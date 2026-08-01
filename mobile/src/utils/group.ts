import type { GroupMembership, MemberBalance } from '@/types/group';

// The backend's /groups/{id}/balance/ action computes suggested settlements by mutating
// each creditor's `balance` value in place as it "pays down" their balance against debtors
// (see GroupViewSet._calculate_settlements) - that mutation leaks into the same dicts the
// response returns, so a creditor's `balance` field often reads as partially or fully zeroed
// even though they're genuinely still owed money (paid/owes themselves are unaffected).
// Always derive the true net balance from paid - owes instead of trusting `balance` directly.
export function computeNetBalance(member: Pick<MemberBalance, 'paid' | 'owes'>): number {
  return Number(member.paid) - Number(member.owes);
}

// Nickname (if the member set one for this group) wins, then full name, then username.
export function memberDisplayName(member: GroupMembership): string {
  if (member.nickname) return member.nickname;
  const details = member.user_details;
  const fullName = `${details.first_name} ${details.last_name}`.trim();
  return fullName || details.username;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
