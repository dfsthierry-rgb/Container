import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Lancamento } from '../types';
import { computeLanc } from './calculations';
import { fmt } from './numberUtils';

export function exportToExcel(lancamentos: Lancamento[]) {
    const data = lancamentos.map(l => {
        const calc = computeLanc(l);
        return {
            'Tipo': l.tipo_container,
            'Ref': l.ref_montreal,
            'DI': l.di,
            'Data Desemb.': l.data_desembaraco,
            'Exportador': l.exportadores,
            'Incoterm': l.incoterm,
            'FOB (USD)': l.fob_usd,
            'Câmbio': l.cambio,
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
    
    const tableData = lancamentos.map(l => {
        const calc = computeLanc(l);
        return [
            l.tipo_container || '-',
            l.ref_montreal || '-',
            l.di || '-',
            fmt.format(calc.fob_real),
            fmt.format(calc.cif),
            fmt.format(calc.valor_aduaneiro),
            fmt.format(calc.tributos),
            fmt.format(calc.total),
            calc.fator.toFixed(3)
        ];
    });

    (doc as any).autoTable({
        startY: 20,
        head: [['Tipo', 'Ref', 'DI', 'FOB (R$)', 'CIF', 'Valor Aduaneiro', 'Tributos', 'Total', 'Fator']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] }, // Indigo 500
        styles: { fontSize: 8 }
    });

    doc.save(`lancamentos_${new Date().toISOString().split('T')[0]}.pdf`);
}
