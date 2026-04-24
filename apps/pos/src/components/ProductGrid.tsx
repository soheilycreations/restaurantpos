import React, { useState, useEffect, useRef } from 'react';
import { usePOSStore } from '../lib/store';
import { 
  ShoppingCart, LayoutGrid, Loader2, UtensilsCrossed, Plus, 
  Soup, Flame, Utensils, Coffee, Cake, Pizza, Salad, Menu as MenuIcon, ChevronRight, ChevronLeft
} from 'lucide-react';
import { productsApi } from '../lib/api';
import { formatPrice } from '../lib/utils';

const categoryIcons: Record<string, any> = {
  'Rice Items': Soup,
  'Kottu': Flame,
  'Noodles': Utensils,
  'Drinks': Coffee,
  'Desserts': Cake,
  'Burgers': Pizza,
  'Other': Salad,
  'All': MenuIcon
};

export function ProductGrid({ activeCategory, onSelectCategory, searchQuery = '' }: { 
    activeCategory: string; 
    onSelectCategory: (cat: string) => void;
    searchQuery?: string 
}) {
  const addToCart = usePOSStore((state) => state.addToCart);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([{ id: 'All', label: 'All' }]);
  const [loading, setLoading] = useState(true);
  const [catsLoading, setCatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setCatsLoading(true);
        
        // Fetch Categories
        const catsData = await productsApi.getCategories();
        setCategories([{ id: 'All', label: 'All' }, ...catsData.map((c: any) => ({ id: c.name, label: c.name }))]);
        setCatsLoading(false);

        // Fetch Products
        const data = await productsApi.getAll();
        const formatted = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          category: p.category?.name || 'Other',
          image: p.image || '',
          available: 100,
          sold: 0,
          discount: null
        }));

        setProducts(formatted);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        setError('Could not load menu items.');
      } finally {
        setLoading(false);
        setCatsLoading(false);
      }
    };

    loadData();
  }, []);

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 opacity-40">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#6c5ce7]" />
        <p className="text-xs font-bold uppercase tracking-widest">Gourmet sync...</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* HORIZONTAL CATEGORY BAR & NAVIGATION */}
      <div className="flex flex-col mb-8 gap-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-xl bg-[#6c5ce7]/10 flex items-center justify-center text-[#6c5ce7]">
                  <LayoutGrid className="w-4 h-4" />
               </div>
               <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Categories</h2>
            </div>
            
            {/* Scroll Buttons for Categories */}
            {!catsLoading && (
              <div className="flex items-center gap-2">
                 <button onClick={() => scroll('left')} className="p-2 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 hover:text-[#6c5ce7] transition-all"><ChevronLeft className="w-4 h-4" /></button>
                 <button onClick={() => scroll('right')} className="p-2 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-400 hover:text-[#6c5ce7] transition-all"><ChevronRight className="w-4 h-4" /></button>
              </div>
            )}
        </div>

        {/* HORIZONTAL CATEGORY BAR */}
        <div 
           ref={scrollRef}
           className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
        >
          {catsLoading ? (
             [1,2,3,4,5].map(i => <div key={i} className="h-10 w-28 rounded-[2rem] bg-gray-50 dark:bg-white/5 animate-pulse flex-shrink-0" />)
          ) : (
            categories.map((cat, idx) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`flex items-center justify-center px-5 py-2.5 rounded-full transition-all duration-300 flex-shrink-0 border ${
                    isActive
                      ? 'bg-[#6c5ce7] border-[#6c5ce7] text-white shadow-xl shadow-[#6c5ce7]/20 scale-[1.02]'
                      : 'bg-white dark:bg-[#151c2c] border-gray-100 dark:border-white/[0.05] text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:border-[#6c5ce7]/30 dark:hover:bg-white/[0.02]'
                  }`}
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <span className={`text-[10px] font-black uppercase tracking-[0.08em] leading-none whitespace-nowrap ${
                    isActive ? 'text-white' : ''
                  }`}>
                    {cat.label}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-20">
          <ShoppingCart className="w-14 h-14 mb-4" />
          <p className="text-xs font-black uppercase tracking-widest">No matching items</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20 transition-all duration-500">
          {filtered.map((p, idx) => (
            <div
              key={p.id}
              onClick={() => addToCart(p)}
              className="premium-card rounded-[2.5rem] overflow-hidden cursor-pointer group animate-premium-fade"
              style={{ animationDelay: `${Math.min(idx * 30, 600)}ms` }}
            >
              <div className="relative w-full h-48 bg-gray-50 dark:bg-[#0b101a] overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out" />
                ) : (
                  <div className="flex flex-col items-center gap-2 opacity-10 group-hover:opacity-20 transition-all duration-500">
                    <UtensilsCrossed className="w-12 h-12 text-gray-400" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Artisan Dish</span>
                  </div>
                )}
                <div className="absolute bottom-4 right-4 z-20 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                   <div className="w-10 h-10 rounded-2xl bg-[#6c5ce7] text-white flex items-center justify-center shadow-lg shadow-[#6c5ce7]/40 ring-4 ring-white/10">
                      <Plus className="w-5 h-5" />
                   </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="flex-1 font-bold text-gray-900 dark:text-white text-sm leading-tight group-hover:text-[#6c5ce7] dark:group-hover:text-[#a29bfe] transition-colors truncate pr-2">
                    {p.name}
                  </h3>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Price</span>
                    <span className="text-[#6c5ce7] dark:text-[#a29bfe] font-black text-lg leading-none italic tracking-tighter">
                       Rs. {formatPrice(p.price)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
