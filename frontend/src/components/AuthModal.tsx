import React, { useState } from 'react';
import { X, Sparkles, Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../services/api.js';
import { User, LevelInfo } from '../types/index.js';
import { soundManager } from '../utils/audio.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, levelInfo?: LevelInfo) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) throw new Error('Please enter your name');
        const res = await api.register({ email, password, name });
        soundManager.playCelebration();
        onSuccess(res.user);
      } else {
        const res = await api.login({ email, password });
        soundManager.playCheck();
        onSuccess(res.user);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.guestLogin();
      soundManager.playCheck();
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Guest login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.oauthLogin(provider);
      soundManager.playCheck();
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || `${provider} login failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-winter-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-slide-up">
        {/* Glow backdrop */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-winter-cyan/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center pt-2 pb-6 space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-winter-cyan/10 border border-winter-cyan/30 text-winter-cyan text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>WINTER ARC ACCOUNT</span>
          </div>
          <h2 className="text-xl font-bold font-display tracking-tight text-white">
            {mode === 'signin' ? 'Welcome Back' : 'Claim Your Arc'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'signin'
              ? 'Your season is waiting. Step back in.'
              : 'Start your transformation period today.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
          {mode === 'signup' && (
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Your Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Hunter"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs font-display flex items-center justify-center gap-2 shadow-glow-purple transition active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Connecting...</span>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In' : 'Create Arc Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Guest Mode & Social */}
        <div className="mt-5 pt-4 border-t border-white/5 space-y-2 relative z-10">
          <div className="text-center text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-2">
            Or continue instantly
          </div>

          <button
            type="button"
            onClick={handleGuest}
            disabled={loading}
            className="w-full py-2.5 rounded-2xl bg-winter-800 hover:bg-winter-700 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 transition active:scale-98"
          >
            <ShieldCheck className="w-4 h-4 text-winter-cyan" />
            <span>Continue as Guest (No Password)</span>
          </button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={loading}
              className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-slate-300 font-medium flex items-center justify-center gap-2 transition"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.9 6.4C.7 8.8 0 10.8 0 12s.7 3.2 1.9 5.6l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16C3.7 19.8 7.5 23 12 23z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuth('apple')}
              disabled={loading}
              className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-slate-300 font-medium flex items-center justify-center gap-2 transition"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.73-7.95-12.13-14.62-6.52-9.84-11.75-20.95-15.68-33.34-3.92-12.39-5.89-24.36-5.89-35.91 0-14.62 3.63-26.79 10.88-36.5 7.25-9.71 16.5-14.67 27.75-14.88 4.79 0 10.3 1.34 16.53 4.02 6.23 2.68 10.22 4.08 11.97 4.2 2.12-.24 6.33-1.68 12.63-4.32 6.3-2.64 11.76-3.83 16.38-3.58 12.3.62 22.09 5.3 29.38 14.05-10.74 6.53-15.99 15.68-15.74 27.46.24 9.17 3.69 16.89 10.35 23.16 6.66 6.27 14.54 9.9 23.63 10.9-2.33 7.02-5.3 14.44-8.91 22.25zM119.22 31.42c0-7.39 2.62-14.28 7.86-20.67 5.24-6.39 11.83-10.31 19.77-11.75.12 1.13.18 2.02.18 2.67 0 7.27-2.73 14.24-8.19 20.92-5.46 6.68-12.16 10.58-20.1 11.7-0.08-.94-.12-1.72-.12-2.34l.6-0.53z" />
              </svg>
              <span>Apple</span>
            </button>
          </div>
        </div>

        {/* Switch mode */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
            }}
            className="text-xs text-slate-400 hover:text-white transition"
          >
            {mode === 'signin' ? (
              <span>
                New to Winter Arc? <strong className="text-winter-cyan underline">Start an Arc</strong>
              </span>
            ) : (
              <span>
                Already have an Arc? <strong className="text-winter-cyan underline">Sign In</strong>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
