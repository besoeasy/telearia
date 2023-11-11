const axios = require('axios');

async function getVersionFromRemote() {

    const response = await axios.get('https://unpkg.com/telepi/package.json');

    return response.data.version || "1.0.0";

}

function getLocalVersion() {
    const localPackageJson = require('../package.json');

    return localPackageJson.version || "1.0.0";
}

async function compareVersions() {
    try {
        // Get versions from remote and local
        const remoteVersion = await getVersionFromRemote();
        const localVersion = getLocalVersion();
        const textSend = `Remote: ${remoteVersion}, Local: ${localVersion}`

        return {
            remoteVersion: remoteVersion,
            localVersion: localVersion,
            text: textSend
        }

    } catch (error) {
        console.error('Error comparing versions:', error.message);
    }
}

module.exports = { compareVersions };
