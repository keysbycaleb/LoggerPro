
import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../firebaseConfig';
import { RideLog } from '../../types';
import { useNavigation } from '@react-navigation/native';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const userUID = "test-user"; // Placeholder

export default function HomeScreen() {
  const [latestRide, setLatestRide] = useState<RideLog | null>(null);
  const [highestRatedRide, setHighestRatedRide] = useState<RideLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchSummaryData = async () => {
      setIsLoading(true);
      try {
        const rideLogsCollectionRef = collection(db, "users", userUID, "rideLogs");

        // For simplicity, fetching all and sorting. For larger datasets, create specific queries.
        const allRidesSnapshot = await getDocs(rideLogsCollectionRef);
        const allRides = allRidesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as RideLog);

        if (allRides.length > 0) {
            // Assuming a timestamp will be added to RideLog for accurate latest ride
            // For now, we'll just take the last added document as the 'latest'
            setLatestRide(allRides[allRides.length - 1]);

            const sortedByRating = [...allRides].sort((a, b) => b.overallRating - a.overallRating);
            setHighestRatedRide(sortedByRating[0]);
        } 

      } catch (error) {
        console.error("Error fetching summary data: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  const renderRideSummary = (ride: RideLog | null, title: string) => {
      if (!ride) return <Text>No rides logged yet.</Text>;
      return (
          <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>{title}</Text>
              <Text style={styles.summaryScore}>Score: {ride.overallRating.toFixed(2)}</Text>
          </View>
      );
  }

  if (isLoading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeTitle}>Welcome Back!</Text>
      
      {renderRideSummary(latestRide, "Your Latest Ride")}
      {renderRideSummary(highestRatedRide, "Your Highest-Rated Ride")}

      <View style={styles.buttonContainer}>
        <Button title="Log a New Ride" onPress={() => navigation.navigate('add-ride')} />
        <Button title="View Full Logbook" onPress={() => navigation.navigate('logbook')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
    },
    summaryCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    summaryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    summaryScore: {
        fontSize: 18,
        color: '#1fb28a',
    },
    buttonContainer: {
        marginTop: 20,
    },
});
