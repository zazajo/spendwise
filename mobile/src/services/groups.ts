import { api } from '@/services/api';
import type { PaginatedResponse } from '@/types/api';
import type {
  Group,
  GroupBalanceResponse,
  GroupExpense,
  GroupExpenseListParams,
  GroupExpensePayload,
  GroupFormValues,
  GroupListParams,
  GroupMembership,
  GroupSettlement,
  MemberRole,
} from '@/types/group';

export async function fetchGroups(params: GroupListParams): Promise<Group[]> {
  const { data } = await api.get<PaginatedResponse<Group>>('/groups/', { params });
  return data.results;
}

export async function fetchGroup(id: number): Promise<Group> {
  const { data } = await api.get<Group>(`/groups/${id}/`);
  return data;
}

export async function createGroup(values: GroupFormValues): Promise<Group> {
  const { data } = await api.post<Group>('/groups/', {
    name: values.name,
    description: values.description ?? '',
  });
  return data;
}

// join_by_invite is a detail route (/groups/{pk}/join_by_invite/) but its implementation
// resolves the group purely from invite_code in the body and never touches pk - verified
// live that a bogus pk still works. Using a placeholder here means the join screen doesn't
// need to already know the group's id, which is the whole point of joining by code.
export async function joinGroupByInviteCode(
  inviteCode: string
): Promise<{ message: string; group: Group }> {
  const { data } = await api.post(`/groups/0/join_by_invite/`, { invite_code: inviteCode });
  return data;
}

export async function regenerateInviteCode(groupId: number): Promise<{ invite_code: string }> {
  const { data } = await api.post<{ invite_code: string }>(`/groups/${groupId}/regenerate_invite/`);
  return data;
}

export async function addMember(
  groupId: number,
  username: string,
  role: MemberRole = 'member'
): Promise<GroupMembership> {
  const { data } = await api.post<GroupMembership>(`/groups/${groupId}/add_member/`, {
    username,
    role,
  });
  return data;
}

export async function removeMember(groupId: number, userId: number): Promise<void> {
  await api.post(`/groups/${groupId}/remove_member/`, { user_id: userId });
}

export async function leaveGroup(groupId: number): Promise<void> {
  await api.post(`/groups/${groupId}/leave/`);
}

export async function fetchGroupBalance(groupId: number): Promise<GroupBalanceResponse> {
  const { data } = await api.get<GroupBalanceResponse>(`/groups/${groupId}/balance/`);
  return data;
}

export async function fetchGroupExpenses(params: GroupExpenseListParams): Promise<GroupExpense[]> {
  const { data } = await api.get<PaginatedResponse<GroupExpense>>('/group-expenses/', { params });
  return data.results;
}

export async function fetchGroupExpense(id: number): Promise<GroupExpense> {
  const { data } = await api.get<GroupExpense>(`/group-expenses/${id}/`);
  return data;
}

export async function createGroupExpense(payload: GroupExpensePayload): Promise<GroupExpense> {
  const { data } = await api.post<GroupExpense>('/group-expenses/', payload);
  return data;
}

export async function updateGroupExpense(
  id: number,
  payload: GroupExpensePayload
): Promise<GroupExpense> {
  const { data } = await api.patch<GroupExpense>(`/group-expenses/${id}/`, payload);
  return data;
}

export async function deleteGroupExpense(id: number): Promise<void> {
  await api.delete(`/group-expenses/${id}/`);
}

export async function settleSplit(expenseId: number, splitId: number): Promise<void> {
  await api.post(`/group-expenses/${expenseId}/settle/`, { split_id: splitId });
}

export async function fetchGroupSettlements(groupId: number): Promise<GroupSettlement[]> {
  const { data } = await api.get<PaginatedResponse<GroupSettlement>>('/group-settlements/', {
    params: { group: groupId },
  });
  return data.results;
}

export async function createSettlement(payload: {
  group: number;
  from_user: number;
  to_user: number;
  amount: string;
  notes?: string;
}): Promise<GroupSettlement> {
  const { data } = await api.post<GroupSettlement>('/group-settlements/', payload);
  return data;
}
