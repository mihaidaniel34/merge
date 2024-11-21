import React, { useState, memo } from 'react';
import { Terminal, User, Mail, Lock, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

// Memoized input component for better performance
const AuthInput = memo(({ 
  icon: Icon, 
  ...props 
}: { 
  icon: React.ElementType; 
  [key: string]: any 
}) => (
  <div className="flex items-center bg-gray-800 px-3 py-2 rounded">
    <Icon size={18} className="text-gray-400 mr-2" />
    <input
      className="bg-transparent w-full text-green-400 placeholder-gray-500 font-mono focus:outline-none"
      {...props}
    />
  </div>
));

AuthInput.displayName = 'AuthInput';

interface AuthFormProps {
  onSubmit: (data: { username: string; email?: string; password: string }) => Promise<void>;
  isLoading: boolean;
  error?: string;
  mode: 'login' | 'signup';
  onToggleMode: () => void;
}

export function AuthForm({
  onSubmit,
  isLoading,
  error,
  mode,
  onToggleMode,
}: AuthFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      username: formData.username,
      email: mode === 'signup' ? formData.email : undefined,
      password: formData.password,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-green-400 p-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Terminal size={48} />
        </div>
        
        <div className="bg-gray-900 p-8 rounded-lg border border-green-400">
          <div className="font-mono mb-6">
            <p className="text-gray-400">$ ssh {mode}@merge</p>
            <p className="text-sm mt-2">
              {mode === 'login' ? 'Authenticating...' : 'Creating new account...'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <AuthInput
              icon={User}
              type="text"
              name="username"
              placeholder="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={isLoading}
              aria-label="Username"
            />

            {mode === 'signup' && (
              <AuthInput
                icon={Mail}
                type="email"
                name="email"
                placeholder="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                aria-label="Email"
              />
            )}

            <AuthInput
              icon={Lock}
              type="password"
              name="password"
              placeholder="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              aria-label="Password"
            />

            {error && (
              <div 
                className="text-red-400 font-mono text-sm bg-red-950 p-2 rounded"
                role="alert"
                aria-live="polite"
              >
                Error: {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="animate-spin mr-2" size={18} />
              ) : null}
              {mode === 'login' ? '$ login' : '$ create-account'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={onToggleMode}
              disabled={isLoading}
              className="text-gray-400 hover:text-green-400 text-sm font-mono focus:outline-none"
              type="button"
            >
              {mode === 'login' ? '$ switch --to-register' : '$ switch --to-login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
