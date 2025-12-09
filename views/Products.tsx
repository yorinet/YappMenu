
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { ViewState } from '../types';
import { supabase } from '../supabaseClient';

interface ProductFromDB {
  id: number;
  name: string;
  price: number | null;
  price_petit: number | null;
  price_moyen: number | null;
  price_grand: number | null;
  category: string;
  image_isolee_url: string | null;
  image_lifestyle_url: string | null;
}

interface ProductsProps {
  onNavigate: (view: ViewState) => void;
  onEditProduct: (id: number) => void;
}

const Products: React.FC<ProductsProps> = ({ onNavigate, onEditProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<ProductFromDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error.message);
        setError(error.message);
      } else {
        setProducts(data || []);
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (product: ProductFromDB, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    // Optimistic UI update check/confirm
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ? Cette action est irréversible.`)) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', product.id);

        if (error) {
          alert(`Erreur lors de la suppression: ${error.message}`);
          console.error(error);
        } else {
          // Remove locally
          setProducts(prev => prev.filter(p => p.id !== product.id));
        }
      } catch (err) {
        console.error('Unexpected error deleting product:', err);
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderPrice = (product: ProductFromDB) => {
    const sizes = [
        { label: 'S', price: product.price_petit },
        { label: 'M', price: product.price_moyen },
        { label: 'L', price: product.price_grand },
    ].filter(s => s.price !== null && s.price > 0);

    // Multiple Prices (Horizontal Row)
    if (sizes.length > 0) {
        return (
            <div className="flex flex-wrap gap-2 mt-1">
                {sizes.map((s, idx) => (
                    <span key={idx} className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200 whitespace-nowrap">
                        {s.label} - {s.price}€
                    </span>
                ))}
            </div>
        );
    }

    // Single Price
    return (
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 w-fit">
            {product.price ? `${product.price}€` : '-'}
        </span>
    );
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 animate-slide-up">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Produits</h2>
          <p className="text-slate-500 mt-1">Gérez votre catalogue et vos assets</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un produit..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-black rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all shadow-sm placeholder:text-slate-400 text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 flex items-center justify-between">
            <span>Une erreur est survenue: {error}</span>
            <button onClick={fetchProducts} className="text-sm font-bold underline">Réessayer</button>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
          <Loader2 size={48} className="text-slate-300 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Chargement de vos produits...</p>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          
          {/* Add New Placeholder Card (Position 1) */}
          <div 
            onClick={() => onNavigate('product-editor')}
            className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-slate-400 hover:border-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-white border border-slate-200 flex items-center justify-center mb-3 transition-colors">
              <Plus size={24} />
            </div>
            <span className="text-sm font-medium">Ajouter un produit</span>
          </div>

          {/* Product Items */}
          {filteredProducts.map((product) => {
             // Determine which image to show
             const displayImage = product.image_isolee_url || product.image_lifestyle_url;

             return (
              <div 
                key={product.id} 
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Image Container */}
                <div className="aspect-square relative overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                  {displayImage ? (
                    <img 
                      src={displayImage} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-slate-300 flex flex-col items-center gap-2">
                       <ImageIcon size={32} />
                       <span className="text-[10px] font-medium uppercase">Sans image</span>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  
                  {/* Action Overlay */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEditProduct(product.id); }}
                      className="p-2 bg-white/90 backdrop-blur rounded-full shadow-sm hover:bg-white text-slate-700 hover:text-blue-600 transition-colors"
                      title="Modifier"
                      type="button"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => deleteProduct(product, e)}
                      className="p-2 bg-white/90 backdrop-blur rounded-full shadow-sm hover:bg-white text-slate-700 hover:text-red-500 transition-colors" 
                      title="Supprimer"
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Content Info */}
                <div className="p-4 flex flex-col gap-1 h-full">
                    {/* Row 1: Name */}
                    <h3 className="font-semibold text-slate-900 truncate" title={product.name}>
                        {product.name}
                    </h3>
                    
                    {/* Row 2: Category */}
                    <p className="text-xs text-slate-500 truncate mb-1">
                        {product.category || 'Non classé'}
                    </p>

                    {/* Row 3: Price(s) */}
                    <div className="mt-auto">
                        {renderPrice(product)}
                    </div>
                </div>
              </div>
            );
          })}
          
          {filteredProducts.length === 0 && (
             <div className="col-span-full py-10 text-center text-slate-400">
                <p>Aucun produit trouvé.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Products;
