
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Save, Upload, Image as ImageIcon, DollarSign, Tag, Type, FileText, Wand2, Box, Layers, Trash2, Plus, CircleDot, CheckCircle2, Loader2, Utensils, Coffee, IceCream, Pizza, Wine, Beer, Sandwich, Soup, Salad, Cake, Croissant, Drumstick, Scaling } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { ViewState } from '../types';
import { supabase } from '../supabaseClient';

interface ProductEditorProps {
  onNavigate: (view: ViewState) => void;
  productId?: number | null;
}

const ICONS_LIST = [
  { id: 'pizza', icon: <Pizza size={18} />, label: 'Pizza' },
  { id: 'burger', icon: <Utensils size={18} />, label: 'Plat' },
  { id: 'drink', icon: <Coffee size={18} />, label: 'Café' },
  { id: 'icecream', icon: <IceCream size={18} />, label: 'Glace' },
  { id: 'wine', icon: <Wine size={18} />, label: 'Vin' },
  { id: 'beer', icon: <Beer size={18} />, label: 'Bière' },
  { id: 'sandwich', icon: <Sandwich size={18} />, label: 'Snack' },
  { id: 'soup', icon: <Soup size={18} />, label: 'Soupe' },
  { id: 'salad', icon: <Salad size={18} />, label: 'Salade' },
  { id: 'cake', icon: <Cake size={18} />, label: 'Gâteau' },
  { id: 'croissant', icon: <Croissant size={18} />, label: 'Viennoiserie' },
  { id: 'meat', icon: <Drumstick size={18} />, label: 'Viande' },
];

interface Category {
    id: string;
    name: string;
    count: number;
    iconId: string;
}

