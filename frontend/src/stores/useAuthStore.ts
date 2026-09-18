import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  full_name: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  workspaceId: string | null;
  setAuth: (token: string, user: User, workspaceId: string) => void;
  setWorkspaceId: (workspaceId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: {
    id: 'user-demo-1',
    email: 'jelvis@nexus.workspace',
    full_name: 'Jelvis',
  },
  workspaceId: 'workspace-default-1',
  setAuth: (token, user, workspaceId) => set({ token, user, workspaceId }),
  setWorkspaceId: (workspaceId) => set({ workspaceId }),
  logout: () => set({ token: null, user: null, workspaceId: null }),
}));
