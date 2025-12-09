import React from 'react';
import { Image, Film } from 'lucide-react';

const MediaLibrary: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 h-[calc(100vh-4rem)] bg-slate-50">
       <div className="text-center space-y-4 animate-fade-in">
          <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border border-slate-200 flex items-center justify-center mx-auto text-slate-300">
              <Image size={48} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Media</h1>
          <p className="text-slate-500 font-medium">Bibliothèque de ressources</p>
       </div>
    </div>
  );
};

export default MediaLibrary;