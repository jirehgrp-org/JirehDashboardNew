#!/bin/bash

echo "📦 Building the project..."
npm run build

echo "🚀 Restarting PM2..."
pm2 restart all

echo "🔄 Restarting Nginx..."
sudo nginx -t && sudo systemctl restart nginx

echo "✅ Deployment complete!"
