import React from 'react';
import { User, Menu as MenuIcon } from 'lucide-react';
import { ViewState } from '../types';

interface HeaderProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  const navItemClass = (view: ViewState) =>
    `px-4 py-2 text-sm font-medium transition-all rounded-full ${
      currentView === view
        ? 'bg-slate-900 text-white shadow-md'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        
        {/* Logo Area */}
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => onNavigate('home')}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow">
            <span className="font-bold text-lg">Y</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">YAPPMENU</span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-1 bg-white border border-slate-100 p-1 rounded-full shadow-sm">
          <button onClick={() => onNavigate('products')} className={navItemClass('products')}>
            Produits
          </button>
          <button onClick={() => onNavigate('menus')} className={navItemClass('menus')}>
            Menus
          </button>
          <button onClick={() => onNavigate('media')} className={navItemClass('media')}>
            Media
          </button>
        </nav>

        {/* User Area */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end mr-2">
             <span className="text-sm font-medium text-slate-900">Admin User</span>
             <span className="text-xs text-slate-500">Pro Plan</span>
          </div>
          <button 
            onClick={() => onNavigate('profile')}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${
              currentView === 'profile' 
                ? 'bg-slate-900 text-white border-slate-900' 
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;