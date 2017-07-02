
const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
const RouteWorker = require('../../../src/worker/route_worker');

describe('Route Worker Test', function () {
	describe('test routeWorker.arrayToString', function () {
		it('should convert an array to string ', function () {
			let routeWorker = new RouteWorker();
			let data = ["22.372081", "114.107877"];

			let ans = routeWorker.arrayToString(data);
			expect(ans).to.be.a.string;
			expect(ans).to.include(',');
		});
	});
	describe('test routeWorker.prepareData', function () {
		it('should convert the dataset into origin, destination, and waypoints ', function () {
			let routeWorker = new RouteWorker();
			let data = [
				["22.372081", "114.107877"],
				["22.284419", "114.159510"],
				["22.326442", "114.167811"]
			]
			let ans = _.cloneDeep(data);
			let origin, destination, waypoints;
			[origin, destination, waypoints] = routeWorker.prepareData(data);
			expect(origin).to.be.deep.equal(ans[0])
			expect(destination).to.be.deep.equal(ans[2]);
			expect(waypoints[0]).to.be.deep.equal(ans[1]);
		});
		it('should return origin and destination if input value is 2 coordinates', function () {
			let routeWorker = new RouteWorker();
			let data = [
				["22.372081", "114.107877"],
				["22.326442", "114.167811"]
			]
			let ans = _.cloneDeep(data);
			let origin, destination, waypoints;
			[origin, destination, waypoints] = routeWorker.prepareData(data);
			expect(origin).to.be.deep.equal(ans[0])
			expect(destination).to.be.deep.equal(ans[1]);
			expect(waypoints).to.be.deep.equal([]);
		});
		it('should return multiple waypoints if input value is more than 3 coordinates', function () {
			let routeWorker = new RouteWorker();
			let data = [
				["22.372081", "114.107877"],
				["22.284419", "114.159510"],
				["22.326442", "114.167811"],
				["22.123456", "114.123456"]
			]
			let ans = _.cloneDeep(data);
			let origin, destination, waypoints;
			[origin, destination, waypoints] = routeWorker.prepareData(data);
			expect(origin).to.be.deep.equal(ans[0])
			expect(destination).to.be.deep.equal(ans[3]);
			expect(waypoints).to.have.length(2);
			expect(waypoints[0]).to.be.deep.equal(ans[1]);
			expect(waypoints[1]).to.be.deep.equal(ans[2]);
		});
	});

	describe('test routeWorker.constructUrl', function () {
		it('should return a fully form url with n waypoints', function () {
			let routeWorker = new RouteWorker();
			let origin = ["22.372081", "114.107877"];
			let destination = ["22.123456", "114.123456"]
			let waypoints = [
				["22.284419", "114.159510"],
				["22.326442", "114.167811"],
			]
			let url = 'https://maps.googleapis.com/maps/api/directions/json?origin=22.372081,114.107877&destination=22.123456,114.123456&waypoints=22.284419,114.159510|22.326442,114.167811&key=AIzaSyAThTaWYcdO7M9-sn74ikhrmfwl-ZbCYAQ'
			let ans = routeWorker.constructUrl(origin, destination, waypoints);
			expect(ans).to.be.equal(url);
		});
		it('shoud return a fully formed url with 1 waypoint', function () {
			let routeWorker = new RouteWorker();
			let origin = ["22.372081", "114.107877"];
			let destination = ["22.326442", "114.167811"]
			let waypoints = [
				["22.284419", "114.159510"]
			]
			let url = 'https://maps.googleapis.com/maps/api/directions/json?origin=22.372081,114.107877&destination=22.326442,114.167811&waypoints=22.284419,114.159510&key=AIzaSyAThTaWYcdO7M9-sn74ikhrmfwl-ZbCYAQ'
			let ans = routeWorker.constructUrl(origin, destination, waypoints);
			expect(ans).to.be.equal(url);
		});
		it('should return a fully formed url without any waypoint', function () {
			let routeWorker = new RouteWorker();
			let origin = ["22.372081", "114.107877"];
			let destination = ["22.326442", "114.167811"]
			let waypoints = []
			let url = 'https://maps.googleapis.com/maps/api/directions/json?origin=22.372081,114.107877&destination=22.326442,114.167811&key=AIzaSyAThTaWYcdO7M9-sn74ikhrmfwl-ZbCYAQ'
			let ans = routeWorker.constructUrl(origin, destination, waypoints);
			expect(ans).to.be.equal(url);
		});
	});
});
