import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function DetailModal({ item, user, onClose, onOpenAuth }) {
  const [proof, setProof] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [claimSubmitted, setClaimSubmitted] = useState(false);

  if (!item) return null;

  const handleClaimSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('You must be logged in with your campus email to submit a claim!');
      onOpenAuth();
      return;
    }

    if (!proof.trim()) return alert('Please provide details verifying you own this item.');

    setSubmitting(true);

    const { error } = await supabase
      .from('claims')
      .insert([
        {
          item_id: item.id,
          claimer_id: user.id,
          claimer_email: user.email,
          proof_description: proof
        }
      ]);

    setSubmitting(false);

    if (error) {
      console.error('Claim Error:', error);
      alert('Failed to submit claim. Please try again.');
    } else {
      setClaimSubmitted(true);
      setProof('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-xl"
        >
          ✕
        </button>

        {item.image_url && (
          <img 
            src={item.image_url} 
            alt={item.title} 
            className="w-full h-56 object-cover rounded-xl mb-4" 
          />
        )}

        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            item.type === 'LOST' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {item.type}
          </span>
          <span className="text-xs text-slate-400">{item.category}</span>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">{item.title}</h2>
        
        <div className="text-sm text-slate-600 space-y-1 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <p>📍 <strong>Location:</strong> {item.location}</p>
          <p>📅 <strong>Date:</strong> {item.date || 'Recently reported'}</p>
        </div>

        <hr className="my-6 border-slate-100" />

        {/* Claim Form Section */}
        <h3 className="font-bold text-slate-800 mb-2">Is this yours? Submit a Claim</h3>
        <p className="text-xs text-slate-500 mb-4">
          Describe specific verification details (e.g., unique marks, wallpaper photo, serial number, or exact contents inside).
        </p>

        {claimSubmitted ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-medium">
            ✅ Claim request submitted successfully! The poster will review your proof.
          </div>
        ) : (
          <form onSubmit={handleClaimSubmit} className="space-y-4">
            <textarea
              rows="3"
              placeholder="Describe proof of ownership..."
              value={proof}
              onChange={(e) => setProof(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition text-sm shadow-md shadow-blue-500/20 disabled:bg-slate-400"
            >
              {submitting ? 'Submitting Claim...' : 'Submit Claim Request'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}