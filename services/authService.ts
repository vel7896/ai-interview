import { User } from '../types';
import { register as apiRegister, login as apiLogin } from '../backend/api';

// This service now acts as a pass-through to the mock backend API.
// In a real application, this service would contain fetch() calls to a remote server.

export const register = async (name: string, email: string, password: string): Promise<User> => {
  return apiRegister(name, email, password);
};

export const login = async (email: string, password: string): Promise<User> => {
  return apiLogin(email, password);
};
