
import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Calendar } from 'lucide-react';
import { MenuTemplate, ViewState } from '../types';

const MOCK_MENUS: MenuTemplate[] = [
  { id: '1', name: 'Carte des Vins', style: 'List', format: 'A4', lastModified: '2023-10-01' },
  { id: '2', name: 'Menu Déjeuner', style: 'List', format: 'A4', lastModified: '2023-10-02' },
  { id: '3', name: 'Menu Dîner', style: 'List', format: 'A4', lastModified: '2023-10-03' },
  { id: '4', name: 'Desserts & Cafés', style: 'List', format: 'A4', lastModified: '2023-10-04' },
  { id: '5', name: 'Spécialités', style: 'Grid', format: 'A4', lastModified: '2023-10-05' },
];

interface MenusProps {
  onNavigate: (view: ViewState) => void;
}

const Menus: React.FC<MenusProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 animate-slide-up">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Vos Menus</h2>
          <p className="text-slate-500 mt-1">Créez, éditez et organisez vos cartes</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un menu..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-black rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all shadow-sm placeholder:text-slate-400 text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Grid: 1 col mobile, 3 cols tablet (md), 4 cols desktop (lg) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        
        {/* Add New Menu Card (Position 1) */}
        <div 
            onClick={() => onNavigate('menu-editor')}
            className="flex flex-col aspect-[4/5] bg-white rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-50 cursor-pointer transition-all items-center justify-center group"
        >
            <div className="w-14 h-14 rounded-full bg-slate-50 group-hover:bg-white border border-slate-200 flex items-center justify-center mb-4 transition-colors">
                <Plus size={28} className="text-slate-400 group-hover:text-slate-600" />
            </div>
            <span className="font-medium text-slate-500 group-hover:text-slate-700">Ajouter un menu</span>
        </div>

        {/* Menu Items */}
        {MOCK_MENUS.map((menu) => (
          <div key={menu.id} className="relative group bg-white rounded-xl border border-slate-200 flex flex-col hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden">
            
            {/* Preview Area (Blue Wireframe Theme) */}
            <div className="bg-blue-50 p-6 flex justify-center items-center border-b border-slate-100 aspect-[4/5] relative">
              
              {/* Action Overlay (Hover) - Matches Products Page Style */}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                  onClick={() => onNavigate('menu-editor')}
                  className="p-2 bg-white/90 backdrop-blur rounded-full shadow-sm hover:bg-white text-slate-700 hover:text-blue-600 transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button className="p-2 bg-white/90 backdrop-blur rounded-full shadow-sm hover:bg-white text-slate-700 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Wireframe Content */}
              <div 
                onClick={() => onNavigate('menu-editor')}
                className="w-full h-full bg-white shadow-sm border border-blue-200 rounded flex flex-col p-3 gap-2 transform group-hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
              >
                 <div className="h-2 w-1/2 bg-blue-100 rounded-sm mb-2 mx-auto"></div>
                 
                 {menu.style === 'List' ? (
                   <div className="space-y-2 mt-1">
                       {[1, 2, 3].map((i) => (
                         <div key={i} className="flex gap-2">
                            <div className="w-6 h-6 bg-blue-50 border border-blue-100 rounded flex-shrink-0"></div>
                            <div className="flex-1 space-y-1 py-1">
                               <div className="h-1.5 w-full bg-blue-50/80 rounded-sm"></div>
                               <div className="h-1.5 w-1/3 bg-blue-50/50 rounded-sm"></div>
                            </div>
                         </div>
                       ))}
                   </div>
                 ) : (
                   <div className="grid grid-cols-2 gap-2 mt-1">
                     {[1, 2, 3, 4].map((i) => (
                       <div key={i} className="aspect-square bg-blue-50 border border-blue-100 rounded flex items-center justify-center">
                          <div className="w-1/2 h-1/2 rounded-full border border-blue-200/50"></div>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            </div>

            {/* Footer Info */}
            <div className="p-4 bg-white">
              <div className="flex justify-between items-start mb-2">
                <div>
                   <h3 className="font-bold text-slate-800 text-sm">{menu.name}</h3>
                   <div className="flex items-center gap-2 mt-1">
                     <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">{menu.format}</span>
                   </div>
                </div>
              </div>

              <div className="flex items-center text-[10px] text-slate-400 gap-1 pt-3 mt-1 border-t border-slate-50">
                <Calendar size={12} />
                <span>Modifié le {menu.lastModified}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menus;
