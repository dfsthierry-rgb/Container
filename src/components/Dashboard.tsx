import React, { useRef, useMemo } from 'react';
import { Lancamento } from '../types';
import { computeLanc } from '../utils/calculations';
import { getBestDate } from '../utils/dateUtils';
import { fmt, parseNum } from '../utils/numberUtils';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend, Filler } from 'chart.js';
import { Line, Chart as ReactChart } from 'react-chartjs-2';
import { TreemapController, TreemapElement } from 'chartjs-chart-treemap';
import { Layers, Package, Truck, Receipt, Anchor, UserCheck, Wallet, Clock, Hourglass, CalendarCheck, Edit, Trash2, Ship } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend, Filler, TreemapController, TreemapElement);

interface DashboardProps {
    lancamentos: Lancamento[];
    onEdit: (idx: number) => void;
    onDelete: (idx: number) => void;
}

function linearRegression(data: number[]) {
    const n = data.length;
    if (n < 2) return data;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) { sumX += i; sumY += data[i]; sumXY += i * data[i]; sumX2 += i * i; }
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return data.map((_, i) => Math.max(0, intercept + slope * i));
}

export default function Dashboard({ lancamentos, onEdit, onDelete }: DashboardProps) {

    const chartRef = useRef(null);

    const stats = useMemo(() => {
        let tProd = 0, tLog = 0, tTrib = 0, tDA = 0, tDesp = 0, tGeral = 0, tFator = 0, cFator = 0;
        let sEC = 0, sCD = 0, sED = 0, cEC = 0, cCD = 0, cED = 0;
        let tCIF = 0, tVA = 0, tCambio = 0, cCambio = 0;
        
        const porMes: Record<string, any> = {};

        lancamentos.forEach(l => {
            const c = computeLanc(l);
            tProd += c.fob_real; tLog += c.logistica; tTrib += c.tributos; tDA += c.desp_adu; tDesp += c.despachante; tGeral += c.total;
            if (c.fator > 0) { tFator += c.fator; cFator++; }
            if (c.diasEC > 0) { sEC += c.diasEC; cEC++; }
            if (c.diasCD > 0) { sCD += c.diasCD; cCD++; }
            if (c.diasED > 0) { sED += c.diasED; cED++; }

            const cambioVal = parseNum(l.cambio);
            if (cambioVal > 0) { tCambio += cambioVal; cCambio++; }
            tCIF += c.cif;
            tVA += c.valor_aduaneiro;

            const d = getBestDate(l);
            if (d) {
                const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                if (!porMes[chave]) porMes[chave] = { prod: 0, log: 0, trib: 0, da: 0, desp: 0, cambioSum: 0, cambioCount: 0, count: 0 };
                porMes[chave].prod += c.fob_real; porMes[chave].log += c.logistica; porMes[chave].trib += c.tributos;
                porMes[chave].da += c.desp_adu; porMes[chave].desp += c.despachante;
                porMes[chave].count++;
                if (cambioVal > 0) { porMes[chave].cambioSum += cambioVal; porMes[chave].cambioCount++; }
            }
        });

        const n = lancamentos.length;
        
        return {
            tProd, tLog, tTrib, tDA, tDesp, tGeral,
            mediaProd: n ? tProd / n : 0, mediaLog: n ? tLog / n : 0, mediaTrib: n ? tTrib / n : 0, mediaDA: n ? tDA / n : 0, mediaDesp: n ? tDesp / n : 0,
            tCIF, tVA,
            fatorMedio: cFator > 0 ? tFator / cFator : 0,
            diasEC: cEC > 0 ? sEC / cEC : 0,
            diasCD: cCD > 0 ? sCD / cCD : 0,
            diasED: cED > 0 ? sED / cED : 0,
            dolarMedio: cCambio > 0 ? tCambio / cCambio : 0,
            porMes
        };
    }, [lancamentos]);

    const { tProd, tLog, tTrib, tDA, tDesp, tGeral, tCIF, tVA, fatorMedio } = stats;

    const renderCard = (icon: any, color: string, title: string, total: number, media: number, itemsList: any) => {
        const pct = tProd > 0 ? ((total / tProd) * 100).toFixed(1) : '0';
        return (
            <div className={`bg-gradient-to-br border rounded-2xl overflow-hidden shadow-sm`} style={{ borderColor: `${color}40`, backgroundImage: `linear-gradient(to bottom right, ${color}33, ${color}1a)` }}>
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}33`, color: color }}>
                            {icon}
                        </div>
                        <span className="text-xs font-bold uppercase" style={{ color }}>{title}</span>
                    </div>
                    <p className="text-2xl font-black mb-1" style={{ color }}>{fmt.format(total)}</p>
                    <p className="text-[11px] text-slate-400">Média: <span className="font-bold" style={{ color }}>{fmt.format(media)}</span></p>
                    <p className="text-[11px] font-bold mt-1" style={{ color }}>{pct}% do FOB</p>
                </div>
            </div>
        );
    };

    const chartData = useMemo(() => {
        const meses = Object.keys(stats.porMes).sort();
        const nomesMes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
        const labels = meses.map(m => { const [a, mes] = m.split('-'); return `${nomesMes[parseInt(mes)-1]}/${a.slice(2)}`; });

        const prodData = meses.map(m => stats.porMes[m].count > 0 ? stats.porMes[m].prod / stats.porMes[m].count : 0);
        const logData = meses.map(m => stats.porMes[m].count > 0 ? stats.porMes[m].log / stats.porMes[m].count : 0);
        const tribData = meses.map(m => stats.porMes[m].count > 0 ? stats.porMes[m].trib / stats.porMes[m].count : 0);
        const daData = meses.map(m => stats.porMes[m].count > 0 ? stats.porMes[m].da / stats.porMes[m].count : 0);
        const despData = meses.map(m => stats.porMes[m].count > 0 ? stats.porMes[m].desp / stats.porMes[m].count : 0);
        const dolarData = meses.map(m => stats.porMes[m].cambioCount > 0 ? stats.porMes[m].cambioSum / stats.porMes[m].cambioCount : 0);

        const trendProd = linearRegression(prodData);
        const trendLog = linearRegression(logData);
        const trendTrib = linearRegression(tribData);
        const trendDA = linearRegression(daData);
        const trendDesp = linearRegression(despData);

        return {
            lineData: {
                labels,
                datasets: [
                    { label: 'Produtos', data: prodData, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)', fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#10b981', yAxisID: 'y' },
                    { label: 'Tend. Produtos', data: trendProd, borderColor: '#10b981', backgroundColor: 'transparent', fill: false, borderDash: [8, 4], borderWidth: 1.5, pointRadius: 0, pointHitRadius: 0, yAxisID: 'y' },
                    { label: 'Logística', data: logData, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#3b82f6', yAxisID: 'y' },
                    { label: 'Tend. Logística', data: trendLog, borderColor: '#3b82f6', backgroundColor: 'transparent', fill: false, borderDash: [8, 4], borderWidth: 1.5, pointRadius: 0, pointHitRadius: 0, yAxisID: 'y' },
                    { label: 'Tributos', data: tribData, borderColor: '#a855f7', backgroundColor: 'rgba(168,85,247,0.08)', fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#a855f7', yAxisID: 'y' },
                    { label: 'Tend. Tributos', data: trendTrib, borderColor: '#a855f7', backgroundColor: 'transparent', fill: false, borderDash: [8, 4], borderWidth: 1.5, pointRadius: 0, pointHitRadius: 0, yAxisID: 'y' },
                    { label: 'Desp. Aduan.', data: daData, borderColor: '#06b6d4', backgroundColor: 'rgba(6,182,212,0.08)', fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#06b6d4', yAxisID: 'y' },
                    { label: 'Tend. Desp. Aduan.', data: trendDA, borderColor: '#06b6d4', backgroundColor: 'transparent', fill: false, borderDash: [8, 4], borderWidth: 1.5, pointRadius: 0, pointHitRadius: 0, yAxisID: 'y' },
                    { label: 'Despachante', data: despData, borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.08)', fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#f97316', yAxisID: 'y' },
                    { label: 'Tend. Despachante', data: trendDesp, borderColor: '#f97316', backgroundColor: 'transparent', fill: false, borderDash: [8, 4], borderWidth: 1.5, pointRadius: 0, pointHitRadius: 0, yAxisID: 'y' }
                ]
            },
            treeData: {
                datasets: [{
                    tree: [
                        { cat: 'Produtos', val: tProd, color: '#10b981' },
                        { cat: 'Logística', val: tLog, color: '#3b82f6' },
                        { cat: 'Tributos', val: tTrib, color: '#a855f7' },
                        { cat: 'Desp. Aduan.', val: tDA, color: '#06b6d4' },
                        { cat: 'Despachante', val: tDesp, color: '#f97316' }
                    ].filter(d => d.val > 0),
                    key: 'val',
                    groups: ['cat'],
                    backgroundColor: (ctx: any) => {
                        const arr = [
                            { cat: 'Produtos', val: tProd, color: '#10b981' },
                            { cat: 'Logística', val: tLog, color: '#3b82f6' },
                            { cat: 'Tributos', val: tTrib, color: '#a855f7' },
                            { cat: 'Desp. Aduan.', val: tDA, color: '#06b6d4' },
                            { cat: 'Despachante', val: tDesp, color: '#f97316' }
                        ].filter(d => d.val > 0);
                        return arr[ctx.dataIndex]?.color || '#334155';
                    },
                    borderColor: '#0f172a',
                    borderWidth: 3,
                    borderRadius: 10,
                    spacing: 4,
                    labels: {
                        display: true,
                        color: '#ffffff',
                        font: [{ size: 14, weight: 'bold' }],
                        formatter: (ctx: any) => {
                            if (!ctx.raw || !ctx.raw._data) return '';
                            const totalAll = tProd + tLog + tTrib + tDA + tDesp;
                            const item = ctx.raw._data;
                            const pct = totalAll > 0 ? (item.val / totalAll * 100).toFixed(1) : 0;
                            return [item.cat, fmt.format(item.val), pct + '%'];
                        }
                    }
                }]
            }
        };
    }, [stats]);

    return (
        <div>
            <section className="mb-6">
                <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-white">Tendência de Custos Médios por Mês</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Dólar Médio:</span>
                            <span className="text-sm font-bold text-yellow-400">R$ {stats.dolarMedio.toFixed(4).replace('.', ',')}</span>
                        </div>
                    </div>
                    <div className="h-80">
                        <Line data={chartData.lineData} options={{
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 }, filter: (item: any) => !item.text.includes('Tend.') } } },
                            scales: {
                                x: { ticks: { color: '#64748b' }, grid: { color: '#334155' } },
                                y: { ticks: { color: '#64748b' }, grid: { color: '#334155' } }
                            }
                        }} />
                    </div>
                </div>
            </section>
            
            <section className="mb-6">
                <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
                    <h3 className="text-sm font-bold text-white mb-4">Hierarquia de Custos</h3>
                    <div className="h-72">
                        <ReactChart type="treemap" data={chartData.treeData as any} options={{
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { display: false } }
                        }} />
                    </div>
                </div>
            </section>

            {/* Composicao */}
            <section className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0"><Layers className="text-indigo-400 w-4 h-4" /></div>
                    <h2 className="text-lg font-black text-white">Composição de Custos</h2>
                </div>

                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {renderCard(<Package className="w-4 h-4" />, '#10b981', 'Produtos (FOB R$)', tProd, stats.mediaProd, [])}
                    {renderCard(<Truck className="w-4 h-4" />, '#3b82f6', 'Logística', tLog, stats.mediaLog, [])}
                    {renderCard(<Receipt className="w-4 h-4" />, '#a855f7', 'Tributos', tTrib, stats.mediaTrib, [])}
                    {renderCard(<Anchor className="w-4 h-4" />, '#06b6d4', 'Desp. Aduaneiras', tDA, stats.mediaDA, [])}
                    {renderCard(<UserCheck className="w-4 h-4" />, '#f97316', 'Despachante', tDesp, stats.mediaDesp, [])}
                    
                    {/* Total Geral */}
                    <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-500/30 rounded-2xl p-4">
                         <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center text-pink-400"><Wallet className="w-4 h-4"/></div>
                            <span className="text-xs text-pink-400 font-bold uppercase">Total Geral</span>
                        </div>
                        <p className="text-3xl font-black text-pink-400 mb-1">{fmt.format(tGeral)}</p>
                        <p className="text-[11px] text-pink-400 font-bold mt-1">{tProd > 0 ? ((tGeral / tProd) * 100).toFixed(1) : 0}% do FOB</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border-2 border-amber-500/30 rounded-xl p-4 text-center">
                        <span className="text-xs font-bold text-amber-400 uppercase">Fator Médio</span>
                        <p className="text-2xl font-black text-amber-400 mt-1">{fatorMedio.toFixed(3)}</p>
                    </div>
                    <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border-2 border-emerald-500/30 rounded-xl p-4 text-center">
                        <span className="text-xs font-bold text-emerald-400 uppercase">CIF Total</span>
                        <p className="text-2xl font-black text-emerald-400 mt-1">{fmt.format(tCIF)}</p>
                    </div>
                    <div className="bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border-2 border-teal-500/30 rounded-xl p-4 text-center">
                        <span className="text-xs font-bold text-teal-400 uppercase">Valor Aduaneiro Total</span>
                        <p className="text-2xl font-black text-teal-400 mt-1">{fmt.format(tVA)}</p>
                    </div>
                </div>
            </section>

            {/* Tempos Medios */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-500/30 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2 text-indigo-400">
                        <Clock className="w-5 h-5"/>
                        <span className="text-[10px] font-medium truncate">TEMPO MÉDIO EMB → CHEG</span>
                    </div>
                    <p className="text-xl font-black text-indigo-400">{stats.diasEC.toFixed(1)} dias</p>
                </div>
                <div className="bg-gradient-to-br from-teal-500/20 to-teal-600/10 border border-teal-500/30 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2 text-teal-400">
                        <Hourglass className="w-5 h-5"/>
                        <span className="text-[10px] font-medium truncate">TEMPO MÉDIO CHEG → DESEMB</span>
                    </div>
                    <p className="text-xl font-black text-teal-400">{stats.diasCD.toFixed(1)} dias</p>
                </div>
                <div className="bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/30 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2 text-violet-400">
                        <CalendarCheck className="w-5 h-5"/>
                        <span className="text-[10px] font-medium truncate">TEMPO MÉDIO EMB → DESEMB</span>
                    </div>
                    <p className="text-xl font-black text-violet-400">{stats.diasED.toFixed(1)} dias</p>
                </div>
            </section>

            {/* List */}
            <section className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
                <div className="px-4 py-4 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0"><Layers className="text-indigo-400 w-5 h-5" /></div>
                        <div>
                            <h2 className="text-xl font-black text-white">Lançamentos</h2>
                            <p className="text-xs text-slate-400">{lancamentos.length} lançamentos registrados</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 max-h-[500px] overflow-y-auto">
                    {!lancamentos.length ? (
                        <div className="text-center py-12">
                            <Ship className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400 text-lg">Nenhum lançamento ainda</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {lancamentos.map((l) => {
                                const realIdx = l._idx !== undefined ? l._idx : 0;
                                const c = computeLanc(l);
                                const ref = (l.ref_montreal || `#${realIdx + 1}`).substring(0, 25);
                                const exp = (l.exportadores || 'N/D').substring(0, 20);
                                return (
                                    <div key={realIdx} onClick={() => onEdit(realIdx)} className="bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600 hover:border-indigo-500/50 rounded-xl p-4 cursor-pointer transition-colors">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-full">{l.tipo_container || 'N/D'}</span>
                                                    <span className="text-xs text-slate-400">DI: {l.di || 'N/D'}</span>
                                                </div>
                                                <h4 className="font-bold text-white text-sm truncate">{ref}</h4>
                                                <p className="text-xs text-slate-400 truncate">Exp: {exp}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-xl font-black text-emerald-400">{fmt.format(c.total)}</p>
                                                    <p className="text-xs font-bold text-amber-400">Fator: {c.fator.toFixed(3)}</p>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); onEdit(realIdx); }} className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 rounded-lg"><Edit className="w-4 h-4"/></button>
                                                    <button onClick={(e) => { e.stopPropagation(); onDelete(realIdx); }} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
