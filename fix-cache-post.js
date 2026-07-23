import fs from 'fs';
let content = fs.readFileSync('src/utils/sheets.ts', 'utf8');
content = content.replace(
    /method: 'POST',\n\s*redirect: 'follow',/g,
    `method: 'POST',\n        redirect: 'follow',\n        cache: 'no-store',`
);
fs.writeFileSync('src/utils/sheets.ts', content);
