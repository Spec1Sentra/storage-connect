import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMyPostedChores, getMyClaimedChores } from '../services/api';

const MyChoresScreen = ({ navigation }) => {
    const [postedChores, setPostedChores] = useState([]);
    const [claimedChores, setClaimedChores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchChores = async () => {
        try {
            setLoading(true);
            const [postedRes, claimedRes] = await Promise.all([
                getMyPostedChores(),
                getMyClaimedChores(),
            ]);
            setPostedChores(postedRes.data);
            setClaimedChores(claimedRes.data);
        } catch (error) {
            console.error('Failed to fetch chores', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchChores();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchChores();
    };

    const renderChoreItem = ({ item }) => (
        <TouchableOpacity style={styles.choreItem} onPress={() => navigation.navigate('ChoreDetail', { choreId: item._id })}>
            <Text style={styles.choreTitle}>{item.title}</Text>
            <Text style={styles.choreStatus}>{item.status}</Text>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return <ActivityIndicator size="large" style={styles.loader} />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Chores I've Claimed</Text>
            <FlatList
                data={claimedChores}
                renderItem={renderChoreItem}
                keyExtractor={(item) => `claimed-${item._id}`}
                ListEmptyComponent={<Text style={styles.emptyText}>You haven't claimed any chores yet.</Text>}
                style={styles.list}
            />

            <Text style={styles.sectionTitle}>Chores I've Posted</Text>
            <FlatList
                data={postedChores}
                renderItem={renderChoreItem}
                keyExtractor={(item) => `posted-${item._id}`}
                ListEmptyComponent={<Text style={styles.emptyText}>You haven't posted any chores yet.</Text>}
                style={styles.list}
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
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    list: {
        flex: 1,
    },
    choreItem: {
        backgroundColor: '#f9f9f9',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 10,
        borderRadius: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    choreTitle: {
        fontSize: 16,
    },
    choreStatus: {
        fontSize: 14,
        color: '#666',
        textTransform: 'capitalize',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 14,
    },
});

export default MyChoresScreen;
