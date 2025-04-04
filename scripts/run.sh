#!/bin/bash

#NUTNO ZMENIT V ZAVISLOSTI NA IP SERVERU
DB_HOST="192.168.1.187"
DB_PORT="3306"
RABBITMQ_URL="amqp://user:user@192.168.1.187:5672"
CUSTOMER_API_URL="http://192.168.1.187:3005"

docker stop mariadb rabbitmq executor orchestrator customer-api frontend
docker rm mariadb rabbitmq executor orchestrator customer-api frontend

echo "Starting mariadb"
docker run -d \
  --name mariadb \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=task_db \
  -e MYSQL_USER=user \
  -e MYSQL_PASSWORD=pass \
  -p $DB_PORT:$DB_PORT \
  -v mariadb_data:/var/lib/mysql \
  --health-cmd="mysqladmin ping -h localhost" \
  --health-interval=5s \
  --health-timeout=3s \
  --health-retries=5 \
  mariadb:10.11

echo "Waiting for mariadb to become healthy"
until [ "$(docker inspect -f '{{.State.Health.Status}}' mariadb)" == "healthy" ]; do
  sleep 2
done

echo "Starting rabbitmq"
docker run -d \
  --name rabbitmq \
  -e RABBITMQ_DEFAULT_USER=user \
  -e RABBITMQ_DEFAULT_PASS=user \
  -p 5672:5672 \
  -p 15672:15672 \
  -v rabbitmq_data:/var/lib/rabbitmq \
  --health-cmd="rabbitmq-diagnostics status" \
  --health-interval=5s \
  --health-timeout=5s \
  --health-retries=5 \
  rabbitmq:3-management

echo "Waiting for rabbitmq to become healthy"
until [ "$(docker inspect -f '{{.State.Health.Status}}' rabbitmq)" == "healthy" ]; do
  sleep 2
done

echo "Starting customer-api"
docker run -d \
  --name customer-api \
 -p 3005:3000 \
  -e PORT=3000 \
  -e NODE_ENV=development \
  -e DB_HOST=$DB_HOST \
  -e DB_PORT=3306 \
  -e DB_USERNAME=user \
  -e DB_PASSWORD=pass \
  -e DB_DATABASE=task_db \
  -e RABBITMQ_URL=$RABBITMQ_URL \
  -e QUEUE_NAME=task_queue \
  --health-cmd="curl -f http://localhost:3000/health || exit 1" \
  --health-interval=10s \
  --health-timeout=5s \
  --health-retries=5 \
  bajzator/task-runner-customer-api:latest

echo "Waiting for customer-api to become healthy"
until [ "$(docker inspect -f '{{.State.Health.Status}}' customer-api)" == "healthy" ]; do
  sleep 2
done

echo "Starting orchestrator"
docker run -d \
  --name orchestrator \
  -e RABBITMQ_URL=$RABBITMQ_URL \
  -e QUEUE_NAME=task_queue \
  -e ERROR_QUEUE_NAME=task_queue_error \
  -e CUSTOMER_API_URL=$CUSTOMER_API_URL \
  -e EXECUTOR_IMAGE=bajzator/task-runner-executor:latest \
  -e MAX_EXECUTORS=5 \
  -e MIN_EXECUTORS=2 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  bajzator/task-runner-orchestrator:latest

echo "Starting frontend"
docker run -d \
  --name frontend \
  -e NODE_ENV=production \
  -e REACT_APP_API_URL=$CUSTOMER_API_URL \
  -p 80:80 \
  bajzator/task-runner-frontend:latest

echo "All services started"
