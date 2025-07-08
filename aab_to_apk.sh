#!/bin/bash

# Configuration
BUNDLETOOL_VERSION="1.18.1" # Check Google's GitHub for the latest version
BUNDLETOOL_CACHE_DIR=".bundletool_cache"
BUNDLETOOL_JAR_FILENAME="bundletool-all-${BUNDLETOOL_VERSION}.jar"
BUNDLETOOL_JAR="${BUNDLETOOL_CACHE_DIR}/${BUNDLETOOL_JAR_FILENAME}"
BUNDLETOOL_URL="https://github.com/google/bundletool/releases/download/${BUNDLETOOL_VERSION}/${BUNDLETOOL_JAR_FILENAME}"

# --- Script Logic ---

# Check for arguments
if [ -z "$1" ]; then
  echo "Usage: $0 <path_to_aab_file> [output_directory]"
  exit 1
fi

AAB_FILE=$(realpath "$1")

if [ -z "$2" ]; then
  OUTPUT_DIR="docs"
  FINAL_APK_NAME="getodone.apk"
else
  OUTPUT_DIR=$(realpath "$2")
  FINAL_APK_NAME="$(basename "$AAB_FILE" .aab).apk"
fi

TEMP_DIR="bundletool_temp_$(date +%s)" # Unique temporary directory

echo "--- Starting AAB to APK conversion ---"
echo "AAB File: $AAB_FILE"
echo "Output Directory: $OUTPUT_DIR"
echo "Final APK Name: $FINAL_APK_NAME"

# 1. Check if bundletool.jar exists, if not, download it
mkdir -p "$BUNDLETOOL_CACHE_DIR"
if [ ! -f "$BUNDLETOOL_JAR" ]; then
  echo "bundletool.jar not found. Downloading from $BUNDLETOOL_URL..."
  # Try with curl first
  curl -L -o "$BUNDLETOOL_JAR" "$BUNDLETOOL_URL"
  if [ $? -ne 0 ]; then
    echo "curl failed. Trying with wget..."
    # If curl fails, try with wget
    wget -O "$BUNDLETOOL_JAR" "$BUNDLETOOL_URL"
    if [ $? -ne 0 ]; then
      echo "Error: Failed to download bundletool.jar with both curl and wget. Please check your internet connection or the URL."
      exit 1
    fi
  fi
  echo "bundletool.jar downloaded."
else
  echo "bundletool.jar already exists."
fi

# 2. Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"
if [ $? -ne 0 ]; then
  echo "Error: Failed to create output directory: $OUTPUT_DIR"
  exit 1
fi



AAPT2_PATH="/data/data/com.termux/files/usr/bin/aapt2"

# 4. Generate .apks file
echo "Generating .apks file from AAB..."
java -jar "$BUNDLETOOL_JAR" build-apks \
  --bundle="$AAB_FILE" \
  --output="${TEMP_DIR}/app.apks" \
  --aapt2="$AAPT2_PATH" \
  --mode=universal \
  --overwrite

if [ $? -ne 0 ]; then
  echo "Error: Failed to generate .apks file. Check AAB file path or bundletool command."
  rm -rf "$TEMP_DIR"
  exit 1
fi
echo ".apks file generated: ${TEMP_DIR}/app.apks"

# 4. Unzip .apks to extract universal.apk
echo "Extracting universal.apk..."
mkdir -p "$TEMP_DIR/extracted_apks"
unzip "${TEMP_DIR}/app.apks" -d "${TEMP_DIR}/extracted_apks"
if [ $? -ne 0 ]; then
  echo "Error: Failed to unzip .apks file."
  rm -rf "$TEMP_DIR"
  exit 1
fi

# 5. Find and move the universal APK
UNIVERSAL_APK="${TEMP_DIR}/extracted_apks/universal.apk"
if [ -f "$UNIVERSAL_APK" ]; then
  FINAL_APK_PATH="${OUTPUT_DIR}/${FINAL_APK_NAME}"
  mv "$UNIVERSAL_APK" "$FINAL_APK_PATH"
  if [ $? -ne 0 ]; then
    echo "Error: Failed to move universal.apk to $OUTPUT_DIR."
    rm -rf "$TEMP_DIR"
    exit 1
  fi
  echo "Universal APK successfully created at: $FINAL_APK_PATH"
else
  echo "Error: universal.apk not found inside the .apks archive. This might indicate an issue with bundletool or the AAB."
  rm -rf "$TEMP_DIR"
  exit 1
fi

# 6. Clean up temporary files
echo "Cleaning up temporary files..."
rm -rf "$TEMP_DIR"
echo "Cleanup complete."

echo "--- AAB to APK conversion finished ---"
