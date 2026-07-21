import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Lancamento } from '../types';
import { computeLanc } from './calculations';
import { fmt } from './numberUtils';

export function exportToExcel(lancamentos: Lancamento[]) {
    const data = lancamentos.map(l => {
        const calc = computeLanc(l);
        return {
            'Tipo de Container': l.tipo_container || '',
            'Data Desembaraço': l.data_desembaraco || '',
            'Ref. Montreal': l.ref_montreal || '',
            'Invoices': l.invoices || '',
            'Data Embarque': l.data_embarque || '',
            'Exportadores': l.exportadores || '',
            'Data Chegada': l.data_chegada || '',
            'Procedência': l.procedencia || '',
            'Navio': l.navio || '',
            'Tipo de Carga': l.tipo_carga || '',
            'Armador': l.armador || '',
            'Local Embarque': l.local_embarque || '',
            'Local Nacionalização': l.local_nacionalizacao || '',
            'DI': l.di || '',
            'Incoterm': l.incoterm || '',
            'Data Registro': l.data_registro || '',
            'Câmbio': l.cambio || 0,
            'FOB (USD)': l.fob_usd || 0,
            'Frete': l.frete || 0,
            'Seguro': l.seguro || 0,
            'Acréscimos': l.acrescimos || 0,
            'Capatazia': l.capatazia || 0,
            'II': l.ii || 0,
            'IPI': l.ipi || 0,
            'PIS': l.pis || 0,
            'COFINS': l.cofins || 0,
            'ICMS': l.icms || 0,
            'Multa': l.multa || 0,
            'AFRMM': l.afrmm || 0,
            'Siscomex': l.siscomex || 0,
            'Outras DA': l.outras_da || 0,
            'Armazenagem': l.armazenagem || 0,
            'Desconsolidação': l.desconsolidacao || 0,
            'Transp. Interno': l.transp_interno || 0,
            'Liberação': l.liberacao || 0,
            'Hon. SDA': l.hon_sda || 0,
            'Prestação Serv.': l.prest_serv || 0,
            'Despachos Div.': l.desp_div || 0,
            'FOB (R$)': calc.fob_real,
            'CIF': calc.cif,
            'Valor Aduaneiro': calc.valor_aduaneiro,
            'Logística': calc.logistica,
            'Tributos': calc.tributos,
            'Desp. Aduan.': calc.desp_adu,
            'Despachante': calc.despachante,
            'Total': calc.total,
            'Fator': calc.fator.toFixed(3)
        };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lançamentos");
    XLSX.writeFile(wb, `lancamentos_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportToPDF(lancamentos: Lancamento[]) {
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(16);
    doc.text('Relatório de Lançamentos - Container Calculator', 14, 15);
    
    const head = [[
        'Tipo', 'Dt.Desemb', 'Ref', 'DI', 'Invoices', 'Dt.Emb', 'Exportador', 'Dt.Cheg', 'Proc.', 'Navio', 'Tp.Carg', 'Armador', 'L.Emb', 'L.Nac', 'Incoterm', 'Dt.Reg', 'Câmbio', 'FOB($)', 'Frete', 'Seguro', 'Acrés', 'Capat', 'II', 'IPI', 'PIS', 'COFINS', 'ICMS', 'Multa', 'AFRMM', 'Sisc', 'Out.DA', 'Armaz', 'Desc.', 'Tr.Int', 'Lib.', 'Hon.', 'Prest.', 'Desp.Div', 'FOB(R$)', 'CIF', 'V.Adu', 'Log.', 'Trib.', 'Desp.Ad', 'Total', 'Fator'
    ]];

    const tableData = lancamentos.map(l => {
        const calc = computeLanc(l);
        return [
            l.tipo_container || '-', l.data_desembaraco || '-', l.ref_montreal || '-', l.di || '-', l.invoices || '-', l.data_embarque || '-', l.exportadores || '-', l.data_chegada || '-', l.procedencia || '-', l.navio || '-', l.tipo_carga || '-', l.armador || '-', l.local_embarque || '-', l.local_nacionalizacao || '-', l.incoterm || '-', l.data_registro || '-',
            l.cambio || '0', l.fob_usd || '0', l.frete || '0', l.seguro || '0', l.acrescimos || '0', l.capatazia || '0', l.ii || '0', l.ipi || '0', l.pis || '0', l.cofins || '0', l.icms || '0', l.multa || '0', l.afrmm || '0', l.siscomex || '0', l.outras_da || '0', l.armazenagem || '0', l.desconsolidacao || '0', l.transp_interno || '0', l.liberacao || '0', l.hon_sda || '0', l.prest_serv || '0', l.desp_div || '0',
            fmt.format(calc.fob_real), fmt.format(calc.cif), fmt.format(calc.valor_aduaneiro), fmt.format(calc.logistica), fmt.format(calc.tributos), fmt.format(calc.desp_adu), fmt.format(calc.total), calc.fator.toFixed(3)
        ];
    });

    autoTable(doc, {
        startY: 20,
        head: head,
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] }, // Indigo 500
        styles: { fontSize: 4, cellPadding: 0.5 }
    });

    doc.save(`lancamentos_${new Date().toISOString().split('T')[0]}.pdf`);
}
