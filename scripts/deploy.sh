#!/bin/bash
set -euo pipefail

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
HISTORY_FILE=".deploy-history"
HEALTH_URL="http://localhost/health"
MAX_RETRIES=30
RETRY_INTERVAL=2

TAG="${1:-latest}"

echo "==> Deploying TaskForge with tag: $TAG"

# Ensure env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "ERROR: $ENV_FILE not found. Copy .env.production.example and configure it."
    exit 1
fi

# Update TAG in env file
if grep -q "^TAG=" "$ENV_FILE"; then
    sed -i "s/^TAG=.*/TAG=$TAG/" "$ENV_FILE"
else
    echo "TAG=$TAG" >> "$ENV_FILE"
fi

# Pull images
echo "==> Pulling images..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull

# Start services
echo "==> Starting services..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d

# Wait for API health check
echo "==> Waiting for API health check..."
API_HEALTHY=false
for i in $(seq 1 $MAX_RETRIES); do
    if curl -sf "$HEALTH_URL" > /dev/null 2>&1; then
        echo "==> API health check passed!"
        API_HEALTHY=true
        break
    fi
    echo "    Attempt $i/$MAX_RETRIES — waiting ${RETRY_INTERVAL}s..."
    sleep "$RETRY_INTERVAL"
done

if [ "$API_HEALTHY" = false ]; then
    echo "ERROR: API health check failed after $MAX_RETRIES attempts"
    echo "==> Check logs: docker compose -f $COMPOSE_FILE --env-file $ENV_FILE logs api"
    exit 1
fi

# Verify worker is running and initialized
echo "==> Verifying worker status..."
WORKER_STATUS=$(docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps worker --format json 2>/dev/null | grep -o '"State":"[^"]*"' | head -1 || echo "")

if echo "$WORKER_STATUS" | grep -q '"running"'; then
    # Check worker actually initialized (not just container running)
    WORKER_LOGS=$(docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs worker --tail 20 2>/dev/null)
    if echo "$WORKER_LOGS" | grep -q "Worker process started"; then
        echo "==> Worker verified: running and initialized"
    else
        echo "WARNING: Worker container running but startup not confirmed"
        echo "==> Recent worker logs:"
        echo "$WORKER_LOGS" | tail -5
    fi
else
    echo "ERROR: Worker is not running"
    echo "==> Worker status: $WORKER_STATUS"
    echo "==> Check logs: docker compose -f $COMPOSE_FILE --env-file $ENV_FILE logs worker"
    exit 1
fi

# All services verified — record deployment
echo "$(date -Iseconds) $TAG" >> "$HISTORY_FILE"
echo "==> Deployed successfully: $TAG"
echo "==> Deploy history recorded in $HISTORY_FILE"
