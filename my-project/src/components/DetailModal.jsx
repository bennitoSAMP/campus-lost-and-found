import { useState } from 'react';
import { findMatches } from '../utils/matchingEngine';

export default function DetailModal({ item, allItems = [], onClose }) {
  const [claimAnswer, setClaimAnswer] = useState('');
  const [claimSubmitted, setClaimSubmitted] = useState(false);

  if (!item) return null;

  const isLost = item.type === 'LOST';

  // 🤖 Run the matching engine on the currently opened item
  const potentialMatches = findMatches(item, allItems);

  const handleClaimSubmit = (e) => {
    e.preventDefault();
    if (!claimAnswer.trim()) return alert('Please provide an answer!');
    setClaimSubmitted(true);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              isLost ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {item.type}
            </span>
            <h2 className="text-xl font-bold text-slate-800 mt-2">{item.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-xl px-2"
          >
            ✕
          </button>
        </div>

        {/* Item Information */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2 mb-6 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Category:</span>
            <span className="font-medium text-slate-800">{item.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Location:</span>
            <span className="font-medium text-slate-800">📍 {item.location}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date Reported:</span>
            <span className="font-medium text-slate-800">📅 {item.date}</span>
          </div>
        </div>

        {/* ⚡ POTENTIAL MATCHES SECTION */}
        {potentialMatches.length > 0 && (
          <div className="mb-6 bg-blue-50/50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">✨</span>
              <h3 className="font-bold text-slate-800 text-sm">
                System Auto-Matches ({potentialMatches.length})
              </h3>
            </div>

            <div className="space-y-2">
              {potentialMatches.map(({ item: matchItem, score }) => (
                <div 
                  key={matchItem.id} 
                  className="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center text-xs shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{matchItem.title}</p>
                    <p className="text-slate-500">📍 {matchItem.location}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded-md text-[11px]">
                    {score}% Match
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action / Claim Section */}
        {!isLost ? (
          <div>
            {!claimSubmitted ? (
              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h3 className="font-bold text-amber-900 text-sm mb-1">
                    🔒 Verification Required to Claim
                  </h3>
                  <p className="text-xs text-amber-800 mb-3">
                    Describe any specific details (stickers, lock screen, contents) not listed publicly.
                  </p>
                  <textarea
                    rows={3}
                    placeholder="Describe specific details only the owner would know..."
                    value={claimAnswer}
                    onChange={(e) => setClaimAnswer(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-lg p-2.5 text-xs outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition text-sm shadow-md shadow-emerald-500/20"
                >
                  Submit Claim Request
                </button>
              </form>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <div className="text-emerald-600 text-2xl mb-1">✅</div>
                <h3 className="font-bold text-emerald-900 text-sm">Claim Request Sent!</h3>
                <p className="text-xs text-emerald-700 mt-1">
                  The finder will review your verification answer.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <p className="text-xs text-blue-800">
              Did you find this item? Contact campus administration or notify the student directly.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}