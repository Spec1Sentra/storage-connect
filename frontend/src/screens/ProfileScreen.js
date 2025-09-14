import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Button } from 'react-native';
import { getMyProfile } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const ProfileScreen = () => {
    const { logout } = useContext(AuthContext);
    const { user: authUser } = useContext(AuthContext); // Get user from AuthContext for basic info
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getMyProfile();
                setProfile(response.data);
            } catch (error) {
                console.error('Failed to fetch profile', error);
                Alert.alert('Error', 'Could not load your profile.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return <ActivityIndicator size="large" style={styles.loader} />;
    }

    if (!profile) {
        return <View style={styles.container}><Text>Could not load profile.</Text></View>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.name}>{profile.displayName}</Text>
            <Text style={styles.email}>{profile.email}</Text>

            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{profile.level}</Text>
                    <Text style={styles.statLabel}>Level</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{profile.xp}</Text>
                    <Text style={styles.statLabel}>XP</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{profile.credits}</Text>
                    <Text style={styles.statLabel}>Credits</Text>
                </View>
            </View>

            <Button title="Logout" onPress={logout} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    email: {
        fontSize: 16,
        color: 'gray',
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    statBox: {
        alignItems: 'center',
        padding: 10,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 14,
        color: 'gray',
    },
});

export default ProfileScreen;
