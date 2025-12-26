
import React, { useState, useRef } from 'react';
import { AppData } from '../types';
import { Save, UserPlus, Trash2, ShieldCheck, Percent, MapPin, Info, Phone, Mail, Image as ImageIcon, Upload, X } from 'lucide-react';

interface ConfigurationProps {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

const Configuration: React.FC<ConfigurationProps> = ({ data, onUpdate }) => {
  const [config, setConfig] = useState(data.config);
  const [newMember, setNewMember] = useState({ prenom: '', nom: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onUpdate({ ...data, config });
    alert('Configuration enregistrée avec succès !');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig({ ...config, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setConfig({ ...config, logo: '' });
  };

  const addMember = () => {
    if (!newMember.prenom || !newMember.nom) return;
    setConfig({
      ...config,
      members: [...config.members, newMember]
    });
    setNewMember({ prenom: '', nom: '' });
  };

  const removeMember = (index: number) => {
    const newMembers = [...config.members];
    newMembers.splice(index, 1);
    setConfig({ ...config, members: newMembers });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Logo Section */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-8 text-emerald-800">
          <ImageIcon className="w-6 h-6" />
          <h2 className="text-xl font-bold">Logo de la Daara</h2>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-slate-100 rounded-full overflow-hidden border-4 border-white shadow-lg flex items-center justify-center bg-slate-50">
              {config.logo ? (
                <img src={config.logo} alt="Logo Daara" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="text-slate-300 w-16 h-16" />
              )}
            </div>
            {config.logo && (
              <button 
                onClick={removeLogo}
                className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-md hover:bg-rose-600 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Identité Visuelle</h3>
              <p className="text-slate-500 text-sm mt-1">Téléchargez le logo officiel de votre Daara. Il apparaîtra sur tous les rapports PDF et dans l'interface.</p>
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleLogoUpload}
              className="hidden" 
              accept="image/*"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-6 py-2.5 rounded-xl font-bold border border-emerald-100 transition-all"
            >
              <Upload size={18} />
              <span>Choisir une image</span>
            </button>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-8 text-emerald-800">
          <Info className="w-6 h-6" />
          <h2 className="text-xl font-bold">Informations Générales & Contact</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <MapPin size={16} /> Lieu de la Daara
            </label>
            <input 
              type="text" 
              placeholder="Ex: Dakar, Grand Yoff..."
              value={config.location} 
              onChange={(e) => setConfig({ ...config, location: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-semibold"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <Phone size={16} /> Téléphone
            </label>
            <input 
              type="text" 
              placeholder="+221 ..."
              value={config.phone || ''} 
              onChange={(e) => setConfig({ ...config, phone: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-semibold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <Mail size={16} /> Email de contact
            </label>
            <input 
              type="email" 
              placeholder="contact@daaramaha.com"
              value={config.email || ''} 
              onChange={(e) => setConfig({ ...config, email: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-semibold"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-8 text-emerald-800">
          <Percent className="w-6 h-6" />
          <h2 className="text-xl font-bold">Répartition par défaut (%)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wide">Caisse Rénovation</label>
            <div className="relative">
              <input 
                type="number" 
                value={config.defaultRenovationPercent} 
                onChange={(e) => setConfig({ ...config, defaultRenovationPercent: parseInt(e.target.value) || 0 })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-semibold"
              />
              <span className="absolute right-4 top-3.5 text-slate-400">%</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wide">Caisse Sociale</label>
             <div className="relative">
              <input 
                type="number" 
                value={config.defaultSocialePercent} 
                onChange={(e) => setConfig({ ...config, defaultSocialePercent: parseInt(e.target.value) || 0 })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-semibold"
              />
              <span className="absolute right-4 top-3.5 text-slate-400">%</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-wide">Comité Directeur</label>
             <div className="relative">
              <input 
                type="number" 
                value={config.defaultComitePercent} 
                onChange={(e) => setConfig({ ...config, defaultComitePercent: parseInt(e.target.value) || 0 })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-semibold"
              />
              <span className="absolute right-4 top-3.5 text-slate-400">%</span>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-4 items-start">
           <ShieldCheck className="text-amber-600 shrink-0 mt-0.5" />
           <p className="text-sm text-amber-800 italic">
             Important: La somme totale doit être égale à 100%. (Actuellement: {config.defaultRenovationPercent + config.defaultSocialePercent + config.defaultComitePercent}%)
           </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-8 text-emerald-800">
          <UserPlus className="w-6 h-6" />
          <h2 className="text-xl font-bold">Membres Pré-enregistrés</h2>
        </div>

        <div className="flex gap-4 mb-8">
           <input 
              type="text" 
              placeholder="Prénom" 
              value={newMember.prenom}
              onChange={(e) => setNewMember({ ...newMember, prenom: e.target.value })}
              className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
           />
           <input 
              type="text" 
              placeholder="Nom" 
              value={newMember.nom}
              onChange={(e) => setNewMember({ ...newMember, nom: e.target.value })}
              className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
           />
           <button onClick={addMember} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all active:scale-95">
             Ajouter
           </button>
        </div>

        <div className="max-h-64 overflow-y-auto border border-slate-100 rounded-xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-slate-500 uppercase text-xs font-bold">Prénom</th>
                <th className="px-6 py-3 text-slate-500 uppercase text-xs font-bold">Nom</th>
                <th className="px-6 py-3 text-slate-500 uppercase text-xs font-bold w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {config.members.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-6 py-3 text-slate-700">{m.prenom}</td>
                  <td className="px-6 py-3 text-slate-700">{m.nom}</td>
                  <td className="px-6 py-3 text-center">
                    <button onClick={() => removeMember(idx)} className="text-rose-500 hover:text-rose-700 p-2">
                       <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {config.members.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">Aucun membre enregistré</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center pb-12">
        <button 
          onClick={handleSave}
          className="bg-emerald-800 hover:bg-emerald-900 text-white px-10 py-4 rounded-2xl font-bold shadow-xl flex items-center gap-3 transition-all active:scale-95"
        >
          <Save size={20} />
          <span>Enregistrer toute la configuration</span>
        </button>
      </div>
    </div>
  );
};

export default Configuration;
