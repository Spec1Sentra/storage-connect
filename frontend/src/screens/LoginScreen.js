import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { AuthContext } from '../context/AuthContext';

// You must get this from your Google API Console
const WEB_CLIENT_ID = process.env.GOOGLE_WEB_CLIENT_ID || 'your_google_web_client_id_here';

const LoginScreen = () => {
  const { login } = useContext(AuthContext);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: true, // if you want to access user data while offline
    });
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();

      if (idToken) {
        const success = await login(idToken);
        if (!success) {
          Alert.alert('Login Failed', 'Could not log in with the server. Please try again.');
        }
        // On successful login, the AppNavigator will automatically switch screens
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
        console.log('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
        console.log('Sign in is in progress already');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
        Alert.alert('Login Error', 'Google Play Services not available or outdated.');
      } else {
        // some other error happened
        console.error(error);
        Alert.alert('Login Error', 'An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ChoreSwap</Text>
      <Button
        title="Sign In with Google"
        onPress={handleGoogleSignIn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default LoginScreen;
