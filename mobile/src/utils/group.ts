import type { GroupMembership, MemberBalance } from '@/types/group';

// `balance` is the server's authoritative net (paid - owes, adjusted for recorded
// settlements) - use it rather than recomputing from paid/owes, which would ignore
// settlement history.
export function computeNetBalance(member: Pick<MemberBalance, 'balance'>): number {
  return Number(member.balance);
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
