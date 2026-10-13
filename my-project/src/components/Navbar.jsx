export default function Navbar({ onOpenReport, onOpenAuth, user, onLogout, searchTerm, setSearchTerm, onOpenClaims, isAdmin, onOpenAdmin}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            C
          </div>
          <span className="font-bold text-slate-800 text-lg hidden sm:inline">
            Campus <span className="text-blue-600">Retrieve</span>
          </span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search lost items, keys, IDs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 text-slate-800 px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>


        {/* Auth & Post Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2.5 py-1.5 rounded-lg hidden md:inline">
                👤 {user.email}
              </span>
              <button
                onClick={onLogout}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1"
              >
                Log Out
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition px-3 py-1.5"
            >
              Log In
            </button>
          )}

          <button 
            onClick={onOpenReport}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition"
          >
            + Post Item
          </button>

          {user && (
            <button
              onClick={onOpenClaims}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-lg transition"
            >
              📋 Manage Claims
            </button>
          )}

          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow-sm"
            >
              🛡️ Admin
            </button>
          )}
        </div>

      </div>
    </header>
  );
}