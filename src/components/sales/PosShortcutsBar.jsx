import React from 'react';
import { SHORTCUTS } from './posConstants';

export default function PosShortcutsBar() {
    return (
        <div className="pos-shortcuts">
            {SHORTCUTS.map(s => (
                <div key={s.key} className="pos-sc-item">
                    <span className="pos-sc-key">{s.key}</span>
                    <span className="pos-sc-label">{s.label}</span>
                </div>
            ))}
        </div>
    );
}
