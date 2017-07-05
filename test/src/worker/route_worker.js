
const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const RouteWorker = require('../../../src/worker/route_worker');

describe('Route Worker Test', () => {
	describe('test routeWorker.run', () => {
		it('should be able to process the data and return success', (done) => {
			let routeWorker = new RouteWorker();
			let res = {}
			res.body = JSON.stringify({ status: 'OK', routes:[1,2] })
			sinon.stub(routeWorker, 'prepareData').returns([]);
			sinon.stub(routeWorker, 'constructUrl').returns(null);
			sinon.stub(routeWorker, 'postRequest').callsFake(() => {
				return Promise.resolve(res);
			});
			sinon.stub(routeWorker, 'getTotal').returns([]);
			let apiQStub = sinon.stub().returns(Promise.resolve(1));
			let apiQ = {add: apiQStub};
			let data = {id: 1, path: []}
			routeWorker.run(data, apiQ, (err) => {
				let args = apiQStub.args[0][0];
				expect(err).to.be.undefined;
				expect(args.status).to.be.equal('success');
				expect(args.id).to.be.equal(data.id);

				expect(apiQStub.calledOnce).to.be.true;
				done();
			});
		});
		it('should not be able to process the data and return failure', (done) => {
			let routeWorker = new RouteWorker();
			let res = {}
			res.body = JSON.stringify({ routes:[1,2] })
			sinon.stub(routeWorker, 'prepareData').returns([]);
			sinon.stub(routeWorker, 'constructUrl').returns(null);
			sinon.stub(routeWorker, 'postRequest').callsFake(() => {
				return Promise.resolve(res);
			});
			sinon.stub(routeWorker, 'getTotal').returns([]);
			let apiQStub = sinon.stub().returns(Promise.resolve(1));
			let apiQ = {add: apiQStub};
			let data = {id: 1, path: []}
			routeWorker.run(data, apiQ, (err) => {
				let args = apiQStub.args[0][0];
				expect(err).to.be.undefined;
				expect(args.status).to.be.equal('failure');
				expect(args.id).to.be.equal(data.id);

				expect(apiQStub.calledOnce).to.be.true;
				done();
			});
		});
		it('should throw error in case of error', (done) => {
			let routeWorker = new RouteWorker();
			let res = {}
			res.body = JSON.stringify({ status: 'OK', routes:[1,2] })
			sinon.stub(routeWorker, 'prepareData').throws(new Error());
			let data = {id: 1, path: []}
			routeWorker.run(data, null, (err) => {
				expect(err).to.be.not.undefined;
				expect(err).to.be.instanceOf(Error);
				done();
			});
		});
	});
	describe('test routeWorker.getMin', () => {
		it('should compute the total time and distance', () => {
			let routes = {
				legs: [
					{
						distance: {
							value: 1
						},
						duration: {
							value:3
						}
					},
					{
						distance: {
							value: 2
						},
						duration: {
							value:4
						}
					}
				]
			};
			let routeWorker = new RouteWorker();
			let distance, time;
			let expDistance = 3;
			let expTime = 7;
			[distance, time] = routeWorker.getTotal(routes);
			expect(distance).to.be.equal(expDistance);
			expect(time).to.be.equal(expTime);
		});
	});
	describe('test routeWorker.arrayToString', () => {
		it('should convert an array to string ', () => {
			let routeWorker = new RouteWorker();
			let data = ["22.372081", "114.107877"];
			let ans = routeWorker.arrayToString(data);
			expect(ans).to.be.a.string;
			expect(ans).to.include(',');
		});
	});
	describe('test routeWorker.prepareData', () => {
		it('should convert the dataset into origin, destination, and waypoints ', () => {
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
		it('should return origin and destination if input value is 2 coordinates', () => {
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
		it('should return multiple waypoints if input value is more than 3 coordinates', () => {
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

	describe('test routeWorker.constructUrl', () => {
		it('should return a fully form url with n waypoints', () => {
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
		it('shoud return a fully formed url with 1 waypoint', () => {
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
		it('should return a fully formed url without any waypoint', () => {
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
