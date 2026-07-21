import React, { useState, useEffect } from 'react';
import { Lancamento, HEADERS, DATE_FIELDS, NUMERIC_FIELDS } from '../types';
import { X, Save, ClipboardList, DollarSign, Calculator, BarChart3, AlertTriangle, Layers } from 'lucide-react';
import { parseNum, fmt } from '../utils/numberUtils';
import { parseDate } from '../utils/dateUtils';
import { computeLanc } from '../utils/calculations';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    lancamento?: Lancamento;
    onSave: (data: Lancamento) => void;
}

export default function LancamentoModal({ isOpen, onClose, lancamento, onSave }: Props) {
    const [tab, setTab] = useState<'dados' | 'valores' | 'tributos' | 'resumo'>('dados');
    const [form, setForm] = useState<Partial<Lancamento>>({});

    useEffect(() => {
        if (lancamento) {
            const initial: any = { ...lancamento };
            DATE_FIELDS.forEach(f => {
                if (initial[f]) initial[f] = parseDate(initial[f]);
            });
            NUMERIC_FIELDS.forEach(f => {
                if (initial[f]) {
                    const num = parseNum(initial[f]);
                    initial[f] = num !== 0 ? String(num).replace('.', ',') : '';
                }
            });
            setForm(initial);
        } else {
            const hoje = new Date();
            setForm({
                data_registro: `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`
            });
        }
    }, [lancamento]);

    const handleSave = () => {
        const tipo = form.tipo_container;
        const fob = parseNum(form.fob_usd);
        const cambio = parseNum(form.cambio);

        if (!tipo || fob <= 0 || cambio <= 0) {
            alert('Preencha: Tipo, Câmbio e FOB (USD)!');
            return;
        }

        const data: any = { timestamp: form.timestamp || new Date().toISOString() };
        HEADERS.forEach(id => {
            if (id === 'timestamp') return;
            let val = (form as any)[id] || '';
            if (NUMERIC_FIELDS.includes(id)) {
                const num = parseNum(val);
                val = num !== 0 ? String(num) : '';
            }
            data[id] = val;
        });
        
        onSave(data as Lancamento);
    };

    const c = computeLanc(form as Lancamento);

    // Calculate Bases de Calculo expected
    const baseII = c.valor_aduaneiro;
    const baseIPI = c.valor_aduaneiro + parseNum(form.ii);
    const basePIS = c.valor_aduaneiro; // Under new rules PIS/COFINS is just VA. (Before it was complex)
    const baseCOFINS = c.valor_aduaneiro;
    const baseICMS = c.valor_aduaneiro + parseNum(form.ii) + parseNum(form.ipi) + parseNum(form.pis) + parseNum(form.cofins) + parseNum(form.siscomex) + parseNum(form.outras_da);

    const inputClass = "w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 text-sm focus:border-indigo-500 outline-none";
    const labelClass = "block text-xs font-semibold text-slate-400 mb-1";

    const renderInput = (id: string, label: string, type = 'text', placeholder = '', isNumeric = false) => (
        <div className="space-y-1">
            <label className={labelClass}>{label}</label>
            <input 
                type={type}
                inputMode={isNumeric ? 'decimal' : 'text'}
                value={(form as any)[id] || ''}
                onChange={e => setForm({ ...form, [id]: e.target.value })}
                className={`${inputClass} ${isNumeric ? 'text-right' : ''}`}
                placeholder={placeholder}
            />
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
            <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl my-4 flex flex-col max-h-[90vh]">
                <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 px-6 py-4 border-b border-slate-700 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center"><Layers className="text-indigo-400"/></div>
                        <div>
                            <h2 className="text-xl font-black text-white">{lancamento ? 'Editar Lançamento' : 'Novo Lançamento'}</h2>
                            <p className="text-xs text-slate-400">Preencha os dados do container</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-6 h-6"/></button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-slate-700">
                        <button onClick={() => setTab('dados')} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-all flex items-center shrink-0 ${tab === 'dados' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}><ClipboardList className="w-4 h-4 mr-2"/>Dados</button>
                        <button onClick={() => setTab('valores')} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-all flex items-center shrink-0 ${tab === 'valores' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}><DollarSign className="w-4 h-4 mr-2"/>Valores</button>
                        <button onClick={() => setTab('tributos')} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-all flex items-center shrink-0 ${tab === 'tributos' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}><Calculator className="w-4 h-4 mr-2"/>Tributos & Bases</button>
                        <button onClick={() => setTab('resumo')} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-all flex items-center shrink-0 ${tab === 'resumo' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}><BarChart3 className="w-4 h-4 mr-2"/>Resumo</button>
                    </div>

                    {tab === 'dados' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in">
                            <div className="space-y-1">
                                <label className={labelClass}>Tipo de Container *</label>
                                <select value={form.tipo_container || ''} onChange={e => setForm({...form, tipo_container: e.target.value})} className={inputClass}>
                                    <option value="">Selecione...</option><option value="FCL">FCL</option><option value="LCL">LCL</option>
                                </select>
                            </div>
                            {renderInput('data_desembaraco', 'Data de Desembaraço', 'date')}
                            {renderInput('ref_montreal', 'Ref. Montreal', 'text', 'Referência')}
                            {renderInput('data_embarque', 'Data de Embarque', 'date')}
                            {renderInput('data_chegada', 'Data Chegada', 'date')}
                            {renderInput('data_registro', 'Data do Registro', 'date')}
                            {renderInput('di', 'DI', 'text', 'Número da DI')}
                            <div className="space-y-1">
                                <label className={labelClass}>Incoterm</label>
                                <select value={form.incoterm || ''} onChange={e => setForm({...form, incoterm: e.target.value})} className={inputClass}>
                                    <option value="">Selecione...</option><option value="FOB">FOB</option><option value="CIF">CIF</option><option value="EXW">EXW</option><option value="FCA">FCA</option><option value="CPT">CPT</option>
                                </select>
                            </div>
                            {renderInput('procedencia', 'Procedência', 'text', 'País')}
                            {renderInput('navio', 'Navio', 'text', 'Nome')}
                            {renderInput('armador', 'Armador', 'text', 'Companhia')}
                            {renderInput('tipo_carga', 'Tipo de Carga', 'text', 'Tipo')}
                            {renderInput('local_embarque', 'Local de Embarque', 'text', 'Origem')}
                            {renderInput('local_nacionalizacao', 'Local de Nacionalização', 'text', 'Destino')}
                            <div className="sm:col-span-2 space-y-1">
                                <label className={labelClass}>Invoice(s)</label>
                                <textarea rows={2} value={form.invoices || ''} onChange={e => setForm({...form, invoices: e.target.value})} className={inputClass}></textarea>
                            </div>
                            <div className="sm:col-span-2 space-y-1">
                                <label className={labelClass}>Exportador(es)</label>
                                <textarea rows={2} value={form.exportadores || ''} onChange={e => setForm({...form, exportadores: e.target.value})} className={inputClass}></textarea>
                            </div>
                        </div>
                    )}

                    {tab === 'valores' && (
                        <div className="space-y-4 animate-in fade-in">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {renderInput('cambio', 'Câmbio (R$/USD) *', 'text', '0,00', true)}
                                {renderInput('fob_usd', 'FOB (USD) *', 'text', '0,00', true)}
                                <div className="space-y-1">
                                    <label className={labelClass}>FOB (R$)</label>
                                    <div className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-sm text-right font-bold text-emerald-400">{fmt.format(c.fob_real)}</div>
                                </div>
                                <div className="space-y-1">
                                    <label className={labelClass}>CIF (R$)</label>
                                    <div className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-sm text-right font-bold text-emerald-400">{fmt.format(c.cif)}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {renderInput('frete', 'Frete (R$)', 'text', '0,00', true)}
                                {renderInput('seguro', 'Seguro (R$)', 'text', '0,00', true)}
                                {renderInput('acrescimos', 'Acréscimos (R$)', 'text', '0,00', true)}
                                {renderInput('capatazia', 'Capatazia (R$)', 'text', '0,00', true)}
                            </div>
                            <div className="space-y-1">
                                <label className={labelClass}>Valor Aduaneiro (VA)</label>
                                <div className="w-full bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border-2 border-emerald-500/50 rounded-lg p-4 text-lg text-right font-black text-emerald-400">{fmt.format(c.valor_aduaneiro)}</div>
                            </div>
                        </div>
                    )}

                    {tab === 'tributos' && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-4">
                                <h3 className="text-sm font-bold text-indigo-400 mb-3 flex items-center"><Calculator className="w-4 h-4 mr-2"/>Tributos & Bases de Cálculo Esperadas</h3>
                                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                    <div className="space-y-1">
                                        <label className={labelClass}>Imp. Importação (II)</label>
                                        <input type="text" inputMode="decimal" value={form.ii || ''} onChange={e => setForm({...form, ii: e.target.value})} className={`${inputClass} text-right border-indigo-500/50`} placeholder="0,00" />
                                        <p className="text-[10px] text-slate-400 mt-1">Base (VA): <span className="text-slate-300">{fmt.format(baseII)}</span></p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelClass}>IPI</label>
                                        <input type="text" inputMode="decimal" value={form.ipi || ''} onChange={e => setForm({...form, ipi: e.target.value})} className={`${inputClass} text-right border-indigo-500/50`} placeholder="0,00" />
                                        <p className="text-[10px] text-slate-400 mt-1">Base (VA+II): <span className="text-slate-300">{fmt.format(baseIPI)}</span></p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelClass}>PIS</label>
                                        <input type="text" inputMode="decimal" value={form.pis || ''} onChange={e => setForm({...form, pis: e.target.value})} className={`${inputClass} text-right border-indigo-500/50`} placeholder="0,00" />
                                        <p className="text-[10px] text-slate-400 mt-1">Base (VA): <span className="text-slate-300">{fmt.format(basePIS)}</span></p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelClass}>COFINS</label>
                                        <input type="text" inputMode="decimal" value={form.cofins || ''} onChange={e => setForm({...form, cofins: e.target.value})} className={`${inputClass} text-right border-indigo-500/50`} placeholder="0,00" />
                                        <p className="text-[10px] text-slate-400 mt-1">Base (VA): <span className="text-slate-300">{fmt.format(baseCOFINS)}</span></p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelClass}>ICMS</label>
                                        <input type="text" inputMode="decimal" value={form.icms || ''} onChange={e => setForm({...form, icms: e.target.value})} className={`${inputClass} text-right border-indigo-500/50`} placeholder="0,00" />
                                        <p className="text-[10px] text-slate-400 mt-1" title="VA + II + IPI + PIS + COFINS + Siscomex + Outras DA">Base Estimada: <span className="text-slate-300">{fmt.format(baseICMS)}</span></p>
                                    </div>
                                </div>
                            </div>
                            
                            <h3 className="text-sm font-bold text-slate-400 mt-4 mb-2 border-b border-slate-700 pb-2">Despesas Aduaneiras</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {renderInput('afrmm', 'AFRMM (R$)', 'text', '0,00', true)}
                                {renderInput('siscomex', 'Siscomex (R$)', 'text', '0,00', true)}
                                {renderInput('armazenagem', 'Armazenagem (R$)', 'text', '0,00', true)}
                                {renderInput('desconsolidacao', 'Desconsolidação', 'text', '0,00', true)}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {renderInput('transp_interno', 'Transp. Interno (R$)', 'text', '0,00', true)}
                                {renderInput('liberacao', 'Liberação (R$)', 'text', '0,00', true)}
                                {renderInput('outras_da', 'Outras DA (R$)', 'text', '0,00', true)}
                                {renderInput('multa', 'Multa (R$)', 'text', '0,00', true)}
                            </div>

                            <h3 className="text-sm font-bold text-slate-400 mt-4 mb-2 border-b border-slate-700 pb-2">Despachante & Diversos</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {renderInput('hon_sda', 'Honorários SDA (R$)', 'text', '0,00', true)}
                                {renderInput('prest_serv', 'Prest. Serviços (R$)', 'text', '0,00', true)}
                                {renderInput('desp_div', 'Desp. Diversas (R$)', 'text', '0,00', true)}
                            </div>
                        </div>
                    )}

                    {tab === 'resumo' && (
                        <div className="space-y-4 animate-in fade-in">
                            <div className="bg-gradient-to-br from-yellow-500/20 to-amber-600/10 border-2 border-yellow-500/50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <DollarSign className="text-yellow-400 w-5 h-5"/>
                                    <span className="text-xs text-yellow-400/70 font-bold uppercase">Câmbio Utilizado</span>
                                </div>
                                <p className="text-3xl font-black text-yellow-400">R$ {parseNum(form.cambio).toFixed(4)}</p>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                                    <span className="text-[10px] text-emerald-400 font-bold uppercase">Produtos</span>
                                    <p className="text-lg font-black text-emerald-400">{fmt.format(c.fob_real)}</p>
                                </div>
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                                    <span className="text-[10px] text-blue-400 font-bold uppercase">Logística</span>
                                    <p className="text-lg font-black text-blue-400">{fmt.format(c.logistica)}</p>
                                </div>
                                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                                    <span className="text-[10px] text-purple-400 font-bold uppercase">Tributos</span>
                                    <p className="text-lg font-black text-purple-400">{fmt.format(c.tributos)}</p>
                                </div>
                                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                                    <span className="text-[10px] text-cyan-400 font-bold uppercase">Desp. Aduaneiras</span>
                                    <p className="text-lg font-black text-cyan-400">{fmt.format(c.desp_adu)}</p>
                                </div>
                                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                                    <span className="text-[10px] text-orange-400 font-bold uppercase">Despachante</span>
                                    <p className="text-lg font-black text-orange-400">{fmt.format(c.despachante)}</p>
                                </div>
                                <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4">
                                    <span className="text-[10px] text-pink-400 font-bold uppercase">Total</span>
                                    <p className="text-lg font-black text-pink-400">{fmt.format(c.total)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Totals */}
                <div className="px-6 py-4 border-t border-slate-700 bg-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between shrink-0">
                    <div className="flex items-center gap-4 text-left w-full sm:w-auto">
                        <div>
                            <span className="text-[10px] font-bold text-pink-400 uppercase">Total Geral</span>
                            <div className="text-xl font-black text-pink-400">{fmt.format(c.total)}</div>
                        </div>
                        <div className="w-px h-8 bg-slate-700 mx-2"></div>
                        <div>
                            <span className="text-[10px] font-bold text-amber-400 uppercase">Fator</span>
                            <div className="text-xl font-black text-amber-400">{c.fator.toFixed(3)}</div>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button onClick={onClose} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl flex items-center font-bold flex-1 sm:flex-none justify-center">Cancelar</button>
                        <button onClick={handleSave} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center font-bold flex-1 sm:flex-none justify-center"><Save className="w-5 h-5 mr-2"/> Salvar</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
