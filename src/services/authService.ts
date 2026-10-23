import { UserProfile } from '../types';

export type UserRole = 'homeowner' | 'architect' | 'civil_engineer' | 'builder' | 'realtor';

export interface AuthSession {
  user: UserProfile;
  token: string;
  expiresAt: number;
}

const STORAGE_KEY = 'my3_auth_session';
const AUTH_FLAG_KEY = 'my3_is_authenticated';

const DEFAULT_USER: UserProfile = {
  id: 'usr-enterprise-1',
  name: 'Marcus Sterling',
  email: 'm.sterling@sterling-architects.com',
  role: 'architect',
  credits: 850,
  plan: 'Studio',
  companyName: 'Sterling Architectural & Engineering Guild',
  licenseNumber: 'AIA-984210 / PE-CA-58219'
};

export const authService = {
  isExplicitlyAuthenticated(): boolean {
    try {
      return localStorage.getItem(AUTH_FLAG_KEY) === 'true';
    } catch {
      return false;
    }
  },

  setExplicitlyAuthenticated(val: boolean): void {
    try {
      localStorage.setItem(AUTH_FLAG_KEY, String(val));
    } catch (e) {
      console.warn('Failed to set auth flag in localStorage:', e);
    }
  },

  logout(): void {
    try {
      localStorage.removeItem(AUTH_FLAG_KEY);
      localStorage.removeItem(STORAGE_KEY);
      fetch('/api/logout', { method: 'POST' }).catch(() => {});
    } catch (e) {
      console.warn('Failed to clear session in localStorage:', e);
    }
  },

  async loginWithServer(email: string, password: string): Promise<UserProfile> {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Login failed');
      }
      const data = await res.json();
      const userProfile: UserProfile = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role || 'architect',
        credits: 1000,
        plan: 'Studio',
        companyName: data.user.companyName || 'MY3 Design Studio',
        licenseNumber: 'AIA-984210 / PE-CA-58219'
      };
      this.saveSession({
        user: userProfile,
        token: data.token || `jwt_${Date.now()}`,
        expiresAt: Date.now() + 7 * 86400 * 1000
      });
      this.setExplicitlyAuthenticated(true);
      return userProfile;
    } catch (err) {
      throw err;
    }
  },

  async signupWithServer(email: string, password: string, name: string, role: UserRole, companyName?: string): Promise<UserProfile> {
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role, companyName })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Signup failed');
      }
      const data = await res.json();
      const userProfile: UserProfile = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: (data.user.role as UserRole) || role,
        credits: 1000,
        plan: 'Studio',
        companyName: companyName || 'MY3 Design Studio',
        licenseNumber: role === 'architect' ? 'COA/2026/78219' : 'PE-TN-48210'
      };
      this.saveSession({
        user: userProfile,
        token: data.token || `jwt_${Date.now()}`,
        expiresAt: Date.now() + 7 * 86400 * 1000
      });
      this.setExplicitlyAuthenticated(true);
      return userProfile;
    } catch (err) {
      throw err;
    }
  },
  getCurrentSession(): AuthSession {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse auth session from localStorage:', e);
    }

    const defaultSession: AuthSession = {
      user: DEFAULT_USER,
      token: `jwt_my3_${Date.now()}`,
      expiresAt: Date.now() + 86400 * 1000 * 7
    };
    this.saveSession(defaultSession);
    return defaultSession;
  },

  getCurrentUser(): UserProfile {
    return this.getCurrentSession().user;
  },

  saveSession(session: AuthSession): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.warn('Failed to save auth session to localStorage:', e);
    }
  },

  switchRole(role: UserRole): UserProfile {
    const session = this.getCurrentSession();
    const roleTitles: Record<UserRole, { company: string; license: string }> = {
      architect: { company: 'Sterling Architecture Studio', license: 'AIA-984210' },
      civil_engineer: { company: 'Vertex Structural Engineering', license: 'PE-Civil-77412' },
      builder: { company: 'Apex Custom Construction', license: 'GC-Lic-104992' },
      realtor: { company: 'Sotheby’s Premier Properties', license: 'DRE-0194821' },
      homeowner: { company: 'Private Client', license: 'Residential Owner-Builder' }
    };

    const updatedUser: UserProfile = {
      ...session.user,
      role,
      companyName: roleTitles[role].company,
      licenseNumber: roleTitles[role].license
    };

    this.saveSession({
      ...session,
      user: updatedUser
    });

    return updatedUser;
  },

  updateProfile(updates: Partial<UserProfile>): UserProfile {
    const session = this.getCurrentSession();
    const updatedUser = { ...session.user, ...updates };
    this.saveSession({ ...session, user: updatedUser });
    return updatedUser;
  },

  deductCredits(amount: number): boolean {
    const session = this.getCurrentSession();
    if (session.user.credits < amount) return false;
    session.user.credits -= amount;
    this.saveSession(session);
    return true;
  },

  hasPermission(permission: 'export_cad' | 'structural_stamp' | 'ai_synthesis' | 'edit_floors'): boolean {
    const role = this.getCurrentUser().role;
    switch (permission) {
      case 'export_cad':
      case 'edit_floors':
      case 'ai_synthesis':
        return true;
      case 'structural_stamp':
        return role === 'civil_engineer' || role === 'architect';
      default:
        return true;
    }
  }
};
