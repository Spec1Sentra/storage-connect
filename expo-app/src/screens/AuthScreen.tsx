import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabaseClient';

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Login Error', error.message);
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: email.split('@')[0] || 'New User', // Default display name
        }
      }
    });
    if (error) {
      Alert.alert('Sign Up Error', error.message);
    } else {
      Alert.alert('Success', 'Please check your email for a confirmation link.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Storage Connection</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#8892B0"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#8892B0"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" />
      ) : (
        <>
          <View style={styles.buttonContainer}>
            <Button title="Sign In" onPress={handleLogin} color="#FFD700" />
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Sign Up" onPress={handleSignUp} color="#FFD700" />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A192F',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#1D2D44',
    borderRadius: 5,
    paddingHorizontal: 15,
    color: '#FFFFFF',
    marginBottom: 15,
  },
  buttonContainer: {
    width: '100%',
    marginVertical: 5,
  },
});

export default AuthScreen;
