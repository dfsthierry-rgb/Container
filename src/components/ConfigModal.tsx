import React, { useState } from 'react';
import { Settings, X, Plug, Save, PowerOff, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { testSheetConnection } from '../utils/sheets';

interface ConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUrl: string;
    onSave: (url: string) => void;
}

export default function ConfigModal({ isOpen, onClose, currentUrl, onSave }: ConfigModalProps) {
    const [url, setUrl] = useState(currentUrl);
    const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleTest = async () => {
        if (!url) return;
        setStatus('testing');
        try {
            await testSheetConnection(url);
            setStatus('success');
        } catch (e: any) {
            setStatus('error');
            setErrorMsg(e.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
                <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center"><Settings className="text-indigo-400 w-5 h-5"/></div>
                        <div>
                            <h2 className="text-xl font-black text-white">Configurar Google Sheets</h2>
                            <p className="text-xs text-slate-400">Conecte com sua planilha</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-6 h-6"/></button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-400">URL da API do Google Sheets</label>
                        <input 
                            type="text" 
                            value={url} 
                            onChange={e => setUrl(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 text-sm focus:border-indigo-500 outline-none"
                            placeholder="https://script.google.com/macros/s/.../exec"
                        />
                    </div>
                    
                    {status === 'testing' && <p className="text-amber-400 text-sm flex items-center"><Info className="w-4 h-4 mr-2"/>Testando conexão...</p>}
                    {status === 'success' && <p className="text-emerald-400 text-sm flex items-center"><CheckCircle className="w-4 h-4 mr-2"/>Conexão bem-sucedida!</p>}
                    {status === 'error' && <p className="text-red-400 text-sm flex items-center"><AlertTriangle className="w-4 h-4 mr-2"/>Erro: {errorMsg}</p>}
                </div>

                <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/90 flex justify-end gap-3">
                    <button onClick={handleTest} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl flex items-center text-sm font-bold"><Plug className="w-4 h-4 mr-2"/> Testar</button>
                    <button onClick={() => onSave(url)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center text-sm font-bold"><Save className="w-4 h-4 mr-2"/> Salvar e Conectar</button>
                </div>
                <div className="px-6 py-3 border-t border-slate-700 bg-slate-800/50">
                    <button onClick={() => onSave('')} className="w-full text-xs text-slate-400 hover:text-red-400 py-2 transition-colors flex justify-center items-center"><PowerOff className="w-3 h-3 mr-2"/>Desconectar e Usar Modo Offline</button>
                </div>
            </div>
        </div>
    );
}
