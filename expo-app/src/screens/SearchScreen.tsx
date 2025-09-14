import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useNavigation } from '@react-navigation/native';

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const navigation = useNavigation();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['searchItems', query],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('search_items', {
        body: { query_text: query, match_limit: 20 }
      });
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: false, // Only refetch manually
  });

  const handleSearch = () => {
    refetch();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
    >
      <Text style={styles.itemText}>{item.description || 'No description'}</Text>
      <Text style={styles.itemDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search for Items</Text>
      <TextInput
        style={styles.input}
        placeholder="Search by keyword..."
        placeholderTextColor="#8892B0"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
      />
      <Button title="Search" onPress={handleSearch} color="#FFD700" />

      {isLoading && <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 20 }} />}

      {error && <Text style={styles.errorText}>Error: {error.message}</Text>}

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.list}
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
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#1D2D44',
    borderRadius: 5,
    paddingHorizontal: 15,
    color: '#FFFFFF',
    marginBottom: 15,
  },
  list: {
    marginTop: 20,
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
  itemDate: {
    color: '#8892B0',
    fontSize: 12,
    marginTop: 5,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default SearchScreen;
