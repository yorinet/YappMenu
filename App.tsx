import React, { useState } from 'react';
import Header from './components/Header';
import Home from './views/Home';
import Products from './views/Products';
import Menus from './views/Menus';
import MediaEditor from './views/MediaEditor';
import ProductEditor from './views/ProductEditor';
import MediaLibrary from './views/MediaLibrary';
import Profile from './views/Profile';
import Login from './views/Login';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('login');
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const handleLogin = () => {
    setCurrentView('home');
  };

  const handleNavigate = (view: ViewState) => {
    // If navigating to product-editor manually (not via edit button), reset ID
    if (view === 'product-editor') {
      setEditingProductId(null);
    }
    setCurrentView(view);
  };

  const handleEditProduct = (id: number) => {
    setEditingProductId(id);
    setCurrentView('product-editor');
  };

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return <Login onLogin={handleLogin} />;
      case 'home':
        return <Home />;
      case 'products':
        return <Products onNavigate={handleNavigate} onEditProduct={handleEditProduct} />;
      case 'menus':
        return <Menus onNavigate={handleNavigate} />;
      case 'media':
        return <MediaLibrary />;
      case 'menu-editor':
        return <MediaEditor onNavigate={handleNavigate} />;
      case 'product-editor':
        return <ProductEditor onNavigate={handleNavigate} productId={editingProductId} />;
      case 'profile':
        return <Profile />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-100 selection:text-brand-900 flex flex-col">
      {currentView !== 'login' && (
        <Header currentView={currentView} onNavigate={handleNavigate} />
      )}
      <main className="flex-1 animate-fade-in flex flex-col">
        {renderView()}
      </main>
    </div>
  );
};

export default App;