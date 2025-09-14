import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, Alert } from 'react-native';
import { getChoreById, claimChore, completeChore, verifyChore } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const ChoreDetailScreen = ({ route, navigation }) => {
  const { choreId } = route.params;
  const { user } = useContext(AuthContext); // Get the current user from context
  const [chore, setChore] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchChoreDetails = async () => {
    try {
      const response = await getChoreById(choreId);
      setChore(response.data);
    } catch (error) {
      console.error('Failed to fetch chore details', error);
      Alert.alert('Error', 'Could not load chore details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChoreDetails();
  }, [choreId]);

  const handleClaimChore = async () => {
    setLoading(true);
    try {
      await claimChore(choreId);
      Alert.alert('Success', 'You have claimed this chore!');
      fetchChoreDetails(); // Refetch to update status
    } catch (error) {
      console.error('Failed to claim chore', error);
      Alert.alert('Error', error.response?.data?.error || 'Could not claim this chore.');
      setLoading(false);
    }
  };

  const handleCompleteChore = async () => {
    setLoading(true);
    try {
      // For the MVP, we send a placeholder URL. A real app would use an image picker.
      await completeChore(choreId, { proofOfCompletionUrl: 'https://example.com/proof.jpg' });
      Alert.alert('Success', 'Chore marked as complete!');
      fetchChoreDetails(); // Refetch to update status
    } catch (error) {
      console.error('Failed to complete chore', error);
      Alert.alert('Error', error.response?.data?.error || 'Could not complete this chore.');
      setLoading(false);
    }
  };

  const handleVerifyChore = async () => {
    setLoading(true);
    try {
      await verifyChore(choreId);
      Alert.alert('Success', 'Chore has been verified!');
      navigation.navigate('Home'); // Go back to marketplace after verification
    } catch (error) {
      console.error('Failed to verify chore', error);
      Alert.alert('Error', error.response?.data?.error || 'Could not verify this chore.');
      setLoading(false);
    }
  };


  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  if (!chore) {
    return <View style={styles.container}><Text>Chore not found.</Text></View>;
  }

  const isCreator = user && chore.createdBy._id === user._id;
  const isCompleter = user && chore.completedBy && chore.completedBy === user._id;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{chore.title}</Text>
      <Text style={styles.description}>{chore.description}</Text>
      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>Credits: {chore.credits}</Text>
        <Text style={styles.detailText}>Level: {chore.level}</Text>
        <Text style={styles.detailText}>Status: {chore.status}</Text>
        <Text style={styles.detailText}>Posted by: {chore.createdBy.displayName}</Text>
      </View>

      {chore.status === 'posted' && !isCreator && (
        <Button title="Claim This Chore" onPress={handleClaimChore} />
      )}
      {chore.status === 'in_progress' && isCompleter && (
        <Button title="Mark as Complete" onPress={handleCompleteChore} />
      )}
      {chore.status === 'completed' && isCreator && (
        <Button title="Verify Completion" onPress={handleVerifyChore} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        marginBottom: 20,
    },
    detailsContainer: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
    },
    detailText: {
        fontSize: 16,
        marginBottom: 5,
    },
});

export default ChoreDetailScreen;
