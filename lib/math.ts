
import { RatedCriterion } from '../types';

export function calculateOverallRating(ratedCriteria: RatedCriterion[]): number {
  const overallRating = ratedCriteria.reduce((acc, criterion) => {
    return acc + criterion.rating * (criterion.weight / 100);
  }, 0);
  return Number(overallRating.toFixed(2));
}