const ProductEditor: React.FC<ProductEditorProps> = ({ onNavigate, productId }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'categories'>('details');
  const [pricingMode, setPricingMode] = useState<'simple' | 'sizes'>('simple');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFetchingProduct, setIsFetchingProduct] = useState(false);
  
  const [formData, setFormData] = useState({
    name: 'Nouveau Produit',
    active: true,
    price: '12.50',
    priceSmall: '',
    priceMedium: '',
    priceLarge: '',
    category: '',
    description: 'Une délicieuse pizza artisanale avec une pâte fine, sauce tomate fraîche et mozzarella di bufala.',
    imageUrl: '',
    prompt: ''
  });

  // State for Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const [newCategory, setNewCategory] = useState('');
  const [selectedIconId, setSelectedIconId] = useState<string>('burger');

  const [generationType, setGenerationType] = useState<'isolated' | 'lifestyle'>('isolated');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<{ isolated: string | null, lifestyle: string | null }>({
    isolated: null,
    lifestyle: null
  });

  // Fetch Categories on Mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch Product Data if productId exists (Edit Mode)
  useEffect(() => {
    if (productId) {
      fetchProductDetails(productId);
    }
  }, [productId]);

  const fetchProductDetails = async (id: number) => {
    setIsFetchingProduct(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
      } else if (data) {
        // Populate form data
        setFormData({
            name: data.name,
            active: data.active !== undefined ? data.active : true,
            price: data.price ? data.price.toString() : '',
            priceSmall: data.price_petit ? data.price_petit.toString() : '',
            priceMedium: data.price_moyen ? data.price_moyen.toString() : '',
            priceLarge: data.price_grand ? data.price_grand.toString() : '',
            category: data.category || '',
            description: data.description || '',
            imageUrl: data.image_isolee_url || data.image_lifestyle_url || '',
            prompt: ''
        });

        // Set Images
        setGeneratedImages({
            isolated: data.image_isolee_url,
            lifestyle: data.image_lifestyle_url
        });

        // Set Pricing Mode
        if (data.price_petit || data.price_moyen || data.price_grand) {
            setPricingMode('sizes');
        } else {
            setPricingMode('simple');
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setIsFetchingProduct(false);
    }
  };

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching categories:', error);
        } else if (data) {
            const formattedCategories: Category[] = data.map((cat: any) => ({
                id: cat.id.toString(),
                name: cat.name,
                count: 0,
                iconId: cat.icon_id
            }));
            setCategories(formattedCategories);
            
            // Set default category in form if empty and categories exist AND we are not in edit mode (fetching product handles its own category setting)
            if (formattedCategories.length > 0 && !formData.category && !productId) {
                setFormData(prev => ({ ...prev, category: formattedCategories[0].name }));
            }
        }
    } catch (err) {
        console.error('Unexpected error fetching categories:', err);
    } finally {
        setIsLoadingCategories(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!formData.imageUrl) {
      alert("Veuillez d'abord uploader une image manuellement.");
      return;
    }

    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      let systemPrompt = "";
      if (generationType === 'isolated') {
        systemPrompt = "Create a high-quality square (1:1) isolated product image. Keep the product exactly as is. Center it with no distractions. Use studio lighting to enhance textures and colors. Background transparent or white with subtle shadow. No props, reflections, or noise.";
      } else {
        systemPrompt = "Create a high-quality lifestyle image of the product in a realistic restaurant setting. Do not change, alter, or modify the product in any way — keep it exactly as is. Use a clean, modern table with natural warm lighting, highlighting textures and freshness. Shallow depth of field with soft background blur. Evoke a premium restaurant mood with subtle décor. No extra props or unrealistic effects — focus on authenticity and appetizing presentation.";
      }

      const finalPrompt = `${systemPrompt} ${formData.prompt ? `Additional details: ${formData.prompt}` : ''}`;

      const base64Data = formData.imageUrl.split(',')[1];
      const mimeType = formData.imageUrl.split(';')[0].split(':')[1] || 'image/png';

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { mimeType, data: base64Data } },
            { text: finalPrompt }
          ],
        },
      });

      let generatedUrl = null;
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                generatedUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                break;
            }
        }
      }

      if (generatedUrl) {
        setGeneratedImages(prev => ({
            ...prev,
            [generationType]: generatedUrl
        }));
      } else {
        console.warn("No image generated in response");
      }

    } catch (error) {
      console.error("Generation failed:", error);
      alert("Erreur lors de la génération. Veuillez vérifier votre API Key ou réessayer.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToSupabase = async () => {
    setIsSaving(true);
    try {
        const payload: any = {
            name: formData.name,
            active: formData.active,
            description: formData.description,
            category: formData.category,
            image_isolee_url: generatedImages.isolated,
            image_lifestyle_url: generatedImages.lifestyle,
        };

        // Handle Pricing Logic
        if (pricingMode === 'simple') {
            payload.price = parseFloat(formData.price) || 0;
            payload.price_petit = null;
            payload.price_moyen = null;
            payload.price_grand = null;
        } else {
            // If sizes, main price can be null or 0, or base price (e.g. Small)
            payload.price = null; 
            payload.price_petit = parseFloat(formData.priceSmall) || null;
            payload.price_moyen = parseFloat(formData.priceMedium) || null;
            payload.price_grand = parseFloat(formData.priceLarge) || null;
        }

        let error;
        
        if (productId) {
            // UPDATE
            const response = await supabase
                .from('products')
                .update(payload)
                .eq('id', productId)
                .select();
            error = response.error;
        } else {
            // INSERT
            const response = await supabase
                .from('products')
                .insert([payload])
                .select();
            error = response.error;
        }

        if (error) {
            console.error('Supabase Error:', error);
            alert('Erreur lors de l\'enregistrement: ' + error.message);
        } else {
            alert('Produit enregistré avec succès !');
            onNavigate('products');
        }
    } catch (err) {
        console.error('Unexpected Error:', err);
        alert('Une erreur inattendue est survenue.');
    } finally {
        setIsSaving(false);
    }
  };

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      try {
        const { data, error } = await supabase
            .from('categories')
            .insert([
                { name: newCategory, icon_id: selectedIconId }
            ])
            .select();

        if (error) {
            console.error('Error adding category:', error);
            alert('Erreur lors de l\'ajout de la catégorie');
        } else if (data) {
            const newCat: Category = {
                id: data[0].id.toString(),
                name: data[0].name,
                count: 0,
                iconId: data[0].icon_id
            };
            setCategories([...categories, newCat]);
            setNewCategory('');
            
            // Auto-select
            handleChange('category', newCat.name);
        }
      } catch (err) {
        console.error('Unexpected error adding category:', err);
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting category:', error);
                alert('Erreur lors de la suppression');
            } else {
                setCategories(categories.filter(c => c.id !== id));
                // Reset selected category if needed
                const deletedCat = categories.find(c => c.id === id);
                if (deletedCat && formData.category === deletedCat.name) {
                    handleChange('category', categories.length > 1 ? categories[0].name : '');
                }
            }
        } catch (err) {
            console.error('Unexpected error deleting category:', err);
        }
    }
  };

  const getCategoryIcon = (iconId: string) => {
    const iconObj = ICONS_LIST.find(i => i.id === iconId);
    return iconObj ? iconObj.icon : <Utensils size={16} />;
  };

  const getPriceDisplay = () => {
    if (pricingMode === 'sizes') {
        const prices = [formData.priceSmall, formData.priceMedium, formData.priceLarge].filter(p => p && parseFloat(p) > 0);
        if (prices.length > 0) {
            const minPrice = Math.min(...prices.map(p => parseFloat(p)));
            return `dès ${minPrice}€`;
        }
        return '- €';
    }
    return `${formData.price}€`;
  };

  const renderPreviewCard = () => {
    const commonImgClass = "w-full h-full object-contain bg-slate-100";
    const placeholder = (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
        <ImageIcon size={48} strokeWidth={1} />
      </div>
    );
    // Prioritize generated/uploaded image url from formData/state
    const displayUrl = generatedImages.isolated || generatedImages.lifestyle || formData.imageUrl;
    const imgContent = displayUrl ? <img src={displayUrl} className={commonImgClass} alt="Product" /> : placeholder;
    const displayedPrice = getPriceDisplay();

    // Default Layout (White Clean style)
    return (
        <div className="w-full h-full flex flex-col bg-white shadow-sm rounded-xl overflow-hidden">
        <div className="aspect-square w-full relative shrink-0 bg-slate-50">
            {imgContent}
            <span className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm text-sm font-bold text-slate-900 border border-slate-100">
                {displayedPrice}
            </span>
        </div>
        <div className="flex-1 p-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{formData.category || 'CATEGORIE'}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2 truncate">{formData.name}</h1>
            <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{formData.description}</p>
        </div>
        </div>
    );
  };

  if (isFetchingProduct) {
      return (
          <div className="flex items-center justify-center h-screen bg-slate-50">
              <Loader2 size={40} className="animate-spin text-slate-400" />
          </div>
      );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-slate-50">
      
      {/* Editor specific Header */}
      <div className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0">
         <button 
           onClick={() => onNavigate('products')}
           className="flex items-center text-slate-500 hover:text-slate-900 transition-colors gap-2 text-sm font-medium"
         >
           <ArrowLeft size={18} /> 
           <span>Retour aux produits</span>
         </button>
         
         <div className="flex items-center gap-4">
             <span className="text-xs text-slate-400 hidden sm:inline-block">Modifications non enregistrées</span>
             <button 
               onClick={handleSaveToSupabase}
               disabled={isSaving}
               className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
               {isSaving ? 'Enregistrement...' : (productId ? 'Mettre à jour' : 'Enregistrer')}
             </button>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* MIDDLE COLUMN: Live Preview */}
        <div className="flex-1 flex flex-col overflow-hidden relative bg-slate-100">
           
           {/* Preview Area */}
           <div className="flex-1 flex items-center justify-center p-8 overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-70"></div>
              
              <div className="flex flex-col items-center gap-6 z-10 w-full max-w-sm">
                 <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Aperçu en direct</span>
                 
                 {/* Dynamic Card Preview */}
                 <div className={`w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform hover:scale-[1.02] transition-transform duration-500`}>
                    {renderPreviewCard()}
                 </div>
              </div>
           </div>
        </div>

        {/* RIGHT: Form Sidebar */}
        <div className="w-[450px] bg-white border-l border-slate-200 flex flex-col z-20 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] overflow-y-auto">
          <div className="p-8 space-y-8">
             {/* Sidebar Header with Toggle */}
             <div className="flex items-start justify-between">
               <div>
                 <h2 className="text-xl font-bold text-slate-900 mb-1">
                    {activeTab === 'details' ? 'Détails du produit' : 'Catégories'}
                 </h2>
                 <p className="text-slate-400 text-xs">
                    {activeTab === 'details' ? 'Configurez les informations et générez du contenu.' : 'Gérez les catégories de votre catalogue.'}
                 </p>
               </div>
               <button 
                  onClick={() => setActiveTab(activeTab === 'details' ? 'categories' : 'details')}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors border border-transparent hover:border-slate-200"
                  title={activeTab === 'details' ? 'Gérer les catégories' : 'Retour aux détails'}
               >
                  {activeTab === 'details' ? <Layers size={20} /> : <Box size={20} />}
               </button>
             </div>

             {activeTab === 'details' ? (
                 /* DETAILS TAB CONTENT */
                 <>
                     {/* Image & AI Section */}
                     <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                           <ImageIcon size={16} className="text-purple-600" /> Image & Création
                        </label>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-400 transition-all">
                            
                            {/* Top Row: Manual Upload + Thumbnails */}
                            <div className="flex gap-2 mb-3 h-14">
                                {/* Manual Upload Block */}
                                <div 
                                  onClick={() => fileInputRef.current?.click()}
                                  className="flex-1 border border-dashed border-slate-300 rounded-lg px-2 flex items-center gap-2 bg-white hover:bg-slate-50 cursor-pointer transition-colors group relative"
                                >
                                   <input 
                                     type="file" 
                                     ref={fileInputRef} 
                                     onChange={handleImageUpload} 
                                     className="hidden" 
                                     accept="image/*"
                                   />
                                   <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center text-slate-400 group-hover:text-slate-600 shrink-0 overflow-hidden relative">
                                      {formData.imageUrl && !generatedImages.isolated && !generatedImages.lifestyle ? (
                                        <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Uploaded" />
                                      ) : (
                                        <Upload size={16} />
                                      )}
                                   </div>
                                   <div className="flex-1 min-w-0">
                                      <span className="text-xs font-semibold text-slate-900 block truncate">Upload Manuel</span>
                                      <span className="text-[10px] text-slate-400 block truncate">JPG, PNG</span>
                                   </div>
                                </div>

                                {/* Thumbnail: Isolated */}
                                <div 
                                  onClick={() => {
                                    setGenerationType('isolated');
                                    if (generatedImages.isolated) handleChange('imageUrl', generatedImages.isolated);
                                  }}
                                  className={`w-14 h-full bg-white rounded-lg border ${generationType === 'isolated' ? 'border-purple-600 ring-1 ring-purple-600' : 'border-slate-200 hover:border-black'} flex flex-col items-center justify-center cursor-pointer transition-all group relative overflow-hidden`}
                                >
                                     {generatedImages.isolated ? (
                                       <>
                                         <img src={generatedImages.isolated} className="absolute inset-0 w-full h-full object-cover" alt="Isolated" />
                                         <div className="absolute inset-0 bg-black/10"></div>
                                         <CheckCircle2 size={12} className="absolute bottom-1 right-1 text-white z-10" />
                                       </>
                                     ) : (
                                       <div className="z-10 flex flex-col items-center gap-1">
                                          <Box size={16} className={generationType === 'isolated' ? 'text-purple-600' : 'text-slate-400'} />
                                          <span className={`text-[9px] font-medium ${generationType === 'isolated' ? 'text-purple-700' : 'text-slate-500'}`}>Isolée</span>
                                       </div>
                                     )}
                                </div>

                                 {/* Thumbnail: Lifestyle */}
                                <div 
                                  onClick={() => {
                                    setGenerationType('lifestyle');
                                    if (generatedImages.lifestyle) handleChange('imageUrl', generatedImages.lifestyle);
                                  }}
                                  className={`w-14 h-full bg-white rounded-lg border ${generationType === 'lifestyle' ? 'border-purple-600 ring-1 ring-purple-600' : 'border-slate-200 hover:border-black'} flex flex-col items-center justify-center cursor-pointer transition-all group relative overflow-hidden`}
                                >
                                     {generatedImages.lifestyle ? (
                                       <>
                                         <img src={generatedImages.lifestyle} className="absolute inset-0 w-full h-full object-cover" alt="Lifestyle" />
                                         <div className="absolute inset-0 bg-black/10"></div>
                                         <CheckCircle2 size={12} className="absolute bottom-1 right-1 text-white z-10" />
                                       </>
                                     ) : (
                                       <div className="z-10 flex flex-col items-center gap-1">
                                          <ImageIcon size={16} className={generationType === 'lifestyle' ? 'text-purple-600' : 'text-slate-400'} />
                                          <span className={`text-[9px] font-medium ${generationType === 'lifestyle' ? 'text-purple-700' : 'text-slate-500'}`}>Lifestyle</span>
                                       </div>
                                     )}
                                </div>
                            </div>

                            {/* AI Prompt */}
                            <textarea 
                                className="w-full bg-white rounded-lg border border-black focus:ring-0 text-sm p-3 min-h-[80px] text-black placeholder:text-slate-400 resize-none mb-2 focus:outline-none focus:border-black"
                                placeholder="Décrivez votre plat pour générer une image..."
                                value={formData.prompt}
                                onChange={(e) => handleChange('prompt', e.target.value)}
                            />
                            
                            {/* Generation Controls */}
                            <div className="flex items-center justify-end px-1">
                                <button 
                                  onClick={handleGenerate}
                                  disabled={isGenerating || !formData.imageUrl}
                                  className={`w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                   {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />} 
                                   {isGenerating ? 'Génération...' : 'Générer'}
                                </button>
                            </div>
                        </div>
                     </div>

                     <hr className="border-slate-100" />

                     {/* Manual Form Fields */}
                     <div className="space-y-5">
                        
                        {/* Name Input & Active Toggle */}
                        <div className="flex items-center gap-4">
                            <div className="space-y-1.5 flex-1">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Type size={14} /> Nom du produit
                                </label>
                                <input 
                                type="text" 
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-black rounded-lg text-black text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all placeholder:text-slate-300"
                                placeholder="Ex: Burger Signature"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    Statut
                                </label>
                                <div className="flex items-center gap-2 h-[42px]">
                                    <button 
                                        onClick={() => handleChange('active', !formData.active)}
                                        className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center ${formData.active ? 'bg-slate-900' : 'bg-slate-300'}`}
                                        title={formData.active ? 'Désactiver le produit' : 'Activer le produit'}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${formData.active ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                    <span className="text-xs font-bold text-slate-500 w-12">{formData.active ? 'Actif' : 'Inactif'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Price Section with Toggles */}
                        <div className="space-y-2">
                           <div className="flex items-center justify-between">
                               <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <DollarSign size={14} /> Prix & Tarifs
                                </label>
                                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                                   <button 
                                      onClick={() => setPricingMode('simple')}
                                      className={`flex items-center gap-1 px-3 py-1 text-[10px] font-medium rounded-md transition-all ${pricingMode === 'simple' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                                   >
                                      <CircleDot size={12} /> Unique
                                   </button>
                                   <button 
                                      onClick={() => setPricingMode('sizes')}
                                      className={`flex items-center gap-1 px-3 py-1 text-[10px] font-medium rounded-md transition-all ${pricingMode === 'sizes' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                                   >
                                      <Scaling size={12} /> Par Taille
                                   </button>
                                </div>
                           </div>
                           
                           {pricingMode === 'simple' ? (
                               <div className="relative">
                                    <input 
                                    type="number" 
                                    value={formData.price}
                                    onChange={(e) => handleChange('price', e.target.value)}
                                    className="w-full pl-3 pr-8 py-2.5 bg-white border border-black rounded-lg text-black text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all font-mono placeholder:text-slate-300"
                                    placeholder="0.00"
                                    />
                                    <span className="absolute right-3 top-2.5 text-slate-400 text-sm">€</span>
                                </div>
                           ) : (
                               <div className="grid grid-cols-3 gap-2">
                                  <div className="space-y-1">
                                     <label className="text-[10px] font-bold text-slate-500 uppercase">Petit</label>
                                     <div className="relative">
                                        <input 
                                            type="number" 
                                            value={formData.priceSmall}
                                            onChange={(e) => handleChange('priceSmall', e.target.value)}
                                            className="w-full px-2 py-2 bg-white border border-black rounded-lg text-black text-sm focus:outline-none focus:border-black font-mono"
                                            placeholder="-"
                                        />
                                        <span className="absolute right-2 top-2 text-slate-400 text-xs">€</span>
                                     </div>
                                  </div>
                                  <div className="space-y-1">
                                     <label className="text-[10px] font-bold text-slate-500 uppercase">Moyen</label>
                                     <div className="relative">
                                        <input 
                                            type="number" 
                                            value={formData.priceMedium}
                                            onChange={(e) => handleChange('priceMedium', e.target.value)}
                                            className="w-full px-2 py-2 bg-white border border-black rounded-lg text-black text-sm focus:outline-none focus:border-black font-mono"
                                            placeholder="-"
                                        />
                                        <span className="absolute right-2 top-2 text-slate-400 text-xs">€</span>
                                     </div>
                                  </div>
                                  <div className="space-y-1">
                                     <label className="text-[10px] font-bold text-slate-500 uppercase">Grand</label>
                                     <div className="relative">
                                        <input 
                                            type="number" 
                                            value={formData.priceLarge}
                                            onChange={(e) => handleChange('priceLarge', e.target.value)}
                                            className="w-full px-2 py-2 bg-white border border-black rounded-lg text-black text-sm focus:outline-none focus:border-black font-mono"
                                            placeholder="-"
                                        />
                                        <span className="absolute right-2 top-2 text-slate-400 text-xs">€</span>
                                     </div>
                                  </div>
                               </div>
                           )}
                        </div>

                        {/* Category Row */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Tag size={14} /> Catégorie
                            </label>
                            <select 
                                value={formData.category}
                                onChange={(e) => handleChange('category', e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-black rounded-lg text-black text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Choisir...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                             <FileText size={14} /> Description
                          </label>
                          <textarea 
                            rows={4}
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border border-black rounded-lg text-black text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all resize-none placeholder:text-slate-300"
                            placeholder="Détails du produit..."
                          />
                        </div>
                     </div>
                 </>
             ) : (
                 /* CATEGORIES TAB CONTENT */
                 <div className="space-y-6 animate-fade-in">
                    
                    {/* Add Category Form */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                       <h3 className="text-sm font-bold text-slate-900">Ajouter une catégorie</h3>
                       
                       <div className="space-y-4">
                          {/* Name Input */}
                          <div className="space-y-1.5">
                              <label className="text-xs font-medium text-slate-500 block">Nom de la catégorie</label>
                              <input 
                                type="text" 
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-black rounded-lg text-black text-sm focus:outline-none focus:border-black placeholder:text-slate-300"
                                placeholder="Ex: Vins Rouges"
                              />
                          </div>

                          {/* Icon Selector Grid */}
                          <div className="space-y-2">
                             <label className="text-xs font-medium text-slate-500 block">Choisir une icône</label>
                             <div className="grid grid-cols-6 gap-2">
                                {ICONS_LIST.map((item) => (
                                  <button
                                    key={item.id}
                                    onClick={() => setSelectedIconId(item.id)}
                                    className={`aspect-square flex items-center justify-center rounded-lg border transition-all ${
                                      selectedIconId === item.id 
                                        ? 'bg-slate-900 text-white border-slate-900' 
                                        : 'bg-white border-slate-200 text-slate-400 hover:border-black hover:text-black'
                                    }`}
                                    title={item.label}
                                  >
                                    {item.icon as React.ReactElement}
                                  </button>
                                ))}
                             </div>
                          </div>
                          
                          <button 
                            onClick={handleAddCategory}
                            disabled={!newCategory.trim()}
                            className="w-full py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus size={16} /> Ajouter
                          </button>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                           Catégories existantes
                           <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{categories.length}</span>
                       </h3>
                       
                       {isLoadingCategories ? (
                         <div className="flex justify-center p-4">
                            <Loader2 size={24} className="animate-spin text-slate-400" />
                         </div>
                       ) : (
                         <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                            {categories.map((cat) => (
                               <div key={cat.id} className="group flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-black transition-all">
                                  <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 bg-slate-100 rounded-md border border-slate-200 flex items-center justify-center overflow-hidden text-slate-600">
                                        {getCategoryIcon(cat.iconId)}
                                     </div>
                                     <div>
                                        <p className="text-sm font-semibold text-black">{cat.name}</p>
                                        <p className="text-[10px] text-slate-500">{cat.count} produits</p>
                                     </div>
                                  </div>
                                  <button 
                                    onClick={() => handleDeleteCategory(cat.id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                     <Trash2 size={16} />
                                  </button>
                               </div>
                            ))}
                         </div>
                       )}
                    </div>

                 </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductEditor;
