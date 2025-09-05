
import React, { useState, useMemo, useEffect } from 'react';
import { Button, Text, View, TextInput, StyleSheet } from 'react-native';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../firebaseConfig';
import { RatingPreference } from '../../types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const userUID = "test-user"; // Placeholder

const defaultCriteria: Omit<RatingPreference, 'weight'>[] = [
  { id: 'airtime', label: 'Airtime' },
  { id: 'thrill', label: 'Thrill' },
  { id: 'theming', label: 'Theming' },
  { id: 'pacing', label: 'Pacing' },
  { id: 'smoothness', label: 'Smoothness' },
  { id: 'length', label: 'Length' },
  { id: 'restraints', label: 'Restraints' },
  { id: 'operations', label: 'Operations' },
  { id: 'location', label: 'Location' },
  { id: 'scenery', label: 'Scenery' },
];

export default function PreferencesScreen() {
  const [userPreferences, setUserPreferences] = useState<RatingPreference[]>([]);
  const [newCriterionLabel, setNewCriterionLabel] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPreferences = async () => {
      const userDocRef = doc(db, "users", userUID);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists() && userDocSnap.data().ratingPreferences) {
        setUserPreferences(userDocSnap.data().ratingPreferences);
      }
      setIsLoading(false);
    };
    fetchPreferences();
  }, []);

  const totalWeight = useMemo(() => {
    return userPreferences.reduce((sum, pref) => sum + pref.weight, 0);
  }, [userPreferences]);

  const handleAddCriterion = (criterion: Omit<RatingPreference, 'weight'>) => {
    if (!userPreferences.find(p => p.id === criterion.id)) {
      const remainingWeight = 100 - totalWeight;
      const newWeight = userPreferences.length > 0 ? 0 : 100;
      setUserPreferences([...userPreferences, { ...criterion, weight: newWeight }]);
    }
  };

  const handleAddNewCriterion = () => {
    if (newCriterionLabel.trim() !== '') {
      const newCriterion: Omit<RatingPreference, 'weight'> = {
        id: newCriterionLabel.trim().toLowerCase().replace(/\s+/g, '-'),
        label: newCriterionLabel.trim(),
      };
      handleAddCriterion(newCriterion);
      setNewCriterionLabel('');
    }
  };

  const handleWeightChange = (id: string, weight: number) => {
    setUserPreferences(currentPrefs =>
      currentPrefs.map(p => (p.id === id ? { ...p, weight } : p))
    );
  };

  const handleSavePreferences = async () => {
    if (totalWeight !== 100) {
      alert('Total weight must be 100%.');
      return;
    }
    const userDocRef = doc(db, "users", userUID);
    try {
      await setDoc(userDocRef, { ratingPreferences: userPreferences }, { merge: true });
      alert('Your Rating DNA has been saved!');
    } catch (error) {
      console.error("Error saving preferences: ", error);
      alert('Failed to save your preferences.');
    }
  };
  
  if (isLoading) {
    return <View style={styles.container}><Text>Loading your Rating DNA...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rating DNA</Text>

      <View>
        <Text style={styles.subtitle}>Add from default criteria:</Text>
        {defaultCriteria.map(criterion => (
          <Button key={criterion.id} title={criterion.label} onPress={() => handleAddCriterion(criterion)} />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Add a custom criterion:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Inversions"
          value={newCriterionLabel}
          onChangeText={setNewCriterionLabel}
        />
        <Button title="Add Custom" onPress={handleAddNewCriterion} />
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Your selected criteria:</Text>
        <Text style={totalWeight === 100 ? styles.totalWeightSuccess : styles.totalWeightError}>
          Total Weight: {totalWeight}% / 100%
        </Text>
        {userPreferences.map(pref => (
          <View key={pref.id} style={styles.sliderContainer}>
            <Text>{pref.label}: {pref.weight}%</Text>
            <input
              type="range"
              min="0"
              max="100"
              value={pref.weight}
              onChange={(e) => handleWeightChange(pref.id, parseInt(e.target.value, 10))}
            />
          </View>
        ))}
      </View>

      <Button title="Save Rating DNA" onPress={handleSavePreferences} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  section: {
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 8,
    marginVertical: 10,
  },
  sliderContainer: {
    marginVertical: 10,
  },
  totalWeightSuccess: {
    color: 'green',
    fontWeight: 'bold',
  },
  totalWeightError: {
    color: 'red',
    fontWeight: 'bold',
  },
});
