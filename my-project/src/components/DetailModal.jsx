import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { findMatches } from '../utils/matchingEngine';

export default function DetailModal({ item, user, onClose, onOpenAuth, onOpenClaims }) {
  const [proof, setProof] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState(false);
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  const isOwner = user && item && user.id === item.user_id;

  useEffect(() => {
    if (item) {
      fetchAndScoreMatches();
    }
  }, [item]);

  const fetchAndScoreMatches = async () => {
    if (!item) return;
    setLoadingMatches(true);

    const targetType = item.type === 'LOST' ? 'FOUND' : 'LOST';

    const { data: candidates, error } = await supabase
      .from('items')
      .select('*')
      .eq('type', targetType)
      .neq('id', item.id);

    if (error) {
      console.error('Error fetching candidates:', error);
    } else if (candidates) {
      const scoredResults = findMatches(item, candidates);
      setMatches(scoredResults.slice(0, 3));
    }
    setLoadingMatches(false);
  };

  if (!item) return null;

  const handleActionSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('Please log in with your campus account first.');
      onOpenAuth();
      return;
    }

    if (!proof.trim()) return alert('Please enter details before submitting.');

    setSubmitting(true);

    // Save claim or notification to Supabase
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
      console.error('Submission Error:', error);
      alert('Failed to send details. Please try again.');
    } else {
      setSubmittedMessage(true);
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
          {isOwner && (
            <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full ml-auto">
              Your Listing
            </span>
          )}
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">{item.title}</h2>
        
        <div className="text-sm text-slate-600 space-y-1 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <p>📍 <strong>Location:</strong> {item.location}</p>
          <p>📅 <strong>Date:</strong> {item.date || 'Recently reported'}</p>
        </div>

        {/* AUTOMATCHING ENGINE SECTION */}
        <div className="mb-6 bg-indigo-50/70 border border-indigo-100 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">⚡</span>
              <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                Smart Auto-Matches ({item.type === 'LOST' ? 'FOUND' : 'LOST'})
              </h3>
            </div>
            <span className="text-[10px] text-indigo-500 bg-indigo-100/50 px-2 py-0.5 rounded-full font-medium">
              matchingEngine.js
            </span>
          </div>

          {loadingMatches ? (
            <p className="text-xs text-slate-400 py-1">Scanning database...</p>
          ) : matches.length === 0 ? (
            <p className="text-xs text-slate-500 py-1">
              No matching {item.type === 'LOST' ? 'FOUND' : 'LOST'} reports score ≥ 40% found yet.
            </p>
          ) : (
            <div className="space-y-2 mt-2">
              {matches.map(({ item: matchedItem, score }) => (
                <div 
                  key={matchedItem.id} 
                  className="bg-white p-3 rounded-lg border border-indigo-100 text-xs flex justify-between items-center shadow-sm"
                >
                  <div className="pr-2">
                    <p className="font-semibold text-slate-800">{matchedItem.title}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">📍 {matchedItem.location}</p>
                  </div>
                  
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    score >= 70 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                      : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  }`}>
                    {score}% Match
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <hr className="my-6 border-slate-100" />

        {/* 4-WAY DYNAMIC ACTION SECTION */}
        {isOwner && item.type === 'FOUND' && (
          /* SCENARIO 1: OWNER OF A FOUND ITEM */
          <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl text-center">
            <h4 className="text-sm font-bold text-emerald-900 mb-1">You posted this Found Item</h4>
            <p className="text-xs text-emerald-700 mb-4">
              Students claiming this item will submit proof details for your verification.
            </p>
            <button
              onClick={() => {
                onClose();
                if (onOpenClaims) onOpenClaims();
              }}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 rounded-xl transition text-sm shadow-sm"
            >
              📋 View Claims for this Item
            </button>
          </div>
        )}

        {isOwner && item.type === 'LOST' && (
          /* SCENARIO 2: OWNER OF A LOST ITEM */
          <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-xl text-center">
            <h4 className="text-sm font-bold text-amber-900 mb-1">You reported this item as Lost</h4>
            <p className="text-xs text-amber-700 mb-3">
              We are actively cross-referencing new Found posts with your listing.
            </p>
            <p className="text-[11px] text-amber-600 font-medium">
              Check the Auto-Matches box above or monitor your email for updates.
            </p>
          </div>
        )}

        {!isOwner && item.type === 'FOUND' && (
          /* SCENARIO 3: OTHER STUDENT VIEWING A FOUND ITEM */
          <div>
            <h3 className="font-bold text-slate-800 mb-1">Is this yours? Submit a Claim</h3>
            <p className="text-xs text-slate-500 mb-4">
              Describe specific details (e.g. wallpaper picture, serial number, scratch marks) to prove ownership to the finder.
            </p>

            {submittedMessage ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-medium">
                ✅ Claim submitted! The finder has been notified to review your proof.
              </div>
            ) : (
              <form onSubmit={handleActionSubmit} className="space-y-4">
                <textarea
                  rows="3"
                  placeholder="Provide proof of ownership details..."
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
                  {submitting ? 'Submitting...' : 'Submit Claim Request'}
                </button>
              </form>
            )}
          </div>
        )}

        {!isOwner && item.type === 'LOST' && (
          /* SCENARIO 4: OTHER STUDENT VIEWING A LOST ITEM */
          <div>
            <h3 className="font-bold text-slate-800 mb-1">Have you seen or found this item?</h3>
            <p className="text-xs text-slate-500 mb-4">
              Help out a fellow student by sharing where you saw or turned in this item.
            </p>

            {submittedMessage ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-medium">
                ✅ Information sent to the owner! Thank you for helping campus community.
              </div>
            ) : (
              <form onSubmit={handleActionSubmit} className="space-y-4">
                <textarea
                  rows="3"
                  placeholder="e.g. 'I turned this in to the Security Office at Library Block B' or 'Saw it on Table 4 in cafeteria'..."
                  value={proof}
                  onChange={(e) => setProof(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-xl transition text-sm shadow-md shadow-amber-500/20 disabled:bg-slate-400"
                >
                  {submitting ? 'Sending...' : 'Notify Item Owner'}
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}