import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function ClaimsDashboardModal({ isOpen, onClose, user }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      fetchMyClaims();
    }
  }, [isOpen, user]);

  const fetchMyClaims = async () => {
    setLoading(true);

    // Fetch items posted by the user along with their incoming claims
    const { data, error } = await supabase
      .from('claims')
      .select(`
        id,
        proof_description,
        status,
        created_at,
        claimer_email,
        items (
          id,
          title,
          type,
          user_id
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching claims:', error);
    } else {
      // Filter claims for items posted by the current logged-in user
      const userItemClaims = data.filter(claim => claim.items && claim.items.user_id === user.id);
      setClaims(userItemClaims);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (claimId, newStatus) => {
    const { error } = await supabase
      .from('claims')
      .update({ status: newStatus })
      .eq('id', claimId);

    if (error) {
      alert('Failed to update status');
      console.error(error);
    } else {
      setClaims(claims.map(c => c.id === claimId ? { ...c, status: newStatus } : c));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl relative max-h-[85vh] flex flex-col">
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Claims Management Dashboard</h2>
            <p className="text-xs text-slate-500">Review proof submitted by students for your posts</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl px-2">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {loading ? (
            <p className="text-center py-8 text-sm text-slate-500">Loading claims...</p>
          ) : claims.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-sm text-slate-500">No claim requests received for your items yet.</p>
            </div>
          ) : (
            claims.map(claim => (
              <div key={claim.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      Item: {claim.items?.title}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">Claimer: {claim.claimer_email}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    claim.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                    claim.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {claim.status}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs font-semibold text-slate-700 mb-1">Proof Description:</p>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{claim.proof_description}</p>
                </div>

                {claim.status === 'PENDING' && (
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      onClick={() => handleUpdateStatus(claim.id, 'REJECTED')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold rounded-lg transition"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(claim.id, 'APPROVED')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition"
                    >
                      Approve Claim
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}