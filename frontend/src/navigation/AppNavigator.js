import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

// Import Navigators and Screens
import MainTabNavigator from './MainTabNavigator';
import LoginScreen from '../screens/LoginScreen';
import ChoreDetailScreen from '../screens/ChoreDetailScreen';
import CreateChoreScreen from '../screens/CreateChoreScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
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
          // Main App Flow (Tabs and other screens)
          <>
            <Stack.Screen
              name="Main"
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="ChoreDetail" component={ChoreDetailScreen} options={{ title: 'Chore Details' }} />
            <Stack.Screen name="CreateChore" component={CreateChoreScreen} options={{ title: 'Create Chore' }} />
          </>
        ) : (
          // Auth Flow
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
