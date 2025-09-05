
import React, { useState } from 'react';
import { Button, Text, View } from 'react-native';
import { RatingPreference, RatedCriterion, RideLog } from '../../types';
import { calculateOverallRating } from '../../lib/math';

const mockRatingPreferences: RatingPreference[] = [
  { id: 'airtime', label: 'Airtime', weight: 50 },
  { id: 'thrill', label: 'Thrill', weight: 30 },
  { id: 'theming', label: 'Theming', weight: 10 },
  { id: 'pacing', label: 'Pacing', weight: 5 },
  { id: 'smoothness', label: 'Smoothness', weight: 5 },
];

export default function AddRideScreen() {
  const [ratings, setRatings] = useState<Record<string, number>>({});

  const handleRatingChange = (id: string, rating: number) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [id]: rating,
    }));
  };

  const handleSaveRide = () => {
    const ratedCriteria: RatedCriterion[] = mockRatingPreferences.map((preference) => ({
      ...preference,
      rating: ratings[preference.id] || 0,
    }));

    const overallRating = calculateOverallRating(ratedCriteria);

    const newRideLog: RideLog = {
      overallRating,
      ratedCriteria,
    };

    // Here you would typically save the newRideLog to Firestore
    console.log('Saving new ride log:', newRideLog);
    alert(`Ride saved with an overall rating of: ${overallRating}`);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Log a New Ride</Text>
      {mockRatingPreferences.map((preference) => (
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
