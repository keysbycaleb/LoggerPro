
import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../firebaseConfig';
import { RatingPreference, RideLog } from '../../types';
import { calculateOverallRating } from '../../lib/math';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Placeholders for user UID and log ID
const userUID = "test-user"; // In a real app, this would come from auth state
const logID = "some-log-id"; // In a real app, this would be passed as a route param

export default function RideDetailScreen() {
  const [rideLog, setRideLog] = useState<RideLog | null>(null);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRideData = async () => {
      try {
        // Fetch the specific ride log
        const rideLogRef = doc(db, "users", userUID, "rideLogs", logID);
        const rideLogSnap = await getDoc(rideLogRef);

        if (!rideLogSnap.exists()) {
          console.log("No such ride log document!");
          setIsLoading(false);
          return;
        }

        const fetchedRideLog = rideLogSnap.data() as RideLog;
        setRideLog(fetchedRideLog);

        // Fetch the user's current preferences
        const userDocRef = doc(db, "users", userUID);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const currentUserPreferences = userData.ratingPreferences || [];

          // Calculate the "Current Score"
          const ratedCriteriaWithCurrentWeights = fetchedRideLog.ratedCriteria.map(criterion => ({
            ...criterion,
            weight: currentUserPreferences.find((p: RatingPreference) => p.id === criterion.id)?.weight || 0,
          }));

          const newScore = calculateOverallRating(ratedCriteriaWithCurrentWeights);
          setCurrentScore(newScore);
        } else {
          console.log("No such user document!");
        }
      } catch (error) {
        console.error("Error fetching ride data: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRideData();
  }, []);

  if (isLoading) {
    return <View style={{ flex: 1, padding: 20 }}><Text>Loading ride details...</Text></View>;
  }

  if (!rideLog) {
    return <View style={{ flex: 1, padding: 20 }}><Text>Ride log not found.</Text></View>;
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Ride Details</Text>
      <Text>Score at the Time: {rideLog.overallRating}</Text>
      {currentScore !== null && <Text>Current Score: {currentScore.toFixed(2)}</Text>}
    </View>
  );
}
