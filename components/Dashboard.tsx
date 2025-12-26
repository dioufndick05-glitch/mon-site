
import React, { useState } from 'react';
import { AppData, MonthlyRecord, MONTHS } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart,
  Line
} from 'recharts';
import { TrendingUp, Users, Wallet, CreditCard, UserPlus, X, Save } from 'lucide-react';

interface DashboardProps {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMember, setNewMember] = useState({ prenom: '', nom: '' });
  const currentYear = new Date().getFullYear();
  
  const chartData = MONTHS.map(m => {
    const key = `${currentYear}-${m}`;
    const record = data.records[key];
    if (!record) return { name: m.substring(0, 3), total: 0, depenses: 0 };
    
    const totalIn = record.cotisations.reduce((acc, c) => acc + c.montant, 0) + 
                  record.autresSommes.reduce((acc, s) => acc + s.montant, 0);
    const totalOut = record.depenses.reduce((acc, d) => acc + d.total, 0);
    
    return {
      name: m.substring(0, 3),
      total: totalIn,
      depenses: totalOut,
      net: totalIn - totalOut
    };
  });

  const grandTotalCotisations = (Object.values(data.records) as MonthlyRecord[]).reduce((acc, r) => 
    acc + r.cotisations.reduce((c_acc, c) => c_acc + c.montant, 0), 0
  );

  const totalMembers = data.config.members.length;

  const handleAddMember = () => {
    if (!newMember.prenom || !newMember.nom) return;
    onUpdate({
      ...data,
      config: {
        ...data.config,
        members: [...data.config.members, newMember]
      }
    });
    setNewMember({ prenom: '', nom: '' });
    setIsModalOpen(false);
    alert('Membre ajouté avec succès !');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Vue d'ensemble financière</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
        >
          <UserPlus size={20} />
          <span>Ajouter un membre</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Wallet size={24} />
             </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Total Cotisations (Global)</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{grandTotalCotisations.toLocaleString()} FCFA</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users size={24} />
             </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Membres Pré-enregistrés</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalMembers} Membres</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <CreditCard size={24} />
             </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Mois de Données</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{Object.keys(data.records).length} Mois</h3>
        </div>

        <div className="bg-emerald-900 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-emerald-700 text-emerald-200 rounded-xl">
                <TrendingUp size={24} />
             </div>
          </div>
          <p className="text-emerald-300 text-sm font-medium">Année de Référence</p>
          <h3 className="text-2xl font-bold mt-1">{currentYear}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            Flux de Trésorerie Mensuel {currentYear}
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="total" name="Recettes" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="depenses" name="Dépenses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
           <h3 className="font-bold text-slate-800 mb-6">Net Mensuel</h3>
           <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Line type="monotone" dataKey="net" name="Solde Net" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} activeDot={{r: 8}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Modal Ajout Membre */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-300">
             <div className="bg-emerald-900 p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <UserPlus className="text-emerald-300" />
                   <h3 className="text-xl font-bold tracking-tight">Ajouter un Membre</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-emerald-800 rounded-full transition-colors">
                   <X size={20} />
                </button>
             </div>
             
             <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prénom du membre</label>
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Prénom"
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none font-medium"
                      value={newMember.prenom}
                      onChange={(e) => setNewMember({...newMember, prenom: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nom du membre</label>
                    <input 
                      type="text" 
                      placeholder="Nom"
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none font-medium"
                      value={newMember.nom}
                      onChange={(e) => setNewMember({...newMember, nom: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3.5 border border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleAddMember}
                    className="flex-1 px-6 py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Save size={18} />
                    <span>Enregistrer</span>
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
