import React, {useEffect, useState, createContext} from 'react';
import {LogBox, View, ActivityIndicator} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Provider as PaperProvider} from 'react-native-paper';
import firebaseApp, {auth, firestore} from './firebaseConfig';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import Onboarding from './src/screens/Onboarding';
import CircleScreen from './src/screens/CircleScreen';
import ChoreCreate from './src/screens/ChoreCreate';
import ProfileScreen from './src/screens/ProfileScreen';

LogBox.ignoreAllLogs(true);

export const UserContext = createContext(null);
const Stack = createNativeStackNavigator();

export default function App(){
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const unsub = auth.onAuthStateChanged(async(u)=>{
      if(u){
        // ensure user doc exists
        const ref = firestore.collection('users').doc(u.uid);
        const snap = await ref.get();
        if(!snap.exists){
          await ref.set({
            name: u.displayName || u.email.split('@')[0],
            email: u.email,
            createdAt: new Date(),
            credits: 0,
            xp: 0,
            karma: 0,
            personality: null,
            circles: [],
            avatar: null
          });
        }
        const userDoc = (await ref.get()).data();
        setUser({uid: u.uid, ...userDoc});
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return ()=>unsub();
  },[]);

  if(loading) return (<View style={{flex:1,alignItems:'center',justifyContent:'center'}}><ActivityIndicator size="large"/></View>);

  return (
    <PaperProvider>
      <UserContext.Provider value={{user, setUser}}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{headerShown:false}}>
            {!user ? (
              <Stack.Screen name="Auth" component={AuthScreen} />
            ) : !user.personality ? (
              <Stack.Screen name="Onboarding" component={Onboarding} />
            ) : (
              <>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Circle" component={CircleScreen} />
                <Stack.Screen name="Create" component={ChoreCreate} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </UserContext.Provider>
    </PaperProvider>
  );
}
