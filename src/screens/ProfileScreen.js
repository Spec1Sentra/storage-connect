import React, {useContext, useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert} from 'react-native';
import {UserContext} from '../../App';
import {doc, updateDoc, collection, query, where, onSnapshot, increment} from 'firebase/firestore';
import {firestore} from '../../firebaseConfig';
import dayjs from 'dayjs';

export default function ProfileScreen() {
  const {user} = useContext(UserContext);
  const [postedChores, setPostedChores] = useState([]);
  const [claimedChores, setClaimedChores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    // Listener for chores posted by the user
    const postedQuery = query(collection(firestore, 'chores'), where('poster', '==', user.uid));
    const unsubPosted = onSnapshot(postedQuery, snapshot => {
      setPostedChores(snapshot.docs.map(d => ({id: d.id, ...d.data()})));
    });

    // Listener for chores claimed by the user
    const claimedQuery = query(collection(firestore, 'chores'), where('claimer', '==', user.uid), where('status', '==', 'claimed'));
    const unsubClaimed = onSnapshot(claimedQuery, snapshot => {
      setClaimedChores(snapshot.docs.map(d => ({id: d.id, ...d.data()})));
      setLoading(false);
    });

    return () => {
      unsubPosted();
      unsubClaimed();
    };
  }, [user]);

  const markAsComplete = async (chore) => {
    if (chore.status !== 'claimed') {
      Alert.alert("Error", "This chore has not been claimed yet.");
      return;
    }
    // Confirmation dialog
    Alert.alert(
      "Confirm Completion",
      `Are you sure you want to mark "${chore.title}" as complete? This will trigger the credit transfer.`,
      [
        {text: "Cancel", style: "cancel"},
        {
          text: "Confirm",
          onPress: async () => {
            const choreRef = doc(firestore, 'chores', chore.id);
            await updateDoc(choreRef, {
              status: 'completed',
              completedAt: new Date()
            });
            // Credit transfer logic is handled by the cloud function
          }
        }
      ]
    );
  };

  const leaveReview = (chore, rating) => {
    const isPoster = chore.poster === user.uid;
    const userToReview = isPoster ? chore.claimer : chore.poster;
    const reviewField = isPoster ? 'posterReviewed' : 'claimerReviewed';

    const userRef = doc(firestore, 'users', userToReview);
    const choreRef = doc(firestore, 'chores', chore.id);

    // Simple karma logic: +1 for good, -1 for bad
    const karmaUpdate = rating > 3 ? 1 : -1;

    updateDoc(userRef, { karma: increment(karmaUpdate) });
    updateDoc(choreRef, { [reviewField]: true });

    Alert.alert("Review Submitted", "Thank you for your feedback!");
  };

  const handleReview = (chore) => {
    Alert.alert(
      "Leave a Review",
      `How was your experience with this chore?`,
      [
        {text: "Good (+1 Karma)", onPress: () => leaveReview(chore, 5)},
        {text: "Bad (-1 Karma)", onPress: () => leaveReview(chore, 1)},
        {text: "Cancel", style: "cancel"}
      ]
    );
  };

  const renderChoreItem = ({item}, isPostedList) => {
    const isPoster = item.poster === user.uid;
    const canComplete = isPostedList && item.status === 'claimed';

    // Determine if review button should be shown
    const showReviewButton = item.status === 'completed' &&
      (isPoster ? !item.posterReviewed : !item.claimerReviewed);

    return (
      <View style={styles.choreItem}>
        <View style={{flex: 1}}>
          <Text style={styles.choreTitle}>{item.title}</Text>
          <Text style={styles.choreStatus}>Status: {item.status}</Text>
          <Text style={styles.choreDate}>
            {item.status === 'completed' ? `Completed ${dayjs(item.completedAt?.toDate()).fromNow()}`: (item.status === 'claimed' ? `Claimed ${dayjs(item.claimedAt?.toDate()).fromNow()}` : `Posted ${dayjs(item.createdAt.toDate()).fromNow()}`)}
          </Text>
        </View>
        {canComplete && (
          <TouchableOpacity style={styles.completeBtn} onPress={() => markAsComplete(item)}>
            <Text style={{color: '#fff'}}>Complete</Text>
          </TouchableOpacity>
        )}
        {showReviewButton && (
          <TouchableOpacity style={styles.reviewBtn} onPress={() => handleReview(item)}>
            <Text style={{color: '#fff'}}>Review</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return <View style={{flex: 1, justifyContent: 'center'}}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{user.name}'s Profile</Text>
      <Text style={styles.stats}>Credits: {user.credits} | XP: {user.xp} | Karma: {user.karma}</Text>

      <Text style={styles.sectionTitle}>My Posted Chores</Text>
      <FlatList
        data={postedChores}
        renderItem={(props) => renderChoreItem(props, true)}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>You haven't posted any chores.</Text>}
      />

      <Text style={styles.sectionTitle}>My Claimed Chores</Text>
      <FlatList
        data={claimedChores}
        renderItem={(props) => renderChoreItem(props, false)}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>You haven't claimed any chores.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, backgroundColor: '#f8f9fa'},
  header: {fontSize: 24, fontWeight: '700', marginTop: 30},
  stats: {fontSize: 16, color: '#666', marginBottom: 20},
  sectionTitle: {fontSize: 20, fontWeight: '600', marginTop: 20, marginBottom: 10, borderTopWidth: 1, borderColor: '#eee', paddingTop: 20},
  choreItem: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8},
  choreTitle: {fontSize: 16, fontWeight: '500'},
  choreStatus: {fontSize: 14, color: '#444', fontStyle: 'italic'},
  choreDate: {fontSize: 12, color: '#999', marginTop: 4},
  emptyText: {textAlign: 'center', color: '#666', marginTop: 10},
  completeBtn: {backgroundColor: '#28a745', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, marginLeft: 8},
  reviewBtn: {backgroundColor: '#007bff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, marginLeft: 8},
});
