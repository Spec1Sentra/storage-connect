import React from 'react';
import { View, Text, StyleSheet, Button, FlatList, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
  const { user } = useAuth();

  const { data: items, isLoading, error } = useQuery({
    queryKey: ['userItems', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!user,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Profile</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <Text style={styles.subtitle}>Your Items</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#FFD700" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text style={styles.itemText}>{item.description || 'No description'}</Text>
              <Text style={styles.itemStatus}>Status: {item.status}</Text>
            </View>
          )}
        />
      )}

      <View style={styles.buttonContainer}>
        <Button title="Logout" onPress={handleLogout} color="#FFD700" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A192F',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 20,
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
    color: '#8892B0',
    textAlign: 'center',
    marginBottom: 20,
  },
  itemContainer: {
    backgroundColor: '#1D2D44',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  itemText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  itemStatus: {
    color: '#8892B0',
    fontSize: 12,
    marginTop: 5,
  },
  buttonContainer: {
    marginTop: 30,
  }
});

export default ProfileScreen;
