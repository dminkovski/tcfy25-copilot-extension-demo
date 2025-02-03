#!/bin/bash

# Only print log messages if not part of a pipeline
if [[ -t 1 ]]; then
    echo "[INFO] Finding all workspace extension paths..." >&2
fi

WORKSPACES_DIR="/workspaces"

for WORKSPACE in "$WORKSPACES_DIR"/*/; do
    EXT_DIR="${WORKSPACE}.vscode/extensions"
    
    if [[ -d "$EXT_DIR" ]]; then
        if [[ -t 1 ]]; then
            echo "[INFO] Found extensions directory in workspace: $WORKSPACE" >&2
        fi
        
        # Iterate over each extension directory
        for EXT in "$EXT_DIR"/*/; do
            if [[ -d "$EXT" ]]; then
                echo "$EXT"  # Output extension paths (without log messages)
            fi
        done
    fi
done
