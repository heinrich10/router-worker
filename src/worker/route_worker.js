
const util = require('util');
const post = util.promisify(require('request').post);

const link = 'https://maps.googleapis.com/maps/api/directions/json?';
const apiKey = 'AIzaSyAThTaWYcdO7M9-sn74ikhrmfwl-ZbCYAQ'

class RouteWorker {

	async run(data, apiQ, done) {
		let origin, destination, waypoints, body, distance, time;
		[origin, destination, waypoints] = this.prepareData(data);
		let url = this.constructUrl(origin, destination, waypoints);
		body = await this.postRequest(url);

		if (body.status === 'OK') {
			[distance, time] = this.getMin(body.routes);
			await apiQ.add({
				distance: distance,
				time: time
			})
		} else {
			await apiQ.add({err: body.status});
		}

		done();
	}

	getMin(routes) {
		let length = routes[0].legs.length;
		let distance = 0;
		let time = 0;
		for(let i = 0; i < length; i++) {
			distance += routes[0].legs[i].distance.value;
			time += routes[0].legs[i].duration.value;
		}
		return [distance, time];
	}

	postRequest(url) {
		return post(url).then((res) => {
			return JSON.parse(res.body);
		});
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
