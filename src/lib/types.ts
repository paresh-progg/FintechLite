export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string; // ISO 8601 date string
  notes?: string;
};

export type Budget = {
  category: string;
  amount: number;
};

export type GroupMember = {
  id: string;
  name: string;
};

export type Group = {
  id: string;
  name: string;
  members: GroupMember[];
};

export type GroupExpense = {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidById: string; // member id
  date: string; // ISO 8601 date string
  split: { memberId: string; amount: number }[];
};

export type Settlement = {
  id: string;
  groupId: string;
  fromId: string; // member id
  toId: string; // member id
  amount: number;
  date: string; // ISO 8601 date string
};

export type FirestoreUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
};
