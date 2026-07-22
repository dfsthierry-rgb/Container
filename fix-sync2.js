import fs from 'fs';

let content = fs.readFileSync('src/utils/sheets.ts', 'utf8');
content = content.replace(
    /const resp = await fetch\(url, \{[\s\S]*?body: JSON.stringify\(\{ action: 'saveAll', data: sheetsData \}\)\n\s*\}\);/,
    `const resp = await fetch(url, {
        method: 'POST',
        redirect: 'follow',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({ action: 'saveAll', data: sheetsData })
    });`
);
content = content.replace(
    /\/\/ With no-cors, resp.type is 'opaque' and status is 0, so we can't check ok\n\s*return \{ success: true \};/,
    `if (!resp.ok) throw new Error('HTTP ' + resp.status);
    return resp.json();`
);
fs.writeFileSync('src/utils/sheets.ts', content);
