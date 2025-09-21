#!/bin/bash

# Setup script for NutriMate cleanup cron jobs
# This script sets up automated cleanup of abandoned accounts

echo "🔧 Setting up NutriMate cleanup cron jobs..."

# Check if required environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Required environment variables not set"
    echo "   Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

# Get the current directory (project root)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT_PATH="$PROJECT_DIR/scripts/cleanup-abandoned-accounts.ts"

# Check if the cleanup script exists
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "❌ Error: Cleanup script not found at $SCRIPT_PATH"
    exit 1
fi

# Create a wrapper script that sets environment variables
WRAPPER_SCRIPT="$PROJECT_DIR/scripts/run-cleanup.sh"
cat > "$WRAPPER_SCRIPT" << EOF
#!/bin/bash
# Wrapper script for cleanup cron job
# This ensures environment variables are available

export NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL"
export SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
export NODE_ENV="production"

cd "$PROJECT_DIR"
npx tsx "$SCRIPT_PATH" >> "$PROJECT_DIR/logs/cleanup.log" 2>&1
EOF

# Make the wrapper script executable
chmod +x "$WRAPPER_SCRIPT"

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

echo "📝 Created wrapper script: $WRAPPER_SCRIPT"

# Add cron job entries
echo "⏰ Adding cron job entries..."

# Remove existing cron jobs for this project
(crontab -l 2>/dev/null | grep -v "NutriMate cleanup" | grep -v "$WRAPPER_SCRIPT") | crontab -

# Add new cron jobs
(crontab -l 2>/dev/null; echo "# NutriMate cleanup - runs every 6 hours") | crontab -
(crontab -l 2>/dev/null; echo "0 */6 * * * $WRAPPER_SCRIPT") | crontab -

echo "✅ Cron jobs added successfully"
echo ""
echo "📋 Current cron jobs:"
crontab -l | grep -E "(NutriMate|cleanup|$WRAPPER_SCRIPT)"

echo ""
echo "🔍 To monitor cleanup logs:"
echo "   tail -f $PROJECT_DIR/logs/cleanup.log"

echo ""
echo "🗑️  To remove cron jobs:"
echo "   crontab -e"
echo "   # Then delete the lines containing 'NutriMate cleanup' and '$WRAPPER_SCRIPT'"

echo ""
echo "✅ Setup completed successfully!"
