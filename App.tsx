
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Settings, 
  Database, 
  Search as SearchIcon, 
  Menu,
  X,
  Download
} from 'lucide-react';
import MonthManager from './components/MonthManager';
import Configuration from './components/Configuration';
import DataBrowser from './components/DataBrowser';
import SearchModule from './components/SearchModule';
import Dashboard from './components/Dashboard';
import { AppData } from './types';

const INITIAL_DATA: AppData = {
  records: {},
  config: {
    location: '',
    phone: '',
    email: '',
    logo: '',
    defaultRenovationPercent: 40,
    defaultSocialePercent: 30,
    defaultComitePercent: 30,
    members: []
  }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'months' | 'config' | 'database' | 'search'>('dashboard');
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('daara_maha_data');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem('daara_maha_data', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const updateData = (newData: AppData) => setData(newData);

  const navigation = [
    { id: 'dashboard', name: 'Tableau de Bord', icon: LayoutDashboard },
    { id: 'months', name: 'Gestion des Mois', icon: CalendarDays },
    { id: 'search', name: 'Recherche', icon: SearchIcon },
    { id: 'database', name: 'Base de données', icon: Database },
    { id: 'config', name: 'Configuration', icon: Settings },
  ] as const;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-emerald-900 text-white transition-all duration-300 flex flex-col h-full shadow-xl z-20`}
      >
        <div className="p-4 flex items-center justify-between border-b border-emerald-800">
          <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
            {data.config.logo ? (
              <img src={data.config.logo} alt="Logo" className="w-10 h-10 rounded-full object-cover border-2 border-emerald-400 shadow-inner bg-white" />
            ) : (
              <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center font-bold text-xl shadow-inner text-emerald-900">D</div>
            )}
            <span className="font-bold text-sm whitespace-nowrap">DAARA MAHA</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-emerald-800 rounded-lg transition-colors">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-emerald-600 text-white shadow-lg' 
                  : 'text-emerald-100 hover:bg-emerald-800'
              }`}
            >
              <item.icon size={22} className={activeTab === item.id ? 'scale-110 transition-transform' : ''} />
              {isSidebarOpen && <span className="font-medium">{item.name}</span>}
            </button>
          ))}

          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-amber-500 text-white mt-4 shadow-lg animate-pulse"
            >
              <Download size={22} />
              {isSidebarOpen && <span className="font-bold">Installer l'App</span>}
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-emerald-800 text-xs text-emerald-300 text-center">
          {isSidebarOpen && <p>&copy; 2024 Daara Maha Jumoohi</p>}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-slate-50">
        <header className="bg-white border-b sticky top-0 z-10 p-4 flex justify-between items-center shadow-sm no-print">
          <h1 className="text-xl font-bold text-slate-800 uppercase tracking-wide">
            {navigation.find(n => n.id === activeTab)?.name}
          </h1>
          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
                <p className="text-xs text-slate-500 font-medium">{data.config.location || 'Gestion des Mensualités'}</p>
                <p className="text-sm font-semibold text-emerald-700">Admin</p>
             </div>
             <div className="w-10 h-10 bg-emerald-100 rounded-full overflow-hidden flex items-center justify-center border border-emerald-200 shadow-sm">
                {data.config.logo ? (
                  <img src={data.config.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <LayoutDashboard size={20} className="text-emerald-700" />
                )}
             </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard data={data} onUpdate={updateData} />}
          {activeTab === 'months' && <MonthManager data={data} onUpdate={updateData} />}
          {activeTab === 'search' && <SearchModule data={data} />}
          {activeTab === 'database' && <DataBrowser data={data} onUpdate={updateData} />}
          {activeTab === 'config' && <Configuration data={data} onUpdate={updateData} />}
        </div>
      </main>
    </div>
  );
};

export default App;
