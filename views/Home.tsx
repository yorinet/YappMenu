import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 max-w-7xl mx-auto w-full h-[calc(100vh-4rem)]">
      
      {/* Hero Section */}
      <div className="text-center max-w-3xl animate-slide-up">
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
          Bienvenue sur <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500">YAPPMENU</span>
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed">
          Gérez vos produits, créez des menus élégants et exportez vos designs en quelques clics.
          L'outil moderne pour les restaurateurs exigeants.
        </p>
      </div>

    </div>
  );
};

export default Home;