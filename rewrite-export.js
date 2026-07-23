import fs from 'fs';

const newExportUtils = `import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Lancamento } from '../types';
import { computeLanc } from './calculations';
import { fmt, parseNum } from './numberUtils';

export async function exportToExcel(lancamentos: Lancamento[]) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Lançamentos', {
        views: [{ state: 'frozen', ySplit: 1 }]
    });

    // Definir as colunas
    const columns = [
        { header: 'Tipo de Container', key: 'tipo_container', width: 15 },
        { header: 'Data Desembaraço', key: 'data_desembaraco', width: 15 },
        { header: 'Ref. Montreal', key: 'ref_montreal', width: 15 },
        { header: 'Invoices', key: 'invoices', width: 20 },
        { header: 'Data Embarque', key: 'data_embarque', width: 15 },
        { header: 'Exportadores', key: 'exportadores', width: 25 },
        { header: 'Data Chegada', key: 'data_chegada', width: 15 },
        { header: 'Procedência', key: 'procedencia', width: 15 },
        { header: 'Navio', key: 'navio', width: 20 },
        { header: 'Tipo de Carga', key: 'tipo_carga', width: 15 },
        { header: 'Armador', key: 'armador', width: 15 },
        { header: 'Local Embarque', key: 'local_embarque', width: 20 },
        { header: 'Local Nac.', key: 'local_nacionalizacao', width: 20 },
        { header: 'DI', key: 'di', width: 18 },
        { header: 'Incoterm', key: 'incoterm', width: 10 },
        { header: 'Data Registro', key: 'data_registro', width: 15 },
        
        { header: 'Câmbio', key: 'cambio', width: 12 },
        { header: 'FOB (USD)', key: 'fob_usd', width: 15 },
        
        { header: 'Frete', key: 'frete', width: 15 },
        { header: 'Seguro', key: 'seguro', width: 15 },
        { header: 'Acréscimos', key: 'acrescimos', width: 15 },
        { header: 'Capatazia', key: 'capatazia', width: 15 },
        
        { header: 'II', key: 'ii', width: 15 },
        { header: 'IPI', key: 'ipi', width: 15 },
        { header: 'PIS', key: 'pis', width: 15 },
        { header: 'COFINS', key: 'cofins', width: 15 },
        { header: 'ICMS', key: 'icms', width: 15 },
        { header: 'Multa', key: 'multa', width: 15 },
        
        { header: 'AFRMM', key: 'afrmm', width: 15 },
        { header: 'Siscomex', key: 'siscomex', width: 15 },
        { header: 'Outras DA', key: 'outras_da', width: 15 },
        { header: 'Armazenagem', key: 'armazenagem', width: 15 },
        { header: 'Desconsolidação', key: 'desconsolidacao', width: 15 },
        { header: 'Transp. Interno', key: 'transp_interno', width: 15 },
        { header: 'Liberação', key: 'liberacao', width: 15 },
        
        { header: 'Honorários SDA', key: 'hon_sda', width: 15 },
        { header: 'Prestação Serv.', key: 'prest_serv', width: 15 },
        { header: 'Desp. Diversas', key: 'desp_div', width: 15 },
        
        // CÁLCULOS
        { header: 'Base II (VA)', key: 'base_ii', width: 18 },
        { header: 'Base IPI (VA+II)', key: 'base_ipi', width: 18 },
        { header: 'Base PIS (VA)', key: 'base_pis', width: 18 },
        { header: 'Base COFINS (VA)', key: 'base_cofins', width: 18 },
        { header: 'Base ICMS', key: 'base_icms', width: 18 },
        { header: 'Total Calculado', key: 'total', width: 18 },
        { header: 'Fator', key: 'fator', width: 12 },
    ];
    
    sheet.columns = columns;

    // Estilo do Header
    sheet.getRow(1).eachCell((cell) => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1E293B' } // Slate-800
        };
        cell.font = {
            color: { argb: 'FFFFFFFF' },
            bold: true
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    lancamentos.forEach(l => {
        const c = computeLanc(l);
        
        // Bases
        const base_ii = c.valor_aduaneiro;
        const base_ipi = c.valor_aduaneiro + parseNum(l.ii);
        const base_pis = c.valor_aduaneiro;
        const base_cofins = c.valor_aduaneiro;
        const base_icms = c.valor_aduaneiro + parseNum(l.ii) + parseNum(l.ipi) + parseNum(l.pis) + parseNum(l.cofins) + parseNum(l.siscomex) + parseNum(l.outras_da);

        sheet.addRow({
            tipo_container: l.tipo_container,
            data_desembaraco: l.data_desembaraco,
            ref_montreal: l.ref_montreal,
            invoices: l.invoices,
            data_embarque: l.data_embarque,
            exportadores: l.exportadores,
            data_chegada: l.data_chegada,
            procedencia: l.procedencia,
            navio: l.navio,
            tipo_carga: l.tipo_carga,
            armador: l.armador,
            local_embarque: l.local_embarque,
            local_nacionalizacao: l.local_nacionalizacao,
            di: l.di,
            incoterm: l.incoterm,
            data_registro: l.data_registro,
            
            cambio: parseNum(l.cambio),
            fob_usd: parseNum(l.fob_usd),
            
            frete: parseNum(l.frete),
            seguro: parseNum(l.seguro),
            acrescimos: parseNum(l.acrescimos),
            capatazia: parseNum(l.capatazia),
            
            ii: parseNum(l.ii),
            ipi: parseNum(l.ipi),
            pis: parseNum(l.pis),
            cofins: parseNum(l.cofins),
            icms: parseNum(l.icms),
            multa: parseNum(l.multa),
            
            afrmm: parseNum(l.afrmm),
            siscomex: parseNum(l.siscomex),
            outras_da: parseNum(l.outras_da),
            armazenagem: parseNum(l.armazenagem),
            desconsolidacao: parseNum(l.desconsolidacao),
            transp_interno: parseNum(l.transp_interno),
            liberacao: parseNum(l.liberacao),
            
            hon_sda: parseNum(l.hon_sda),
            prest_serv: parseNum(l.prest_serv),
            desp_div: parseNum(l.desp_div),
            
            base_ii,
            base_ipi,
            base_pis,
            base_cofins,
            base_icms,
            total: c.total,
            fator: c.fator
        });
    });

    // Formatar como moeda e centralizar
    sheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
            row.eachCell((cell, colNumber) => {
                const colKey = columns[colNumber - 1].key;
                const isCurrency = ['fob_usd', 'frete', 'seguro', 'acrescimos', 'capatazia', 'ii', 'ipi', 'pis', 'cofins', 'icms', 'multa', 'afrmm', 'siscomex', 'outras_da', 'armazenagem', 'desconsolidacao', 'transp_interno', 'liberacao', 'hon_sda', 'prest_serv', 'desp_div', 'base_ii', 'base_ipi', 'base_pis', 'base_cofins', 'base_icms', 'total'].includes(colKey);
                
                if (isCurrency && typeof cell.value === 'number') {
                    cell.numFmt = colKey === 'fob_usd' ? '"$"#,##0.00' : '"R$"#,##0.00';
                } else if (colKey === 'fator' && typeof cell.value === 'number') {
                    cell.numFmt = '0.000';
                }
                
                // Colors for specific calculation columns
                if (['base_ii', 'base_ipi', 'base_pis', 'base_cofins', 'base_icms'].includes(colKey)) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFEFF6FF' } // Blue-50
                    };
                }
                if (['total', 'fator'].includes(colKey)) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF0FDF4' } // Green-50
                    };
                }
            });
        }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'lancamentos.xlsx');
}

export function exportToPDF(lancamentos: Lancamento[]) {
    const doc = new jsPDF({ orientation: 'landscape' });
    
    doc.setFontSize(16);
    doc.text('Relatório de Lançamentos', 14, 15);
    
    const tableData = lancamentos.map(l => {
        const c = computeLanc(l);
        return [
            l.ref_montreal || '-',
            l.tipo_container || '-',
            l.di || '-',
            l.data_registro ? l.data_registro.substring(0, 10) : '-',
            l.exportadores ? l.exportadores.substring(0, 20) : '-',
            fmt.format(c.total),
            c.fator.toFixed(3)
        ];
    });

    autoTable(doc, {
        head: [['Ref', 'Tipo', 'DI', 'Data Registro', 'Exportador', 'Total', 'Fator']],
        body: tableData,
        startY: 25,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save('lancamentos.pdf');
}
`;

fs.writeFileSync('src/utils/exportUtils.ts', newExportUtils);
