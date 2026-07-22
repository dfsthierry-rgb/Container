import fs from 'fs';

const url = 'https://script.google.com/macros/s/AKfycbwPPEBy8ENPAKT4ZYKdkFf5CYQDzVQxZu9VJuDM-4FLS3jBsFeEJ7UOxFjHfkkzR3qS/exec';

const NUMERIC_FIELDS = [
    'cambio', 'fob_usd', 'frete', 'seguro', 'acrescimos', 'capatazia',
    'ii', 'ipi', 'pis', 'cofins', 'icms', 'multa',
    'afrmm', 'siscomex', 'outras_da', 'armazenagem', 'desconsolidacao',
    'transp_interno', 'liberacao', 'hon_sda', 'prest_serv', 'desp_div'
];

async function test() {
  const data = JSON.parse(fs.readFileSync('./restore.json', 'utf8'));
  
  const fixedData = data.map(row => {
    NUMERIC_FIELDS.forEach(f => {
      if (row[f] && typeof row[f] === 'string') {
        const parsed = parseFloat(row[f]);
        row[f] = isNaN(parsed) ? 0 : parsed;
      }
    });
    return row;
  });

  console.log('Restoring fixed', fixedData.length, 'records...');
  
  const payload = {
    action: 'saveAll',
    data: fixedData
  };

  const resp = await fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: {
          'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
  });
  const text = await resp.text();
  console.log(text);
}
test();
