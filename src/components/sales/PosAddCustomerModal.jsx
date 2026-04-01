import React, { useState, useEffect, useRef } from 'react';

export default function PosAddCustomerModal({ isOpen, onClose, onSave, initialName = '' }) {
    const [name, setName] = useState(initialName);
    const [phone, setPhone] = useState('');
    const nameRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setPhone('');
            setTimeout(() => nameRef.current?.focus(), 50);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!name.trim()) return;
        onSave({ id: null, name: name.trim(), phone: phone.trim(), type: 'Walkin Customer', no: '-' });
        onClose();
    };

    return (
        <div className="pos-modal-overlay">
            <div className="pos-modal" style={{ width: 400 }}>
                <div className="pos-modal-header">
                    <h2 className="pos-modal-title">
                        <i className="pi pi-user-plus" style={{ marginRight: 8, color: '#3b82f6' }}></i>
                        Pelanggan Baru (Walk-in)
                    </h2>
                    <button className="pos-modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="pos-modal-body" style={{ padding: 20 }}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            Nama Pelanggan <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            ref={nameRef}
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') handleSave();
                                if (e.key === 'Escape') onClose();
                            }}
                            placeholder="Masukkan nama pembeli..."
                            style={{
                                width: '100%', height: 40, border: '1px solid #d1d5db', borderRadius: 8,
                                padding: '0 12px', fontSize: '0.9rem', outline: 'none',
                                transition: 'border-color 0.15s'
                            }}
                            onFocus={e => e.target.style.borderColor = '#3b82f6'}
                            onBlur={e => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                            No. Telepon / HP <span style={{ color: '#9ca3af', fontWeight: 400 }}>(Opsional)</span>
                        </label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') handleSave();
                                if (e.key === 'Escape') onClose();
                            }}
                            placeholder="Contoh: 08123456789"
                            style={{
                                width: '100%', height: 40, border: '1px solid #d1d5db', borderRadius: 8,
                                padding: '0 12px', fontSize: '0.9rem', outline: 'none',
                                transition: 'border-color 0.15s'
                            }}
                            onFocus={e => e.target.style.borderColor = '#3b82f6'}
                            onBlur={e => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>
                </div>

                <div className="pos-modal-footer">
                    <button
                        className="pos-btn-secondary"
                        onClick={onClose}
                        style={{ height: 40, padding: '0 16px', borderRadius: 8, fontSize: '0.85rem' }}
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!name.trim()}
                        style={{
                            height: 40, padding: '0 20px', borderRadius: 8, fontSize: '0.85rem',
                            background: name.trim() ? '#3b82f6' : '#9ca3af', color: 'white',
                            border: 'none', fontWeight: 600, cursor: name.trim() ? 'pointer' : 'not-allowed'
                        }}
                    >
                        Simpan Pelanggan
                        <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 4, padding: '1px 6px', fontSize: '0.65rem', marginLeft: 8 }}>Enter</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
