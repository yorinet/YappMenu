
import React, { useState, useEffect } from 'react';
import { Save, Download, Plus, Layout, Type, Palette, Grip, Eye, EyeOff, Monitor, Smartphone, File, ArrowLeft, Search, Trash2, X, Box, Image as ImageLucide, Loader2 } from 'lucide-react';
import { EditorConfig, ViewState } from '../types';
import { supabase } from '../supabaseClient';

interface MediaEditorProps {
  onNavigate: (view: ViewState) => void;
}

const INITIAL_CONFIG: EditorConfig = {
  title: 'My Awesome Menu',
  showTitle: true,
  format: 'A4',
  layout: 'Grid',
  paddingH: 20,
  paddingV: 20,
  gap: 10,
  cols: 3,
  rows: 4,
  colorTitle: '#1e293b',
  colorBg: '#ffffff',
  gradientStart: '#ffffff',
  gradientEnd: '#ffffff',
  colorProductName: '#000000',
  colorPrice: '#000000',
  backgroundGradient: undefined,
  customWidth: 1080,
  customHeight: 1080,
};

const FORMAT_SPECS: Record<string, { ratio: string, label: string, icon: React.ReactNode }> = {
  'A4': { ratio: '210/297', label: 'A4 (Portrait)', icon: <File size={14} /> },
  'A4_LAND': { ratio: '297/210', label: 'A4 (Paysage)', icon: <File size={14} className="rotate-90" /> },
  'TV': { ratio: '16/9', label: 'TV (16:9)', icon: <Monitor size={14} /> },
  'Tablette': { ratio: '3/4', label: 'Tablette (3:4)', icon: <Smartphone size={14} /> },
  'Personalisé': { ratio: 'auto', label: 'Personnalisé', icon: <Layout size={14} /> },
};

const CARD_STYLES = [
  { id: 'white-clean', name: 'White Clean' },
  { id: 'top-overlay', name: 'Top Overlay' },
  { id: 'full-overlay', name: 'Full Overlay' },
  { id: 'solid-bg', name: 'Solid Background' },
  { id: 'split-horiz', name: 'Split Horizontal' },
  { id: 'card-classic', name: 'Card Classic' },
  { id: 'minimal-row', name: 'Minimal Row' },
  { id: 'photo-emphasis', name: 'Photo Emphasis' },
  { id: 'rounded-premium', name: 'Rounded Premium' },
];

interface ProductFromDB {
  id: number;
  name: string;
  price: number | null;
  price_petit: number | null;
  price_moyen: number | null;
  price_grand: number | null;
  category: string;
  description: string;
  image_isolee_url: string | null;
  image_lifestyle_url: string | null;
}

interface GridItem {
  productId: number;
  styleId: string;
  displayMode: 'isolated' | 'lifestyle';
  selectedPrice?: number | null;
  selectedSizeLabel?: string | null;
}

