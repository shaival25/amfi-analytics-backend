const { MongoClient } = require("mongodb");

// Set up MongoDB connection
const uri = "mongodb://localhost:27017/"; // Replace with your MongoDB URI if needed
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function updateJourneyEndAndDuration() {
  try {
    await client.connect();
    const db = client.db("faceAdminDB"); // Replace with your database name

    // Collections
    const useranalyticsCol = db.collection("useranalytics");
    const feedbacksCol = db.collection("feedbacks");
    const sipcalcsCol = db.collection("sipcalcs");

    // Find entries in useranalytics where journeyStarted has a value and journeyEnded is null
    const entries = await useranalyticsCol
      .find({
        journeyStarted: { $ne: null },
        journeyEnded: null,
      })
      .toArray();

    for (const entry of entries) {
      const userId = entry.userId;
      const journeyStarted = entry.journeyStarted;
      const userAnalyticsCreatedAt = entry.created_at;

      // Find the latest feedback for this userId
      const feedback = await feedbacksCol.findOne(
        { userId },
        { sort: { createdAt: -1 } } // Sort by createdAt in descending order
      );

      let journeyEnded;
      let journeyDuration;

      if (feedback) {
        journeyEnded = feedback.createdAt; // Keep the timestamp format
        const journeyStartedDate = new Date(journeyStarted);
        const journeyEndedDate = new Date(journeyEnded);

        // Calculate journey duration in milliseconds
        journeyDuration = journeyEndedDate - journeyStartedDate;

        // If the duration is negative, try with sipcalc
        if (journeyDuration < 0) {
          console.log(
            `Negative duration for feedback of userId: ${userId}, trying sipcalc...`
          );

          const sipcalc = await sipcalcsCol.findOne(
            { userId },
            { sort: { created_at: -1 } } // Sort by created_at in descending order
          );

          if (sipcalc) {
            journeyEnded = sipcalc.created_at || sipcalc.updated_at;
            const sipJourneyEndedDate = new Date(journeyEnded);
            journeyDuration = sipJourneyEndedDate - journeyStartedDate;

            if (journeyDuration < 0) {
              console.log(
                `Negative duration for sipcalc of userId: ${userId}, falling back to created_at in useranalytics...`
              );

              // Fallback to using useranalytics' created_at and feedback's createdAt
              const fallbackJourneyStartedDate = new Date(
                userAnalyticsCreatedAt
              );
              const fallbackJourneyEndedDate = new Date(feedback.createdAt);
              journeyDuration =
                fallbackJourneyEndedDate - fallbackJourneyStartedDate;

              if (journeyDuration < 0) {
                console.log(
                  `Negative fallback duration for userId: ${userId}, skipping...`
                );
                continue;
              } else {
                // Update journeyStarted with useranalytics.created_at and journeyEnded with feedback.createdAt
                await useranalyticsCol.updateOne(
                  { _id: entry._id },
                  {
                    $set: {
                      journeyStarted: userAnalyticsCreatedAt, // Update journeyStarted with userAnalytics.created_at
                      journeyEnded: feedback.createdAt, // Set journeyEnded to feedback's createdAt
                      journeyDuration: journeyDuration, // Set the valid journey duration in milliseconds
                    },
                  }
                );
                console.log(
                  `Updated entry for userId: ${userId} with fallback duration.`
                );
              }
            } else {
              // Valid duration from sipcalc, update the entry
              await useranalyticsCol.updateOne(
                { _id: entry._id },
                {
                  $set: {
                    journeyEnded: journeyEnded, // Update journeyEnded with sipcalc data
                    journeyDuration: journeyDuration, // Set the valid journey duration in milliseconds
                  },
                }
              );
              console.log(
                `Updated entry for userId: ${userId} with sipcalc data.`
              );
            }
          } else {
            // No valid sipcalc or feedback, continue to next entry
            continue;
          }
        } else {
          // Valid duration from feedback, update the entry
          await useranalyticsCol.updateOne(
            { _id: entry._id },
            {
              $set: {
                journeyEnded: journeyEnded, // Update journeyEnded with feedback's createdAt
                journeyDuration: journeyDuration, // Set the valid journey duration in milliseconds
              },
            }
          );
          console.log(
            `Updated entry for userId: ${userId} with feedback data.`
          );
        }
      } else {
        // No feedback, check sipcalcs for the latest entry for this userId
        const sipcalc = await sipcalcsCol.findOne(
          { userId },
          { sort: { created_at: -1 } } // Sort by created_at in descending order
        );

        if (sipcalc) {
          journeyEnded = sipcalc.created_at || sipcalc.updated_at;
          const sipJourneyEndedDate = new Date(journeyEnded);
          const journeyStartedDate = new Date(journeyStarted);
          journeyDuration = sipJourneyEndedDate - journeyStartedDate;

          if (journeyDuration < 0) {
            console.log(
              `Negative duration for sipcalc of userId: ${userId}, skipping...`
            );
            continue;
          }

          // Valid sipcalc data, update the entry
          await useranalyticsCol.updateOne(
            { _id: entry._id },
            {
              $set: {
                journeyEnded: journeyEnded, // Update journeyEnded with sipcalc data
                journeyDuration: journeyDuration, // Set the valid journey duration in milliseconds
              },
            }
          );
          console.log(`Updated entry for userId: ${userId} with sipcalc data.`);
        } else {
          // No feedback or sipcalc data, skip this entry
          continue;
        }
      }
    }
  } catch (error) {
    console.error("Error updating journey end and duration:", error);
  } finally {
    await client.close();
  }
}

updateJourneyEndAndDuration();
