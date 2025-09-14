import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, ScrollView, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { createClaimAndConversation } from '../api/claims';

const ItemDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { itemId } = route.params;
  const [isClaiming, setIsClaiming] = useState(false);

  const { data: item, isLoading, error } = useQuery({
    queryKey: ['item', itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select(`*, images ( * )`)
        .eq('id', itemId)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const handleClaim = async () => {
    if (!user || !item) return;

    setIsClaiming(true);
    try {
      const conversation = await createClaimAndConversation(item.id, item.created_by, user.id);
      navigation.navigate('Chat', { conversationId: conversation.id });
    } catch (error) {
      Alert.alert('Error', `Failed to create claim: ${error.message}`);
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoading) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#FFD700" /></View>;
  }

  if (error) {
    return <View style={styles.container}><Text style={styles.errorText}>Error: {error.message}</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{item.description || 'Item Details'}</Text>
      <Text style={styles.text}>{item.description_auto}</Text>
      <View style={styles.buttonContainer}>
        <Button
          title={isClaiming ? "Claiming..." : "This Might Be Mine"}
          onPress={handleClaim}
          color="#FFD700"
          disabled={isClaiming || user?.id === item.created_by}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A192F',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 15,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 30,
  }
});

export default ItemDetailScreen;
