import { Lancamento, DATE_FIELDS, NUMERIC_FIELDS } from '../types';
import { parseNum } from './numberUtils';
import { parseDate, formatDateBR } from './dateUtils';

function prepareForSheets(lancamentos: Lancamento[]) {
    return lancamentos.map(l => {
        const prepared = { ...l } as any;
        DATE_FIELDS.forEach(f => {
            if (prepared[f]) prepared[f] = formatDateBR(prepared[f]);
        });
        NUMERIC_FIELDS.forEach(f => {
            prepared[f] = prepared[f] ? parseNum(prepared[f]) : 0;
        });
        return prepared;
    });
}

function normalizeFromSheets(lancamentos: any[]): Lancamento[] {
    return lancamentos.map(l => {
        const norm = { ...l };
        DATE_FIELDS.forEach(f => {
            if (norm[f]) norm[f] = parseDate(norm[f]);
        });
        if (norm.timestamp) norm.timestamp = parseDate(norm.timestamp) + 'T00:00:00.000Z';
        NUMERIC_FIELDS.forEach(f => {
            const raw = norm[f];
            if (raw !== undefined && raw !== null && raw !== '' && raw !== 0) {
                norm[f] = typeof raw === 'number' ? String(raw) : (parseNum(raw) !== 0 ? String(parseNum(raw)) : '');
            } else {
                norm[f] = '';
            }
        });
        return norm as Lancamento;
    });
}

export async function syncToSheets(url: string, data: Lancamento[]) {
    if (!url) return;
    const sheetsData = prepareForSheets(data);
    const resp = await fetch(url, {
        method: 'POST',
        redirect: 'follow',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({ action: 'saveAll', data: sheetsData })
    });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    return resp.json();
}

export async function syncFromSheets(url: string): Promise<Lancamento[]> {
    if (!url) throw new Error('No URL configured');
    const resp = await fetch(url + '?action=getAll', { redirect: 'follow' });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const rawData = await resp.json();
    if (!Array.isArray(rawData)) throw new Error('Dados inválidos');
    return normalizeFromSheets(rawData);
}

export async function testSheetConnection(url: string) {
    if (!url) throw new Error('No URL provided');
    const resp = await fetch(url + '?action=ping', { redirect: 'follow' });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    if (!data.success) throw new Error('Resposta inesperada');
    return true;
}
