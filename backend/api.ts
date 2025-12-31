import { User, StoredUser, InterviewRecord } from '../types';
import { collections } from './database';

// ==================================================================================
// MOCK BACKEND API
// In a real application, this file would be a server (e.g., Node.js/Express)
// that interacts with a database via an ORM or driver. This file simulates that
// API layer by using the abstracted database functions from `database.ts`.
// ==================================================================================


// --- User Database Functions ---

export const getUsers = (): Promise<StoredUser[]> => {
  return collections.users.find({});
};


// --- Authentication Functions ---

export const register = async (name: string, email: string, password: string): Promise<User> => {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 500));
  const lowerCaseEmail = email.toLowerCase();

  if (lowerCaseEmail === 'admin@admin.com') {
    throw new Error('This email address is reserved and cannot be used for registration.');
  }

  const existingUser = await collections.users.findOne({ email: lowerCaseEmail });

  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }

  // In a real app, hash the password.
  const newUser: Omit<StoredUser, '_id'> = { name, email: lowerCaseEmail, password };
  await collections.users.insertOne(newUser);
  
  return { name, email: lowerCaseEmail };
};

export const login = async (email: string, password: string): Promise<User> => {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 500));
  const lowerCaseEmail = email.toLowerCase();

  // Hardcoded admin user
  if (lowerCaseEmail === 'admin@admin.com' && password === 'admin') {
    return { name: 'Admin', email: 'admin@admin.com' };
  }
  
  const user = await collections.users.findOne({ email: lowerCaseEmail });

  if (!user || user.password !== password) {
    throw new Error('Invalid email or password.');
  }
  
  return { name: user.name, email: user.email };
};




export const deleteUserByEmail = async (email: string): Promise<void> => {
  const lowerCaseEmail = email.toLowerCase();
  try {
    
    await collections.interviewHistories.deleteMany({ userEmail: lowerCaseEmail });
    await collections.users.deleteOne({ email: lowerCaseEmail });
  } catch (error) {
    console.error(`Failed to delete user ${lowerCaseEmail}`, error);
    throw new Error('Failed to delete user data.');
  }
};

export const updateUserPassword = async (email: string, newPassword: string): Promise<void> => {
    const lowerCaseEmail = email.toLowerCase();
    try {
        const result = await collections.users.updateOne(
            { email: lowerCaseEmail },
            { $set: { password: newPassword } }
        );
        if (result.matchedCount === 0) {
            console.warn(`User with email ${lowerCaseEmail} not found for password update.`);
        }
    } catch (error) {
        console.error(`Failed to update password for user ${lowerCaseEmail}`, error);
        throw new Error('Failed to update password.');
    }
};




export const saveInterviewRecord = async (user: User, record: InterviewRecord): Promise<void> => {
  try {
    const recordWithUser = { ...record, userEmail: user.email };
    await collections.interviewHistories.insertOne(recordWithUser);
  } catch (error) {
    console.error("Failed to save interview record", error);
    throw new Error("Could not save your interview progress.");
  }
};

export const loadInterviewHistory = async (user: User): Promise<InterviewRecord[]> => {
  try {
    const history = await collections.interviewHistories.find({ userEmail: user.email });

    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Failed to load interview history", error);
    return [];
  }
};
