import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ReportModal({ isOpen, onClose, onAddItem }) {
  const [type, setType] = useState('LOST');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [location, setLocation] = useState('');
  const [secretDetail, setSecretDetail] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !location) return alert('Please fill in required fields!');

    setUploading(true);
    let uploadedUrl = null;

    // 1. Upload photo to Supabase Storage if selected
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('item-photos')
        .upload(fileName, imageFile);

      if (uploadError) {
        alert('Error uploading photo!');
        console.error('Upload Error:', uploadError);
        setUploading(false);
        return;
      }

      // 2. Get Public URL directly
      const { data } = supabase.storage
        .from('item-photos')
        .getPublicUrl(fileName);

      uploadedUrl = data.publicUrl;
      console.log("Generated Image Public URL:", uploadedUrl);
    }

    // 3. Send complete post back to App.jsx with uploadedUrl
    await onAddItem({
      type,
      title,
      category,
      location,
      secretDetail,
      imageUrl: uploadedUrl // Make sure this key matches!
    });

    // Reset state & close
    setTitle('');
    setLocation('');
    setSecretDetail('');
    setImageFile(null);
    setUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-slate-800">Report an Item</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl px-2">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setType('LOST')}
              className={`py-2 text-sm font-semibold rounded-lg transition ${
                type === 'LOST' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              I Lost Something
            </button>
            <button
              type="button"
              onClick={() => setType('FOUND')}
              className={`py-2 text-sm font-semibold rounded-lg transition ${
                type === 'FOUND' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              I Found Something
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Item Title *</label>
            <input
              type="text"
              placeholder="e.g. Silver Laptop, Blue Keychain..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Category & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option>Electronics</option>
                <option>Wallets & IDs</option>
                <option>Keys</option>
                <option>Apparel & Bags</option>
                <option>Books & Notes</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Campus Location *</label>
              <input
                type="text"
                placeholder="e.g. Main Library 2F"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Photo Upload Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Item Photo (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />
          </div>

          {/* Secret Security Detail */}
          {type === 'FOUND' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <label className="block text-xs font-bold text-emerald-800 mb-1">
                🔒 Security Detail (Hidden from Public)
              </label>
              <input
                type="text"
                placeholder="e.g. Lock screen picture, brand on back..."
                value={secretDetail}
                onChange={(e) => setSecretDetail(e.target.value)}
                className="w-full bg-white border border-emerald-300 rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition text-sm shadow-md shadow-blue-500/20 disabled:bg-slate-400"
          >
            {uploading ? 'Uploading Photo...' : 'Submit Listing'}
          </button>
        </form>

      </div>
    </div>
  );
}