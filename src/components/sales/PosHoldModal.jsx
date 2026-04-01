import React from 'react';
import { formatCurrency } from './posConstants';

const fmtTime = (d) => new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

export default function PosHoldModal({ show, heldCarts, onRecall, onDelete, onClose }) {
    if (!show) return null;

    return (
        <div className="pos-modal-overlay" onClick={onClose}>
            <div className="pos-modal" style={{ width: 520 }} onClick={(e) => e.stopPropagation()}>
                <div className="pos-modal-header" style={{ background: '#1d4ed8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <i className="pi pi-pause-circle" style={{ fontSize: '1.1rem' }} />
                        <span>TRANSAKSI DIPARKIR</span>
                        {heldCarts.length > 0 && (
                            <span style={{
                                background: '#fbbf24', color: '#111827', borderRadius: 20,
                                padding: '1px 8px', fontSize: '0.7rem', fontWeight: 900
                            }}>{heldCarts.length}</span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer', fontSize: '1rem' }}
                    >✕</button>
                </div>

                <div className="pos-modal-body" style={{ padding: '16px 20px', minHeight: 120 }}>
                    {heldCarts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px 0', color: '#9ca3af' }}>
                            <i className="pi pi-inbox" style={{ fontSize: '2.5rem', marginBottom: 12, display: 'block' }} />
                            <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>Belum ada transaksi yang diparkir</p>
                            <p style={{ fontSize: '0.75rem', color: '#d1d5db', marginTop: 4 }}>Tekan F6 untuk parkir transaksi aktif</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto' }}>
                            {heldCarts.map((h, idx) => {
                                const holdTotal = h.cart.reduce((s, i) =>
                                    s + (i.price * (1 - i.disc / 100)) * i.qty, 0);
                                return (
                                    <div key={h.id} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        background: '#f8fafc', border: '1px solid #e2e8f0',
                                        borderRadius: 8, padding: '10px 14px', gap: 12
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{
                                                width: 34, height: 34, borderRadius: 8, background: '#dbeafe',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontWeight: 900, fontSize: '0.9rem', color: '#1d4ed8', flexShrink: 0
                                            }}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827' }}>
                                                    {h.customerName || 'Walkin Customer'}
                                                    <span style={{ fontWeight: 500, color: '#6b7280', marginLeft: 6 }}>
                                                        · {h.cart.length} item · {h.paymentMethod}
                                                    </span>
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 2 }}>
                                                    Diparkir pukul {fmtTime(h.timestamp)}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111827' }}>
                                                {formatCurrency(holdTotal)}
                                            </span>
                                            <button
                                                onClick={() => onRecall(h)}
                                                style={{
                                                    height: 32, padding: '0 14px', borderRadius: 6,
                                                    background: '#1d4ed8', color: 'white', border: 'none',
                                                    fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                                                    transition: 'background 0.15s'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#1e40af'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#1d4ed8'}
                                            >
                                                Recall
                                            </button>
                                            <button
                                                onClick={() => onDelete(h.id)}
                                                style={{
                                                    width: 32, height: 32, borderRadius: 6,
                                                    background: '#fef2f2', color: '#ef4444',
                                                    border: '1px solid #fecaca',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'pointer', fontSize: '0.75rem'
                                                }}
                                            >
                                                <i className="pi pi-trash" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="pos-modal-footer" style={{ paddingTop: 0 }}>
                    <button className="pos-modal-cancel" onClick={onClose} style={{ flex: 1 }}>
                        Tutup (ESC)
                    </button>
                </div>
            </div>
        </div>
    );
}
