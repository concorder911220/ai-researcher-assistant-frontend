#!/bin/bash
# Start the Next.js frontend

echo "🚀 Starting AI Research Assistant Frontend..."
echo ""

cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start dev server
echo "✓ Starting development server..."
echo ""
echo "Frontend: http://localhost:3000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press CTRL+C to stop"
echo ""

npm run dev

