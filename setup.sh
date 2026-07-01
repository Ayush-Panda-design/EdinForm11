#!/usr/bin/env bash
set -e

echo "🔧 FormCraft Setup Script"
echo "========================="

# Check pnpm
if ! command -v pnpm &> /dev/null; then
  echo "❌ pnpm not found. Install with: npm install -g pnpm"
  exit 1
fi

# Copy .env if not exists
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Copied .env.example → .env"
  echo "   ⚠️  Edit .env and set DATABASE_URL before continuing"
fi

# Copy web .env.local if not exists  
if [ ! -f apps/web/.env.local ]; then
  cp apps/web/.env.example apps/web/.env.local
  echo "✅ Copied apps/web/.env.example → apps/web/.env.local"
fi

echo ""
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "🐳 Starting PostgreSQL..."
docker compose up -d

echo ""
echo "⏳ Waiting for database..."
sleep 3

echo ""
echo "📊 Pushing database schema..."
pnpm db:push

echo ""
echo "🌱 Seeding demo data..."
pnpm seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "Start dev servers with: pnpm dev"
echo ""
echo "Demo credentials:"
echo "  Creator: creator@example.com / password123"
echo "  Admin:   admin@example.com / password123"
echo ""
echo "URLs:"
echo "  Web:     http://localhost:3000"
echo "  API:     http://localhost:8000"
echo "  Docs:    http://localhost:8000/docs"
