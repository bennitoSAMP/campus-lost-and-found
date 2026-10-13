import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminPanelModal({ isOpen, onClose, onRefreshFeed }) {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchAllItems();
    }
  }, [isOpen]);

  const fetchAllItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Admin fetch error:', error);
    } else {
      setAllItems(data || []);
    }
    setLoading(false);
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to permanently delete this listing?')) return;

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId);

    if (error) {
      alert('Failed to delete item: ' + error.message);
    } else {
      setAllItems(allItems.filter((item) => item.id !== itemId));
      if (onRefreshFeed) onRefreshFeed();
    }
  };

  const handleToggleStatus = async (itemId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'RESOLVED' : 'ACTIVE';

    const { error } = await supabase
      .from('items')
      .update({ status: newStatus })
      .eq('id', itemId);

    if (error) {
      alert('Failed to update status');
    } else {
      setAllItems(
        allItems.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item))
      );
      if (onRefreshFeed) onRefreshFeed();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              🛡️ Campus Admin Moderation
            </h2>
            <p className="text-xs text-slate-500">Overview all posts, remove spam, and manage item statuses</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl px-2">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <p className="text-center py-8 text-sm text-slate-500">Loading system records...</p>
          ) : allItems.length === 0 ? (
            <p className="text-center py-8 text-sm text-slate-500">No items found in system.</p>
          ) : (
            allItems.map((item) => (
              <div key={item.id} className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.type === 'LOST' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.type}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.status || 'ACTIVE'}
                    </span>
                    <span className="text-xs text-slate-400">{item.category}</span>
                  </div>
                  <p className="font-semibold text-slate-800 text-sm truncate">{item.title}</p>
                  <p className="text-xs text-slate-500">📍 {item.location} • Posted: {item.date}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleStatus(item.id, item.status || 'ACTIVE')}
                    className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition"
                  >
                    {item.status === 'RESOLVED' ? 'Reopen' : 'Mark Resolved'}
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-semibold rounded-lg transition"
                  >
                    Delete Spam
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}