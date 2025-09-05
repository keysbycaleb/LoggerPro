
import React, { useState, useEffect } from 'react';
import { Button, Text, View } from 'react-native';
import { getFirestore, doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { firebaseConfig } from '../../firebaseConfig'; // Assuming firebaseConfig is in the root
import { initializeApp } from 'firebase/app';
import { RatingPreference, RatedCriterion, RideLog } from '../../types';
import { calculateOverallRating } from '../../lib/math';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Placeholder for the current user's UID
const userUID = "test-user"; // In a real app, you'd get this from your auth state

export default function AddRideScreen() {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [ratingPreferences, setRatingPreferences] = useState<RatingPreference[]>([]);

  useEffect(() => {
    const fetchPreferences = async () => {
      const userDocRef = doc(db, "users", userUID);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData && userData.ratingPreferences) {
          setRatingPreferences(userData.ratingPreferences);
        }
      } else {
        console.log("No such user document!");
        // Handle case where user profile doesn't exist or has no preferences
        // For now, we'll just use an empty array
      }
    };

    fetchPreferences();
  }, []);

  const handleRatingChange = (id: string, rating: number) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [id]: rating,
    }));
  };

  const handleSaveRide = async () => {
    if (ratingPreferences.length === 0) {
        alert('Could not load rating preferences.');
        return;
    }

    const ratedCriteria: RatedCriterion[] = ratingPreferences.map((preference) => ({
      ...preference,
      rating: ratings[preference.id] || 0,
    }));

    const overallRating = calculateOverallRating(ratedCriteria);

    const newRideLog: RideLog = {
      overallRating,
      ratedCriteria,
    };

    try {
      const rideLogsCollectionRef = collection(db, "users", userUID, "rideLogs");
      await addDoc(rideLogsCollectionRef, newRideLog);
      alert(`Ride saved with an overall rating of: ${overallRating}`);
    } catch (error) {
      console.error("Error saving ride log: ", error);
      alert('Failed to save ride.');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Log a New Ride</Text>
      {ratingPreferences.map((preference) => (
        <View key={preference.id} style={{ marginBottom: 15 }}>
          <Text>{preference.label}</Text>
          {/* Placeholder for a slider component */}
          <input
            type="range"
            min="0"
            max="10"
            onChange={(e) => handleRatingChange(preference.id, parseInt(e.target.value, 10))}
          />
        </View>
      ))}
      <Button title="Save Ride" onPress={handleSaveRide} />
    </View>
  );
}
