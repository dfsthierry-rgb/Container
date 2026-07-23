import fs from 'fs';
let content = fs.readFileSync('src/utils/sheets.ts', 'utf8');
content = content.replace(
    /'Content-Type': 'text\/plain;charset=utf-8'/g,
    `'Content-Type': 'text/plain'`
);
fs.writeFileSync('src/utils/sheets.ts', content);
