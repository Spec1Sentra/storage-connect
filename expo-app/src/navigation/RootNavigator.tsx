import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { registerForPushNotificationsAsync } from '../lib/notifications';
import SearchScreen from '../screens/SearchScreen';
import UploadScreen from '../screens/UploadScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuthScreen from '../screens/AuthScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import ChatScreen from '../screens/ChatScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const SearchStack = createNativeStackNavigator();
const MessagesStack = createNativeStackNavigator();

const SearchNavigator = () => (
  <SearchStack.Navigator screenOptions={{ headerShown: false }}>
    <SearchStack.Screen name="SearchList" component={SearchScreen} />
    <SearchStack.Screen name="ItemDetail" component={ItemDetailScreen} />
    <SearchStack.Screen name="Chat" component={ChatScreen} />
  </SearchStack.Navigator>
);

const MessagesNavigator = () => (
    <MessagesStack.Navigator screenOptions={{ headerShown: false }}>
        <MessagesStack.Screen name="MessagesList" component={MessagesScreen} />
        <MessagesStack.Screen name="Chat" component={ChatScreen} />
    </MessagesStack.Navigator>
)

const AppTabs = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      registerForPushNotificationsAsync(user.id);
    }
  }, [user]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0A192F' },
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: '#8892B0',
      }}
    >
      <Tab.Screen name="Search" component={SearchNavigator} />
      <Tab.Screen name="Upload" component={UploadScreen} />
      <Tab.Screen name="Messages" component={MessagesNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A192F' }}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="App" component={AppTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
