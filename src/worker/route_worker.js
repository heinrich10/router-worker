
const _ = require('lodash');
const {promisify} = require('util');
const request = require('request');
const post = promisify(request.post);

const apiKey = require('../../config').app.apiKey;

const link = 'https://maps.googleapis.com/maps/api/directions/json?';

class RouteWorker {

	async run(data, apiQ, done) {
		let origin, destination, waypoints, res, body, distance, time;
		let id = data.id;
		let path = data.path;
		let origPath = _.cloneDeep(path);
		try {
			[origin, destination, waypoints] = this.prepareData(path);
			let url = this.constructUrl(origin, destination, waypoints);
			res = await this.postRequest(url);
			body = JSON.parse(res.body);
			if (body.status === 'OK') {
				[distance, time] = this.getTotal(body.routes[0]);
				await apiQ.add({
					id:id,
					path: origPath,
					distance: distance,
					time: time,
					status: 'success'
				})
			} else {
				await apiQ.add({
					id:id,
					err: body.status,
					status: 'failure'
				});
			}

			done();
		} catch(e) {
			await apiQ.add({
				id:id,
				err: "something went wrong",
				status: 'failure'
			});
			done();
		}
	}

	getTotal(routes) {
		let legs = routes.legs;
		let length = legs.length;
		let distance = 0;
		let time = 0;
		for(let i = 0; i < length; i++) {
			distance += legs[i].distance.value;
			time += legs[i].duration.value;
		}
		return [distance, time];
	}

	postRequest(url) {
		return post(url);
	}

	prepareData(data) {
		return [data.shift(), data.pop(), data];
	}

	constructUrl(origin, destination, waypoints) {
		let url = 'origin=' + this.arrayToString(origin) + '&';
		url += 'destination=' + this.arrayToString(destination) + '&';
		let length = waypoints.length;
		let via = '';
		for (let i = 0; i < length; i++) {
			via += this.arrayToString(waypoints[i])
			if (i < length - 1) {
				via += '|'
			}
		}
		if (length > 0) {
			url += 'waypoints=' + via + '&'
		}
		url += 'key=' + apiKey;
		return link + url;
	}

	arrayToString(arr) {
		return arr[0].toString()+ ',' + arr[1].toString();
	}

}
module.exports = RouteWorker;
