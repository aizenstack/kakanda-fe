const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'components', 'sales', 'pos.css');
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(/background: #111827;\s*color: white;\s*display: flex;\s*align-items: center;\s*justify-content: space-between;\s*padding: 0 1\.5rem;\s*height: 52px;\s*flex-shrink: 0;\s*border-bottom: 3px solid #ef4444;/,
    `background: #2563eb;
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    height: 52px;
    flex-shrink: 0;
    border-bottom: 1px solid #bfdbfe;`);

css = css.replace(/background: #ef4444;\s*display: flex;\s*align-items: center;\s*justify-content: center;\s*font-size: 0\.9rem;\s*font-weight: 900;\s*color: white;/,
    `background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    font-weight: 900;
    color: white;`);

css = css.replace(/border: 2px solid #ef4444;/g, 'border: 2px solid #3b82f6;');
css = css.replace(/border-color: #dc2626;/g, 'border-color: #2563eb;');
css = css.replace(/rgba\(239, 68, 68, 0\.2\)/g, 'rgba(37, 99, 235, 0.2)');

css = css.replace(/grid-template-columns: 44px 1fr 80px 90px 130px 130px 44px;\s*background: #ef4444;/,
    `grid-template-columns: 44px 1fr 80px 90px 130px 130px 44px;
    background: #2563eb;`);

css = css.replace(/\.disc-input:focus \{\s*border-color: #ef4444;\s*\}/,
    `.disc-input:focus {
    border-color: #3b82f6;
}`);

css = css.replace(/border-color: #fca5a5;/g, 'border-color: #93c5fd;');
css = css.replace(/\.pos-method-btn\.active \{\s*border-color: #ef4444;\s*background: #fef2f2;\s*color: #b91c1c;\s*box-shadow: 0 0 0 1px #ef4444;\s*\}/,
    `.pos-method-btn.active {
    border-color: #3b82f6;
    background: #eff6ff;
    color: #1d4ed8;
    box-shadow: 0 0 0 1px #3b82f6;
}`);

css = css.replace(/\.pos-method-btn\.active \.pos-method-icon \{\s*background: #fecaca;\s*color: #b91c1c;\s*\}/,
    `.pos-method-btn.active .pos-method-icon {
    background: #dbeafe;
    color: #1d4ed8;
}`);

css = css.replace(/\.pos-method-btn \.check-icon \{\s([^}]*?)color: #ef4444;/s,
    `.pos-method-btn .check-icon {
    $1color: #3b82f6;`);

// pos-pay-btn
css = css.replace(/\.pos-pay-btn \{\s([^}]*?)background: #ef4444;/s,
    `.pos-pay-btn {
    $1background: #2563eb;`);
css = css.replace(/\.pos-pay-btn:hover:not\(:disabled\) \{\s*background: #dc2626;\s*\}/,
    `.pos-pay-btn:hover:not(:disabled) {
    background: #1d4ed8;
}`);
css = css.replace(/\.pos-pay-btn:active:not\(:disabled\) \{\s*background: #b91c1c;\s*\}/,
    `.pos-pay-btn:active:not(:disabled) {
    background: #1e40af;
}`);

// pos-modal-header
css = css.replace(/\.pos-modal-header \{\s*background: #111827;/g,
    `.pos-modal-header {
    background: #2563eb;`);

// pos-modal-confirm
css = css.replace(/\.pos-modal-confirm \{\s([^}]*?)background: #ef4444;/s,
    `.pos-modal-confirm {
    $1background: #2563eb;`);
css = css.replace(/\.pos-modal-confirm:hover:not\(:disabled\) \{\s*background: #dc2626;\s*\}/,
    `.pos-modal-confirm:hover:not(:disabled) {
    background: #1d4ed8;
}`);

fs.writeFileSync(cssPath, css);


const replaceInFile = (relPath, replacements) => {
    const fullPath = path.join(__dirname, relPath);
    let content = fs.readFileSync(fullPath, 'utf8');
    replacements.forEach(r => {
        content = content.replace(r.search, r.replace);
    });
    fs.writeFileSync(fullPath, content);
};

// PosCartTable.jsx
replaceInFile('src/components/sales/PosCartTable.jsx', [
    { search: /color: '#ef4444'/g, replace: "color: '#2563eb'" } // Row subtotal
]);

// PosRightPanel.jsx
replaceInFile('src/components/sales/PosRightPanel.jsx', [
    { search: /borderColor = '#ef4444'/g, replace: "borderColor = '#3b82f6'" },
    { search: /color: '#ef4444'/g, replace: "color: '#3b82f6'" }
]);

// PosPayModal.jsx
replaceInFile('src/components/sales/PosPayModal.jsx', [
    { search: /#ef4444' : '#e5e7eb'/g, replace: "#3b82f6' : '#e5e7eb'" },
    { search: /#ef4444' : '#374151'/g, replace: "#3b82f6' : '#374151'" },
    { search: /<strong style={{ color: '#ef4444' }}>{formatCurrency\(grandTotal\)}<\/strong>/g, replace: "<strong style={{ color: '#2563eb' }}>{formatCurrency(grandTotal)}</strong>" }
]);

// PosSearchBar.jsx
replaceInFile('src/components/sales/PosSearchBar.jsx', [
    { search: /addQty > 1 \? '#ef4444' : '#9ca3af'/g, replace: "addQty > 1 ? '#3b82f6' : '#9ca3af'" },
    { search: /3px solid #ef4444/g, replace: "3px solid #3b82f6" },
    { search: /borderColor = '#ef4444'/g, replace: "borderColor = '#3b82f6'" }
]);

// SelectPartnerComponent.jsx
replaceInFile('src/components/SelectPartnerComponent.jsx', [
    { search: /borderColor = '#ef4444'/g, replace: "borderColor = '#3b82f6'" }
]);

console.log("Theme updated!");
