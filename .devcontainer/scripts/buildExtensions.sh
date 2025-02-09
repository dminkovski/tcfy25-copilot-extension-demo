#!/bin/bash

# This script will install dependencies and build all workspace extensions found in the project.

# Load shared script to get extension paths
SCRIPT_DIR="$(dirname "$0")"
source "$SCRIPT_DIR/workspaceExtensionPaths.sh"

echo "[INFO] Installing dependencies for all extensions..."

while read -r EXT; do
    PACKAGE_JSON="${EXT%/}/package.json"
    
    if [[ -f "$PACKAGE_JSON" ]]; then
        echo "[INFO] Running npm install in $EXT..."
        
        # Navigate to extension directory and install dependencies
        (cd "$EXT" && npm install)

        # Check if "vscode:prepublish" exists in package.json
        if jq -e '.scripts["vscode:prepublish"]' "$PACKAGE_JSON" >/dev/null 2>&1; then
            echo "[INFO] Running npm run vscode:prepublish in $EXT..."
            (cd "$EXT" && npm run vscode:prepublish --if-present)
        fi
    else
        echo "[WARNING] No package.json found in $EXT. Skipping."
    fi
done < <("$SCRIPT_DIR/workspaceExtensionPaths.sh")

echo "[INFO] Extension npm package install and build complete."