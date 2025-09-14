import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const MessagesScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();

  const { data: conversations, isLoading, error } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          claim_id,
          item:items (id, description)
        `)
        .or(`item_owner_id.eq.${user.id},claimant_id.eq.${user.id}`);

      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#FFD700" /></View>;
  }

  if (error) {
    return <View style={styles.container}><Text style={styles.errorText}>Error: {error.message}</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Conversations</Text>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => navigation.navigate('Chat', { conversationId: item.id })}
          >
            <Text style={styles.itemText}>Conversation about: {item.item?.description || 'an item'}</Text>
          </TouchableOpacity>
        )}
      />
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
    marginBottom: 20,
    textAlign: 'center',
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
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default MessagesScreen;
