import type { GroupExpensePayload, SplitInputs, SplitType } from '@/types/group';

export interface ComputedSplit {
  user: number;
  amount: string;
  percentage?: number;
}

function toCents(value: number): number {
  return Math.round(value * 100);
}

function fromCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

// Distributes totalCents across participants proportionally to `weights` (equal weights
// for an equal split, percentages for a percentage split, share counts for a shares split),
// using largest-remainder rounding so every cent lands somewhere and the parts always sum
// to exactly totalCents (never drifts by a cent the way naive per-item rounding would).
function distributeCents(totalCents: number, weights: number[]): number[] {
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  if (weightSum <= 0) return weights.map(() => 0);

  const raw = weights.map((weight) => (totalCents * weight) / weightSum);
  const floors = raw.map(Math.floor);
  const allocated = floors.reduce((sum, value) => sum + value, 0);
  const remainder = totalCents - allocated;

  const byRemainingFraction = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);

  const result = [...floors];
  for (let k = 0; k < remainder; k++) {
    result[byRemainingFraction[k % byRemainingFraction.length].index] += 1;
  }
  return result;
}

export function computeEqualSplits(amount: number, participantIds: number[]): ComputedSplit[] {
  const cents = distributeCents(toCents(amount), participantIds.map(() => 1));
  return participantIds.map((user, index) => ({ user, amount: fromCents(cents[index]) }));
}

export function computePercentageSplits(
  amount: number,
  participantIds: number[],
  splitInputs: SplitInputs
): ComputedSplit[] {
  const percentages = participantIds.map((id) => Number(splitInputs[id] || 0));
  const cents = distributeCents(toCents(amount), percentages);
  return participantIds.map((user, index) => ({
    user,
    amount: fromCents(cents[index]),
    percentage: percentages[index],
  }));
}

export function computeSharesSplits(
  amount: number,
  participantIds: number[],
  splitInputs: SplitInputs
): ComputedSplit[] {
  const shares = participantIds.map((id) => Number(splitInputs[id] || 0));
  const cents = distributeCents(toCents(amount), shares);
  return participantIds.map((user, index) => ({ user, amount: fromCents(cents[index]) }));
}

export function computeCustomSplits(
  participantIds: number[],
  splitInputs: SplitInputs
): ComputedSplit[] {
  return participantIds.map((user) => ({ user, amount: Number(splitInputs[user] || 0).toFixed(2) }));
}

export function computeSplits(
  splitType: SplitType,
  amount: number,
  participantIds: number[],
  splitInputs: SplitInputs
): ComputedSplit[] {
  switch (splitType) {
    case 'equal':
      return computeEqualSplits(amount, participantIds);
    case 'percentage':
      return computePercentageSplits(amount, participantIds, splitInputs);
    case 'shares':
      return computeSharesSplits(amount, participantIds, splitInputs);
    case 'custom':
      return computeCustomSplits(participantIds, splitInputs);
  }
}

// Null means valid. Equal never fails here - it's always computed, never user-input.
export function validateSplits(
  splitType: SplitType,
  amount: number,
  participantIds: number[],
  splitInputs: SplitInputs
): string | null {
  if (splitType === 'percentage') {
    const total = participantIds.reduce((sum, id) => sum + Number(splitInputs[id] || 0), 0);
    if (Math.abs(total - 100) > 0.5) {
      return `Percentages add up to ${total.toFixed(1)}%, not 100%.`;
    }
  }

  if (splitType === 'custom') {
    const total = participantIds.reduce((sum, id) => sum + Number(splitInputs[id] || 0), 0);
    if (Math.abs(total - amount) > 0.01) {
      return `Splits add up to ${total.toFixed(2)}, not the expense total of ${amount.toFixed(2)}.`;
    }
  }

  if (splitType === 'shares') {
    const hasInvalidShare = participantIds.some((id) => Number(splitInputs[id] || 0) <= 0);
    if (hasInvalidShare) {
      return 'Every participant needs at least 1 share.';
    }
  }

  return null;
}

// Whether the backend's own native 'equal' path can be used (it always splits among
// every group member, with no `splits` array) versus needing to fall back to 'custom'
// with pre-computed equal amounts for a partial subset.
export function buildGroupExpensePayload(
  base: Omit<GroupExpensePayload, 'split_type' | 'splits'>,
  splitType: SplitType,
  amount: number,
  participantIds: number[],
  allMemberIds: number[],
  splitInputs: SplitInputs
): GroupExpensePayload {
  const isFullGroupEqualSplit =
    splitType === 'equal' &&
    participantIds.length === allMemberIds.length &&
    allMemberIds.every((id) => participantIds.includes(id));

  if (isFullGroupEqualSplit) {
    return { ...base, split_type: 'equal' };
  }

  const splits = computeSplits(splitType, amount, participantIds, splitInputs).map((split) => ({
    user: split.user,
    amount: split.amount,
    ...(split.percentage !== undefined ? { percentage: split.percentage } : {}),
  }));

  return { ...base, split_type: splitType === 'equal' ? 'custom' : splitType, splits };
}
