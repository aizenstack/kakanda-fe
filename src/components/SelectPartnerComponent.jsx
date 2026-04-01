import React, { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import { formatCurrency } from './sales/posConstants';
import { customerService } from '../services/customerService';

const SelectPartnerComponent = forwardRef(({ value, onSelect, onClear, onAddNew }, ref) => {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [customers, setCustomers] = useState([]);
    const wrapRef = useRef(null);

    const fetchCustomers = useCallback(async (q) => {
        if (!q) {
            setCustomers([]);
            return;
        }
        try {
            const res = await customerService.getAll({ search: q });
            const mapped = (res.data.data || []).map(c => ({
                ...c,
                no: c.member_code || '-',
                type: c.member_code ? 'anggota' : 'pelanggan'
            }));
            setCustomers(mapped);
        } catch (err) {
            console.error("Fetch customers failed", err);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCustomers(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query, fetchCustomers]);

    const filtered = customers.slice(0, 8);
    const anggota = filtered.filter(c => c.member_code);
    const mitra = filtered.filter(c => !c.member_code);

    useEffect(() => {
        const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSelect = useCallback((customer) => {
        onSelect(customer);
        setQuery('');
        setOpen(false);
        setSelectedIndex(0);
    }, [onSelect]);

    const handleClear = () => {
        onClear();
        setQuery('');
        setOpen(false);
        setSelectedIndex(0);
    };

    const handleKeyDown = (e) => {
        if (!open) return;
        const totalOptions = filtered.length + (query.trim().length > 0 ? 1 : 0);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < totalOptions - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === 'Escape') {
            setOpen(false);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < filtered.length) {
                handleSelect(filtered[selectedIndex]);
            } else if (selectedIndex === filtered.length && query.trim().length > 0) {
                setQuery('');
                setOpen(false);
                if (onAddNew) onAddNew(query.trim());
            } else if (selectedIndex === -1 && totalOptions > 0) {
                if (filtered.length > 0) handleSelect(filtered[0]);
                else {
                    setQuery('');
                    setOpen(false);
                    if (onAddNew) onAddNew(query.trim());
                }
            }
        }
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
                <input
                    ref={ref}
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); setOpen(true); }}
                    onFocus={(e) => { setOpen(true); e.target.style.borderColor = '#3b82f6'; }}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    onKeyDown={handleKeyDown}
                    placeholder="Cari nama (F2)..."
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
                    {anggota.length > 0 && (
                        <div style={{ padding: '6px 12px 2px', fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', letterSpacing: '0.08em', background: '#f9fafb', textTransform: 'uppercase' }}>
                            Anggota
                        </div>
                    )}
                    {anggota.map((c, idx) => (
                        <CustomerRow key={c.id} customer={c} selected={selectedIndex === idx} onHover={() => setSelectedIndex(idx)} onClick={() => handleSelect(c)} typeColor={typeColor} />
                    ))}
                    {mitra.length > 0 && (
                        <div style={{ padding: '6px 12px 2px', fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', letterSpacing: '0.08em', background: '#f9fafb', textTransform: 'uppercase', borderTop: '1px solid #f3f4f6' }}>
                            Mitra / Partner
                        </div>
                    )}
                    {mitra.map((c, idx) => {
                        const globIdx = anggota.length + idx;
                        return <CustomerRow key={c.id} customer={c} selected={selectedIndex === globIdx} onHover={() => setSelectedIndex(globIdx)} onClick={() => handleSelect(c)} typeColor={typeColor} />;
                    })}

                    {query.trim().length > 0 && (
                        <div
                            onClick={() => {
                                setQuery('');
                                setOpen(false);
                                if (onAddNew) onAddNew(query.trim());
                            }}
                            onMouseEnter={() => setSelectedIndex(filtered.length)}
                            style={{
                                padding: '8px 12px', borderTop: '1px solid #f3f4f6', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem',
                                color: '#6b7280', transition: 'all 0.1s',
                                background: selectedIndex === filtered.length ? '#fef3c7' : '#f9fafb',
                                borderLeft: selectedIndex === filtered.length ? '3px solid #f59e0b' : '3px solid transparent'
                            }}
                        >
                            <i className="pi pi-user-plus" style={{ color: '#3b82f6' }} />
                            <span>Tambah <strong style={{ color: '#111827' }}>"{query.trim()}"</strong> sebagai Pelanggan Baru...</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

export default SelectPartnerComponent;

function CustomerRow({ customer, onClick, onHover, typeColor, selected }) {
    const tc = typeColor(customer.type);
    return (
        <div
            onClick={onClick}
            onMouseEnter={onHover}
            style={{
                padding: '8px 12px', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: 10, transition: 'all 0.1s',
                background: selected ? '#fef3c7' : 'white',
                borderLeft: selected ? '3px solid #f59e0b' : '3px solid transparent'
            }}
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
