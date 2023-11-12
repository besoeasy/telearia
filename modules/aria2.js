const axios = require('axios');

const saveDirectory = '/tmp/telepi/';

const getVersion = async () => {
	const { data } = await axios.post('http://localhost:6800/jsonrpc', {
		jsonrpc: '2.0',
		method: 'aria2.getVersion',
		id: 1,
	});

	return data;
};

const getGlobalStats = async () => {
	const { data } = await axios.post('http://localhost:6800/jsonrpc', {
		jsonrpc: '2.0',
		method: 'aria2.getGlobalStat',
		id: 1,
	});

	return data;
};

const downloadAria = async (id, url) => {
	const { data } = await axios.post('http://localhost:6800/jsonrpc', {
		jsonrpc: '2.0',
		method: 'aria2.addUri',
		id: 1,
		params: [[url], { dir: saveDirectory + id + '/', enableDHT: true, enablePeerExchange: true }],
	});

	return data;
};

const getDownloadStatus = async (gid) => {
	const { data } = await axios.post('http://localhost:6800/jsonrpc', {
		jsonrpc: '2.0',
		method: 'aria2.tellStatus',
		id: 1,
		params: [gid],
	});

	return data;
};

const cancelDownload = async (gid) => {
	const { data } = await axios.post('http://localhost:6800/jsonrpc', {
		jsonrpc: '2.0',
		method: 'aria2.remove',
		id: 1,
		params: [gid],
	});

	return data;
};

const handler = require('serve-handler');

const http = require('http');

const httpServer = http.createServer((request, response) => {
	return handler(request, response, {
		public: saveDirectory,
		rewrites: [{ source: '**', destination: '/index.html' }],
	});
});

module.exports = {
	getVersion,
	getGlobalStats,
	downloadAria,
	getDownloadStatus,
	cancelDownload,
	saveDirectory,
	httpServer,
};
