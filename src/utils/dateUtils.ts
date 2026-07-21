import { Lancamento } from '../types';

export function parseDate(val: any): string {
    if (!val || val === '' || val === 'undefined' || val === 'null' || val === '0') return '';
    let s = String(val).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10);
    if (/^\d{2}\/\d{2}\/\d{4}/.test(s)) {
        const parts = s.split('/');
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.substring(0, 10);
    try {
        const d = new Date(s);
        if (!isNaN(d.getTime()) && d.getFullYear() > 1900) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        }
    } catch(e) {}
    return '';
}

export function formatDateBR(val: any): string {
    const iso = parseDate(val);
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return '';
}

export function makeDate(val: any): Date | null {
    const iso = parseDate(val);
    if (!iso) return null;
    const d = new Date(iso + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
}

export function getBestDate(l: Lancamento): Date | null {
    let d = makeDate(l.data_registro);
    if (d) return d;
    d = makeDate(l.data_desembaraco);
    if (d) return d;
    d = makeDate(l.data_chegada);
    if (d) return d;
    d = makeDate(l.data_embarque);
    if (d) return d;
    if (l.timestamp) {
        d = makeDate(l.timestamp);
        if (d) return d;
    }
    return null;
}
