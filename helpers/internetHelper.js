const axios = require('axios');
const config = require('../config/config');  // Assuming your config file contains the pingURL

async function checkInternet() {
    try {
        const response = await axios.get(config.pingURL, { timeout: 5000 });
        if (response.status === 200) {
            return true;
        }
    } catch (error) {
        console.error('Error checking internet connectivity:', error.message);
        return false;
    }
    return false;
}

module.exports = { checkInternet };
