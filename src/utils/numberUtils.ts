export function parseNum(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  let s = String(val).trim();
  if (s.includes(',') && s.includes('.')) {
      const lastComma = s.lastIndexOf(',');
      const lastDot = s.lastIndexOf('.');
      if (lastComma > lastDot) {
          s = s.replace(/\./g, '').replace(',', '.');
      } else {
          s = s.replace(/,/g, '');
      }
  } else if (s.includes(',')) {
      s = s.replace(',', '.');
  }
  s = s.replace(/[^\d.\-]/g, '');
  const num = parseFloat(s);
  return isNaN(num) ? 0 : num;
}

export const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
