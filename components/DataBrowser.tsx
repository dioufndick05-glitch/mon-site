
import React, { useState, useMemo, useEffect } from 'react';
import { AppData, MonthlyRecord, MONTHS } from '../types';
import { Trash2, ExternalLink, Download, FileSpreadsheet, Calendar, Filter, Users, CalendarDays, FileDown, MapPin, Phone, Mail, Globe, Clock, CheckCircle2, AlertTriangle, X, Save, Landmark, HeartPulse, UserCog, Calculator, TrendingUp, TrendingDown } from 'lucide-react';

interface DataBrowserProps {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

const DataBrowser: React.FC<DataBrowserProps> = ({ data, onUpdate }) => {
  // Load saved filters from localStorage if they exist
  const getSavedFilters = () => {
    const saved = localStorage.getItem('daara_maha_browser_filters');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    return {};
  };

  const initialFilters = getSavedFilters();
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>(initialFilters.year || 'all');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>(initialFilters.month || 'all');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>(initialFilters.member || 'all');
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [filtersSavedFeedback, setFiltersSavedFeedback] = useState(false);

  const allRecords = useMemo(() => 
    (Object.values(data.records) as MonthlyRecord[]).sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      const aIdx = MONTHS.indexOf(a.month);
      const bIdx = MONTHS.indexOf(b.month);
      return bIdx - aIdx;
    }),
    [data.records]
  );

  // Solde Actuel based on the absolute latest record in the database
  const currentBalances = useMemo(() => {
    if (allRecords.length === 0) return { renovation: 0, sociale: 0, comite: 0 };
    const latest = allRecords[0];
    return {
      renovation: latest.repartition.caisseRenovation.nouveauSolde,
      sociale: latest.repartition.caisseSociale.nouveauSolde,
      comite: latest.repartition.comiteDirecteur.nouveauSolde
    };
  }, [allRecords]);

  const availableYears = useMemo(() => {
    const years = allRecords.map(r => r.year.toString());
    return Array.from(new Set<string>(years)).sort((a, b) => parseInt(b) - parseInt(a));
  }, [allRecords]);

  const availableMembers = useMemo(() => {
    return data.config.members.map(m => `${m.prenom} ${m.nom}`);
  }, [data.config.members]);

  const filteredRecords = useMemo(() => {
    return allRecords.filter(r => {
      const yearMatch = selectedYearFilter === 'all' || r.year.toString() === selectedYearFilter;
      const monthMatch = selectedMonthFilter === 'all' || r.month === selectedMonthFilter;
      const memberMatch = selectedMemberFilter === 'all' || r.cotisations.some(c => 
        `${c.prenom} ${c.nom}`.toLowerCase() === selectedMemberFilter.toLowerCase()
      );
      return yearMatch && monthMatch && memberMatch;
    });
  }, [allRecords, selectedYearFilter, selectedMonthFilter, selectedMemberFilter]);

  // Aggregate totals for the filtered selection
  const selectionTotals = useMemo(() => {
    return filteredRecords.reduce((acc, r) => {
      const rCot = r.cotisations.reduce((cacc, c) => cacc + c.montant, 0);
      const rAut = r.autresSommes.reduce((aacc, a) => aacc + a.montant, 0);
      const rDep = r.depenses.reduce((dacc, d) => dacc + d.total, 0);
      
      acc.cotisations += rCot;
      acc.autres += rAut;
      acc.depenses += rDep;
      acc.recettes += (rCot + rAut);
      acc.net += (rCot + rAut - rDep);
      return acc;
    }, { cotisations: 0, autres: 0, recettes: 0, depenses: 0, net: 0 });
  }, [filteredRecords]);

  const handleSaveFilters = () => {
    const filters = {
      year: selectedYearFilter,
      month: selectedMonthFilter,
      member: selectedMemberFilter
    };
    localStorage.setItem('daara_maha_browser_filters', JSON.stringify(filters));
    setFiltersSavedFeedback(true);
    setTimeout(() => setFiltersSavedFeedback(false), 2000);
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      const newRecords = { ...data.records };
      delete newRecords[recordToDelete];
      onUpdate({ ...data, records: newRecords });
      setRecordToDelete(null);
    }
  };

  const handleExportFilteredPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-emerald-900 p-8 rounded-2xl shadow-xl text-white flex flex-col md:flex-row justify-between items-center gap-6 no-print">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
            <FileSpreadsheet /> 
            Exploration de la Base de Données
          </h2>
          <p className="text-emerald-300 opacity-90">Visualisez et exportez vos archives mensuelles avec des filtres précis.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportFilteredPDF}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg transition-all active:scale-95 group"
          >
             <FileDown size={20} className="group-hover:translate-y-0.5 transition-transform" />
             <span>Exporter Rapport PDF Détaillé</span>
          </button>
        </div>
      </div>

      {/* Current Balances Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 flex items-center gap-5 group hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
               <Landmark size={28} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Solde Rénovation</p>
               <h3 className="text-xl font-black text-emerald-900">{currentBalances.renovation.toLocaleString()} FCFA</h3>
            </div>
         </div>
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100 flex items-center gap-5 group hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
               <HeartPulse size={28} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Solde Social</p>
               <h3 className="text-xl font-black text-blue-900">{currentBalances.sociale.toLocaleString()} FCFA</h3>
            </div>
         </div>
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-indigo-100 flex items-center gap-5 group hover:shadow-md transition-all">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
               <UserCog size={28} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Solde Comité</p>
               <h3 className="text-xl font-black text-indigo-900">{currentBalances.comite.toLocaleString()} FCFA</h3>
            </div>
         </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 no-print">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
            <Filter size={14} />
            <span>Filtres de recherche active</span>
          </div>
          <button 
            onClick={handleSaveFilters}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              filtersSavedFeedback 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {filtersSavedFeedback ? <CheckCircle2 size={14} /> : <Save size={14} />}
            <span>{filtersSavedFeedback ? 'Filtres sauvegardés !' : 'Sauvegarder les filtres'}</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm">
              <Calendar size={18} />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Année</label>
              <select
                value={selectedYearFilter}
                onChange={(e) => setSelectedYearFilter(e.target.value)}
                className="w-full bg-transparent font-bold text-slate-700 outline-none cursor-pointer focus:text-emerald-600 transition-colors"
              >
                <option value="all">Toutes les années</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
              <CalendarDays size={18} />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Mois</label>
              <select
                value={selectedMonthFilter}
                onChange={(e) => setSelectedMonthFilter(e.target.value)}
                className="w-full bg-transparent font-bold text-slate-700 outline-none cursor-pointer focus:text-blue-600 transition-colors"
              >
                <option value="all">Tous les mois</option>
                {MONTHS.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="p-2 bg-white rounded-lg text-indigo-600 shadow-sm">
              <Users size={18} />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Filtrer par Membre</label>
              <select
                value={selectedMemberFilter}
                onChange={(e) => setSelectedMemberFilter(e.target.value)}
                className="w-full bg-transparent font-bold text-slate-700 outline-none cursor-pointer focus:text-indigo-600 transition-colors"
              >
                <option value="all">Tous les membres</option>
                {availableMembers.map(member => (
                  <option key={member} value={member}>{member}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table View (On Screen) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-slate-500 uppercase text-xs font-bold">Période</th>
                  <th className="px-6 py-4 text-slate-500 uppercase text-xs font-bold text-center">Cotisations</th>
                  <th className="px-6 py-4 text-slate-500 uppercase text-xs font-bold text-center">Recettes</th>
                  <th className="px-6 py-4 text-slate-500 uppercase text-xs font-bold text-center">Dépenses</th>
                  <th className="px-6 py-4 text-slate-500 uppercase text-xs font-bold text-right">Net Mensuel</th>
                  <th className="px-6 py-4 text-slate-500 uppercase text-xs font-bold text-center">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y">
                {filteredRecords.map(r => {
                  const key = `${r.year}-${r.month}`;
                  const totalC = r.cotisations.reduce((acc, c) => acc + c.montant, 0);
                  const totalA = r.autresSommes.reduce((acc, a) => acc + a.montant, 0);
                  const totalD = r.depenses.reduce((acc, d) => acc + d.total, 0);
                  const net = (totalC + totalA) - totalD;

                  return (
                    <tr key={key} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center font-bold text-emerald-700 shadow-inner border border-emerald-100">
                               {r.month.substring(0, 1)}
                            </div>
                            <div>
                               <p className="font-bold text-slate-800">{r.month}</p>
                               <p className="text-xs text-slate-400 font-bold">{r.year}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-slate-600">
                        {selectedMemberFilter !== 'all' ? (
                          <div className="flex flex-col items-center">
                            <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-sm">
                              {r.cotisations.find(c => `${c.prenom} ${c.nom}`.toLowerCase() === selectedMemberFilter.toLowerCase())?.montant.toLocaleString() || 0} FCFA
                            </span>
                          </div>
                        ) : (
                          `${totalC.toLocaleString()} FCFA`
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-slate-600">{totalA.toLocaleString()} FCFA</td>
                      <td className="px-6 py-4 text-center font-medium text-slate-600">{totalD.toLocaleString()} FCFA</td>
                      <td className="px-6 py-4 text-right">
                         <span className={`font-bold px-3 py-1 rounded-lg ${net >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                           {net.toLocaleString()} FCFA
                         </span>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex justify-center items-center gap-2">
                            <button onClick={() => setRecordToDelete(key)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors" title="Supprimer">
                               <Trash2 size={18} />
                            </button>
                         </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">Aucun enregistrement ne correspond aux filtres.</td>
                  </tr>
                )}
             </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Deletion */}
      {recordToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md animate-in fade-in duration-300 no-print">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-300">
             <div className="bg-rose-50 p-8 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-rose-200">
                   <AlertTriangle size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Supprimer les données ?</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                   Vous êtes sur le point de supprimer définitivement les enregistrements de <span className="font-black text-rose-600 underline decoration-rose-200 decoration-2">{recordToDelete.split('-')[1]} {recordToDelete.split('-')[0]}</span>. Cette action est irréversible.
                </p>
             </div>
             
             <div className="p-8 bg-white flex gap-4">
                <button 
                  onClick={() => setRecordToDelete(null)}
                  className="flex-1 px-6 py-4 border-2 border-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95"
                >
                  Annuler
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-4 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 shadow-lg shadow-rose-200 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Trash2 size={18} />
                  <span>Confirmer</span>
                </button>
             </div>
          </div>
        </div>
      )}

      {/* DETAILED PRINT REPORT SECTION */}
      <div id="print-area" className="hidden print:block bg-white p-0 space-y-10">
          {/* Main Print Header */}
          <div className="border-b-[6px] border-emerald-900 pb-8">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-6">
                 {/* Logo */}
                 <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center overflow-hidden shadow-xl border-2 border-emerald-800 p-1">
                    {data.config.logo ? (
                      <img src={data.config.logo} alt="Logo" className="w-full h-full object-contain rounded-2xl" />
                    ) : (
                      <div className="w-full h-full bg-emerald-900 flex items-center justify-center text-white font-black text-5xl rounded-2xl">D</div>
                    )}
                 </div>
                 <div>
                    <h1 className="text-4xl font-black text-emerald-950 uppercase tracking-tighter">Daara Maha Jumoohi</h1>
                    <p className="text-emerald-700 font-black uppercase text-sm tracking-[0.2em] mt-1">Archive de Gestion Financière</p>
                    <div className="flex gap-4 mt-3 text-[11px] font-bold text-slate-500 uppercase">
                       {data.config.location && <span className="flex items-center gap-1"><MapPin size={12} className="text-emerald-600" /> {data.config.location}</span>}
                       {data.config.phone && <span className="flex items-center gap-1"><Phone size={12} className="text-emerald-600" /> {data.config.phone}</span>}
                       {data.config.email && <span className="flex items-center gap-1"><Mail size={12} className="text-emerald-600" /> {data.config.email}</span>}
                    </div>
                 </div>
              </div>
              <div className="text-right">
                 <div className="bg-emerald-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest inline-block mb-2">
                    RAPPORT BASE DE DONNÉES
                 </div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Émis le {new Date().toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-4 gap-4">
               <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Période Filtrée</p>
                  <p className="text-xs font-bold text-slate-800">
                    {selectedMonthFilter === 'all' ? 'Tous les mois' : selectedMonthFilter} {selectedYearFilter === 'all' ? 'Toutes années' : selectedYearFilter}
                  </p>
               </div>
               <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Membre Filtré</p>
                  <p className="text-xs font-bold text-slate-800">{selectedMemberFilter === 'all' ? 'Aucun (Vue Globale)' : selectedMemberFilter}</p>
               </div>
               <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Enregistrements</p>
                  <p className="text-xs font-bold text-emerald-800">{filteredRecords.length} mois trouvés</p>
               </div>
               <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Date Impression</p>
                  <p className="text-xs font-bold text-blue-800">{new Date().toLocaleDateString('fr-FR')}</p>
               </div>
            </div>
          </div>

          {/* NEW: Global Summary Section for PDF */}
          <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-200">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-slate-900 text-white rounded-lg">
                  <Calculator size={20} />
               </div>
               <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Résumé Global de la Sélection</h2>
            </div>
            
            <div className="grid grid-cols-4 gap-6">
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Cotisations</p>
                  <p className="text-lg font-black text-emerald-700">{selectionTotals.cotisations.toLocaleString()} FCFA</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Autres Recettes</p>
                  <p className="text-lg font-black text-blue-700">{selectionTotals.autres.toLocaleString()} FCFA</p>
               </div>
               <div className="space-y-1 border-l-2 border-slate-200 pl-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Dépenses</p>
                  <p className="text-lg font-black text-rose-700">{selectionTotals.depenses.toLocaleString()} FCFA</p>
               </div>
               <div className="bg-slate-900 p-4 rounded-2xl text-white">
                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-1">Bilan Net Final</p>
                  <p className="text-xl font-black">{selectionTotals.net.toLocaleString()} FCFA</p>
               </div>
            </div>
          </div>

          {/* Month by Month Detail */}
          <div className="space-y-12">
            <div className="flex items-center gap-3 border-b-4 border-slate-100 pb-4">
               <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Détail Chronologique par Mois</h2>
            </div>
            
            {filteredRecords.map((r, index) => {
               const totalC = r.cotisations.reduce((acc, c) => acc + c.montant, 0);
               const totalA = r.autresSommes.reduce((acc, a) => acc + a.montant, 0);
               const totalD = r.depenses.reduce((acc, d) => acc + d.total, 0);
               const net = (totalC + totalA) - totalD;

               return (
                 <div key={`${r.year}-${r.month}`} className={`border-[3px] border-slate-100 rounded-[2rem] overflow-hidden ${index > 0 && index % 2 === 0 ? 'page-break-before-always' : ''}`}>
                    <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg border-2 border-emerald-300">
                            {r.month.substring(0, 1)}
                         </div>
                         <div>
                            <h3 className="text-2xl font-black uppercase tracking-tight">{r.month} {r.year}</h3>
                            <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-[0.3em]">Bilan Mensuel Détallé</p>
                         </div>
                      </div>
                      <div className="text-right bg-white/10 px-6 py-2 rounded-2xl backdrop-blur-md">
                         <p className="text-[9px] font-bold text-slate-300 uppercase mb-1">NET MENSUEL</p>
                         <p className="text-xl font-black">{net.toLocaleString()} FCFA</p>
                      </div>
                    </div>

                    <div className="p-8 grid grid-cols-2 gap-x-12 gap-y-10 bg-white">
                      {/* Section 1: Cotisations */}
                      <div className="space-y-4">
                         <div className="flex items-center gap-2 border-b-2 border-emerald-800 pb-2">
                            <Users size={16} className="text-emerald-800" />
                            <h4 className="text-xs font-black uppercase text-emerald-950 tracking-widest">Cotisations des Membres</h4>
                         </div>
                         <table className="w-full text-[10px]">
                            <thead className="text-slate-400 font-bold uppercase">
                               <tr>
                                  <th className="text-left py-2">Prénom & Nom</th>
                                  <th className="text-right py-2">Montant</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                               {r.cotisations.filter(c => selectedMemberFilter === 'all' || `${c.prenom} ${c.nom}`.toLowerCase() === selectedMemberFilter.toLowerCase()).map(c => (
                                 <tr key={c.id}>
                                    <td className="py-2 font-bold text-slate-700">{c.prenom} {c.nom}</td>
                                    <td className="py-2 text-right font-black text-emerald-700">{c.montant.toLocaleString()} FCFA</td>
                                 </tr>
                               ))}
                               {r.cotisations.length === 0 && <tr><td colSpan={2} className="py-4 text-center italic text-slate-300">Aucune donnée</td></tr>}
                            </tbody>
                            <tfoot className="border-t-2 border-slate-100 font-black">
                               <tr>
                                  <td className="py-3 uppercase text-slate-400 text-[9px]">Sous-Total</td>
                                  <td className="py-3 text-right text-emerald-800">{totalC.toLocaleString()} FCFA</td>
                               </tr>
                            </tfoot>
                         </table>
                      </div>

                      {/* Section 2: Autres Recettes */}
                      <div className="space-y-4">
                         <div className="flex items-center gap-2 border-b-2 border-blue-800 pb-2">
                            <Globe size={16} className="text-blue-800" />
                            <h4 className="text-xs font-black uppercase text-blue-950 tracking-widest">Autres Sommes Reçues</h4>
                         </div>
                         <table className="w-full text-[10px]">
                            <thead className="text-slate-400 font-bold uppercase">
                               <tr>
                                  <th className="text-left py-2">Source / Origine</th>
                                  <th className="text-right py-2">Montant</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                               {r.autresSommes.map(s => (
                                 <tr key={s.id}>
                                    <td className="py-2 font-bold text-slate-700">{s.source}</td>
                                    <td className="py-2 text-right font-black text-blue-700">{s.montant.toLocaleString()} FCFA</td>
                                 </tr>
                               ))}
                               {r.autresSommes.length === 0 && <tr><td colSpan={2} className="py-4 text-center italic text-slate-300">Aucune donnée</td></tr>}
                            </tbody>
                            <tfoot className="border-t-2 border-slate-100 font-black">
                               <tr>
                                  <td className="py-3 uppercase text-slate-400 text-[9px]">Sous-Total</td>
                                  <td className="py-3 text-right text-blue-800">{totalA.toLocaleString()} FCFA</td>
                               </tr>
                            </tfoot>
                         </table>
                      </div>

                      {/* Section 3: Dépenses */}
                      <div className="space-y-4">
                         <div className="flex items-center gap-2 border-b-2 border-rose-800 pb-2">
                            <Clock size={16} className="text-rose-800" />
                            <h4 className="text-xs font-black uppercase text-rose-950 tracking-widest">Détail des Dépenses</h4>
                         </div>
                         <table className="w-full text-[10px]">
                            <thead className="text-slate-400 font-bold uppercase">
                               <tr>
                                  <th className="text-left py-2">Désignation</th>
                                  <th className="text-right py-2">Total</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                               {r.depenses.map(d => (
                                 <tr key={d.id}>
                                    <td className="py-2 font-bold text-slate-700">{d.designation}</td>
                                    <td className="py-2 text-right font-black text-rose-700">{d.total.toLocaleString()} FCFA</td>
                                 </tr>
                               ))}
                               {r.depenses.length === 0 && <tr><td colSpan={2} className="py-4 text-center italic text-slate-300">Aucune donnée</td></tr>}
                            </tbody>
                            <tfoot className="border-t-2 border-slate-100 font-black">
                               <tr>
                                  <td className="py-3 uppercase text-slate-400 text-[9px]">Total Dépenses</td>
                                  <td className="py-3 text-right text-rose-800">{totalD.toLocaleString()} FCFA</td>
                               </tr>
                            </tfoot>
                         </table>
                      </div>

                      {/* Section 4: Répartition & Caisses */}
                      <div className="space-y-4">
                         <div className="flex items-center gap-2 border-b-2 border-indigo-800 pb-2">
                            <CheckCircle2 size={16} className="text-indigo-800" />
                            <h4 className="text-xs font-black uppercase text-indigo-950 tracking-widest">Répartition des Fonds</h4>
                         </div>
                         <div className="grid grid-cols-1 gap-2 pt-2">
                            {[
                               { name: 'Caisse Rénovation', state: r.repartition.caisseRenovation, color: 'emerald' },
                               { name: 'Caisse Sociale', state: r.repartition.caisseSociale, color: 'blue' },
                               { name: 'Comité Directeur', state: r.repartition.comiteDirecteur, color: 'indigo' }
                            ].map(fund => (
                               <div key={fund.name} className="flex flex-col bg-slate-50 p-3 rounded-xl border border-slate-100">
                                  <div className="flex justify-between items-center mb-1">
                                     <span className="text-[10px] font-black text-slate-700 uppercase">{fund.name}</span>
                                     <span className="text-[10px] font-black text-emerald-700">SOLDE À JOUR</span>
                                  </div>
                                  <div className="flex justify-between items-end">
                                     <div className="flex flex-col">
                                        <span className="text-[8px] font-bold text-slate-400 uppercase">Ancien</span>
                                        <span className="text-[10px] font-bold text-slate-500">{fund.state.ancienSolde.toLocaleString()} FCFA</span>
                                     </div>
                                     <div className="flex flex-col text-right">
                                        <span className="text-[8px] font-black text-indigo-400 uppercase">Nouveau</span>
                                        <span className="text-xs font-black text-indigo-900">{fund.state.nouveauSolde.toLocaleString()} FCFA</span>
                                     </div>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                    </div>
                 </div>
               );
            })}
          </div>
          
          <div className="mt-12 text-center text-[8px] text-slate-300 font-bold uppercase tracking-[0.5em] pb-10">
             *** Fin du Rapport Détaillé - Daara Maha Jumoohi Management System ***
          </div>
      </div>
    </div>
  );
};

export default DataBrowser;
