
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Printer, 
  FileDown, 
  FileText,
  Save, 
  ChevronRight, 
  DollarSign, 
  ArrowRightLeft, 
  TrendingDown, 
  UserPlus,
  Coins,
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { AppData, MonthlyRecord, MONTHS, Cotisation, AutreSomme, Depense } from '../types';

interface MonthManagerProps {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

const MonthManager: React.FC<MonthManagerProps> = ({ data, onUpdate }) => {
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isSaved, setIsSaved] = useState(false);

  const recordKey = `${selectedYear}-${selectedMonth}`;
  
  // Default structure for a missing record
  const defaultRecord: MonthlyRecord = {
    month: selectedMonth,
    year: selectedYear,
    cotisations: [],
    autresSommes: [],
    depenses: [],
    repartition: {
      caisseRenovation: { ancienSolde: 0, nouveauSolde: 0 },
      caisseSociale: { ancienSolde: 0, nouveauSolde: 0 },
      comiteDirecteur: { ancienSolde: 0, nouveauSolde: 0 },
    }
  };

  const currentRecord = data.records[recordKey] || defaultRecord;

  // Calculations
  const totalCotisations = useMemo(() => 
    currentRecord.cotisations.reduce((acc, c) => acc + c.montant, 0), 
  [currentRecord.cotisations]);

  const totalAutres = useMemo(() => 
    currentRecord.autresSommes.reduce((acc, s) => acc + s.montant, 0), 
  [currentRecord.autresSommes]);

  const totalRecu = useMemo(() => totalCotisations + totalAutres, [totalCotisations, totalAutres]);

  const totalDepenses = useMemo(() => 
    currentRecord.depenses.reduce((acc, d) => acc + d.total, 0), 
  [currentRecord.depenses]);

  const netMensuel = totalRecu - totalDepenses;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleUpdateRecord = (updates: Partial<MonthlyRecord>) => {
    setIsSaved(false);
    const now = new Date().toISOString();
    const isFirstCreation = !data.records[recordKey];
    
    const updatedRecord = { 
      ...currentRecord, 
      ...updates,
      updatedAt: now,
      createdAt: isFirstCreation ? now : currentRecord.createdAt || now
    };
    
    // Recalculate intermediate sums for updated repartitions
    const newTotalCot = (updatedRecord.cotisations || currentRecord.cotisations).reduce((acc, c) => acc + c.montant, 0);
    const newTotalAut = (updatedRecord.autresSommes || currentRecord.autresSommes).reduce((acc, s) => acc + s.montant, 0);
    const newTotalDep = (updatedRecord.depenses || currentRecord.depenses).reduce((acc, d) => acc + d.total, 0);
    const newNet = (newTotalCot + newTotalAut) - newTotalDep;

    // Auto-calculate répartition based on Net Mensuel
    const { config } = data;
    const renShare = (newNet * config.defaultRenovationPercent) / 100;
    const socShare = (newNet * config.defaultSocialePercent) / 100;
    const comShare = (newNet * config.defaultComitePercent) / 100;

    updatedRecord.repartition = {
      caisseRenovation: { 
        ancienSolde: currentRecord.repartition.caisseRenovation.ancienSolde, 
        nouveauSolde: currentRecord.repartition.caisseRenovation.ancienSolde + renShare 
      },
      caisseSociale: { 
        ancienSolde: currentRecord.repartition.caisseSociale.ancienSolde, 
        nouveauSolde: currentRecord.repartition.caisseSociale.ancienSolde + socShare 
      },
      comiteDirecteur: { 
        ancienSolde: currentRecord.repartition.comiteDirecteur.ancienSolde, 
        nouveauSolde: currentRecord.repartition.comiteDirecteur.ancienSolde + comShare 
      },
    };

    onUpdate({
      ...data,
      records: {
        ...data.records,
        [recordKey]: updatedRecord
      }
    });
  };

