import { db } from './firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  addDoc,
  updateDoc,
} from 'firebase/firestore';
import type { Transaction, Budget, Group, GroupExpense, Settlement } from './types';

// Transactions
export const getTransactions = (userId: string, onUpdate: (transactions: Transaction[]) => void) => {
  const q = query(collection(db, 'transactions'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    onUpdate(transactions);
  });
};

export const addTransaction = (userId: string, transaction: Omit<Transaction, 'id'>) => {
  return addDoc(collection(db, 'transactions'), { ...transaction, userId });
};

export const updateTransaction = (userId: string, transactionId: string, transaction: Partial<Omit<Transaction, 'id'>>) => {
  return updateDoc(doc(db, 'transactions', transactionId), { ...transaction, userId });
};

export const deleteTransaction = (userId: string, transactionId: string) => {
  return deleteDoc(doc(db, 'transactions', transactionId));
};

// Budgets
export const getBudgets = (userId: string, onUpdate: (budgets: Budget[]) => void) => {
  const docRef = doc(db, 'budgets', userId);
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      onUpdate(snapshot.data().budgets as Budget[]);
    } else {
      onUpdate([]);
    }
  });
};

export const setBudgets = (userId: string, budgets: Budget[]) => {
  return setDoc(doc(db, 'budgets', userId), { budgets });
};

// Groups
export const getGroups = (userId: string, onUpdate: (groups: Group[]) => void) => {
  const q = query(collection(db, 'groups'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
    onUpdate(groups);
  });
};

export const getGroup = (userId: string, groupId: string, onUpdate: (group: Group | null) => void) => {
    const docRef = doc(db, 'groups', groupId);
    return onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists() && snapshot.data().userId === userId) {
            onUpdate({ id: snapshot.id, ...snapshot.data() } as Group);
        } else {
            onUpdate(null);
        }
    });
};

export const addGroup = (userId: string, group: Omit<Group, 'userId'>) => {
  return setDoc(doc(db, 'groups', group.id), { ...group, userId });
};

// Group Expenses
export const getGroupExpenses = (userId: string, groupId: string, onUpdate: (expenses: GroupExpense[]) => void) => {
    const q = query(collection(db, 'group_expenses'), where('groupId', '==', groupId), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
        const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroupExpense));
        onUpdate(expenses);
    });
};

export const addGroupExpense = (userId: string, expense: GroupExpense) => {
    return setDoc(doc(db, 'group_expenses', expense.id), { ...expense, userId });
};

// Settlements
export const getSettlements = (userId: string, groupId: string, onUpdate: (settlements: Settlement[]) => void) => {
    const q = query(collection(db, 'settlements'), where('groupId', '==', groupId), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
        const settlements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Settlement));
        onUpdate(settlements);
    });
};

export const addSettlement = (userId: string, settlement: Settlement) => {
    return setDoc(doc(db, 'settlements', settlement.id), { ...settlement, userId });
};
