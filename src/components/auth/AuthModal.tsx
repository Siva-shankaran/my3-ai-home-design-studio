import React, { useState } from 'react';
import { authService, UserRole } from '../../services/authService';
import type { UserProfile } from '../../types';
import { 
  Building2, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  Sparkles, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  Briefcase,
  Compass
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<UserRole>('architect');
  const [name, setName] = useState('Marcus Sterling');
  const [email, setEmail] = useState('m.sterling@sterling-architects.com');
  const [phone, setPhone] = useState('+91 98401 22849');
  const [company, setCompany] = useState('Sterling Architectural Studio');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const updatedUser = authService.updateProfile({
        name: name || 'Architect Partner',
        email: email || 'architect@my3designs.com',
        role,
        companyName: company || 'MY3 Design Studio',
        licenseNumber: role === 'architect' ? 'COA/2026/78219' : 'PE-TN-48210',
      });

      setIsLoading(false);
      onSuccess(updatedUser);
      onClose();
    }, 400);
  };

  const handleQuickDemo = (demoRole: UserRole) => {
    const switched = authService.switchRole(demoRole);
    onSuccess(switched);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-xl shadow-2xl overflow-hidden font-sans">
        {/* Top Header */}
        <div className="p-6 bg-[var(--color-paper-2)] border-b border-[var(--color-rule-2)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center border border-[var(--color-accent)]/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-accent)] font-semibold">
                Enterprise Studio Access
              </span>
              <h2 className="font-serif text-xl text-[var(--color-ink)]">
                {mode === 'signin' ? 'Sign In to MY3 Studio' : 'Create Architectural Account'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--color-muted)] hover:text-[var(--color-ink)] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[var(--color-rule-2)] text-xs font-mono">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 py-3 text-center transition cursor-pointer ${
              mode === 'signin'
                ? 'border-b-2 border-[var(--color-accent)] text-[var(--color-accent)] font-bold bg-[var(--color-paper)]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-ink)] bg-[var(--color-paper-2)]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-3 text-center transition cursor-pointer ${
              mode === 'signup'
                ? 'border-b-2 border-[var(--color-accent)] text-[var(--color-accent)] font-bold bg-[var(--color-paper)]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-ink)] bg-[var(--color-paper-2)]'
            }`}
          >
            Register New Studio
          </button>
        </div>

        {/* Body Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="text-[11px] font-mono text-[var(--color-muted)] block mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Ar. Rajesh Kumar"
                  className="w-full bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] px-3 py-2 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-[var(--color-muted)] block mb-1 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Architectural Firm / Practice
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="e.g. Sterling Architectural Guild"
                  className="w-full bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] px-3 py-2 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-[var(--color-muted)] block mb-1">
                  Professional Practice Role
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {(['architect', 'civil_engineer', 'homeowner', 'builder'] as UserRole[]).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`p-2 rounded border text-left capitalize transition cursor-pointer ${
                        role === r
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-semibold'
                          : 'border-[var(--color-rule-2)] bg-[var(--color-paper-2)] text-[var(--color-muted)]'
                      }`}
                    >
                      {r.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-[11px] font-mono text-[var(--color-muted)] block mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Corporate Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. architect@domain.com"
              className="w-full bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] px-3 py-2 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-[var(--color-muted)] block mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Mobile Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 98400 12345"
              className="w-full bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] px-3 py-2 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded font-mono text-xs uppercase tracking-wider font-bold bg-[var(--color-accent)] text-white hover:opacity-95 transition shadow-sm cursor-pointer mt-2"
          >
            {isLoading ? 'Verifying Credentials...' : mode === 'signin' ? 'Sign In & Launch Studio' : 'Create Account & Enter'}
          </button>

          {/* Quick Demo Logins */}
          <div className="pt-3 border-t border-[var(--color-rule-2)]">
            <span className="text-[10px] font-mono text-[var(--color-muted)] uppercase tracking-wider block mb-2 text-center">
              Or 1-Click Instant Architectural Demo
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => handleQuickDemo('architect')}
                className="p-2 rounded bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] hover:border-[var(--color-accent)] text-[var(--color-ink)] transition text-left cursor-pointer flex items-center gap-2"
              >
                <Building2 className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>Licensed Architect</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('homeowner')}
                className="p-2 rounded bg-[var(--color-paper-2)] border border-[var(--color-rule-2)] hover:border-[var(--color-accent)] text-[var(--color-ink)] transition text-left cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Homeowner Mode</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
