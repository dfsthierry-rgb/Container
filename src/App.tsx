import React, { useState, useEffect, useMemo } from 'react';
import { Ship, Plus, Filter, Download, FileText, Database, HardDrive, RefreshCw } from 'lucide-react';
import { Lancamento } from './types';
import { getData, saveData, loadConfigUrl, saveConfigUrl } from './utils/storage';
import { syncFromSheets, syncToSheets } from './utils/sheets';
import { getBestDate, makeDate } from './utils/dateUtils';
import { exportToExcel, exportToPDF } from './utils/exportUtils';
import Dashboard from './components/Dashboard';
import LancamentoModal from './components/LancamentoModal';
import ConfigModal from './components/ConfigModal';

export default function App() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // Filters
  const [fAno, setFAno] = useState('');
  const [fMes, setFMes] = useState('');
  const [fTipo, setFTipo] = useState('');
  const [fExp, setFExp] = useState('');

  const [status, setStatus] = useState<'online' | 'offline' | 'syncing'>('offline');
  const [sheetsUrl, setSheetsUrl] = useState('');

  useEffect(() => {
    const url = loadConfigUrl();
    setSheetsUrl(url);
    setStatus(url ? 'online' : 'offline');
    
    // Initial load from local storage
    const localData = getData();
    setLancamentos(localData);

    if (url) {
      handleSync(url);
    }
  }, []);

  const handleSync = async (url: string) => {
    setStatus('syncing');
    try {
      const data = await syncFromSheets(url);
      setLancamentos(data);
      saveData(data);
      setStatus('online');
    } catch (e: any) {
      console.warn('Sync warning:', e.message || e);
      setStatus('offline');
    }
  };

  const filteredLancamentos = useMemo(() => {
    const withIdx = lancamentos.map((l, idx) => ({ ...l, _idx: idx }));
    let filtered = withIdx;
    if (fAno || fMes || fTipo || fExp) {
      filtered = withIdx.filter(l => {
        const d = getBestDate(l);
        if (fTipo && l.tipo_container !== fTipo) return false;
        if (fExp) {
          const exp = (l.exportadores || '').toLowerCase();
          if (!exp.includes(fExp.toLowerCase())) return false;
        }
        if (!d) return !fAno && !fMes;
        if (fAno && d.getFullYear().toString() !== fAno) return false;
        if (fMes && String(d.getMonth() + 1).padStart(2, '0') !== fMes) return false;
        return true;
      });
    }
    return filtered.sort((a, b) => {
      const da = makeDate(a.data_desembaraco)?.getTime() || getBestDate(a)?.getTime() || 0;
      const db = makeDate(b.data_desembaraco)?.getTime() || getBestDate(b)?.getTime() || 0;
      return db - da;
    });
  }, [lancamentos, fAno, fMes, fTipo, fExp]);

  const { anos, exportadores } = useMemo(() => {
    const anosSet = new Set<number>();
    const expSet = new Set<string>();
    lancamentos.forEach(l => {
      const d = getBestDate(l);
      if (d) {
        const ano = d.getFullYear();
        if (ano > 1900 && ano < 2100) anosSet.add(ano);
      }
      if (l.exportadores) {
        l.exportadores.split(/\n|,|;/).map(e => e.trim()).filter(Boolean).forEach(e => expSet.add(e));
      }
    });
    return {
      anos: Array.from(anosSet).sort().reverse(),
      exportadores: Array.from(expSet).sort((a, b) => a.localeCompare(b))
    };
  }, [lancamentos]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Ship className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black text-white">
                  Container Calculator <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded ml-2">v2.0</span>
                </h1>
                <p className="text-xs text-slate-400">Gestão de Lançamentos - Com Exportação</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg cursor-pointer" onClick={() => setIsConfigOpen(true)}>
                <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : status === 'syncing' ? 'bg-amber-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-xs text-slate-400">
                  {status === 'online' ? 'Online' : status === 'syncing' ? 'Sincronizando...' : 'Offline'}
                </span>
                {status === 'online' ? <Database className="w-4 h-4 text-emerald-400 ml-1" /> : <HardDrive className="w-4 h-4 text-slate-400 ml-1" />}
              </div>
              <button onClick={() => { setEditingIndex(null); setIsModalOpen(true); }} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center gap-2 flex-shrink-0">
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Novo Lançamento</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-slate-800/60 border-b border-slate-700 sticky top-[88px] z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase flex items-center"><Filter className="w-3 h-3 mr-1"/>Filtros:</span>
              <select value={fAno} onChange={e => setFAno(e.target.value)} className="bg-slate-800 border border-slate-600 text-white rounded-lg py-2 px-3 text-sm min-w-[100px] outline-none focus:border-indigo-500">
                <option value="">Todos os Anos</option>
                {anos.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <select value={fMes} onChange={e => setFMes(e.target.value)} className="bg-slate-800 border border-slate-600 text-white rounded-lg py-2 px-3 text-sm min-w-[120px] outline-none focus:border-indigo-500">
                <option value="">Todos os Meses</option>
                <option value="01">Janeiro</option><option value="02">Fevereiro</option><option value="03">Março</option>
                <option value="04">Abril</option><option value="05">Maio</option><option value="06">Junho</option>
                <option value="07">Julho</option><option value="08">Agosto</option><option value="09">Setembro</option>
                <option value="10">Outubro</option><option value="11">Novembro</option><option value="12">Dezembro</option>
              </select>
              <select value={fTipo} onChange={e => setFTipo(e.target.value)} className="bg-slate-800 border border-slate-600 text-white rounded-lg py-2 px-3 text-sm min-w-[100px] outline-none focus:border-indigo-500">
                <option value="">Todos os Tipos</option>
                <option value="FCL">FCL</option>
                <option value="LCL">LCL</option>
              </select>
              <select value={fExp} onChange={e => setFExp(e.target.value)} className="bg-slate-800 border border-slate-600 text-white rounded-lg py-2 px-3 text-sm min-w-[160px] outline-none focus:border-indigo-500">
                <option value="">Todos os Exportadores</option>
                {exportadores.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
              <button onClick={() => { setFAno(''); setFMes(''); setFTipo(''); setFExp(''); }} className="text-xs text-slate-400 hover:text-white transition-colors px-2">
                Limpar
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">{filteredLancamentos.length} lançamentos</span>
              <button onClick={() => handleSync(sheetsUrl)} disabled={!sheetsUrl || status === 'syncing'} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                <RefreshCw className={`w-3 h-3 mr-1 ${status === 'syncing' ? 'animate-spin' : ''}`} /> Sincronizar
              </button>
              <button onClick={() => exportToExcel(filteredLancamentos)} className="text-xs bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-3 py-1.5 rounded-lg transition-colors flex items-center">
                <Download className="w-3 h-3 mr-1" /> Excel
              </button>
              <button onClick={() => exportToPDF(filteredLancamentos)} className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1.5 rounded-lg transition-colors flex items-center">
                <FileText className="w-3 h-3 mr-1" /> PDF
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Dashboard 
          lancamentos={filteredLancamentos} 
          onEdit={(idx) => { setEditingIndex(idx); setIsModalOpen(true); }}
          onDelete={(idx) => {
            if (confirm('Excluir este lançamento?')) {
              const newLancs = [...lancamentos];
              newLancs.splice(idx, 1);
              setLancamentos(newLancs);
              saveData(newLancs);
              if (sheetsUrl) {
                setStatus('syncing');
                syncToSheets(sheetsUrl, newLancs)
                  .then(() => setStatus('online'))
                  .catch(e => {
                    console.warn('Sync warning on delete:', e);
                    setStatus('offline');
                  });
              }
            }
          }}
        />
      </main>

      {isModalOpen && (
        <LancamentoModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          lancamento={editingIndex !== null ? lancamentos[editingIndex] : undefined}
          onSave={(data) => {
            const newLancs = [...lancamentos];
            if (editingIndex !== null) {
              newLancs[editingIndex] = data;
            } else {
              newLancs.push(data);
            }
            setLancamentos(newLancs);
            saveData(newLancs);
            setIsModalOpen(false);
            if (sheetsUrl) {
              setStatus('syncing');
              syncToSheets(sheetsUrl, newLancs)
                .then(() => setStatus('online'))
                .catch(e => {
                  console.warn('Sync warning on save:', e);
                  setStatus('offline');
                });
            }
          }}
        />
      )}

      {isConfigOpen && (
        <ConfigModal 
          isOpen={isConfigOpen} 
          onClose={() => setIsConfigOpen(false)}
          currentUrl={sheetsUrl}
          onSave={(url) => {
            setSheetsUrl(url);
            saveConfigUrl(url);
            if (url) handleSync(url);
            else setStatus('offline');
            setIsConfigOpen(false);
          }}
        />
      )}
    </div>
  );
}
