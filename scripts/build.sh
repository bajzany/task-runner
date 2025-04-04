#!/bin/bash

docker build -t bajzator/task-runner-executor:latest -f ./executor/docker/Dockerfile ./executor
docker push bajzator/task-runner-orchestrator:latest

docker build -t bajzator/task-runner-orchestrator:latest -f ./orchestrator/docker/Dockerfile ./orchestrator
docker push bajzator/task-runner-orchestrator:latest

docker build -t bajzator/task-runner-customer-api:latest -f ./customer-api/docker/Dockerfile ./customer-api
docker push bajzator/task-runner-customer-api:latest

docker build -t bajzator/task-runner-frontend:latest -f ./frontend/docker/Dockerfile ./frontend
docker push bajzator/task-runner-frontend:latest
