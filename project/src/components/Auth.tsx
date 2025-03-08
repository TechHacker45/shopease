import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Swal from 'sweetalert2';

const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*)' };
  }
  return { valid: true, message: 'Password is strong' };
};

export function Auth() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordValidation, setPasswordValidation] = useState<{ valid: boolean; message: string }>({ 
    valid: true, 
    message: '' 
  });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (isSignUp && newPassword) {
      setPasswordValidation(validatePassword(newPassword));
    } else {
      setPasswordValidation({ valid: true, message: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      const validation = validatePassword(password);
      if (!validation.valid) {
        await Swal.fire({
          title: 'Invalid Password',
          text: validation.message,
          icon: 'error',
          background: '#1e293b',
          color: '#fff',
          confirmButtonColor: '#3b82f6'
        });
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        await Swal.fire({
          title: 'Account Created',
          text: 'You can now sign in with your credentials',
          icon: 'success',
          background: '#1e293b',
          color: '#fff',
          confirmButtonColor: '#3b82f6'
        });
        setIsSignUp(false);
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      console.error('Auth error:', error);
      await Swal.fire({
        title: 'Error',
        text: error instanceof Error ? error.message : 'Authentication failed',
        icon: 'error',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-slate-400 text-center mb-8">
            {isSignUp 
              ? 'Sign up to start protecting your sites'
              : 'Sign in to access your WAF dashboard'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-400 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-700/30 border border-slate-600/50 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-400 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                className={`w-full bg-slate-700/30 border rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none ${
                  isSignUp && password
                    ? passwordValidation.valid
                      ? 'border-green-500/50 focus:border-green-500/50'
                      : 'border-red-500/50 focus:border-red-500/50'
                    : 'border-slate-600/50 focus:border-blue-500/50'
                }`}
                placeholder="••••••••"
                required
                minLength={8}
              />
              {isSignUp && password && (
                <p className={`mt-2 text-sm ${
                  passwordValidation.valid ? 'text-green-400' : 'text-red-400'
                }`}>
                  {passwordValidation.message}
                </p>
              )}
              {isSignUp && !password && (
                <p className="mt-2 text-sm text-slate-400">
                  Password must be at least 8 characters long and contain uppercase, lowercase, 
                  numbers, and special characters
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (isSignUp && !passwordValidation.valid)}
              className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              {isSignUp 
                ? 'Already have an account? Sign in'
                : 'Need an account? Sign up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}