import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedTextInput } from '@/components/ThemedTextInput';
import { startForegroundService, stopForegroundService, isForegroundServiceRunning } from '@/services/foregroundService';
import { useFocusEffect } from '@react-navigation/native';

export default function ForegroundServiceScreen() {
  const [isRunning, setIsRunning] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('Your custom persistent message here.');

  const checkStatus = useCallback(async () => {
    const running = await isForegroundServiceRunning();
    setIsRunning(running);
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkStatus();
    }, [checkStatus])
  );

  const handleStartService = async () => {
    try {
      await startForegroundService(notificationMessage);
      setIsRunning(true);
      Alert.alert('Service Started', 'Foreground service is now running with your custom message.');
    } catch (error) {
      console.error('Failed to start foreground service:', error);
      Alert.alert('Error', 'Failed to start foreground service.');
    }
  };

  const handleStopService = async () => {
    try {
      await stopForegroundService();
      setIsRunning(false);
      Alert.alert('Service Stopped', 'Foreground service has been stopped. The persistent notification should disappear.');
    } catch (error) {
      console.error('Failed to stop foreground service:', error);
      Alert.alert('Error', 'Failed to stop foreground service.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Foreground Service</ThemedText>
      <ThemedText style={styles.statusText}>
        Status: <ThemedText style={isRunning ? styles.running : styles.stopped}>{isRunning ? 'Running' : 'Stopped'}</ThemedText>
      </ThemedText>

      <ThemedText style={styles.label}>Persistent Notification Message:</ThemedText>
      <ThemedTextInput
        style={styles.input}
        value={notificationMessage}
        onChangeText={setNotificationMessage}
        placeholder="Enter message for persistent notification"
      />

      <TouchableOpacity
        onPress={handleStartService}
        style={[styles.button, styles.startButton, isRunning && styles.buttonDisabled]}
        disabled={isRunning}
      >
        <ThemedText style={styles.buttonText}>Start Foreground Service</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleStopService}
        style={[styles.button, styles.stopButton, !isRunning && styles.buttonDisabled]}
        disabled={!isRunning}
      >
        <ThemedText style={styles.buttonText}>Stop Foreground Service</ThemedText>
      </TouchableOpacity>

      <ThemedText style={styles.infoText}>
        Note: A running foreground service will display a persistent notification that can only be cleared from within this app.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: 20,
  },
  statusText: {
    fontSize: 18,
    marginBottom: 20,
  },
  running: {
    color: 'green',
    fontWeight: 'bold',
  },
  stopped: {
    color: 'red',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    width: '80%',
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '80%',
    marginBottom: 10,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  infoText: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
  },
});