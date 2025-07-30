#!/bin/bash

# Set your database name here
DB_NAME="sponsorship-db"

echo "🚀 Starting index optimization migration..."

# Check if Turso CLI is installed
if ! command -v turso &> /dev/null; then
    echo "❌ Turso CLI not found. Please install it first:"
    echo "   curl -sSfL https://get.tur.so/install.sh | bash"
    exit 1
fi

# Check if database name is set
if [ "$DB_NAME" = "your-database-name" ]; then
    echo "❌ Please set your actual database name in the script"
    echo "   Edit this script and change DB_NAME to your actual database name"
    exit 1
fi

echo "📊 Checking current indexes..."

# Method 1: Using heredoc (recommended)
turso db shell $DB_NAME << 'EOF'
SELECT 'Current indexes before migration:' as info;
SELECT name FROM sqlite_master WHERE type = 'index' AND name NOT LIKE 'sqlite_%' ORDER BY name;
EOF

echo -e "\n🔄 Running migrations..."

# Check if migrations directory exists
if [ ! -d "migrations" ]; then
    echo "❌ migrations directory not found. Creating it..."
    mkdir -p migrations
    echo "📝 Please create your migration files in the migrations/ directory first"
    exit 1
fi

# Run each migration using heredoc to avoid argument parsing issues
for migration in migrations/*.sql; do
    if [ -f "$migration" ]; then
        echo "Running $(basename $migration)..."
        
        # Use heredoc to pass the SQL file content
        turso db shell $DB_NAME << EOF
.read $migration
EOF
        
        if [ $? -eq 0 ]; then
            echo "✅ $(basename $migration) completed"
        else
            echo "❌ $(basename $migration) failed"
            echo "💡 Try running manually: turso db shell $DB_NAME"
            echo "   Then: .read $migration"
            exit 1
        fi
    fi
done

echo -e "\n📊 Final indexes after migration:"
turso db shell $DB_NAME << 'EOF'
SELECT name FROM sqlite_master WHERE type = 'index' AND name NOT LIKE 'sqlite_%' ORDER BY name;
EOF

echo -e "\n🎉 Index optimization completed!"
echo "💡 Next steps:"
echo "   1. Test your application performance"
echo "   2. Update your search queries to use optimized indexes"
echo "   3. Monitor query execution plans"