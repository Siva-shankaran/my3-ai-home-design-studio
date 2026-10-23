import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';

const DATA_DIR = path.resolve(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  salt: string;
  hash: string;
  role?: string;
  companyName?: string;
  createdAt: number;
}

export interface StoredSession {
  uid: string;
  exp: number;
}

export interface StoredProject {
  id: string;
  uid: string;
  name: string;
  state: any;
  updated: number;
}

export interface ConceptHistoryItem {
  name: string;
  key: string;
  t: number;
}

// In-memory database mirrors with synchronous persistence
class HearthStore {
  users: Record<string, StoredUser> = {};
  sessions: Record<string, StoredSession> = {};
  projects: Record<string, StoredProject> = {};
  concepts: Record<string, ConceptHistoryItem[]> = {};
  private hits: Record<string, number[]> = {};

  constructor() {
    this.loadAll();
  }

  private loadAll() {
    const collections: Array<keyof HearthStore> = ['users', 'sessions', 'projects', 'concepts'];
    for (const name of collections) {
      const filePath = path.join(DATA_DIR, `${name}.json`);
      try {
        if (fs.existsSync(filePath)) {
          const raw = fs.readFileSync(filePath, 'utf-8');
          (this as any)[name] = JSON.parse(raw);
        }
      } catch (err) {
        console.warn(`[HearthStore] Could not load ${name}.json, initializing empty:`, err);
        (this as any)[name] = {};
      }
    }
  }

  save(collection: 'users' | 'sessions' | 'projects' | 'concepts') {
    try {
      const filePath = path.join(DATA_DIR, `${collection}.json`);
      fs.writeFileSync(filePath, JSON.stringify(this[collection], null, 2), 'utf-8');
    } catch (err) {
      console.error(`[HearthStore] Failed to save ${collection}:`, err);
    }
  }

  hashPassword(password: string, salt: string): string {
    return crypto.scryptSync(password, salt, 64).toString('hex');
  }

  verifyPassword(password: string, user: StoredUser): boolean {
    const computed = Buffer.from(this.hashPassword(password, user.salt), 'hex');
    const expected = Buffer.from(user.hash, 'hex');
    if (computed.length !== expected.length) return false;
    return crypto.timingSafeEqual(computed, expected);
  }

  parseCookies(req: IncomingMessage): Record<string, string> {
    const header = req.headers.cookie || '';
    return Object.fromEntries(
      header
        .split(';')
        .map(s => s.trim().split('='))
        .filter(a => a[0] && a[1])
        .map(([k, v]) => [k, decodeURIComponent(v)])
    );
  }

  getUserFromRequest(req: IncomingMessage): StoredUser | null {
    // Check Authorization Bearer header first
    const authHeader = req.headers.authorization;
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else {
      // Check cookie
      const cookies = this.parseCookies(req);
      token = cookies.sid || '';
    }

    if (!token) return null;
    const session = this.sessions[token];
    if (!session || session.exp < Date.now()) {
      if (session) {
        delete this.sessions[token];
        this.save('sessions');
      }
      return null;
    }

    return this.users[session.uid] || null;
  }

  createSession(res: ServerResponse, email: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    this.sessions[token] = {
      uid: email,
      exp: Date.now() + 7 * 86400 * 1000 // 7 days
    };
    this.save('sessions');

    const isHttps = process.env.HTTPS === '1' || process.env.NODE_ENV === 'production';
    const cookieHeader = `sid=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${isHttps ? '; Secure' : ''}`;
    res.setHeader('Set-Cookie', cookieHeader);
    return token;
  }

  destroySession(req: IncomingMessage, res: ServerResponse): void {
    const cookies = this.parseCookies(req);
    const token = cookies.sid;
    if (token && this.sessions[token]) {
      delete this.sessions[token];
      this.save('sessions');
    }
    res.setHeader('Set-Cookie', 'sid=; Max-Age=0; Path=/; HttpOnly');
  }

  rateLimit(key: string, maxCalls: number, windowMs: number): boolean {
    const now = Date.now();
    const timestamps = (this.hits[key] = (this.hits[key] || []).filter(t => now - t < windowMs));
    if (timestamps.length >= maxCalls) {
      return false;
    }
    timestamps.push(now);
    return true;
  }
}

export const hearthStore = new HearthStore();