const MediaEditor: React.FC<MediaEditorProps> = ({ onNavigate }) => {
  const [config, setConfig] = useState<EditorConfig>(INITIAL_CONFIG);
  const [gridItems, setGridItems] = useState<(GridItem | null)[]>([]);
  
  // Products State
  const [products, setProducts] = useState<ProductFromDB[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Sidebar State for "Add Product" mode
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectionStyle, setSelectionStyle] = useState('white-clean');
  const [productSearch, setProductSearch] = useState('');
  const [productDisplayMode, setProductDisplayMode] = useState<'isolated' | 'lifestyle'>('isolated');

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching products:', error.message);
        } else {
          setProducts(data || []);
        }
      } catch (err: any) {
        console.error('Unexpected error:', err.message);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Initialize grid items when dimensions change
  useEffect(() => {
    const total = config.cols * config.rows;
    setGridItems(prev => {
      const newItems = new Array(total).fill(null);
      // Preserve existing items if possible
      prev.forEach((item, i) => {
        if (i < total) newItems[i] = item;
      });
      return newItems;
    });
  }, [config.cols, config.rows]);

  const handleConfigChange = (key: keyof EditorConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleGradientChange = (type: 'start' | 'end', color: string) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      if (type === 'start') newConfig.gradientStart = color;
      if (type === 'end') newConfig.gradientEnd = color;
      newConfig.colorBg = newConfig.gradientStart;
      return newConfig;
    });
  };

  const handleAddItem = (productId: number, price: number | null, sizeLabel: string | null) => {
    if (selectedSlot !== null) {
      const newItems = [...gridItems];
      newItems[selectedSlot] = { 
        productId, 
        styleId: selectionStyle,
        displayMode: productDisplayMode,
        selectedPrice: price,
        selectedSizeLabel: sizeLabel
      };
      setGridItems(newItems);
      setSelectedSlot(null); // Close sidebar selection mode
      setProductSearch('');
    }
  };

  const handleRemoveItem = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newItems = [...gridItems];
    newItems[index] = null;
    setGridItems(newItems);
  };

  // Render Logic Helpers
  const renderStyleThumbnail = (id: string, isSelected: boolean) => {
    const borderColor = isSelected ? 'border-slate-400' : 'border-slate-200';
    const bgColor = isSelected ? 'bg-white' : 'bg-slate-50';
    const lineColor = isSelected ? 'bg-slate-300' : 'bg-slate-200';
    const accentColor = isSelected ? 'bg-slate-200' : 'bg-slate-100';

    const containerClass = `w-14 h-14 rounded shadow-sm border ${borderColor} ${bgColor} overflow-hidden flex relative transition-all`;

    switch (id) {
      case 'white-clean': 
        return (
          <div className={`${containerClass} flex-col`}>
             <div className={`h-3/5 w-full ${accentColor} border-b ${borderColor}`}></div>
             <div className="flex-1 p-1 flex flex-col justify-center gap-0.5">
                <div className={`h-0.5 w-3/4 ${lineColor} rounded-full`}></div>
                <div className={`h-0.5 w-1/2 ${lineColor} rounded-full opacity-60`}></div>
             </div>
          </div>
        );
      case 'top-overlay': 
        return (
          <div className={`${containerClass} flex-col`}>
             <div className={`h-1/2 w-full ${accentColor}`}></div>
             <div className={`mx-0.5 -mt-1.5 bg-white border ${borderColor} rounded-[2px] p-0.5 shadow-sm relative z-10`}>
                 <div className={`h-0.5 w-2/3 ${lineColor} rounded-full`}></div>
             </div>
          </div>
        );
      case 'full-overlay': 
        return (
          <div className={`${containerClass} p-0.5 items-center justify-center`}>
             <div className={`w-full h-full ${accentColor} rounded border ${borderColor} relative flex flex-col justify-end p-0.5`}>
                <div className="bg-white/80 p-0.5 rounded-[2px] backdrop-blur-sm">
                   <div className={`h-0.5 w-full ${lineColor} rounded-full`}></div>
                </div>
             </div>
          </div>
        );
      case 'solid-bg': 
        return (
          <div className={`w-14 h-14 rounded shadow-sm border ${borderColor} bg-slate-800 overflow-hidden flex flex-col p-1`}>
             <div className="w-6 h-6 rounded-full bg-slate-700 mb-auto mx-auto border border-slate-600"></div>
             <div className="h-0.5 w-full bg-slate-600 rounded-full mb-0.5"></div>
          </div>
        );
      case 'split-horiz': 
        return (
          <div className={`${containerClass} flex-row`}>
             <div className={`w-[35%] h-full ${accentColor} border-r ${borderColor}`}></div>
             <div className="flex-1 p-0.5 flex flex-col justify-center gap-0.5">
                 <div className={`h-0.5 w-full ${lineColor} rounded-full`}></div>
                 <div className={`h-0.5 w-2/3 ${lineColor} rounded-full`}></div>
             </div>
          </div>
        );
      case 'card-classic': 
        return (
          <div className={`${containerClass} flex-row items-center p-0.5 gap-0.5`}>
             <div className={`w-5 h-5 rounded ${accentColor} border ${borderColor} shrink-0`}></div>
             <div className="flex-1 flex flex-col gap-0.5">
                 <div className={`h-0.5 w-full ${lineColor} rounded-full`}></div>
                 <div className={`h-0.5 w-1/2 ${lineColor} rounded-full`}></div>
             </div>
          </div>
        );
      case 'minimal-row': 
        return (
          <div className={`${containerClass} flex-col justify-center gap-0.5 p-0.5`}>
             <div className="flex items-center gap-0.5 border-b border-slate-100 pb-0.5">
               <div className={`w-2 h-2 rounded-full ${accentColor} shrink-0`}></div>
               <div className={`h-0.5 w-6 ${lineColor} rounded-full`}></div>
             </div>
             <div className="flex items-center gap-0.5">
               <div className={`w-2 h-2 rounded-full ${accentColor} shrink-0`}></div>
               <div className={`h-0.5 w-6 ${lineColor} rounded-full`}></div>
             </div>
          </div>
        );
      case 'photo-emphasis': 
        return (
          <div className={`${containerClass} flex-col`}>
             <div className={`h-[80%] w-full ${accentColor}`}></div>
             <div className="flex-1 flex items-center px-0.5">
                <div className={`h-0.5 w-1/2 ${lineColor} rounded-full`}></div>
             </div>
          </div>
        );
      case 'rounded-premium': 
        return (
          <div className={`w-14 h-14 rounded-xl shadow-sm border ${borderColor} ${bgColor} overflow-hidden flex flex-col p-0.5`}>
             <div className={`h-1/2 w-full ${accentColor} rounded-lg mb-0.5`}></div>
             <div className="px-0.5 space-y-0.5">
                <div className={`h-0.5 w-3/4 ${lineColor} rounded-full`}></div>
             </div>
          </div>
        );
      default:
        return <div className={containerClass}></div>;
    }
  };

  const renderCardContent = (item: GridItem) => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return null;

    // Determine image based on the mode stored in the item or fallback
    let imageUrl = null;
    if (item.displayMode === 'isolated' && product.image_isolee_url) {
        imageUrl = product.image_isolee_url;
    } else if (item.displayMode === 'lifestyle' && product.image_lifestyle_url) {
        imageUrl = product.image_lifestyle_url;
    } else {
        // Fallback logic
        imageUrl = product.image_isolee_url || product.image_lifestyle_url;
    }

    const img = imageUrl ? (
        <img src={imageUrl} className="w-full h-full object-cover" alt="" />
    ) : (
        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
            <ImageLucide size={24} />
        </div>
    );
    
    // Determine Price to Display
    let displayPrice = "";
    
    // Case 1: Specific Price selected (from Price Block Click)
    if (item.selectedPrice !== undefined && item.selectedPrice !== null) {
        displayPrice = item.selectedSizeLabel 
            ? `${item.selectedSizeLabel} ${item.selectedPrice}€` 
            : `${item.selectedPrice}€`;
    } 
    // Case 2: General Selection (from Row Click)
    else {
        // Check if multiple sizes exist
        const sizes = [
            { l: 'S', p: product.price_petit },
            { l: 'M', p: product.price_moyen },
            { l: 'L', p: product.price_grand }
        ].filter(s => s.p !== null && s.p > 0);

        if (sizes.length > 0) {
            // Display all sizes like "S 10€ M 12€ L 14€"
            displayPrice = sizes.map(s => `${s.l} ${s.p}€`).join(' ');
        } else if (product.price) {
            // Fallback to single price
            displayPrice = `${product.price}€`;
        } else {
             displayPrice = '-€';
        }
    }
    
    // Tiny utility styles for the preview card
    const titleStyle = { color: config.colorProductName };
    const priceStyle = { color: config.colorPrice };

    switch (item.styleId) {
      case 'white-clean':
        return (
          <div className="w-full h-full flex flex-col bg-white overflow-hidden rounded-md shadow-sm">
            <div className="h-2/3 relative">{img}</div>
            <div className="flex-1 p-2 flex flex-col justify-center">
               <h3 className="font-bold text-[10px] leading-tight truncate" style={titleStyle}>{product.name}</h3>
               <p className="text-[8px] text-slate-400 truncate">{product.category}</p>
               <span className="font-bold text-[10px] mt-auto" style={priceStyle}>{displayPrice}</span>
            </div>
          </div>
        );
      case 'top-overlay':
        return (
           <div className="w-full h-full flex flex-col bg-slate-50 relative rounded-md overflow-hidden">
             <div className="h-1/2">{img}</div>
             <div className="absolute top-[40%] left-2 right-2 bg-white p-2 rounded shadow-sm text-center">
                <h3 className="font-bold text-[9px] truncate" style={titleStyle}>{product.name}</h3>
             </div>
             <div className="mt-auto p-2 text-center font-bold text-[10px]" style={priceStyle}>{displayPrice}</div>
           </div>
        );
      case 'full-overlay':
        return (
          <div className="w-full h-full relative rounded-md overflow-hidden">
             {img}
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
             <div className="absolute bottom-0 left-0 right-0 p-2">
                <h3 className="font-bold text-[10px] text-white truncate">{product.name}</h3>
                <span className="font-bold text-[10px] text-emerald-400">{displayPrice}</span>
             </div>
          </div>
        );
      case 'solid-bg':
         return (
           <div className="w-full h-full bg-slate-800 text-white p-2 flex flex-col items-center text-center rounded-md overflow-hidden">
              <div className="w-10 h-10 rounded-full border-2 border-slate-600 overflow-hidden mb-1 shrink-0">{img}</div>
              <h3 className="font-bold text-[9px] leading-tight mb-1">{product.name}</h3>
              <span className="mt-auto font-bold text-[10px] text-emerald-400">{displayPrice}</span>
           </div>
         );
      case 'split-horiz':
         return (
            <div className="w-full h-full flex bg-white rounded-md overflow-hidden">
               <div className="w-[40%] h-full relative border-r border-slate-100">{img}</div>
               <div className="flex-1 p-2 flex flex-col justify-center">
                  <span className="text-[8px] text-blue-500 font-bold bg-blue-50 px-1 rounded w-fit">{product.category}</span>
                  <h3 className="font-bold text-[9px] mt-1 truncate" style={titleStyle}>{product.name}</h3>
                  <div className="font-bold text-[10px] mt-auto" style={priceStyle}>{displayPrice}</div>
               </div>
            </div>
         );
      case 'card-classic':
         return (
            <div className="w-full h-full bg-white p-2 flex items-center gap-2 rounded-md overflow-hidden shadow-sm">
               <div className="w-1/3 aspect-square rounded-md overflow-hidden">{img}</div>
               <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[10px] truncate" style={titleStyle}>{product.name}</h3>
                  <div className="font-bold text-[10px]" style={priceStyle}>{displayPrice}</div>
               </div>
            </div>
         );
       case 'minimal-row':
         return (
            <div className="w-full h-full bg-white p-2 flex flex-col justify-center gap-1 rounded-md overflow-hidden">
               <div className="flex items-center gap-2 border-b border-slate-100 pb-1">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">{img}</div>
                  <div className="min-w-0">
                     <h3 className="font-bold text-[9px] truncate" style={titleStyle}>{product.name}</h3>
                     <div className="font-bold text-[9px]" style={priceStyle}>{displayPrice}</div>
                  </div>
               </div>
            </div>
         );
       case 'photo-emphasis':
         return (
            <div className="w-full h-full flex flex-col bg-white rounded-md overflow-hidden">
               <div className="flex-1 relative">{img}</div>
               <div className="h-8 flex items-center justify-between px-2 border-t border-slate-50">
                  <h3 className="font-bold text-[9px] truncate max-w-[60%]" style={titleStyle}>{product.name}</h3>
                  <span className="font-bold text-[9px]" style={priceStyle}>{displayPrice}</span>
               </div>
            </div>
         );
       case 'rounded-premium':
         return (
            <div className="w-full h-full bg-slate-50 p-1 flex flex-col rounded-lg overflow-hidden">
               <div className="flex-1 rounded-md overflow-hidden relative shadow-sm border border-white mb-1">{img}</div>
               <div className="px-1 flex justify-between items-center">
                  <h3 className="font-bold text-[9px] truncate" style={titleStyle}>{product.name}</h3>
                  <span className="font-bold text-[9px]" style={priceStyle}>{displayPrice}</span>
               </div>
            </div>
         );
      default: return null;
    }
  };

  const currentFormatSpec = FORMAT_SPECS[config.format] || FORMAT_SPECS['A4'];
  
  let aspectRatioStyle: React.CSSProperties = {};
  if (config.format === 'Personalisé') {
     aspectRatioStyle = { aspectRatio: `${config.customWidth}/${config.customHeight}`, width: '450px' };
  } else {
     aspectRatioStyle = { aspectRatio: currentFormatSpec.ratio, width: config.format === 'TV' || config.format === 'A4_LAND' ? '600px' : '450px' };
  }

  const pageContainerStyle = {
    background: `linear-gradient(135deg, ${config.gradientStart} 0%, ${config.gradientEnd} 100%)`,
    padding: `${config.paddingV}px ${config.paddingH}px`,
    display: 'flex',
    flexDirection: 'column' as const,
    ...aspectRatioStyle
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${config.rows}, minmax(0, 1fr))`,
    gap: `${config.gap}px`,
    flex: 1,
    width: '100%',
    minHeight: 0,
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-white">
      
      {/* LEFT COLUMN: Canvas Area */}
      <div className="flex-1 flex flex-col relative bg-slate-100">
        
        {/* Editor Toolbar */}
        <div className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0 z-10">
           <button 
             onClick={() => onNavigate('menus')}
             className="flex items-center text-slate-500 hover:text-slate-900 transition-colors gap-2 text-sm font-medium"
           >
             <ArrowLeft size={18} /> 
             <span>Retour aux menus</span>
           </button>
           
           <div className="flex items-center gap-4">
               <span className="text-xs text-slate-400 hidden sm:inline-block">Modifications non enregistrées</span>
               <div className="flex items-center gap-2">
                   <button className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center gap-2">
                     <Download size={16} /> <span className="hidden sm:inline">Export</span>
                   </button>
                   <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm">
                     <Save size={16} /> Enregistrer
                   </button>
               </div>
           </div>
        </div>

        {/* Canvas Scroller */}
        <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
          <div 
            className="bg-white shadow-2xl transition-all duration-300 relative shrink-0"
            style={pageContainerStyle}
          >
             {config.showTitle && (
               <div className="mb-4 text-center shrink-0">
                 <h1 style={{ color: config.colorTitle }} className="text-2xl font-bold font-serif leading-tight">
                   {config.title}
                 </h1>
                 <div className="w-16 h-1 bg-current opacity-20 mx-auto mt-2 rounded-full" style={{ color: config.colorTitle }}></div>
               </div>
             )}

             <div style={gridStyle}>
                {gridItems.map((item, idx) => (
                    <div 
                      key={`slot-${idx}`} 
                      className={`relative w-full h-full transition-all group ${
                        !item ? 'rounded-lg border-2 border-dashed border-slate-300/30 hover:bg-black/5 hover:border-slate-400' : ''
                      } ${selectedSlot === idx ? 'ring-2 ring-slate-900 ring-offset-2' : ''}`}
                      onClick={() => setSelectedSlot(idx)}
                    >
                        {item ? (
                          <>
                             {renderCardContent(item)}
                             {/* Remove Button Overlay */}
                             <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                <button 
                                  onClick={(e) => handleRemoveItem(e, idx)}
                                  className="p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600"
                                >
                                  <X size={12} />
                                </button>
                             </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer text-slate-300">
                               <Plus size={20} />
                               <span className="text-[10px] font-medium">Ajouter</span>
                          </div>
                        )}
                    </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Settings or Product Sidebar */}
      <div className="w-[450px] bg-white border-l border-slate-200 flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.02)] z-30 flex-shrink-0 transition-all duration-300">
        
        {/* === CASE 1: ADD PRODUCT MODE === */}
        {selectedSlot !== null ? (
          <div className="flex flex-col h-full animate-fade-in">
             {/* Header */}
             <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                <button 
                  onClick={() => setSelectedSlot(null)}
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 font-medium"
                >
                   <ArrowLeft size={16} /> Annuler
                </button>
                <span className="text-sm font-bold text-slate-900">Ajouter au slot {selectedSlot + 1}</span>
             </div>

             {/* STATIC TOP SECTION (Styles + Search) */}
             <div className="p-5 border-b border-slate-50 shrink-0">
                
                {/* 1. Style Selection */}
                <div className="space-y-3 mb-6">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Style de carte</label>
                   <div className="grid grid-cols-6 gap-2">
                      {CARD_STYLES.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setSelectionStyle(style.id)}
                          className={`aspect-square flex flex-col items-center justify-center rounded-lg border-2 transition-all p-1 ${
                            selectionStyle === style.id 
                              ? 'border-black bg-slate-50' 
                              : 'border-transparent hover:bg-slate-50'
                          }`}
                          title={style.name}
                        >
                           {renderStyleThumbnail(style.id, selectionStyle === style.id)}
                        </button>
                      ))}
                   </div>
                </div>

                {/* 2. Search */}
                <div className="space-y-3">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rechercher</label>
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Burger, Pizza, Vin..." 
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-black rounded-lg text-sm text-black focus:outline-none focus:ring-1 focus:ring-black"
                      />
                   </div>
                </div>
             </div>

             {/* FLEXIBLE BOTTOM SECTION (List) */}
             <div className="flex-1 flex flex-col min-h-0 bg-white">
                <div className="p-5 pb-2 sticky top-0 bg-white z-10">
                   <div className="flex items-center justify-between">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Liste des produits</label>
                       <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                          <button 
                             onClick={() => setProductDisplayMode('isolated')}
                             className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md transition-all ${productDisplayMode === 'isolated' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                             <Box size={10} /> Isolée
                          </button>
                          <button 
                             onClick={() => setProductDisplayMode('lifestyle')}
                             className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md transition-all ${productDisplayMode === 'lifestyle' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                             <ImageLucide size={10} /> Lifestyle
                          </button>
                       </div>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto px-5 pb-5 custom-scrollbar h-[280px]">
                   {isLoadingProducts ? (
                       <div className="flex items-center justify-center h-40">
                          <Loader2 size={24} className="animate-spin text-slate-300" />
                       </div>
                   ) : (
                       <div className="space-y-2">
                          {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).map((product) => {
                             // Determine thumbnail based on selected mode
                             let thumbUrl = null;
                             if (productDisplayMode === 'isolated') thumbUrl = product.image_isolee_url;
                             else if (productDisplayMode === 'lifestyle') thumbUrl = product.image_lifestyle_url;
                             
                             // Fallback
                             if (!thumbUrl) thumbUrl = product.image_isolee_url || product.image_lifestyle_url;

                             // Determine Prices for Blocks
                             let priceBlocks: { label: string, price: number }[] = [];
                             if (product.price) {
                                 priceBlocks.push({ label: '', price: product.price });
                             } else {
                                 if (product.price_petit) priceBlocks.push({ label: 'S', price: product.price_petit });
                                 if (product.price_moyen) priceBlocks.push({ label: 'M', price: product.price_moyen });
                                 if (product.price_grand) priceBlocks.push({ label: 'L', price: product.price_grand });
                             }

                             return (
                              <div 
                                key={product.id}
                                className="flex items-center gap-3 p-2 border border-slate-100 rounded-lg bg-white cursor-pointer hover:bg-slate-50 hover:border-slate-200 transition-colors"
                                onClick={() => handleAddItem(product.id, null, null)}
                                title="Ajouter avec tous les prix"
                              >
                                 <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-100 flex items-center justify-center text-slate-300">
                                     {thumbUrl ? (
                                        <img src={thumbUrl} className="w-full h-full object-cover" alt="" />
                                     ) : (
                                        <ImageLucide size={16} />
                                     )}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-slate-900 truncate">{product.name}</h4>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-wide">{product.category}</span>
                                 </div>
                                 
                                 {/* Price Blocks - Square Buttons */}
                                 <div className="flex gap-1.5">
                                    {priceBlocks.map((block, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddItem(product.id, block.price, block.label);
                                            }}
                                            className="w-10 h-10 flex flex-col items-center justify-center bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 hover:border-emerald-200 rounded-md text-emerald-700 transition-colors"
                                            title={block.label ? `Ajouter taille ${block.label}` : 'Ajouter'}
                                        >
                                            {block.label && <span className="text-[9px] leading-none opacity-80 mb-0.5">{block.label}</span>}
                                            <span className="text-xs font-bold leading-none">{block.price}€</span>
                                        </button>
                                    ))}
                                    {priceBlocks.length === 0 && (
                                        <span className="text-xs text-slate-300 italic px-2">-</span>
                                    )}
                                 </div>
                              </div>
                             );
                          })}
                          
                          {products.length === 0 && (
                            <div className="text-center py-10 text-slate-400 text-xs">
                               Aucun produit trouvé.
                            </div>
                          )}
                       </div>
                   )}
                </div>
             </div>
          </div>
        ) : (
          /* === CASE 2: CONFIGURATION MODE (Default) === */
          <>
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Configuration</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
              
              {/* General Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                    <Type size={16} /> <span>Contenu</span>
                </div>
                
                <div className="space-y-3 pl-2">
                    <div className="flex gap-3">
                      <div className="space-y-1 flex-[2]">
                        <label className="text-xs font-medium text-slate-500">Titre du Menu</label>
                        <input 
                          type="text" 
                          value={config.title}
                          onChange={(e) => handleConfigChange('title', e.target.value)}
                          className="w-full h-9 px-3 border border-black rounded-lg text-sm focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all text-black bg-white"
                        />
                      </div>

                      <div className="space-y-1 flex-1 min-w-[140px]">
                        <label className="text-xs font-medium text-slate-500">Format</label>
                        <select 
                          value={config.format}
                          onChange={(e) => handleConfigChange('format', e.target.value)}
                          className="w-full h-9 px-2 border border-black rounded-lg text-sm bg-white focus:outline-none text-black focus:border-black appearance-none cursor-pointer"
                        >
                          {Object.keys(FORMAT_SPECS).map(fmt => (
                              <option key={fmt} value={fmt}>{FORMAT_SPECS[fmt].label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Custom Dimensions Inputs */}
                    {config.format === 'Personalisé' && (
                      <div className="grid grid-cols-2 gap-3 animate-fade-in">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-500">Largeur (px)</label>
                          <input 
                            type="number" 
                            value={config.customWidth}
                            onChange={(e) => handleConfigChange('customWidth', parseInt(e.target.value) || 0)}
                            className="w-full h-9 px-3 border border-black rounded-lg text-sm focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all text-black bg-white"
                            placeholder="W"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-500">Hauteur (px)</label>
                          <input 
                            type="number" 
                            value={config.customHeight}
                            onChange={(e) => handleConfigChange('customHeight', parseInt(e.target.value) || 0)}
                            className="w-full h-9 px-3 border border-black rounded-lg text-sm focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition-all text-black bg-white"
                            placeholder="H"
                          />
                        </div>
                      </div>
                    )}
                </div>
              </section>

              {/* Merged Structure Section (Grid + Spacing) */}
              <section className="space-y-4 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                    <Grip size={16} /> <span>Structure</span>
                </div>
                
                <div className="space-y-4 pl-2">
                    {/* Row 1: Cols & Rows */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-slate-500">Colonnes ({config.cols})</label>
                          <input 
                            type="range" min="1" max="4"
                            value={config.cols}
                            onChange={(e) => handleConfigChange('cols', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-slate-500">Lignes ({config.rows})</label>
                          <input 
                            type="range" min="1" max="20"
                            value={config.rows}
                            onChange={(e) => handleConfigChange('rows', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                          />
                        </div>
                    </div>

                    {/* Row 2: Padding & Gap */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <label className="text-xs font-medium text-slate-500">Padding</label>
                            <span className="text-xs text-slate-400">{config.paddingH}px</span>
                          </div>
                          <input 
                            type="range" min="0" max="80"
                            value={config.paddingH}
                            onChange={(e) => {
                                handleConfigChange('paddingH', parseInt(e.target.value));
                                handleConfigChange('paddingV', parseInt(e.target.value));
                            }}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <label className="text-xs font-medium text-slate-500">Gap</label>
                            <span className="text-xs text-slate-400">{config.gap}px</span>
                          </div>
                          <input 
                            type="range" min="0" max="40"
                            value={config.gap}
                            onChange={(e) => handleConfigChange('gap', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                          />
                        </div>
                    </div>
                </div>
              </section>

              {/* Colors Section */}
              <section className="space-y-4 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                    <Palette size={16} /> <span>Apparence</span>
                </div>

                <div className="pl-2 space-y-4">
                    {/* Row 1: BG Gradient & Title */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-500 block">Arrière-plan (Dégradé)</label>
                          <div className="h-9 w-full rounded-lg border border-black p-1 flex items-center gap-2 bg-white">
                              
                              {/* Left Icon (Start Color) - Rectangle */}
                              <div className="relative group cursor-pointer">
                                  <div 
                                    className="w-8 h-6 rounded border border-slate-300 shadow-sm transition-all hover:border-slate-500"
                                    style={{ backgroundColor: config.gradientStart }}
                                  ></div>
                                  <input 
                                    type="color" 
                                    value={config.gradientStart}
                                    onChange={(e) => handleGradientChange('start', e.target.value)}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                  />
                              </div>

                              {/* Visual Gradient Bar */}
                              <div 
                                className="flex-1 h-3 rounded border border-slate-100"
                                style={{ background: `linear-gradient(to right, ${config.gradientStart}, ${config.gradientEnd})` }}
                              ></div>

                              {/* Right Icon (End Color) - Rectangle */}
                              <div className="relative group cursor-pointer">
                                  <div 
                                    className="w-8 h-6 rounded border border-slate-300 shadow-sm transition-all hover:border-slate-500"
                                    style={{ backgroundColor: config.gradientEnd }}
                                  ></div>
                                  <input 
                                    type="color" 
                                    value={config.gradientEnd}
                                    onChange={(e) => handleGradientChange('end', e.target.value)}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                  />
                              </div>

                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                              <label className="text-xs font-medium text-slate-500 block">Titres</label>
                              <button 
                                onClick={() => handleConfigChange('showTitle', !config.showTitle)}
                                className="text-slate-400 hover:text-slate-800 transition-colors"
                                title={config.showTitle ? "Masquer le titre" : "Afficher le titre"}
                              >
                                  {config.showTitle ? <Eye size={14} /> : <EyeOff size={14} />}
                              </button>
                          </div>
                          <div className="flex items-center gap-2 border border-black p-1.5 rounded-lg bg-white h-9">
                              <input 
                                type="color" 
                                value={config.colorTitle}
                                onChange={(e) => handleConfigChange('colorTitle', e.target.value)}
                                className="w-6 h-6 rounded border-none cursor-pointer p-0 bg-transparent"
                              />
                              <span className="text-xs font-mono text-black uppercase">{config.colorTitle}</span>
                          </div>
                        </div>
                    </div>

                    {/* Row 2: Product Name & Price */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-500 block">Nom du produit</label>
                          <div className="flex items-center gap-2 border border-black p-1.5 rounded-lg bg-white h-9">
                              <input 
                                type="color" 
                                value={config.colorProductName}
                                onChange={(e) => handleConfigChange('colorProductName', e.target.value)}
                                className="w-6 h-6 rounded border-none cursor-pointer p-0 bg-transparent"
                              />
                              <span className="text-xs font-mono text-black uppercase">{config.colorProductName}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-500 block">Prix</label>
                          <div className="flex items-center gap-2 border border-black p-1.5 rounded-lg bg-white h-9">
                              <input 
                                type="color" 
                                value={config.colorPrice}
                                onChange={(e) => handleConfigChange('colorPrice', e.target.value)}
                                className="w-6 h-6 rounded border-none cursor-pointer p-0 bg-transparent"
                              />
                              <span className="text-xs font-mono text-black uppercase">{config.colorPrice}</span>
                          </div>
                        </div>
                    </div>
                </div>
              </section>

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MediaEditor;
