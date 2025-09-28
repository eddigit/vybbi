#!/bin/bash

# Script de build pour Cloudflare Pages
echo "🚀 Starting Vybbi build process..."

# Vérifier la version de Node.js
echo "📦 Node.js version:"
node --version

# Vérifier la version de npm
echo "📦 npm version:"
npm --version

# Installer les dépendances avec legacy-peer-deps
echo "📥 Installing dependencies..."
npm install --legacy-peer-deps

# Build de l'application
echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!"