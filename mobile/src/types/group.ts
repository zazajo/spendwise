import { z } from 'zod';

import { dateSchema } from '@/types/expense';

export type GroupStatus = 'active' | 'settled' | 'archived';
export type MemberRole = 'admin' | 'member' | 'viewer';
export type SplitType = 'equal' | 'percentage' | 'custom' | 'shares';

export interface GroupMemberUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

export interface GroupMembership {
  id: number;
  user: number;
  user_details: GroupMemberUser;
  username: string;
  role: MemberRole;
  nickname: string;
  balance: string;
  joined_at: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  status: GroupStatus;
  invite_code: string | null;
  // member_count from the API is unreliable (a queryset join-collapse bug always
  // returns 1) - use members.length instead. Kept here only because the field exists.
  member_count: number;
  total_expenses: string | null;
  members: GroupMembership[];
  created_by: number | null;
  created_by_username: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface GroupListParams {
  search?: string;
}

export const groupFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Keep it under 100 characters'),
  description: z.string().max(500, 'Keep it under 500 characters').optional(),
});

export type GroupFormValues = z.infer<typeof groupFormSchema>;

export const joinGroupSchema = z.object({
  invite_code: z
    .string()
    .min(1, 'Enter an invite code')
    .transform((value) => value.trim().toUpperCase()),
});

export type JoinGroupFormValues = z.infer<typeof joinGroupSchema>;

export interface GroupExpenseSplit {
  id: number;
  user: number;
  user_name: string;
  amount: string;
  percentage: number | null;
  is_paid: boolean;
  paid_at: string | null;
}

export interface GroupExpense {
  id: number;
  amount: string;
  description: string;
  date: string;
  split_type: SplitType;
  paid_by: number;
  paid_by_name: string;
  group: number;
  group_name: string;
  splits: GroupExpenseSplit[];
  total_splits_amount: string;
  is_settled: boolean;
  notes: string;
  original_expense: number | null;
  created_at: string;
  updated_at: string;
}

export interface GroupExpenseListParams {
  group?: number;
  paid_by?: number;
  split_type?: SplitType;
  search?: string;
}

// One entry per selected participant; the raw value's meaning depends on split_type:
// percentage -> "25" (percent), custom -> "12.50" (dollar amount), shares -> "2" (share count).
// Equal doesn't use this at all - amounts are derived automatically.
export type SplitInputs = Record<number, string>;

export const groupExpenseFormSchema = z.object({
  description: z.string().min(1, 'Description is required').max(255),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount')
    .refine((value) => Number(value) > 0, 'Amount must be greater than 0'),
  date: dateSchema,
  paid_by: z.number().min(1, 'Pick who paid'),
  split_type: z.enum(['equal', 'percentage', 'custom', 'shares']),
  participantIds: z.array(z.number()).min(1, 'Pick at least one participant'),
  splitInputs: z.record(z.string(), z.string()),
  notes: z.string().optional(),
});

export type GroupExpenseFormValues = z.infer<typeof groupExpenseFormSchema>;

export interface GroupExpensePayload {
  group: number;
  paid_by: number;
  amount: string;
  description: string;
  date: string;
  split_type: SplitType;
  notes: string;
  splits?: { user: number; amount: string; percentage?: number }[];
}

export interface GroupSettlement {
  id: number;
  from_user: number;
  from_user_name: string;
  to_user: number;
  to_user_name: string;
  amount: string;
  settled_at: string;
  notes: string;
}

export interface MemberBalance {
  user_id: number;
  username: string;
  nickname?: string;
  paid: string;
  owes: string;
  balance: string;
}

export interface SuggestedSettlement {
  from: string;
  from_id: number;
  to: string;
  to_id: number;
  amount: number;
}

export interface GroupBalanceResponse {
  balances: MemberBalance[];
  suggested_settlements: SuggestedSettlement[];
  total_group_expenses: string;
}
