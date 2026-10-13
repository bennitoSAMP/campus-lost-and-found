import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ItemCard from './components/ItemCard';
import ReportModal from './components/ReportModal';
import DetailModal from './components/DetailModal';
import AuthModal from './components/AuthModal';
import ClaimsDashboardModal from './components/ClaimsDashboardModal';
import { supabase } from './lib/supabase';

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [isClaimsOpen, setIsClaimsOpen] = useState(false);
  
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check user session & fetch database items
  useEffect(() => {
    fetchItems();

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth state changes (login / logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching items:', error);
    else setItems(data);

    setLoading(false);
  }

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
          date: 'Just now',
          secret_detail: newItem.secretDetail,
          image_url: newItem.imageUrl,
          user_id: user.id
        }
      ])
      .select();

    if (error) {
      alert('Error saving post to database!');
      console.error(error);
    } else if (data) {
      setItems([data[0], ...items]);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = 
      selectedCategory === 'All' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Electronics', 'Wallets & IDs', 'Keys', 'Apparel & Bags', 'Personal Items'];

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
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
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
          <div className="text-center py-12 text-slate-500 text-sm">
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
      />

      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onUserAuthenticated={(u) => setUser(u)}
      />
    </div>
  );
}