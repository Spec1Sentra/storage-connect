import React, {useState, useEffect, useContext} from 'react';
import {View, Text, FlatList, StyleSheet, ActivityIndicator} from 'react-native';
import {firestore} from '../../firebaseConfig';
import {collection, query, where, onSnapshot, orderBy} from 'firebase/firestore';
import {UserContext} from '../../App';
import ChoreCard from '../shared/ChoreCard';

export default function CircleScreen({navigation}) {
  const {user} = useContext(UserContext);
  const [chores, setChores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assuming the user is part of at least one circle.
  // The UI for joining/creating circles is not yet built.
  const circleId = user.circles && user.circles.length > 0 ? user.circles[0] : null;

  useEffect(() => {
    if (!circleId) {
      setLoading(false);
      return;
    }

    const choresRef = collection(firestore, 'chores');
    const q = query(
      choresRef,
      where('circleId', '==', circleId),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const choresData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChores(choresData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [circleId]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  if (!circleId) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No Circle Found</Text>
        <Text style={styles.subtitle}>You are not part of any circle yet. Join or create one to see chores.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chores in Your Circle</Text>
      {chores.length === 0 ? (
        <Text style={styles.subtitle}>No open chores available in this circle.</Text>
      ) : (
        <FlatList
          data={chores}
          renderItem={({item}) => <ChoreCard chore={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={{paddingBottom: 20}}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 30,
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
});
