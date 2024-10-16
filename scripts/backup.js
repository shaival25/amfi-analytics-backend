const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");
const config = require("../config/config");

const uri = config.mongoURIBackup;
const dbName = config.mongoURIBackupDB; // Replace with your database name
const backupInterval = 5 * 60 * 1000; // 5 minutes in milliseconds

async function backupDatabase() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();

    // Create a folder for today's date
    const today = new Date();
    const dateFolderName = `${String(today.getDate()).padStart(
      2,
      "0"
    )}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;
    const backupFolder = path.join(
      __dirname,
      "..",
      "backup-db",
      dateFolderName
    );

    if (!fs.existsSync(backupFolder)) {
      fs.mkdirSync(backupFolder, { recursive: true });
    }

    for (const collection of collections) {
      const collectionName = collection.name;
      const documents = await db.collection(collectionName).find({}).toArray();
      const json = JSON.stringify(documents, null, 2);
      fs.writeFileSync(path.join(backupFolder, `${collectionName}.json`), json);
      console.log(`Backed up collection: ${collectionName}`);
    }
  } catch (err) {
    console.error("Error during backup:", err);
  } finally {
    await client.close();
  }
}

// Run the backup immediately and then every 5 minutes
backupDatabase();
setInterval(backupDatabase, backupInterval);
