import React from 'react';

export default function PosExitModal({ showExitConfirm, setShowExitConfirm, cart, searchRef, navigate, onPark }) {
    if (!showExitConfirm) return null;

    const handleExit = () => {
        if (cart.length > 0) onPark();
        navigate('/');
    };

    return (
        <div className="pos-modal-overlay" onClick={() => setShowExitConfirm(false)}>
            <div className="pos-modal" style={{ width: 420 }} onClick={(e) => e.stopPropagation()}>
                <div className="pos-modal-header" style={{ background: '#b91c1c' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <i className="pi pi-exclamation-triangle" style={{ fontSize: '1.1rem' }} />
                        <span>KONFIRMASI KELUAR</span>
                    </div>
                </div>
                <div className="pos-modal-body">
                    {cart.length > 0 && (
                        <div style={{
                            background: '#fff7ed', border: '1px solid #fed7aa',
                            borderRadius: 8, padding: '10px 14px', marginBottom: 14,
                            display: 'flex', alignItems: 'center', gap: 8
                        }}>
                            <i className="pi pi-info-circle" style={{ color: '#c2410c', fontSize: '0.95rem' }} />
                            <span style={{ fontSize: '0.8rem', color: '#9a3412', fontWeight: 600 }}>
                                Masih ada <strong>{cart.length} item</strong> di keranjang.
                                Transaksi akan otomatis <strong>diparkir</strong> agar tidak hilang.
                            </span>
                        </div>
                    )}
                    <p style={{ fontSize: '0.9rem', color: '#374151', fontWeight: 500, marginBottom: 6 }}>
                        Apakah Anda yakin ingin keluar dari halaman kasir?
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        Tekan <strong>Y</strong> atau <strong>Enter</strong> untuk keluar &nbsp;·&nbsp;
                        Tekan <strong>N</strong> atau <strong>ESC</strong> untuk batal
                    </p>
                </div>
                <div className="pos-modal-footer">
                    <button
                        className="pos-modal-cancel"
                        onClick={() => { setShowExitConfirm(false); searchRef.current?.focus(); }}
                        style={{ flex: 2 }}
                    >
                        <i className="pi pi-times" style={{ marginRight: 6 }} />
                        Tidak, Tetap di Kasir (N)
                    </button>
                    <button
                        className="pos-modal-confirm"
                        onClick={handleExit}
                        style={{ flex: 1, background: '#b91c1c' }}
                    >
                        <i className="pi pi-sign-out" style={{ marginRight: 6 }} />
                        Ya, Keluar (Y)
                    </button>
                </div>
            </div>
        </div>
    );
}
