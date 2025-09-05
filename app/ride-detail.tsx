
import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../firebaseConfig';
import { RideLog } from '../types';
import { useRoute } from '@react-navigation/native';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const userUID = "test-user"; // Placeholder

export default function RideDetailScreen() {
  const route = useRoute();
  const { rideId } = route.params as { rideId: string };
  const [rideLog, setRideLog] = useState<RideLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRideLog = async () => {
      setIsLoading(true);
      try {
        const rideLogRef = doc(db, "users", userUID, "rideLogs", rideId);
        const rideLogSnap = await getDoc(rideLogRef);
        if (rideLogSnap.exists()) {
          setRideLog(rideLogSnap.data() as RideLog);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching ride log: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (rideId) {
      fetchRideLog();
    }
  }, [rideId]);

  if (isLoading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  if (!rideLog) {
    return <Text style={styles.errorText}>Ride log not found.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ride Details</Text>
      <View style={styles.card}>
          <Text style={styles.rideName}>Ride Name Placeholder</Text>
          <Text style={styles.overallRating}>Overall Score: {rideLog.overallRating.toFixed(2)}</Text>
          <View style={styles.criteriaList}>
              {rideLog.ratedCriteria.map(criterion => (
                  <View key={criterion.id} style={styles.criterionRow}>
                      <Text style={styles.criterionLabel}>{criterion.label}</Text>
                      <Text style={styles.criterionRating}>{criterion.rating}/10</Text>
                  </View>
              ))}
          </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    rideName: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 15,
      textAlign: 'center',
    },
    overallRating: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1fb28a',
        textAlign: 'center',
        marginBottom: 20,
    },
    criteriaList: {
        marginTop: 10,
    },
    criterionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    criterionLabel: {
        fontSize: 16,
    },
    criterionRating: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: 'red',
    },
});
