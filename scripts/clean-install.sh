#!/bin/bash

# Clean install script for Netlify deployment

echo "Cleaning node_modules and package-lock.json..."
rm -rf node_modules
rm -f package-lock.json

echo "Running fresh npm install..."
npm install

echo "Clean install complete!"