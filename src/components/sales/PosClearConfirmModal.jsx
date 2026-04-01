import React from 'react';

export default function PosClearConfirmModal({ show, cart, onConfirm, onCancel }) {
    if (!show) return null;

    return (
        <div className="pos-modal-overlay" onClick={onCancel}>
            <div className="pos-modal" style={{ width: 380 }} onClick={(e) => e.stopPropagation()}>
                <div className="pos-modal-header" style={{ background: '#b45309' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <i className="pi pi-trash" style={{ fontSize: '1.1rem' }} />
                        <span>KOSONGKAN KERANJANG?</span>
                    </div>
                </div>
                <div className="pos-modal-body">
                    <div style={{
                        background: '#fff7ed', border: '1px solid #fed7aa',
                        borderRadius: 8, padding: '10px 14px', marginBottom: 14,
                        display: 'flex', alignItems: 'center', gap: 8
                    }}>
                        <i className="pi pi-exclamation-triangle" style={{ color: '#c2410c', fontSize: '0.95rem' }} />
                        <span style={{ fontSize: '0.8rem', color: '#9a3412', fontWeight: 600 }}>
                            <strong>{cart.length} item</strong> akan dihapus dari keranjang.
                        </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#374151', fontWeight: 500, marginBottom: 6 }}>
                        Apakah Anda yakin ingin mengosongkan keranjang?
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        Tekan <strong>Y</strong> atau <strong>Enter</strong> untuk konfirmasi &nbsp;·&nbsp;
                        Tekan <strong>ESC</strong> untuk batal
                    </p>
                </div>
                <div className="pos-modal-footer">
                    <button className="pos-modal-cancel" onClick={onCancel} style={{ flex: 2 }}>
                        <i className="pi pi-times" style={{ marginRight: 6 }} />
                        Batal (ESC)
                    </button>
                    <button
                        className="pos-modal-confirm"
                        onClick={onConfirm}
                        style={{ flex: 1, background: '#b45309' }}
                    >
                        <i className="pi pi-trash" style={{ marginRight: 6 }} />
                        Kosongkan (Y)
                    </button>
                </div>
            </div>
        </div>
    );
}
