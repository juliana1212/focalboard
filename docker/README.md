# Deploy Focalboard with Docker

## Docker

The Dockerfile gives a quick and easy way to build the latest Focalboard server and deploy it locally. In the example below,
the Focalboard database and files will be persisted in a named volumed called `fbdata`.

From the Focalboard project root directory:

```bash
docker build -f docker/Dockerfile -t focalboard .
docker run -it -v "fbdata:/opt/focalboard/data" -p 80:8000 focalboard
```

Open a browser to [localhost](http://localhost) to start

## Alternative architectures

From the Focalboard project root directory:

```bash
docker build -f docker/Dockerfile --platform linux/arm64 -t focalboard .
docker run -it -v "fbdata:/opt/focalboard/data" -p 80:8000 focalboard
```

## Docker-Compose

Docker-Compose provides the option to automate the build and run step, or even include some of the steps from the [personal server setup](https://www.focalboard.com/download/personal-edition/ubuntu/).

To start the server, change directory to `focalboard/docker` and run:

```bash
docker-compose up
```

This will automatically build the focalboard image and start it with the http port mapping. These examples also create a persistent named volume called `fbdata`.

To run Focalboard with a nginx proxy and a postgres backend, change directory to `focalboard/docker` and run:

```bash
docker-compose -f docker-compose-db-nginx.yml up
```

## Jenkins + SonarQube

For a lightweight CI stack with Jenkins and SonarQube, change directory to `focalboard/docker` and run:

```bash
docker compose -f docker-compose-ci.yml up -d
```

This brings up:

* Jenkins on [localhost:8081](http://localhost:8081)
* SonarQube on [localhost:9001](http://localhost:9001)

Notes:

* The Jenkins image is built locally from `docker/jenkins/Dockerfile` with Go, Node, Git, and build tools preinstalled.
* The base `Jenkinsfile` runs the `server` and `webapp` stages directly inside that Jenkins runtime.
* This compose does not publish Jenkins agent port `50000`; the base pipeline does not need inbound agents.
* SonarQube stores its state in named volumes, including the PostgreSQL database.
* On Linux hosts, make sure `vm.max_map_count` is set to at least `262144` before starting SonarQube.
