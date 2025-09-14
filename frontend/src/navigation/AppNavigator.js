import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ChoreDetailScreen from '../screens/ChoreDetailScreen';
import CreateChoreScreen from '../screens/CreateChoreScreen';
import MyChoresScreen from '../screens/MyChoresScreen';
import { View, ActivityIndicator } from 'react-native';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    // Show a loading spinner while checking for token
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isAuthenticated ? (
          // Main App Screens
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Marketplace' }} />
            <Stack.Screen name="MyChores" component={MyChoresScreen} options={{ title: 'My Chores' }} />
            <Stack.Screen name="ChoreDetail" component={ChoreDetailScreen} options={{ title: 'Chore Details' }} />
            <Stack.Screen name="CreateChore" component={CreateChoreScreen} options={{ title: 'Create Chore' }} />
          </>
        ) : (
          // Auth Screens
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
