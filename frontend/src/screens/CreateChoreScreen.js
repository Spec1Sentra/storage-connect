import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';
import { createChore } from '../services/api';

const CreateChoreScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('1'); // Default level

  const handleCreateChore = async () => {
    if (!title || !level) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    try {
      await createChore({
        title,
        description,
        level: parseInt(level, 10),
      });
      Alert.alert('Success', 'Chore created successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to create chore', error);
      Alert.alert('Error', 'Could not create the chore.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Chore Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g., Wash the dishes"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="e.g., Please wash all the plates and cups in the sink."
        multiline
      />

      <Text style={styles.label}>Difficulty Level (1-3)</Text>
      <TextInput
        style={styles.input}
        value={level}
        onChangeText={(text) => {
            if (/^[1-3]$/.test(text) || text === '') {
                setLevel(text);
            }
        }}
        placeholder="1 (easy), 2 (medium), 3 (hard)"
        keyboardType="numeric"
      />

      <Button title="Create Chore" onPress={handleCreateChore} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});

export default CreateChoreScreen;
