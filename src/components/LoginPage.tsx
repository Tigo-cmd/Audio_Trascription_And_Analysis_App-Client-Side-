import React, { useState } from 'react';
import { Eye, EyeOff, Mic, Lock, User as UserIcon } from 'lucide-react';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  isLoading,
  error
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim() && !isLoading) {
      await onLogin(username.trim(), password);
    }
  };

  // const defaultCredentials = [
  //   { username: 'admin', password: 'admin123', role: 'Administrator' },
  //   { username: 'user', password: 'user123', role: 'User' },
  //   { username: 'demo', password: 'demo123', role: 'Demo User' }
  // ];

  // const handleQuickLogin = (creds: { username: string; password: string }) => {
  //   setUsername(creds.username);
  //   setPassword(creds.password);
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AudioScribe</h1>
          <p className="text-gray-600">Professional audio transcription and analysis</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center space-x-2 mb-6">
            <Lock className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Sign In</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !username.trim() || !password.trim()}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            {/* <button
              onClick={() => setShowCredentials(!showCredentials)}
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              {showCredentials ? 'Hide' : 'Show'} demo credentials
            </button> */}
            
            {/* {showCredentials && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-gray-500 mb-3">Click to use demo credentials:</p>
                {defaultCredentials.map((creds, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickLogin(creds)}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{creds.username}</p>
                        <p className="text-xs text-gray-500">{creds.role}</p>
                      </div>
                      <p className="text-xs text-gray-400 font-mono">{creds.password}</p>
                    </div>
                  </button>
                ))}
              </div>
            )} */}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Secure audio transcription powered by Tigo
          </p>
        </div>
      </div>
    </div>
  );
};