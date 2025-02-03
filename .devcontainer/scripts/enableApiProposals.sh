#!/bin/bash

# This script will update the VS Code product.json file in the dev container to "whitelist" API Proposals for packaged workspace extensions.

# Load shared script
SCRIPT_DIR="$(dirname "$0")"
source "$SCRIPT_DIR/workspaceExtensionPaths.sh"

declare -A EXTENSIONS

echo "[INFO] Collecting extension API proposals..."

while read -r EXT; do
    PACKAGE_JSON="${EXT%/}/package.json"
    
    if [[ -f "$PACKAGE_JSON" ]]; then
        echo "[DEBUG] Reading $PACKAGE_JSON..."
        
        # Extract publisher, extension name, and enabledApiProposals
        EXT_NAME=$(jq -r '.name' "$PACKAGE_JSON")
        EXT_PUBLISHER=$(jq -r '.publisher' "$PACKAGE_JSON")
        EXT_APIPROPOSALS=$(jq -c '.enabledApiProposals // []' "$PACKAGE_JSON" 2>/dev/null)

        # Ensure publisher and name exist
        if [[ -n "$EXT_NAME" && -n "$EXT_PUBLISHER" ]]; then
            EXT_KEY="$EXT_PUBLISHER.$EXT_NAME"
            echo "[DEBUG] Extracted API Proposals for $EXT_KEY: $EXT_APIPROPOSALS"
            
            # Store in associative array for idempotent update
            EXTENSIONS["$EXT_KEY"]="$EXT_APIPROPOSALS"
        else
            echo "[WARNING] Skipping extension due to missing name or publisher: $PACKAGE_JSON"
        fi
    else
        echo "[DEBUG] No package.json found in $EXT"
    fi
done < <("$SCRIPT_DIR/workspaceExtensionPaths.sh")

echo "[INFO] Finished collecting extension API proposals."

# Step 2: Find the newest VS Code server directory
BASE_DIR="/vscode/vscode-server/bin/linux-x64"
NEWEST_SUBDIR=$(ls -td "$BASE_DIR"/*/ 2>/dev/null | head -n 1)

# Ensure a valid subdirectory was found
if [[ -z "$NEWEST_SUBDIR" ]]; then
    echo "[ERROR] No subdirectories found in $BASE_DIR"
    exit 1
fi

echo "[INFO] Newest VS Code server directory: $NEWEST_SUBDIR"

# Step 3: Modify the product.json file idempotently with backup & validation
PRODUCT_JSON="${NEWEST_SUBDIR%/}/product.json"

if [[ -f "$PRODUCT_JSON" ]]; then
    echo "[INFO] Checking file permissions for $PRODUCT_JSON..."
    
    if [[ ! -w "$PRODUCT_JSON" ]]; then
        echo "[ERROR] No write permissions for $PRODUCT_JSON. Exiting."
        exit 1
    fi

    echo "[INFO] Backing up existing $PRODUCT_JSON before modification..."

    # Create a unique backup file
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="$NEWEST_SUBDIR/product.json.$TIMESTAMP.bak"

    cp "$PRODUCT_JSON" "$BACKUP_FILE"
    echo "[SUCCESS] Backup created: $BACKUP_FILE"

    echo "[INFO] Updating $PRODUCT_JSON with extension API proposals..."

    # Read the existing extensionEnabledApiProposals object (if it exists)
    EXISTING_JSON=$(jq '.extensionEnabledApiProposals // {}' "$PRODUCT_JSON")

    # Merge new extensions, ensuring idempotency
    UPDATED_JSON="$EXISTING_JSON"
    for KEY in "${!EXTENSIONS[@]}"; do
        NEW_VALUE="${EXTENSIONS[$KEY]}"
        
        # Check if the key already exists
        OLD_VALUE=$(echo "$EXISTING_JSON" | jq -c --arg key "$KEY" '.[$key] // empty')
        if [[ -n "$OLD_VALUE" ]]; then
            if [[ "$OLD_VALUE" != "$NEW_VALUE" ]]; then
                echo "[INFO] Updating $KEY in product.json from $OLD_VALUE to $NEW_VALUE"
                UPDATED_JSON=$(echo "$UPDATED_JSON" | jq --arg key "$KEY" --argjson value "$NEW_VALUE" '.[$key] = $value')
            else
                echo "[DEBUG] No change for $KEY. Keeping existing value: $OLD_VALUE"
            fi
        else
            echo "[INFO] Adding new entry for $KEY: $NEW_VALUE"
            UPDATED_JSON=$(echo "$UPDATED_JSON" | jq --arg key "$KEY" --argjson value "$NEW_VALUE" '.[$key] = $value')
        fi
    done

    # Write the updated JSON to a temp file
    TEMP_FILE="${NEWEST_SUBDIR%/}/product.tmp.json"
    jq --argjson updated "$UPDATED_JSON" '.extensionEnabledApiProposals = $updated' "$PRODUCT_JSON" > "$TEMP_FILE"

    # Validate JSON format before replacing the original file
    if jq empty "$TEMP_FILE" >/dev/null 2>&1; then
        mv "$TEMP_FILE" "$PRODUCT_JSON"
        echo "[SUCCESS] Updated $PRODUCT_JSON successfully."
    else
        echo "[ERROR] JSON validation failed! Rolling back to backup..."
        cp "$BACKUP_FILE" "$PRODUCT_JSON"
        echo "[SUCCESS] Rolled back to backup: $BACKUP_FILE"
        exit 1
    fi
else
    echo "[ERROR] product.json not found in $NEWEST_SUBDIR"
    exit 1
fi

echo "[INFO] Script execution complete."
