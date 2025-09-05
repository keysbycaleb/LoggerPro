
import React, { useState, useMemo } from 'react';
import { Button, FlatList, Text, View } from 'react-native';
import { RatingPreference, RideLog } from '../../types';
import { calculateOverallRating } from '../../lib/math';

const mockRideLogs: RideLog[] = [
  {
    overallRating: 6.95,
    ratedCriteria: [
      { id: 'airtime', label: 'Airtime', weight: 50, rating: 7 },
      { id: 'thrill', label: 'Thrill', weight: 30, rating: 8 },
      { id: 'theming', label: 'Theming', weight: 10, rating: 3 },
      { id: 'pacing', label: 'Pacing', weight: 5, rating: 6 },
      { id: 'smoothness', label: 'Smoothness', weight: 5, rating: 9 },
    ],
  },
  {
    overallRating: 8.50,
    ratedCriteria: [
        { id: 'airtime', label: 'Airtime', weight: 60, rating: 9 },
        { id: 'thrill', label: 'Thrill', weight: 20, rating: 8 },
        { id: 'theming', label: 'Theming', weight: 10, rating: 7 },
        { id: 'pacing', label: 'Pacing', weight: 5, rating: 9 },
        { id: 'smoothness', label: 'Smoothness', weight: 5, rating: 10 },
    ],
  },
];

const mockCurrentUserPreferences: RatingPreference[] = [
    { id: 'airtime', label: 'Airtime', weight: 60 },
    { id: 'thrill', label: 'Thrill', weight: 20 },
    { id: 'theming', label: 'Theming', weight: 10 },
    { id: 'pacing', label: 'Pacing', weight: 5 },
    { id: 'smoothness', label: 'Smoothness', weight: 5 },
];

export default function LogbookScreen() {
  const [sortOrder, setSortOrder] = useState('original');

  const sortedLogs = useMemo(() => {
    if (sortOrder === 'current') {
      return [...mockRideLogs].sort((a, b) => {
        const aCurrentScore = calculateOverallRating(
          a.ratedCriteria.map(c => ({ ...c, weight: mockCurrentUserPreferences.find(p => p.id === c.id)?.weight || 0 }))
        );
        const bCurrentScore = calculateOverallRating(
          b.ratedCriteria.map(c => ({ ...c, weight: mockCurrentUserPreferences.find(p => p.id === c.id)?.weight || 0 }))
        );
        return bCurrentScore - aCurrentScore;
      });
    }
    return mockRideLogs;
  }, [sortOrder]);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button title="Sort by Current Score" onPress={() => setSortOrder('current')} />
      <Button title="Sort by Original Score" onPress={() => setSortOrder('original')} />
      <FlatList
        data={sortedLogs}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 15 }}>
            <Text>Overall Rating (at time): {item.overallRating}</Text>
          </View>
        )}
      />
    </View>
  );
}
