# Getodone: An AI-Powered Productivity Companion (React Native + LLM)

This project is an AI-driven productivity companion built with React Native (Expo) and integrated with Large Language Models (LLMs) like Groq. It goes beyond traditional to-do lists by providing intelligent, emotionally supportive nudges to help users complete their tasks.

This `README.md` also serves as a detailed log of the setup process, challenges, and solutions encountered when developing this application within a Termux environment using the Gemini CLI.

## Table of Contents

1.  [Concept Overview](#concept-overview)
2.  [Features](#features)
3.  [Tech Stack](#tech-stack)
4.  [Local Development Setup (Termux + Android)](#local-development-setup-termux--android)
    *   [Prerequisites](#prerequisites)
    *   [Cloning the Repository](#cloning-the-repository)
    *   [Initial Dependencies & Configuration](#initial-dependencies--configuration)
    *   [Addressing Common Build Errors](#addressing-common-build-errors)
    *   [Setting up Local `expo run:android` (Wireless Debugging)](#setting-up-local-expo-runandroid-wireless-debugging)
    *   [Running the Development Build](#running-the-development-build)
5.  [EAS Build (Cloud Builds)](#eas-build-cloud-builds)
6.  [Troubleshooting & Lessons Learned](#troubleshooting--lessons-learned)

---

## Concept Overview

Getodone is a mobile to-do app where users input tasks, and the app leverages LLMs to generate motivating, timely nudges. Users can configure the AI's tone (Soft, Hard, Neutral) and manage their LLM API key and model locally.

## Features

*   **Todo Management:** Add, edit, and delete to-do items; view pending/completed tasks.
*   **Motivation Engine:** Periodic scheduler sends prompts to LLM to generate personalized motivational messages.
*   **AI Configuration:** UI to input LLM API key (Groq/OpenAI compatible) and model, stored securely locally.
*   **Notification Service:** Delivers AI-generated nudges as push notifications.
*   **Settings:** Configure AI tone, notification frequency (hourly, 3x/day, daily, next 5 mins).
*   **Test Notification:** Button in settings to immediately test LLM API call and notification.

## Tech Stack

*   **UI:** React Native + Expo
*   **AI:** Groq / OpenAI via REST API
*   **Storage:** AsyncStorage
*   **Notifications:** Expo Notifications, Expo Background Task
*   **Navigation:** Expo Router

## Local Development Setup (Termux + Android)

This section details the steps and challenges faced when setting up and developing this project entirely within a Termux environment on an Android phone, using the Gemini CLI.

### Prerequisites

Before you begin, ensure you have:

*   **Termux:** Installed on your Android device.
*   **Node.js & npm:** Installed in Termux.
*   **Java Development Kit (JDK):** Installed in Termux (e.g., `pkg install openjdk-21`).
*   **Android Tools (`adb`):** Installed in Termux (`pkg install android-tools`).
*   **Gradle:** Installed in Termux (`pkg install gradle`).
*   **`eas-cli` & `expo-cli`:** Installed globally in Termux (`npm install -g eas-cli expo-cli`).
*   **`expo-dev-client`:** Installed in your project (`npm install expo-dev-client`).

### Cloning the Repository

```bash
git clone https://github.com/your-username/getodone.git # Replace with actual repo URL
cd getodone
```

### Initial Dependencies & Configuration

1.  **Install JavaScript dependencies:**
    ```bash
    npm install
    ```
2.  **Configure `tsconfig.json` for `@/` alias:**
    Initially, the project might fail to resolve imports like `@/components`. Update `tsconfig.json` to map `@/*` to `./src/*`:
    ```json
    // tsconfig.json
    {
      "compilerOptions": {
        "paths": {
          "@/*": ["./src/*"]
        }
      }
    }
    ```
3.  **Install missing React Native packages:**
    You might encounter errors like "Unable to resolve module `react-native-uuid`" or "`@react-native-picker/picker`". Install them:
    ```bash
    npm install react-native-uuid @react-native-picker/picker
    ```
4.  **Update `app.json` for correct image paths:**
    Builds might fail due to incorrect image paths for `adaptive-icon.png` and `splash-icon.png`. Update `app.json` to point to `src/assets/images/`:
    ```json
    // app.json
    {
      "expo": {
        "android": {
          "adaptiveIcon": {
            "foregroundImage": "./src/assets/images/adaptive-icon.png",
            "backgroundColor": "#ffffff"
          }
        },
        "plugins": [
          [
            "expo-splash-screen",
            {
              "image": "./src/assets/images/splash-icon.png",
              "imageWidth": 200,
              "resizeMode": "contain",
              "backgroundColor": "#ffffff"
            }
          ]
        ]
      }
    }
    ```

### Addressing Common Build Errors

#### Java Installation Issues (Gradle)

A recurring challenge was Gradle's inability to find a suitable Java installation (specifically Java 17, even with Java 21 present). This is often due to Termux's environment and Gradle's toolchain detection.

**Solutions attempted (and their effectiveness):**

*   **Setting `JAVA_HOME` environment variable:**
    ```bash
    export JAVA_HOME=/data/data/com.termux/files/usr/lib/jvm/java-21-openjdk
    ```
    *Result:* Did not consistently resolve the issue.
*   **Adding `org.gradle.java.home` to `android/gradle.properties`:**
    ```properties
    # android/gradle.properties
    org.gradle.java.home=/data/data/com.termux/files/usr/lib/jvm/java-21-openjdk
    ```
    *Result:* Did not consistently resolve the issue.
*   **Explicitly setting `sourceCompatibility` and `targetCompatibility` in `android/build.gradle`:**
    ```gradle
    // android/build.gradle
    allprojects {
      // ...
      afterEvaluate {
        if (project.hasProperty('android')) {
          android {
            compileOptions {
              sourceCompatibility JavaVersion.VERSION_17
              targetCompatibility JavaVersion.VERSION_17
            }
          }
        }
      }
    }
    ```
    *Result:* Did not consistently resolve the issue.
*   **Hardcoding `JAVACMD` in `android/gradlew` (Most Effective Local Fix):**
    This was the most reliable way to force Gradle to use the correct Java executable in Termux.
    ```bash
    # android/gradlew (around line 100, replace the if/else block for JAVACMD)
    # Determine the Java command to use to start the JVM.
    # Hardcoding JAVACMD due to persistent Java detection issues in Termux.
    JAVACMD="/data/data/com.termux/files/usr/lib/jvm/java-21-openjdk/bin/java"

    if [ ! -x "$JAVACMD" ] ; then
        die "ERROR: Hardcoded JAVACMD is not an executable: $JAVACMD

Please ensure Java is installed at this path."
    fi
    ```
    *Result:* Successfully bypassed the Java detection error.

#### "Address already in use" (Port 8081)

This error occurred frequently when running `npx expo run:android`, indicating that the Metro Bundler (or another process) was already holding port 8081.

**Solutions attempted (and their effectiveness):**

*   **`fuser -k 8081/tcp`:**
    *Result:* Failed due to Termux permission limitations (`Permission denied`).
*   **Rebooting the phone:**
    *Result:* Sometimes worked, but not consistently, indicating a persistent process.
*   **Changing port with `--port` flag:**
    ```bash
    npx expo run:android --port 8083
    ```
    *Result:* Did not consistently resolve, as `adb reverse` might still try to use 8081, or the underlying issue persisted.
*   **Force stopping Termux app:**
    *Result:* This was the most effective way to clear orphaned processes holding the port. Go to Android Settings > Apps > Termux > Force Stop.

### Setting up Local `expo run:android` (Wireless Debugging)

Running `npx expo run:android` directly on the device via Termux requires a stable `adb` connection. Wireless debugging is convenient but can be tricky.

1.  **Enable Developer Options & USB Debugging:**
    *   Go to **Settings > About phone**, tap **Build number** 7 times.
    *   Go to **Developer options**, enable **USB debugging**.
2.  **Enable Wireless Debugging:**
    *   In **Developer options**, enable **Wireless debugging**.
    *   **Crucially, tap on "Pair device with pairing code".** This will show an IP/Port and a 6-digit pairing code. **Keep this screen open.**
3.  **Pairing with `adb pair` (The Key Step!):**
    This step is vital for a stable connection from Termux on the same device.
    *   In Termux: `adb start-server`
    *   In Termux: `adb pair <IP_FROM_PAIRING_SCREEN>:<PORT_FROM_PAIRING_SCREEN>`
    *   **Quickly enter the 6-digit pairing code** from your phone's screen into the Termux prompt.
    *   *Lesson Learned:* The pairing dialog on the phone often closes or changes ports if you switch apps. Split-screen or extreme quickness is required.
4.  **Connecting with `adb connect`:**
    After successful pairing, your phone's Wireless Debugging settings might show a new IP/Port for connection.
    *   In Termux: `adb connect <IP_FOR_CONNECTION>:<PORT_FOR_CONNECTION>`
    *   Verify: `adb devices` (should show your device as `device`).

### Running the Development Build

Once `adb` is successfully connected and the port 8081 issue is resolved (e.g., by force-stopping Termux), you can run the local build:

```bash
cd /data/data/com.termux/files/home/github/getodone
npx expo run:android
```

This will build the APK, install it on your device, and start the Metro Bundler. Your app will then connect to this local server.

## EAS Build (Cloud Builds)

While local development is preferred for quick iterations, certain native features (like reliable background tasks and push notifications) often require a full native build. EAS Build provides this in the cloud.

1.  **Install EAS CLI:** `npm install -g eas-cli`
2.  **Log in to Expo:** `eas login` (requires interactive input in a standard terminal).
3.  **Install `expo-dev-client`:** `expo install expo-dev-client`
4.  **Initiate Build:**
    ```bash
    eas build --platform android --profile development
    ```
    *   *Note:* Free tier builds can have long queue times.
    *   *Previous Issues:* Initial builds failed due to incorrect image paths in `app.json` and a "Failed to compute project fingerprint" error (resolved by `EAS_SKIP_AUTO_FINGERPRINT=1` environment variable, though this was not needed after `app.json` fixes).

## Troubleshooting & Lessons Learned

*   **Persistent Java Errors:** When Gradle struggles to find Java in Termux, hardcoding `JAVACMD` in `android/gradlew` was the most effective solution.
*   **Port Conflicts:** "Address already in use" errors are often due to orphaned Metro Bundler processes. Force-stopping the Termux app is the most reliable way to clear them.
*   **Wireless Debugging Instability:** `adb pair` is crucial for stable wireless debugging from Termux on the same device. Be quick to enter the pairing code!
*   **Native Feature Testing:** For reliable testing of features like notifications and background tasks, a development build (either via `expo run:android` or EAS Build) is essential. Expo Go has limitations.
*   **Iterative Development:** Even with a development build, UI and JavaScript logic changes are fast. Only native code changes require a new build.
*   **Gemini CLI's Role:** The Gemini CLI was instrumental in navigating the file system, reading/writing files, and executing shell commands, making the entire debugging and development process within Termux manageable.

---