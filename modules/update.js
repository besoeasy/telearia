const axios = require('axios');
const localPackageJson = require('../package.json');

async function compareVersions() {
    try {
        const remoteVersion = (await axios.get('https://unpkg.com/telepi/package.json')).data.version || "1.0.0";
        const localVersion = localPackageJson.version || "1.0.0";

        return {
            remoteVersion,
            localVersion,
            textSend: `Remote: ${remoteVersion}, Local: ${localVersion}`
        }
    } catch (error) {
        console.error('Error comparing versions:', error.message);
    }
}

module.exports = { compareVersions };