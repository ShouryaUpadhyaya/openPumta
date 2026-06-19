#!/bin/bash

# ==============================================================================
# VPS Database Migration Script (Docker Compose)
# ==============================================================================
# This script applies Prisma database migrations on your production VPS
# when running with Docker Compose.
#
# INSTRUCTIONS:
# 1. SSH into your VPS: ssh user@your_vps_ip
# 2. Navigate to your project root (e.g., cd /path/to/Productivity_System)
# 3. Pull the latest code: git pull origin main
# 4. Make this script executable: chmod +x migrate_vps.sh
# 5. Run the script: ./migrate_vps.sh
# ==============================================================================

echo "🚀 Starting VPS Docker migration process..."

# Determine which compose file to use
COMPOSE_FILE="docker-compose.prod.yml"
if [ ! -f "$COMPOSE_FILE" ]; then
  if [ -f "docker-compose.yml" ]; then
    COMPOSE_FILE="docker-compose.yml"
  else
    echo "❌ Error: Could not find docker-compose.prod.yml or docker-compose.yml"
    exit 1
  fi
fi

echo "📦 Using Compose file: $COMPOSE_FILE"

# 1. Build the new api image with the latest code
# (This step automatically runs `npx prisma generate` inside the Dockerfile)
echo "⚙️ Building updated Docker images..."
docker compose -f $COMPOSE_FILE build api web

# 2. Run the migration against the database using a temporary container from the new image
echo "🗄️ Applying Prisma migrations to the production database..."
docker compose -f $COMPOSE_FILE run --rm api npx prisma migrate deploy

# 3. Start/Restart the services with the new images
echo "🔄 Restarting the containers in the background..."
docker compose -f $COMPOSE_FILE up -d

echo "✨ Migration and deployment complete!"
