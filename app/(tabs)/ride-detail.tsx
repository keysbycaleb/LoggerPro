
import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import { RatingPreference, RideLog } from '../../types';
import { calculateOverallRating } from '../../lib/math';

const mockRideLog: RideLog = {
  overallRating: 6.95,
  ratedCriteria: [
    { id: 'airtime', label: 'Airtime', weight: 50, rating: 7 },
    { id: 'thrill', label: 'Thrill', weight: 30, rating: 8 },
    { id: 'theming', label: 'Theming', weight: 10, rating: 3 },
    { id: 'pacing', label: 'Pacing', weight: 5, rating: 6 },
    { id: 'smoothness', label: 'Smoothness', weight: 5, rating: 9 },
  ],
};

const mockCurrentUserPreferences: RatingPreference[] = [
  { id: 'airtime', label: 'Airtime', weight: 60 },
  { id: 'thrill', label: 'Thrill', weight: 20 },
  { id: 'theming', label: 'Theming', weight: 10 },
  { id: 'pacing', label: 'Pacing', weight: 5 },
  { id: 'smoothness', label: 'Smoothness', weight: 5 },
];

export default function RideDetailScreen() {
  const [currentScore, setCurrentScore] = useState<number | null>(null);

  useEffect(() => {
    const historicalRatings = mockRideLog.ratedCriteria.map(criterion => ({
      id: criterion.id,
      label: criterion.label,
      rating: criterion.rating,
      weight: mockCurrentUserPreferences.find(p => p.id === criterion.id)?.weight || 0,
    }));

    const newScore = calculateOverallRating(historicalRatings);
    setCurrentScore(newScore);
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Ride Details</Text>
      <Text>Score at the Time: {mockRideLog.overallRating}</Text>
      {currentScore !== null && <Text>Current Score: {currentScore}</Text>}
    </View>
  );
}
