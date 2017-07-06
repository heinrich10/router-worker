# Route Worker
[![CircleCI](https://circleci.com/gh/heinrich10/router-worker.svg?style=svg)](https://circleci.com/gh/heinrich10/router-worker)  [![codecov](https://codecov.io/gh/heinrich10/router-worker/branch/master/graph/badge.svg)](https://codecov.io/gh/heinrich10/router-worker)

## Prerequisites

1. make sure docker is install
2. make sure there is a redis instance, for my case, I use a docker redis instance, to configure the redis settings modify this part
```
case 'docker': {
    host = "redis",
    port = 6379
    break;
}
 ```
in config/index.js
3. please supply your own api key for the google maps API

## How to run

1. go to the root directory and run: ``` docker build -t route_worker . ```
2. make sure redis is already running
3. make sure you have a docker network so that each service can discover each other
3. execute ``` docker run -it -network=docker_nat -name=routeworker route_worker```

Please refer to [route](https://github.com/heinrich10/router) for overview of the whole architecture
