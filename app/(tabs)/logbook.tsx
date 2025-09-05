
import React, { useState, useEffect, useMemo } from 'react';
import { Button, FlatList, Text, View } from 'react-native';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../firebaseConfig';
import { RatingPreference, RideLog } from '../../types';
import { calculateOverallRating } from '../../lib/math';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userUID = "test-user"; // Placeholder

export default function LogbookScreen() {
  const [rideLogs, setRideLogs] = useState<RideLog[]>([]);
  const [currentUserPreferences, setCurrentUserPreferences] = useState<RatingPreference[]>([]);
  const [sortOrder, setSortOrder] = useState('original'); // 'original' or 'current'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch user's current preferences
        const userDocRef = doc(db, "users", userUID);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setCurrentUserPreferences(userDocSnap.data().ratingPreferences || []);
        }

        // Fetch all ride logs
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
  }, []);

  const sortedLogs = useMemo(() => {
    if (sortOrder === 'current' && currentUserPreferences.length > 0) {
      return [...rideLogs].sort((a, b) => {
        const aCurrentScore = calculateOverallRating(
          a.ratedCriteria.map(c => ({
            ...c,
            weight: currentUserPreferences.find(p => p.id === c.id)?.weight || 0,
          }))
        );
        const bCurrentScore = calculateOverallRating(
          b.ratedCriteria.map(c => ({
            ...c,
            weight: currentUserPreferences.find(p => p.id === c.id)?.weight || 0,
          }))
        );
        return bCurrentScore - aCurrentScore;
      });
    }
    // Sort by original overallRating by default
    return [...rideLogs].sort((a, b) => b.overallRating - a.overallRating);
  }, [rideLogs, sortOrder, currentUserPreferences]);

  if (isLoading) {
    return <View style={{ flex: 1, padding: 20 }}><Text>Loading logbook...</Text></View>;
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>My Logbook</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
        <Button title="Sort by Current Score" onPress={() => setSortOrder('current')} disabled={sortOrder === 'current'} />
        <Button title="Sort by Original Score" onPress={() => setSortOrder('original')} disabled={sortOrder === 'original'} />
      </View>
      <FlatList
        data={sortedLogs}
        keyExtractor={(item) => item.id!}
        renderItem={({ item }) => (
          <View style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
            <Text style={{ fontSize: 18 }}>Ride: {item.id}</Text> {/* You might want to store a ride name */}
            <Text>Score at the Time: {item.overallRating.toFixed(2)}</Text>
            {
              sortOrder === 'current' &&
              <Text style={{ color: 'blue' }}>
                Current Score: {calculateOverallRating(item.ratedCriteria.map(c => ({ ...c, weight: currentUserPreferences.find(p => p.id === c.id)?.weight || 0, }))).toFixed(2)}
              </Text>
            }
          </View>
        )}
        ListEmptyComponent={<Text>You haven't logged any rides yet.</Text>}
      />
    </View>
  );
}
