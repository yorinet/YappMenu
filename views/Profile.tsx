
import React, { useState } from 'react';
import { User, Mail, CreditCard, LogOut, Lock, Key, Building2, Phone, MapPin, Facebook, Instagram, Video, MessageCircle, Map } from 'lucide-react';

const Profile: React.FC = () => {
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [licenseKey, setLicenseKey] = useState('PRO-2023-XXXX-YYYY');
  
  const [businessInfo, setBusinessInfo] = useState({
    companyName: 'Mon Restaurant Gourmet',
    email: 'contact@gourmet.com',
    phone: '+33 1 23 45 67 89',
    whatsapp: '+33 6 12 34 56 78',
    facebook: '',
    instagram: '',
    tiktok: '',
    address: '12 Avenue de la République, 75011 Paris',
    lat: '48.866',
    lng: '2.378'
  });

  const handleInfoChange = (key: string, value: string) => {
    setBusinessInfo(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full animate-slide-up">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Mon Profil</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Summary */}
        <div className="col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center text-center shadow-sm sticky top-24">
             <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4 border border-slate-200">
                <User size={48} />
             </div>
             <h2 className="text-xl font-bold text-slate-900">{businessInfo.companyName || 'Admin User'}</h2>
             <p className="text-slate-500 text-sm mb-4">{businessInfo.email}</p>
             <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
               Pro Plan
             </span>
             
             <div className="w-full border-t border-slate-100 mt-6 pt-6 space-y-3">
                 <button className="flex items-center gap-2 px-5 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-red-100 w-full justify-center">
                   <LogOut size={16} /> Déconnexion
                 </button>
             </div>
          </div>
        </div>

        {/* Right Column: Details & Settings */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          
          {/* Business Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building2 size={20} className="text-slate-400" /> Informations de l'entreprise
                </h3>
                <button className="text-xs font-medium text-slate-500 hover:text-slate-900 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors">
                  Sauvegarder
                </button>
             </div>
             
             <div className="space-y-4">
                {/* Company Name */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">Nom de l'entreprise</label>
                    <input 
                      type="text" 
                      value={businessInfo.companyName} 
                      onChange={(e) => handleInfoChange('companyName', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-black rounded-lg text-black text-sm outline-none focus:ring-1 focus:ring-black"
                    />
                </div>

                {/* Contact Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                       <Mail size={12} /> Email
                    </label>
                    <input 
                      type="email" 
                      value={businessInfo.email} 
                      onChange={(e) => handleInfoChange('email', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-black rounded-lg text-black text-sm outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                       <Phone size={12} /> Téléphone
                    </label>
                    <input 
                      type="tel" 
                      value={businessInfo.phone} 
                      onChange={(e) => handleInfoChange('phone', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-black rounded-lg text-black text-sm outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>

                {/* WhatsApp & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                       <MessageCircle size={12} /> WhatsApp
                    </label>
                    <input 
                      type="tel" 
                      value={businessInfo.whatsapp} 
                      onChange={(e) => handleInfoChange('whatsapp', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-black rounded-lg text-black text-sm outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                       <MapPin size={12} /> Adresse
                    </label>
                    <input 
                      type="text" 
                      value={businessInfo.address} 
                      onChange={(e) => handleInfoChange('address', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-black rounded-lg text-black text-sm outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>

                {/* Social Media */}
                <div className="border-t border-slate-100 pt-4 mt-2">
                   <label className="text-xs font-bold text-slate-500 mb-3 block">Réseaux Sociaux</label>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                         <div className="relative">
                            <Facebook size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              type="text" 
                              placeholder="Page Facebook"
                              value={businessInfo.facebook} 
                              onChange={(e) => handleInfoChange('facebook', e.target.value)}
                              className="w-full pl-9 pr-2 py-2 bg-white border border-slate-200 rounded-lg text-black text-xs outline-none focus:border-black"
                            />
                         </div>
                      </div>
                      <div className="space-y-1">
                         <div className="relative">
                            <Instagram size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              type="text" 
                              placeholder="Page Instagram"
                              value={businessInfo.instagram} 
                              onChange={(e) => handleInfoChange('instagram', e.target.value)}
                              className="w-full pl-9 pr-2 py-2 bg-white border border-slate-200 rounded-lg text-black text-xs outline-none focus:border-black"
                            />
                         </div>
                      </div>
                      <div className="space-y-1">
                         <div className="relative">
                            <Video size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              type="text" 
                              placeholder="Compte TikTok"
                              value={businessInfo.tiktok} 
                              onChange={(e) => handleInfoChange('tiktok', e.target.value)}
                              className="w-full pl-9 pr-2 py-2 bg-white border border-slate-200 rounded-lg text-black text-xs outline-none focus:border-black"
                            />
                         </div>
                      </div>
                   </div>
                </div>

                {/* Map Position */}
                <div className="border-t border-slate-100 pt-4">
                   <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mb-2">
                       <Map size={12} /> Position Map (Coordonnées GPS)
                   </label>
                   <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="Latitude"
                        value={businessInfo.lat} 
                        onChange={(e) => handleInfoChange('lat', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-black rounded-lg text-black text-sm outline-none focus:ring-1 focus:ring-black font-mono"
                      />
                      <input 
                        type="text" 
                        placeholder="Longitude"
                        value={businessInfo.lng} 
                        onChange={(e) => handleInfoChange('lng', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-black rounded-lg text-black text-sm outline-none focus:ring-1 focus:ring-black font-mono"
                      />
                   </div>
                   <div className="mt-2 h-32 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                      Aperçu de la carte
                   </div>
                </div>
             </div>
          </div>

          {/* Security / Password Management */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
             <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
               <Lock size={20} className="text-slate-400" /> Sécurité
             </h3>
             
             <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-500">Mot de passe actuel</label>
                    <input 
                      type="password"
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-black rounded-lg text-black text-sm outline-none placeholder:text-slate-300"
                      placeholder="••••••••"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500">Nouveau mot de passe</label>
                        <input 
                          type="password"
                          value={passwordData.new}
                          onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-black rounded-lg text-black text-sm outline-none placeholder:text-slate-300"
                          placeholder="••••••••"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500">Confirmer</label>
                        <input 
                          type="password"
                          value={passwordData.confirm}
                          onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-black rounded-lg text-black text-sm outline-none placeholder:text-slate-300"
                          placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                   <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
                     Mettre à jour
                   </button>
                </div>
             </div>
          </div>

          {/* Subscription & Key */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
             <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
               <CreditCard size={20} className="text-slate-400" /> Abonnement & Licence
             </h3>
             
             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
                <div>
                   <p className="font-bold text-slate-900">Plan Professionnel</p>
                   <p className="text-xs text-slate-500">Renouvellement le 01 Nov 2023</p>
                </div>
                <button className="text-sm font-medium text-black underline hover:text-slate-600 transition-colors">
                  Gérer
                </button>
             </div>

             <div className="space-y-2 border-t border-slate-100 pt-4">
                 <label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                    <Key size={14} /> Clé d'activation
                 </label>
                 <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={licenseKey}
                        onChange={(e) => setLicenseKey(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-black rounded-lg text-black text-sm outline-none font-mono tracking-wide"
                        placeholder="XXXX-XXXX-XXXX-XXXX"
                    />
                    <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 rounded-lg text-sm font-medium transition-colors">
                        Activer
                    </button>
                 </div>
                 <p className="text-[10px] text-slate-400">Entrez votre clé de licence pour activer les fonctionnalités premium.</p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
