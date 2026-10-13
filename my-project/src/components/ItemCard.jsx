export default function ItemCard({ type, title, location, date, category, image_url, onClick }) {
  const isLost = type === 'LOST';

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
      {image_url ? (
        <div className="h-48 w-full bg-slate-100 overflow-hidden relative">
          <img 
            src={image_url} 
            alt={title} 
            className="w-full h-full object-cover"
            onError={(e) => console.error("Failed to load image from URL:", image_url)}
          />
          <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm ${
            isLost ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
          }`}>
            {type}
          </span>
        </div>
      ) : (
        /* Fallback header if no image */
        <div className="p-4 pb-0 flex justify-between items-start">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            isLost ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {type}
          </span>
          <span className="text-xs text-slate-400">{category}</span>
        </div>
      )}

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 text-lg mb-1">{title}</h3>
          <div className="text-sm text-slate-500 space-y-1 mb-4">
            <p>📍 {location}</p>
            <p>📅 {date}</p>
          </div>
        </div>

        <button 
          onClick={onClick}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium py-2 rounded-lg transition"
        >
          View Details
        </button>
      </div>
    </div>
  );
}