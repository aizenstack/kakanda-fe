import React from 'react';
import { formatDate } from './posConstants';

export default function PosHeader({ time, kasirName, noStruk, txCountToday, heldCount, branchName }) {
    // Dibuat ulang setiap render sehingga tanggal tidak pernah frozen
    const today = new Date();

    return (
        <div className="pos-header">
            <div className="pos-header-brand">
                <div className="pos-header-logo">K</div>
                <div>
                    <div className="pos-header-title">{branchName || 'KOPERASI POS'}</div>
                    <div className="pos-header-sub">{formatDate(today)}</div>
                </div>
            </div>
            <div className="pos-header-info">
                <div className="pos-header-chip">
                    <span>Kasir</span>
                    <strong>{kasirName}</strong>
                </div>
                <div className="pos-header-chip">
                    <span>No. Struk</span>
                    <strong>{noStruk}</strong>
                </div>
                <div className="pos-header-chip">
                    <span>Trx Hari Ini</span>
                    <strong style={{ color: '#fbbf24' }}>{txCountToday}</strong>
                </div>
                {heldCount > 0 && (
                    <div className="pos-header-chip">
                        <span>Diparkir</span>
                        <strong style={{ color: '#fbbf24' }}>{heldCount}</strong>
                    </div>
                )}
                <div className="pos-clock">{time}</div>
            </div>
        </div>
    );
}
