
export interface RatingPreference {
  id: string;
  label: string;
  weight: number;
}

export interface RatedCriterion {
  id: string;
  label: string;
  weight: number;
  rating: number;
}

export interface RideLog {
  overallRating: number;
  ratedCriteria: RatedCriterion[];
}
