#!/bin/bash

set -e

echo "================================"
echo "Setting up ToonSwap..."
echo "================================"

# ============================================
# FFmpeg
# ============================================

echo "Checking FFmpeg..."

if ! command -v ffmpeg >/dev/null 2>&1; then
    echo "FFmpeg not found. Installing..."

    # Universal image may contain an outdated
    # Yarn apt repository with a missing GPG key.
    sudo rm -f /etc/apt/sources.list.d/yarn.list
    sudo rm -f /etc/apt/sources.list.d/yarnpkg.list

    sudo apt-get update
    sudo apt-get install -y ffmpeg
fi

echo "FFmpeg:"
ffmpeg -version | head -n 1

# ============================================
# Backend
# ============================================

echo "================================"
echo "Installing backend dependencies..."
echo "================================"

cd /workspaces/toonswap/backend

npm install
npm run prisma:generate

# ============================================
# Frontend
# ============================================

echo "================================"
echo "Installing frontend dependencies..."
echo "================================"

cd /workspaces/toonswap/frontend

npm install

echo "================================"
echo "ToonSwap setup complete!"
echo "================================"