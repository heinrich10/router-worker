/*eslint no-process-env: "off"*/
let host, port;
switch (process.env.NODE_ENV) {
	case 'docker': {
		host = "redis",
		port = 6379
		break;
	}
	default: {
		host = "192.168.99.100",
		port = 6379
		break;
	}
}
module.exports = {
	app: {
		redis: {
			host: host,
			port: port
		},
		apiKey: 'AIzaSyAThTaWYcdO7M9-sn74ikhrmfwl-ZbCYAQ'
	}
}
