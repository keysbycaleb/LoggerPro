
import React, { useState, useEffect, useMemo } from 'react';
import { Button, FlatList, Text, View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../firebaseConfig';
import { RatingPreference, RideLog } from '../types';
import { calculateOverallRating } from '../lib/math';
import { useNavigation } from '@react-navigation/native';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const userUID = "test-user";

export default function LogbookScreen() {
  const [rideLogs, setRideLogs] = useState<RideLog[]>([]);
  const [currentUserPreferences, setCurrentUserPreferences] = useState<RatingPreference[]>([]);
  const [sortOrder, setSortOrder] = useState('original');
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const userDocRef = doc(db, "users", userUID);
        const userDocSnap = await getDoc(userDocRef);
        const preferences = userDocSnap.exists() ? userDocSnap.data().ratingPreferences || [] : [];
        setCurrentUserPreferences(preferences);

        if (preferences.length === 0) {
          navigation.navigate('rating-dna');
        }

        const rideLogsCollectionRef = collection(db, "users", userUID, "rideLogs");
        const querySnapshot = await getDocs(rideLogsCollectionRef);
        const logs = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as RideLog);
        setRideLogs(logs);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigation]);

  const sortedLogs = useMemo(() => {
    const getScore = (log: RideLog, useCurrent: boolean) => {
        if (!useCurrent) return log.overallRating;
        if (currentUserPreferences.length === 0) return log.overallRating;

        const weightedCriteria = log.ratedCriteria.map(c => ({
            ...c,
            weight: currentUserPreferences.find(p => p.id === c.id)?.weight || 0,
        }));
        return calculateOverallRating(weightedCriteria);
    };

    return [...rideLogs].sort((a, b) => {
        const scoreA = getScore(a, sortOrder === 'current');
        const scoreB = getScore(b, sortOrder === 'current');
        return scoreB - scoreA;
    });
  }, [rideLogs, sortOrder, currentUserPreferences]);

  const renderItem = ({ item }: { item: RideLog }) => {
    const currentScore = calculateOverallRating(
        item.ratedCriteria.map(c => ({
            ...c,
            weight: currentUserPreferences.find(p => p.id === c.id)?.weight || 0,
        }))
    );

    return (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ride-detail', { rideId: item.id })}>
            <Text style={styles.rideName}>Ride Name Placeholder</Text>
            <View style={styles.scoresContainer}>
                <View style={styles.scoreBox}>
                    <Text style={styles.scoreLabel}>Original Score</Text>
                    <Text style={styles.scoreValue}>{item.overallRating.toFixed(2)}</Text>
                </View>
                <View style={styles.scoreBox}>
                    <Text style={styles.scoreLabel}>Current Score</Text>
                    <Text style={styles.scoreValue}>{currentScore.toFixed(2)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <View style={styles.container}><Text>Loading logbook...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Logbook</Text>
        <TouchableOpacity onPress={() => navigation.navigate('add-ride')} style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add Ride</Text>
        </TouchableOpacity>
      <View style={styles.sortContainer}>
        <TouchableOpacity onPress={() => setSortOrder('original')} style={[styles.sortButton, sortOrder === 'original' && styles.sortButtonActive]}>
            <Text style={styles.sortButtonText}>Sort by Original</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSortOrder('current')} style={[styles.sortButton, sortOrder === 'current' && styles.sortButtonActive]}>
            <Text style={styles.sortButtonText}>Sort by Current</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={sortedLogs}
        renderItem={renderItem}
        keyExtractor={item => item.id!}
        ListEmptyComponent={<Text style={styles.emptyText}>You haven't logged any rides yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
    },
    addButton: {
        backgroundColor: '#1fb28a',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    addButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    sortContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    sortButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#ddd',
        borderRadius: 20,
        marginHorizontal: 5,
    },
    sortButtonActive: {
        backgroundColor: '#1fb28a',
    },
    sortButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    rideName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    scoresContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    scoreBox: {
        alignItems: 'center',
    },
    scoreLabel: {
        fontSize: 14,
        color: '#666',
    },
    scoreValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1fb28a',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    },
});
