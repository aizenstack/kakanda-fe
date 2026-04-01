import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DUMMY_CUSTOMERS, formatCurrency } from './posConstants';

export default function PosCustomerSelect({ value, onSelect, onClear }) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);

    const filtered = query.length >= 1
        ? DUMMY_CUSTOMERS.filter(c =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.no.toLowerCase().includes(query.toLowerCase()) ||
            (c.phone && c.phone.includes(query))
        ).slice(0, 8)
        : [];

    useEffect(() => {
        const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSelect = useCallback((customer) => {
        onSelect(customer);
        setQuery('');
        setOpen(false);
    }, [onSelect]);

    const handleClear = () => {
        onClear();
        setQuery('');
        setOpen(false);
    };

    const typeColor = (type) => type === 'anggota'
        ? { bg: '#dbeafe', color: '#1d4ed8' }
        : { bg: '#f0fdf4', color: '#15803d' };

    return (
        <div ref={wrapRef} style={{ position: 'relative' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                Pelanggan / Partner
            </div>

            {value ? (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 8,
                    padding: '6px 10px', cursor: 'default'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            ...typeColor(value.type),
                            borderRadius: 4, padding: '2px 7px', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.05em'
                        }}>
                            {value.type === 'anggota' ? 'ANGGOTA' : 'MITRA'}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>{value.name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                {value.no}
                                {value.type === 'anggota' && value.saldo !== undefined && (
                                    <span style={{ marginLeft: 8, color: value.saldo > 0 ? '#15803d' : '#9ca3af' }}>
                                        Saldo: {formatCurrency(value.saldo)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleClear}
                        title="Hapus pelanggan"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1rem', padding: '2px 4px', borderRadius: 4 }}
                    >✕</button>
                </div>
            ) : (
                /* Input search */
                <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={(e) => { setOpen(true); e.target.style.borderColor = '#ef4444'; }}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    placeholder="Cari nama, no. anggota, atau ketik nama ..."
                    style={{
                        width: '100%', height: 38, border: '1px solid #d1d5db', borderRadius: 8,
                        padding: '0 12px', fontSize: '0.83rem', fontWeight: 600, color: '#374151',
                        outline: 'none', transition: 'border-color 0.15s'
                    }}
                />
            )}

            {open && filtered.length > 0 && !value && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
                    marginTop: 4, background: 'white', borderRadius: 8,
                    border: '1px solid #e5e7eb', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    overflow: 'hidden'
                }}>
                    {filtered.some(c => c.type === 'anggota') && (
                        <div style={{ padding: '6px 12px 2px', fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', letterSpacing: '0.08em', background: '#f9fafb', textTransform: 'uppercase' }}>
                            Anggota
                        </div>
                    )}
                    {filtered.filter(c => c.type === 'anggota').map(c => (
                        <CustomerRow key={c.id} customer={c} onClick={() => handleSelect(c)} typeColor={typeColor} />
                    ))}
                    {filtered.some(c => c.type === 'mitra') && (
                        <div style={{ padding: '6px 12px 2px', fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', letterSpacing: '0.08em', background: '#f9fafb', textTransform: 'uppercase', borderTop: '1px solid #f3f4f6' }}>
                            Mitra / Partner
                        </div>
                    )}
                    {filtered.filter(c => c.type === 'mitra').map(c => (
                        <CustomerRow key={c.id} customer={c} onClick={() => handleSelect(c)} typeColor={typeColor} />
                    ))}

                    {query.trim().length > 0 && (
                        <div
                            onClick={() => { onSelect({ id: null, name: query.trim(), type: 'Walkin Customer', no: '-' }); setQuery(''); setOpen(false); }}
                            style={{
                                padding: '8px 12px', borderTop: '1px solid #f3f4f6', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem',
                                color: '#6b7280', background: '#f9fafb'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                            onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}
                        >
                            <i className="pi pi-plus-circle" style={{ color: '#3b82f6' }} />
                            Gunakan "<strong style={{ color: '#111827' }}>{query.trim()}</strong>" sebagai nama pembeli
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function CustomerRow({ customer, onClick, typeColor }) {
    const tc = typeColor(customer.type);
    return (
        <div
            onClick={onClick}
            style={{
                padding: '8px 12px', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: 10, transition: 'background 0.1s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#fef9c3'}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
        >
            <div style={{ ...tc, borderRadius: 4, padding: '2px 6px', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.05em', flexShrink: 0 }}>
                {customer.type === 'anggota' ? 'ANGGOTA' : 'MITRA'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.83rem', fontWeight: 700, color: '#111827' }}>{customer.name}</div>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                    No. {customer.no}
                    {customer.type === 'anggota' && customer.saldo !== undefined && (
                        <span style={{ marginLeft: 8, color: customer.saldo > 0 ? '#15803d' : '#9ca3af' }}>
                            | Saldo {formatCurrency(customer.saldo)}
                        </span>
                    )}
                </div>
            </div>
            <i className="pi pi-chevron-right" style={{ fontSize: '0.7rem', color: '#d1d5db' }} />
        </div>
    );
}
