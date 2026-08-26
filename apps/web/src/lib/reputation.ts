/**
 * Reputation System — Documented weights and model.
 *
 * Score computation: weighted average of:
 * - Owner reviews (30%)
 * - Expert reviews (20%)
 * - Resale value (15%)
 * - Reliability stats (15%)
 * - Price positioning (10%)
 * - Community engagement (10%)
 *
 * Each sub-score is 0-100, then weighted and averaged.
 * Final score normalized to 0-100.
 */

export interface ReputationWeights {
  ownerReviews: number;
  expertReviews: number;
  resaleValue: number;
  reliability: number;
  pricePositioning: number;
  communityEngagement: number;
}

export const DEFAULT_WEIGHTS: ReputationWeights = {
  ownerReviews: 0.30,
  expertReviews: 0.20,
  resaleValue: 0.15,
  reliability: 0.15,
  pricePositioning: 0.10,
  communityEngagement: 0.10,
};

export interface ReputationInput {
  ownerReviewScore?: number;     // 0-100
  ownerReviewCount?: number;
  expertReviewScore?: number;    // 0-100
  resaleDepreciation?: number;   // 0-100 (higher = holds value better)
  failureRate?: number;          // 0-100 (higher = fewer failures)
  priceVsMarket?: number;        // 0-100 (higher = better priced)
  activeDiscussions?: number;    // count of active discussions
  helpfulVotes?: number;         // count of helpful votes
}

export function computeReputationScore(
  input: ReputationInput,
  weights: ReputationWeights = DEFAULT_WEIGHTS
): { score: number; breakdown: Record<string, number>; confidence: number } {
  const breakdown: Record<string, number> = {};

  // Owner reviews (clamped with diminishing returns for small sample sizes)
  const ownerBase = input.ownerReviewScore ?? 50;
  const ownerCountFactor = Math.min(1, (input.ownerReviewCount ?? 0) / 20);
  breakdown.ownerReviews = ownerBase * (0.5 + 0.5 * ownerCountFactor);

  // Expert reviews
  breakdown.expertReviews = input.expertReviewScore ?? 50;

  // Resale value
  breakdown.resaleValue = input.resaleDepreciation ?? 50;

  // Reliability
  breakdown.reliability = input.failureRate ?? 50;

  // Price positioning
  breakdown.pricePositioning = input.priceVsMarket ?? 50;

  // Community engagement (normalized 0-100 from raw counts)
  const engagementRaw = (input.activeDiscussions ?? 0) * 2 + (input.helpfulVotes ?? 0);
  breakdown.communityEngagement = Math.min(100, engagementRaw * 5);

  // Weighted average
  const score = Math.round(
    breakdown.ownerReviews * weights.ownerReviews +
    breakdown.expertReviews * weights.expertReviews +
    breakdown.resaleValue * weights.resaleValue +
    breakdown.reliability * weights.reliability +
    breakdown.pricePositioning * weights.pricePositioning +
    breakdown.communityEngagement * weights.communityEngagement
  );

  // Confidence: based on data availability
  const dataPoints = [
    input.ownerReviewScore !== undefined,
    input.expertReviewScore !== undefined,
    input.resaleDepreciation !== undefined,
    input.failureRate !== undefined,
    input.priceVsMarket !== undefined,
    engagementRaw > 0,
  ].filter(Boolean).length;
  const confidence = Math.round((dataPoints / 6) * 100);

  return { score: Math.min(100, Math.max(0, score)), breakdown, confidence };
}

export function scoreLabel(score: number): string {
  if (score >= 90) return "Excellente";
  if (score >= 75) return "Très bonne";
  if (score >= 60) return "Bonne";
  if (score >= 40) return "Moyenne";
  return "Faible";
}

export function scoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600";
  if (score >= 75) return "text-green-600";
  if (score >= 60) return "text-amber-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
}
