import fs from 'fs';
let content = fs.readFileSync('src/components/LancamentoModal.tsx', 'utf8');
content = content.replace(
    /if \(\!tipo \|\| fob <= 0 \|\| cambio <= 0\) \{\n\s*alert\('Preencha: Tipo, Câmbio e FOB \(USD\)!'\);\n\s*return;\n\s*\}/,
    `if (!tipo || fob <= 0 || cambio <= 0) {
            alert(\`Por favor preencha os campos obrigatórios:\\n- Tipo de Container (atual: \${tipo || 'vazio'})\\n- Câmbio > 0 (atual: \${cambio})\\n- FOB USD > 0 (atual: \${fob})\`);
            return;
        }`
);
fs.writeFileSync('src/components/LancamentoModal.tsx', content);
