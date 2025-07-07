import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Platform, TouchableOpacity, Alert } from 'react-native';
import { ThemedTextInput } from './ThemedTextInput';
import { Picker } from '@react-native-picker/picker';
import { Settings } from '../services/types';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface SettingsFormProps {
  initialSettings: Settings;
  onSave: (settings: Settings) => void;
  onTestNotification: () => void;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ initialSettings, onSave, onTestNotification }) => {
  const [notificationFrequency, setNotificationFrequency] = useState(initialSettings.notificationFrequency);
  const [aiTone, setAiTone] = useState(initialSettings.aiTone);
  const [apiKey, setApiKey] = useState(initialSettings.apiKey);
  const [model, setModel] = useState(initialSettings.model);
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(initialSettings.notificationsEnabled);
  const [customTime, setCustomTime] = useState(initialSettings.customNotificationTime || '10:00');

  const handleSave = () => {
    onSave({
      notificationFrequency,
      aiTone,
      apiKey,
      model,
      notificationsEnabled,
      customNotificationTime: customTime,
    });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.switchContainer}>
        <ThemedText style={styles.label}>Enable Motivational Nudges:</ThemedText>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={notificationsEnabled ? "#f5dd4b" : "#f4f3f4"}
          ios_backgroundColor="#3e3e3e"
          onValueChange={setNotificationsEnabled}
          value={notificationsEnabled}
        />
      </View>
      <ThemedText style={styles.label}>Notification Frequency:</ThemedText>
      <Picker
        selectedValue={notificationFrequency}
        onValueChange={(itemValue) => setNotificationFrequency(itemValue)}
        style={styles.picker}
        itemStyle={styles.pickerItem}
      >
        <Picker.Item label="Hourly" value="hourly" />
        <Picker.Item label="3 times a day" value="3-per-day" />
        <Picker.Item label="Daily" value="daily" />
        <Picker.Item label="Next 1 Min" value="1-min" />
        <Picker.Item label="Custom" value="custom" />
      </Picker>

      {notificationFrequency === 'custom' && (
        <>
          <ThemedText style={styles.label}>Custom Notification Time (HH:MM):</ThemedText>
          <ThemedTextInput
            style={styles.input}
            value={customTime}
            onChangeText={setCustomTime}
            placeholder="e.g., 14:30"
          />
        </>
      )}

      <ThemedText style={styles.label}>AI Tone:</ThemedText>
      <Picker
        selectedValue={aiTone}
        onValueChange={(itemValue) => setAiTone(itemValue)}
        style={styles.picker}
        itemStyle={styles.pickerItem}
      >
        <Picker.Item label="Soft" value="soft" />
        <Picker.Item label="Hard" value="hard" />
        <Picker.Item label="Neutral" value="neutral" />
      </Picker>

      <ThemedText style={styles.label}>Groq API Key:</ThemedText>
      <View style={styles.apiKeyInputContainer}>
        <ThemedTextInput
          style={[styles.input, styles.apiKeyInput]}
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="sk-..."
          secureTextEntry={!isApiKeyVisible}
        />
        <TouchableOpacity onPress={() => setIsApiKeyVisible(!isApiKeyVisible)} style={styles.toggleVisibilityButton}>
          <ThemedText>{isApiKeyVisible ? 'Hide' : 'Show'}</ThemedText>
        </TouchableOpacity>
      </View>

      <ThemedText style={styles.label}>AI Model:</ThemedText>
      <ThemedTextInput
        style={styles.input}
        value={model}
        onChangeText={setModel}
        placeholder="e.g., gpt-4o-mini, llama3-8b-instruct"
      />

      <TouchableOpacity onPress={onTestNotification} style={styles.testButton}>
        <ThemedText style={styles.testButtonText}>Test Motivation Message</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
        <ThemedText style={styles.saveButtonText}>Save Settings</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  pickerItem: {
    height: 50, // Ensure consistent height across platforms
  },
  input: {
    // ThemedTextInput handles border and color
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  apiKeyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
  },
  apiKeyInput: {
    flex: 1,
    borderWidth: 0, // Remove individual border as it's on the container
  },
  toggleVisibilityButton: {
    padding: 10,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  testButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  debugButton: {
    backgroundColor: '#FFC107',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  debugButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});