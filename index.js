/* global Promise */
const queue = require('bull');
// const cron = require('node-schedule')

const RouteWorker = require('./src/worker/route_worker');

const config = require('./config');
const redisConfig = config.app;
// const service = config.service;
//const destConfig = require('./config').app.dest;

const routeQ = new queue('route', redisConfig);
const apiQ = new queue('api', redisConfig);


routeQ.process(function (job, done) {
	let data = job.data;
	let worker = new RouteWorker();
	worker.run(data, apiQ, done);
});
