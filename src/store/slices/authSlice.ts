import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '../../constants/storage';
export type Role = 'guest' | 'user' | 'admin';

const STORAGE_KEY = STORAGE_KEYS.AUTH;

interface AuthState {
  role: Role;
}

function loadFromStorage(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { role: 'guest' };
    const parsed = JSON.parse(raw) as { role?: unknown };
    if (
      parsed.role === 'user' ||
      parsed.role === 'admin' ||
      parsed.role === 'guest'
    ) {
      return { role: parsed.role };
    }
    return { role: 'guest' };
  } catch {
    return { role: 'guest' };
  }
}

function saveToStorage(state: AuthState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

const initialState: AuthState = loadFromStorage();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setRole(state, action: PayloadAction<Exclude<Role, 'guest'>>) {
      state.role = action.payload;
      saveToStorage(state);
    },
    logout(state) {
      state.role = 'guest';
      saveToStorage(state);
    },
  },
});

export const { setRole, logout } = authSlice.actions;

// Селекторы
export const selectRole = (state: { auth: AuthState }): Role => state.auth.role;

export const selectIsAuthenticated = (state: { auth: AuthState }): boolean =>
  state.auth.role !== 'guest';

export const selectIsAdmin = (state: { auth: AuthState }): boolean =>
  state.auth.role === 'admin';

export default authSlice.reducer;
