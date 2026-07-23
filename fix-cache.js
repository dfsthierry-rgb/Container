import fs from 'fs';
let content = fs.readFileSync('src/utils/sheets.ts', 'utf8');
content = content.replace(
    /fetch\(url \+ '\?action=getAll', \{ redirect: 'follow' \}\);/g,
    `fetch(url + '?action=getAll&t=' + Date.now(), { redirect: 'follow', cache: 'no-store' });`
);
fs.writeFileSync('src/utils/sheets.ts', content);
