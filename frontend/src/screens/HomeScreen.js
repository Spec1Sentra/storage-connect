import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Button, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getChores } from '../services/api';

const HomeScreen = ({ navigation }) => {
  const [chores, setChores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChores = async () => {
    try {
      const response = await getChores();
      setChores(response.data);
    } catch (error) {
      console.error('Failed to fetch chores', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // useFocusEffect to refetch chores when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchChores();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchChores();
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  const renderChore = ({ item }) => (
    <TouchableOpacity style={styles.choreItem} onPress={() => navigation.navigate('ChoreDetail', { choreId: item._id })}>
      <View>
        <Text style={styles.choreTitle}>{item.title}</Text>
        <Text style={styles.choreCredits}>{item.credits} Credits</Text>
      </View>
      <Text style={styles.choreUser}>by {item.createdBy.displayName}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button
            title="Create a New Chore"
            onPress={() => navigation.navigate('CreateChore')}
        />
        <Button
            title="My Chores"
            onPress={() => navigation.navigate('MyChores')}
        />
      </View>
      <FlatList
        data={chores}
        renderItem={renderChore}
        keyExtractor={(item) => item._id}
        style={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No chores available right now. Check back later!</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        marginTop: 20,
    },
    choreItem: {
        backgroundColor: '#f9f9f9',
        padding: 20,
        marginVertical: 8,
        borderRadius: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    choreTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    choreCredits: {
        fontSize: 14,
        color: 'green',
    },
    choreUser: {
        fontSize: 12,
        color: '#666',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    },
});

export default HomeScreen;
