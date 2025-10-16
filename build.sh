#!/bin/bash

# Script de build local/CI pour Vybbi (sans Cloudflare)
echo "🚀 Starting Vybbi build process..."

# Vérifier la version de Node.js
echo "📦 Node.js version:"
node --version

# Vérifier la version de npm
echo "📦 npm version:"
npm --version

# Installer les dépendances
echo "📥 Installing dependencies..."
npm install

# Build de l'application
echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!"