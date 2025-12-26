
import React, { useState, useMemo } from 'react';
import { AppData, MonthlyRecord } from '../types';
import { Search as SearchIcon, Calendar, User, DollarSign, ArrowRight } from 'lucide-react';

interface SearchModuleProps {
  data: AppData;
}

const SearchModule: React.FC<SearchModuleProps> = ({ data }) => {
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const results: any[] = [];
    const lowerQuery = query.toLowerCase();

    Object.values(data.records).forEach((record: MonthlyRecord) => {
      // Search in cotisations
      record.cotisations.forEach(c => {
        if (c.prenom.toLowerCase().includes(lowerQuery) || c.nom.toLowerCase().includes(lowerQuery)) {
          results.push({
            type: 'Cotisation',
            name: `${c.prenom} ${c.nom}`,
            amount: c.montant,
            period: `${record.month} ${record.year}`
          });
        }
      });

      // Search in other sums
      record.autresSommes.forEach(s => {
        if (s.source.toLowerCase().includes(lowerQuery)) {
          results.push({
            type: 'Autre Recette',
            name: s.source,
            amount: s.montant,
            period: `${record.month} ${record.year}`
          });
        }
      });

      // Search in expenses
      record.depenses.forEach(d => {
        if (d.designation.toLowerCase().includes(lowerQuery)) {
          results.push({
            type: 'Dépense',
            name: d.designation,
            amount: d.total,
            period: `${record.month} ${record.year}`
          });
        }
      });
    });

    return results;
  }, [query, data.records]);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher un membre, une source ou une dépense..."
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-lg focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <p className="text-center text-slate-400 text-sm mt-4">Tapez un nom, un motif ou une source pour filtrer les données.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {searchResults.map((result, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                result.type === 'Cotisation' ? 'bg-emerald-100 text-emerald-700' :
                result.type === 'Dépense' ? 'bg-rose-100 text-rose-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {result.type}
              </span>
              <div className="flex items-center gap-1 text-slate-400 text-xs">
                 <Calendar size={14} />
                 <span>{result.period}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User size={18} className="text-slate-400" />
                <h4 className="font-bold text-slate-800 text-lg line-clamp-1">{result.name}</h4>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xl">
                  <DollarSign size={20} />
                  <span>{result.amount.toLocaleString()} FCFA</span>
                </div>
                <ArrowRight className="text-slate-200 group-hover:text-emerald-500 transition-colors" />
              </div>
            </div>
          </div>
        ))}
        {query && searchResults.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-100">
             <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon size={32} />
             </div>
             <p className="text-slate-500 font-medium">Aucun résultat trouvé pour "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModule;
