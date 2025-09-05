
import React, { useState, useEffect, useMemo } from 'react';
import { Button, Text, View, StyleSheet } from 'react-native';
import { getFirestore, doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { firebaseConfig } from '../../firebaseConfig';
import { initializeApp } from 'firebase/app';
import { RatingPreference, RatedCriterion, RideLog } from '../../types';
import { calculateOverallRating } from '../../lib/math';
import Slider from '@react-native-community/slider';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const userUID = "test-user";

export default function AddRideScreen() {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [ratingPreferences, setRatingPreferences] = useState<RatingPreference[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPreferences = async () => {
      setIsLoading(true);
      const userDocRef = doc(db, "users", userUID);
      try {
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data().ratingPreferences) {
          const prefs = userDocSnap.data().ratingPreferences;
          setRatingPreferences(prefs);
          // Initialize ratings state
          const initialRatings = prefs.reduce((acc: Record<string, number>, pref: RatingPreference) => {
            acc[pref.id] = 5; // Default to a middle rating
            return acc;
          }, {});
          setRatings(initialRatings);
        } else {
          console.log("User preferences not found.");
        }
      } catch (error) {
        console.error("Error fetching preferences: ", error);
      } finally {
        setIsLoading(false);
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

  const overallRating = useMemo(() => {
    if (ratingPreferences.length === 0) return 0;
    const ratedCriteria: RatedCriterion[] = ratingPreferences.map((preference) => ({
      ...preference,
      rating: ratings[preference.id] || 0,
    }));
    return calculateOverallRating(ratedCriteria);
  }, [ratings, ratingPreferences]);

  const handleSaveRide = async () => {
    if (ratingPreferences.length === 0) {
        alert('Could not load rating preferences.');
        return;
    }

    const ratedCriteria: RatedCriterion[] = ratingPreferences.map((preference) => ({
      ...preference,
      rating: ratings[preference.id] || 0,
    }));

    const newRideLog: RideLog = {
      overallRating,
      ratedCriteria,
    };

    try {
      const rideLogsCollectionRef = collection(db, "users", userUID, "rideLogs");
      await addDoc(rideLogsCollectionRef, newRideLog);
      alert(`Ride saved with an overall rating of: ${overallRating.toFixed(2)}`);
    } catch (error) {
      console.error("Error saving ride log: ", error);
      alert('Failed to save ride.');
    }
  };

  if (isLoading) {
    return <View style={styles.container}><Text>Loading your preferences...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
          <Text style={styles.title}>Log a New Ride</Text>
          <Text style={styles.overallRating}>Overall Score: {overallRating.toFixed(2)}</Text>
      </View>

      {ratingPreferences.length === 0 ? (
        <Text>Please set up your Rating DNA in the Preferences tab first!</Text>
      ) : (
        ratingPreferences.map((preference) => (
            <View key={preference.id} style={styles.sliderContainer}>
                <Text style={styles.label}>{preference.label} ({ratings[preference.id] || 0}/10)</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={10}
                    step={1}
                    value={ratings[preference.id] || 0}
                    onValueChange={(value) => handleRatingChange(preference.id, value)}
                    minimumTrackTintColor="#1fb28a"
                    maximumTrackTintColor="#d3d3d3"
                    thumbTintColor="#1fb28a"
                />
            </View>
        ))
      )}
      <Button title="Save Ride" onPress={handleSaveRide} disabled={ratingPreferences.length === 0} />
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    header: {
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    overallRating: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1fb28a',
    },
    sliderContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        marginBottom: 10,
    },
    slider: {
        width: '100%',
        height: 40,
    },
});
