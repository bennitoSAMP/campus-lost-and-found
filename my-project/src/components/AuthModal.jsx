import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AuthModal({ isOpen, onClose, onUserAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Change this to match your university domain!
  const ALLOWED_DOMAIN = 'ctu.edu.ph';

  const handleAuth = async (e) => {
    e.preventDefault();

    // Validate university email domain
    if (!email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)) {
      alert(`Access Restricted! You must use a valid @${ALLOWED_DOMAIN} student email address.`);
      return;
    }

    setLoading(true);

    if (isSigningUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        alert(error.message);
      } else {
        alert('Account created! Please check your email for the confirmation link.');
        if (data.user) onUserAuthenticated(data.user);
        onClose();
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
      } else {
        if (data.user) onUserAuthenticated(data.user);
        onClose();
      }
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">
            {isSigningUp ? 'Student Sign Up' : 'Student Login'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl px-2">
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          Enter your official university email address (<span className="font-semibold text-blue-600">@{ALLOWED_DOMAIN}</span>) to log in.
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Campus Email *</label>
            <input
              type="email"
              placeholder={`student@${ALLOWED_DOMAIN}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Password *</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition text-sm shadow-md shadow-blue-500/20 disabled:bg-slate-400"
          >
            {loading ? 'Authenticating...' : isSigningUp ? 'Create Account' : 'Log In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSigningUp(!isSigningUp)}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            {isSigningUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>
        </div>

      </div>
    </div>
  );
}