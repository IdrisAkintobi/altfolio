import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Lock, User as UserIcon, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const AuthForm: React.FC = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
      <Card className="w-full max-w-md border-indigo-500/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</CardTitle>
          <p className="text-slate-400 text-sm mt-2">
            Enter your credentials to access Altfolio
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-slate-300">Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="John Doe"
                    minLength={2}
                    maxLength={100}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {mode === 'signup' && (
               <p className="text-xs text-slate-500 italic">
                 Tip: Use an email containing "admin" to get Administrator access.
               </p>
            )}

            <Button type="submit" className="w-full mt-6" size="lg" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>

            <div className="text-center mt-4">
              <button 
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError(null);
                }}
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};