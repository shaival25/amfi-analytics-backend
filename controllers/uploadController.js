const fs = require('fs-extra');
const path = require('path');

exports.syncFile = async (req, res) => {
    try {
        const { modifiedAt, folderPath } = req.body; // Extract folderPath from body
        const file = req.file;

        if (!file || typeof folderPath === 'undefined') {
            return res.status(400).json({ message: 'No file uploaded or folder path missing.' });
        }

        // Define the full path where the file will be saved
        const fullPath = path.join(__dirname, '../uploads', folderPath || '', file.originalname); // Use empty string if folderPath is undefined

        // Ensure directory exists asynchronously
        await fs.ensureDir(path.dirname(fullPath));

        // Check if the file already exists and if it should be updated
        if (fs.existsSync(fullPath)) {
            const stats = fs.statSync(fullPath);
            if (new Date(modifiedAt).getTime() <= stats.mtime.getTime()) {
                return res.status(200).json({ message: 'File already exists and is up to date, skipping upload.' });
            }
        }

        // Write the file buffer to disk
        await fs.writeFile(fullPath, file.buffer); // Use fs.writeFile for simplicity

        res.status(200).json({ message: 'File synced successfully.' });

    } catch (error) {
        console.error('Error syncing file:', error);
        res.status(500).json({ message: 'Error syncing file to server.' });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const { fileName, folderPath } = req.body;
        if (!fileName) {
            return res.status(400).json({ message: 'File name missing.' });
        }
        const fullPath = path.join(__dirname, '../uploads', folderPath, fileName);

        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ message: 'File not found on server.' });
        }

        await fs.remove(fullPath);

        console.log(`File deleted: ${fullPath}`);
        res.status(200).json({ message: 'File deleted successfully.' });

    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ message: 'Error deleting file on server.' });
    }
};