import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitMerge, User, Mail, Lock } from 'lucide-react';
import { auth } from '../lib/api';
import { getStoredToken, setStoredToken } from '../lib/utils';

export function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = isLogin
        ? await auth.login(username, password)
        : await auth.signup(username, email, password);

      if (response.error) {
        setError(response.error);
        setIsLoading(false);
        return;
      }

      if (response.data?.token) {
        setStoredToken(response.data.token);
        setIsLoading(false);
        navigate('/dashboard');
      } else {
        setError('No token received');
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-green-400 p-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <GitMerge size={48} />
        </div>
        
        <div className="bg-gray-900 p-8 rounded-lg border border-green-400/30">
          <div className="font-mono mb-6 space-y-2">
            <p className="text-gray-400">$ ssh {isLogin ? 'login' : 'register'}@merge</p>
              <div className="flex items-center space-x-2">
                <div className="animate-pulse">
                  <span className="text-green-400"></span>
                </div>
                <p className="text-sm text-green-500">
                  {isLogin ? 'Authenticating...' : 'Creating account...'}
                </p>
              </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center bg-gray-800/50 px-3 py-2 rounded border border-gray-800">
                <User size={18} className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-transparent w-full text-green-400 placeholder-gray-500 font-mono focus:outline-none"
                  required
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <div className="flex items-center bg-gray-800/50 px-3 py-2 rounded border border-gray-800">
                  <Mail size={18} className="text-gray-400 mr-2" />
                  <input
                    type="email"
                    placeholder="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent w-full text-green-400 placeholder-gray-500 font-mono focus:outline-none"
                    required
                    autoComplete="off"
                    spellCheck="false"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center bg-gray-800/50 px-3 py-2 rounded border border-gray-800">
                <Lock size={18} className="text-gray-400 mr-2" />
                <input
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent w-full text-green-400 placeholder-gray-500 font-mono focus:outline-none"
                  required
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
            </div>

            {error && (
              <div className="font-mono text-sm space-y-1">
                <p className="text-red-400">Error: {error}</p>
                <p className="text-gray-500">$ {isLogin ? 'Try again with correct credentials' : 'Please check your input and try again'}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-800 hover:bg-gray-700 border border-green-400/30 text-green-400 font-mono py-2 px-4 rounded focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              $ {isLogin ? 'connect --secure' : 'create-account'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setUsername('');
                setEmail('');
                setPassword('');
              }}
              className="text-gray-400 hover:text-green-400 font-mono text-sm"
              disabled={isLoading}
            >
              $ {isLogin ? 'switch --register' : 'switch --login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
