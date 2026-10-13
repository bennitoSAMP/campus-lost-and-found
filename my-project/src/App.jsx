import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ItemCard from './components/ItemCard';
import ReportModal from './components/ReportModal';
import DetailModal from './components/DetailModal';
import AuthModal from './components/AuthModal';
import ClaimsDashboardModal from './components/ClaimsDashboardModal';
import AdminPanelModal from './components/AdminPanelModal'; // FIXED TYPO HERE
import { supabase } from './lib/supabase';

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isClaimsOpen, setIsClaimsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch items from Supabase with safety fallback
  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase query error:', error.message);
        // Fallback: Query items without strict filters
        const { data: fallbackData } = await supabase.from('items').select('*');
        setItems(fallbackData || []);
      } else {
        // Client-side filter for active listings
        const activeListings = (data || []).filter(
          (item) => !item.status || item.status === 'ACTIVE'
        );
        setItems(activeListings);
      }
    } catch (err) {
      console.error('Unexpected fetch exception:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();

    // Check current active session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn('Session expired or invalid, resetting session:', error.message);
        supabase.auth.signOut();
        setUser(null);
      } else {
        setUser(session?.user ?? null);
      }
    });

    // Listen for real-time auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setUser(null);
      } else if (session) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleAddItem = async (newItem) => {
    if (!user) {
      alert('You must be logged in with a campus email to post an item!');
      setIsAuthOpen(true);
      return;
    }

    const { data, error } = await supabase
      .from('items')
      .insert([
        {
          title: newItem.title,
          type: newItem.type,
          category: newItem.category,
          location: newItem.location,
          date: newItem.date || new Date().toISOString().split('T')[0],
          secret_detail: newItem.secret_detail || null,
          image_url: newItem.image_url || null,
          user_id: user.id,
          status: 'ACTIVE'
        }
      ])
      .select();

    if (error) {
      alert('Error saving post to database!');
      console.error('Database Insert Error:', error);
    } else if (data && data.length > 0) {
      setItems([data[0], ...items]);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = 
      (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.location || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = 
      selectedCategory === 'All' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Electronics', 'Wallets & IDs', 'Keys', 'Apparel & Bags', 'Books & Notes', 'Other'];
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.email === 'kervinedgar.bardilas@ctu.edu.ph';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar 
        onOpenReport={() => {
          if (!user) setIsAuthOpen(true);
          else setIsModalOpen(true);
        }} 
        onOpenAuth={() => setIsAuthOpen(true)}
        user={user}
        onLogout={handleLogout}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenClaims={() => setIsClaimsOpen(true)}
        isAdmin={isAdmin}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            {selectedCategory === 'All' ? 'Recent Listings' : `${selectedCategory}`}
          </h1>
          <span className="text-sm text-slate-500">{filteredItems.length} items found</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm animate-pulse">
            Loading campus listings...
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ItemCard 
                key={item.id} 
                {...item} 
                onClick={() => setSelectedItem(item)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-sm">No items match your search or filter criteria.</p>
          </div>
        )}
      </main>

      <ClaimsDashboardModal 
        isOpen={isClaimsOpen}
        onClose={() => setIsClaimsOpen(false)}
        user={user}
      />
        
      <ReportModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddItem={handleAddItem} 
      />

      <DetailModal 
        item={selectedItem} 
        user={user}
        onClose={() => setSelectedItem(null)} 
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenClaims={() => setIsClaimsOpen(true)}
      />

      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onUserAuthenticated={(u) => setUser(u)}
      />

      <AdminPanelModal 
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onRefreshFeed={fetchItems}
      />
    </div>
  );
}