  const handleManualSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    // onUpdate is already called on every change, this is for UI feedback
  };

  const addCotisation = () => {
    const newCot: Cotisation = { id: crypto.randomUUID(), prenom: '', nom: '', montant: 0 };
    handleUpdateRecord({ cotisations: [...currentRecord.cotisations, newCot] });
  };

  const addAutre = () => {
    const newItem: AutreSomme = { id: crypto.randomUUID(), source: '', montant: 0 };
    handleUpdateRecord({ autresSommes: [...currentRecord.autresSommes, newItem] });
  };

  const addDepense = () => {
    const newItem: Depense = { id: crypto.randomUUID(), designation: '', total: 0 };
    handleUpdateRecord({ depenses: [...currentRecord.depenses, newItem] });
  };

  const updateArrayItem = (
    array: any[], 
    id: string, 
    key: string, 
    value: any, 
    fieldName: keyof MonthlyRecord
  ) => {
    const newArray = array.map(item => item.id === id ? { ...item, [key]: value } : item);
    handleUpdateRecord({ [fieldName]: newArray } as any);
  };

  const removeArrayItem = <T extends { id: string }>(
    array: T[], 
    id: string, 
    fieldName: keyof MonthlyRecord
  ) => {
    const newArray = array.filter(item => item.id !== id);
    handleUpdateRecord({ [fieldName]: newArray } as any);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csv = `RAPPORT FINANCIER - ${selectedMonth.toUpperCase()} ${selectedYear}\n`;
    csv += `Lieu: ${data.config.location || 'Non spécifié'}\n`;
    csv += `Date de creation: ${formatDate(currentRecord.createdAt)}\n`;
    csv += `Derniere modification: ${formatDate(currentRecord.updatedAt)}\n\n`;

    csv += "--- COTISATIONS ---\n";
    csv += "Prenom,Nom,Montant (FCFA)\n";
    currentRecord.cotisations.forEach(c => {
      csv += `"${c.prenom}","${c.nom}",${c.montant}\n`;
    });
    csv += `TOTAL COTISATIONS,,${totalCotisations}\n\n`;

    csv += "--- AUTRES RECETTES ---\n";
    csv += "Source,Montant (FCFA)\n";
    currentRecord.autresSommes.forEach(s => {
      csv += `"${s.source}",${s.montant}\n`;
    });
    csv += `TOTAL AUTRES,,${totalAutres}\n\n`;

    csv += "--- DEPENSES ---\n";
    csv += "Designation,Total (FCFA)\n";
    currentRecord.depenses.forEach(d => {
      csv += `"${d.designation}",${d.total}\n`;
    });
    csv += `TOTAL DEPENSES,,${totalDepenses}\n\n`;

    csv += "--- BILAN ---\n";
    csv += `Total Recu,,${totalRecu}\n`;
    csv += `Net Mensuel,,${netMensuel}\n\n`;

    csv += "--- REPARTITION DES FONDS ---\n";
    csv += `Caisse Renovation,Ancien: ${currentRecord.repartition.caisseRenovation.ancienSolde},Nouveau: ${currentRecord.repartition.caisseRenovation.nouveauSolde}\n`;
    csv += `Caisse Sociale,Ancien: ${currentRecord.repartition.caisseSociale.ancienSolde},Nouveau: ${currentRecord.repartition.caisseSociale.nouveauSolde}\n`;
    csv += `Comite Directeur,Ancien: ${currentRecord.repartition.comiteDirecteur.ancienSolde},Nouveau: ${currentRecord.repartition.comiteDirecteur.nouveauSolde}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Daara_Maha_Report_${selectedMonth}_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Selector & Actions */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mois</label>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="block w-48 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium"
            >
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Année</label>
            <input 
              type="number" 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="block w-24 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleManualSave}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all active:scale-95 ${
              isSaved 
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
            <span>{isSaved ? 'Enregistré !' : 'Enregistrer'}</span>
          </button>
          <div className="h-8 w-px bg-slate-200 mx-1"></div>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all active:scale-95"
          >
            <FileText size={18} />
            <span>CSV</span>
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all active:scale-95"
          >
            <FileDown size={18} />
            <span>PDF / Impression</span>
          </button>
        </div>
      </div>

      <div id="print-area" className="space-y-8 bg-white print:p-0">
        {/* Header (Print Only - Enhanced) */}
        <div className="hidden print:block border-b-4 border-emerald-800 pb-6 mb-8">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
               {/* Logo Implementation */}
               <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-lg border-2 border-emerald-600">
                  {data.config.logo ? (
                    <img src={data.config.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-emerald-900 flex items-center justify-center text-white font-black text-4xl">D</div>
                  )}
               </div>
               <div>
                  <h1 className="text-3xl font-black text-emerald-900 uppercase tracking-tighter">Daara Maha Jumoohi</h1>
                  <p className="text-emerald-700 font-bold uppercase text-xs tracking-widest mt-1">Gestion des Mensualités & Fonds Sociaux</p>
               </div>
            </div>
            <div className="text-right text-xs space-y-1 text-slate-600 font-medium">
               {data.config.location && <p className="flex items-center justify-end gap-2 text-emerald-800 font-bold"><MapPin size={12} /> {data.config.location}</p>}
               {data.config.phone && <p className="flex items-center justify-end gap-2"><Phone size={12} /> {data.config.phone}</p>}
               {data.config.email && <p className="flex items-center justify-end gap-2"><Mail size={12} /> {data.config.email}</p>}
               <p className="flex items-center justify-end gap-2"><Globe size={12} /> www.daaramaha.com</p>
            </div>
          </div>
          
          <div className="mt-8 flex justify-between items-end">
             <div>
                <h2 className="text-xl font-bold text-slate-800">RAPPORT FINANCIER MENSUEL</h2>
                <p className="text-emerald-600 font-black text-2xl uppercase">{selectedMonth} {selectedYear}</p>
             </div>
             <div className="text-[10px] text-slate-400 font-bold uppercase text-right space-y-0.5">
                <p>Généré le: {new Date().toLocaleDateString('fr-FR')}</p>
                <p>Création: {formatDate(currentRecord.createdAt)}</p>
                <p>Dernière Modif: {formatDate(currentRecord.updatedAt)}</p>
             </div>
          </div>
        </div>

        {/* Timestamps (Screen only, subtle) */}
        <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest no-print">
           <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
             <Clock size={12} className="text-emerald-500" />
             <span>Créé: {formatDate(currentRecord.createdAt)}</span>
           </div>
           <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
             <Clock size={12} className="text-blue-500" />
             <span>Modifié: {formatDate(currentRecord.updatedAt)}</span>
           </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <Coins size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cotisations</p>
              <p className="text-lg font-bold text-emerald-600">{totalCotisations.toLocaleString()} FCFA</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Autres Recettes</p>
              <p className="text-lg font-bold text-blue-600">{totalAutres.toLocaleString()} FCFA</p>
            </div>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-600 shadow-sm">
              <Plus size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Reçu</p>
              <p className="text-lg font-bold text-slate-800">{totalRecu.toLocaleString()} FCFA</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-rose-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
              <TrendingDown size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dépenses</p>
              <p className="text-lg font-bold text-rose-600">{totalDepenses.toLocaleString()} FCFA</p>
            </div>
          </div>
          <div className="bg-emerald-900 p-5 rounded-2xl shadow-lg flex items-center gap-4 text-white print:bg-emerald-800">
            <div className="w-10 h-10 bg-emerald-700 rounded-xl flex items-center justify-center">
              <ArrowRightLeft size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Net Mensuel</p>
              <p className="text-lg font-bold">{netMensuel.toLocaleString()} FCFA</p>
            </div>
          </div>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cotisations */}
          <section className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <UserPlus size={20} className="text-emerald-600" />
                 <h3 className="font-bold text-slate-700">Cotisations</h3>
              </div>
              <button onClick={addCotisation} className="no-print p-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors">
                <Plus size={18} />
              </button>
            </div>
            <div className="overflow-x-auto p-4">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-4 py-3">Prénom</th>
                    <th className="px-4 py-3">Nom</th>
                    <th className="px-4 py-3">Montant (FCFA)</th>
                    <th className="px-4 py-3 no-print">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {currentRecord.cotisations.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2">
                        <input 
                          type="text" 
                          value={item.prenom} 
                          onChange={(e) => updateArrayItem(currentRecord.cotisations, item.id, 'prenom', e.target.value, 'cotisations')}
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-700"
                        />
                      </td>
                      <td className="px-4 py-2">
                         <input 
                          type="text" 
                          value={item.nom} 
                          onChange={(e) => updateArrayItem(currentRecord.cotisations, item.id, 'nom', e.target.value, 'cotisations')}
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-700"
                        />
                      </td>
                      <td className="px-4 py-2 font-semibold">
                         <input 
                          type="number" 
                          value={item.montant} 
                          onChange={(e) => updateArrayItem(currentRecord.cotisations, item.id, 'montant', parseFloat(e.target.value) || 0, 'cotisations')}
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-700"
                        />
                      </td>
                      <td className="px-4 py-2 no-print">
                        <button onClick={() => removeArrayItem(currentRecord.cotisations, item.id, 'cotisations')} className="text-rose-500 hover:text-rose-700 p-1">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {currentRecord.cotisations.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">Aucune cotisation enregistrée</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Autres Sommes */}
          <section className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <DollarSign size={20} className="text-blue-600" />
                 <h3 className="font-bold text-slate-700">Autres Recettes</h3>
              </div>
              <button onClick={addAutre} className="no-print p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors">
                <Plus size={18} />
              </button>
            </div>
            <div className="overflow-x-auto p-4">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-4 py-3">Source / Motif</th>
                    <th className="px-4 py-3">Montant (FCFA)</th>
                    <th className="px-4 py-3 no-print">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {currentRecord.autresSommes.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2">
                        <input 
                          type="text" 
                          value={item.source} 
                          onChange={(e) => updateArrayItem(currentRecord.autresSommes, item.id, 'source', e.target.value, 'autresSommes')}
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-700"
                        />
                      </td>
                      <td className="px-4 py-2 font-semibold">
                         <input 
                          type="number" 
                          value={item.montant} 
                          onChange={(e) => updateArrayItem(currentRecord.autresSommes, item.id, 'montant', parseFloat(e.target.value) || 0, 'autresSommes')}
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-700"
                        />
                      </td>
                      <td className="px-4 py-2 no-print">
                        <button onClick={() => removeArrayItem(currentRecord.autresSommes, item.id, 'autresSommes')} className="text-rose-500 hover:text-rose-700 p-1">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                   {currentRecord.autresSommes.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-slate-400 italic">Aucune autre recette</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Dépenses */}
          <section className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <TrendingDown size={20} className="text-rose-600" />
                 <h3 className="font-bold text-slate-700">Dépenses</h3>
              </div>
              <button onClick={addDepense} className="no-print p-2 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg transition-colors">
                <Plus size={18} />
              </button>
            </div>
            <div className="overflow-x-auto p-4">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-4 py-3">Désignation</th>
                    <th className="px-4 py-3">Total (FCFA)</th>
                    <th className="px-4 py-3 no-print">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {currentRecord.depenses.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2">
                        <input 
                          type="text" 
                          value={item.designation} 
                          onChange={(e) => updateArrayItem(currentRecord.depenses, item.id, 'designation', e.target.value, 'depenses')}
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-700"
                        />
                      </td>
                      <td className="px-4 py-2 font-semibold">
                         <input 
                          type="number" 
                          value={item.total} 
                          onChange={(e) => updateArrayItem(currentRecord.depenses, item.id, 'total', parseFloat(e.target.value) || 0, 'depenses')}
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-700"
                        />
                      </td>
                      <td className="px-4 py-2 no-print">
                        <button onClick={() => removeArrayItem(currentRecord.depenses, item.id, 'depenses')} className="text-rose-500 hover:text-rose-700 p-1">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                   {currentRecord.depenses.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-slate-400 italic">Aucune dépense enregistrée</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Répartition des fonds */}
          <section className="bg-white rounded-2xl shadow-sm border border-emerald-200 overflow-hidden">
             <div className="bg-emerald-50 p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-3 text-emerald-800">
                 <ArrowRightLeft size={20} />
                 <h3 className="font-bold">Répartition des Fonds</h3>
              </div>
            </div>
            <div className="p-6 space-y-6">
               <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <p className="font-bold text-slate-600 border-b pb-1">Caisse Rénovation ({data.config.defaultRenovationPercent}%)</p>
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 uppercase font-bold">Ancien Solde</span>
                      <input 
                        type="number"
                        className="font-semibold text-slate-700 border-none p-0 focus:ring-0"
                        value={currentRecord.repartition.caisseRenovation.ancienSolde}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          handleUpdateRecord({ 
                            repartition: { 
                              ...currentRecord.repartition, 
                              caisseRenovation: { 
                                ancienSolde: val, 
                                nouveauSolde: val + (netMensuel * data.config.defaultRenovationPercent / 100)
                              } 
                            } 
                          })
                        }}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-emerald-500 uppercase font-bold">Nouveau Solde</span>
                      <span className="font-bold text-lg text-emerald-600">{currentRecord.repartition.caisseRenovation.nouveauSolde.toLocaleString()} FCFA</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="font-bold text-slate-600 border-b pb-1">Caisse Sociale ({data.config.defaultSocialePercent}%)</p>
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 uppercase font-bold">Ancien Solde</span>
                      <input 
                        type="number"
                        className="font-semibold text-slate-700 border-none p-0 focus:ring-0"
                        value={currentRecord.repartition.caisseSociale.ancienSolde}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          handleUpdateRecord({ 
                            repartition: { 
                              ...currentRecord.repartition, 
                              caisseSociale: { 
                                ancienSolde: val, 
                                nouveauSolde: val + (netMensuel * data.config.defaultSocialePercent / 100)
                              } 
                            } 
                          })
                        }}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-blue-500 uppercase font-bold">Nouveau Solde</span>
                      <span className="font-bold text-lg text-blue-600">{currentRecord.repartition.caisseSociale.nouveauSolde.toLocaleString()} FCFA</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="font-bold text-slate-600 border-b pb-1">Comité Directeur ({data.config.defaultComitePercent}%)</p>
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 uppercase font-bold">Ancien Solde</span>
                      <input 
                        type="number"
                        className="font-semibold text-slate-700 border-none p-0 focus:ring-0"
                        value={currentRecord.repartition.comiteDirecteur.ancienSolde}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          handleUpdateRecord({ 
                            repartition: { 
                              ...currentRecord.repartition, 
                              comiteDirecteur: { 
                                ancienSolde: val, 
                                nouveauSolde: val + (netMensuel * data.config.defaultComitePercent / 100)
                              } 
                            } 
                          })
                        }}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-indigo-500 uppercase font-bold">Nouveau Solde</span>
                      <span className="font-bold text-lg text-indigo-600">{currentRecord.repartition.comiteDirecteur.nouveauSolde.toLocaleString()} FCFA</span>
                    </div>
                  </div>
               </div>
               
               <div className="mt-8 p-4 bg-emerald-50 rounded-xl text-emerald-800 text-sm italic no-print">
                 Note: La répartition est calculée automatiquement sur le Net Mensuel ({netMensuel.toLocaleString()} FCFA) selon les pourcentages définis dans la configuration.
               </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default MonthManager;
