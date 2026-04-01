import React, { useState, useCallback } from 'react';
import { formatCurrency } from './posConstants';

export default function PosSearchBar({ searchRef, searchQuery, setSearchQuery, searchResults, onSearchChange, addToCart, addQty = 1, setAddQty }) {
    const [searchIndex, setSearchIndex] = useState(0);

    const handleSelect = useCallback((product) => {
        addToCart(product, addQty);
        setAddQty?.(1);
        setSearchQuery('');
        onSearchChange('');
        setSearchIndex(0);
        searchRef.current?.focus();
    }, [addToCart, addQty, setAddQty, searchRef, onSearchChange, setSearchQuery]);

    const handleKeyDown = (e) => {
        const resultCount = searchResults.slice(0, 8).length;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSearchIndex(prev => (prev + 1) % resultCount);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSearchIndex(prev => (prev - 1 + resultCount) % resultCount);
        } else if (e.key === 'Enter') {
            e.preventDefault();

            if (searchQuery.startsWith('*') || searchQuery.endsWith('*')) {
                const qtyStr = searchQuery.replace('*', '');
                const qtyNum = parseInt(qtyStr, 10);
                if (!isNaN(qtyNum) && qtyNum > 0) {
                    setAddQty?.(qtyNum);
                    setSearchQuery('');
                    onSearchChange('');
                    return;
                }
            }

            if (resultCount > 0) {
                handleSelect(searchResults[searchIndex] || searchResults[0]);
            }
        }
    };

    return (
        <div className="pos-field-wrap" style={{ position: 'relative' }}>
            <label className="pos-field-label">Tambah Produk (F1)</label>
            <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'white', border: '2px solid #e5e7eb', borderRadius: 6, padding: '0 8px', flexShrink: 0 }}>
                    <button
                        onClick={() => setAddQty?.(Math.max(1, addQty - 1))}
                        style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: '#374151' }}
                    >−</button>
                    <span style={{ minWidth: 28, textAlign: 'center', fontSize: '0.9rem', fontWeight: 800, color: addQty > 1 ? '#3b82f6' : '#9ca3af' }}>
                        ×{addQty}
                    </span>
                    <button
                        onClick={() => setAddQty?.(addQty + 1)}
                        style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 4, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, color: '#374151' }}
                    >+</button>
                </div>
                <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                        const val = e.target.value;
                        setSearchQuery(val);
                        setSearchIndex(0);
                        onSearchChange(val);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Nama produk atau scan barcode..."
                    className="pos-input"
                    autoFocus
                    style={{ flex: 1 }}
                />
            </div>
            {searchQuery && searchResults.length > 0 && (
                <div style={{
                    position: 'absolute', top: '100%', marginTop: 4, left: 0, right: 0,
                    zIndex: 50, background: 'white', border: '1px solid #e5e7eb',
                    borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    maxHeight: 220, overflowY: 'auto'
                }}>
                    {searchResults.slice(0, 8).map((p, idx) => {
                        const isSelected = idx === searchIndex;
                        return (
                            <div
                                key={p.id}
                                onClick={() => handleSelect(p)}
                                style={{
                                    padding: '8px 14px', cursor: 'pointer', fontSize: '0.82rem',
                                    fontWeight: 500, borderBottom: '1px solid #f3f4f6',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    background: isSelected ? '#fef2f2' : 'white',
                                    borderLeft: isSelected ? '3px solid #3b82f6' : '3px solid transparent'
                                }}
                                onMouseEnter={() => setSearchIndex(idx)}
                            >
                                <span>
                                    {p.name}{' '}
                                    <span style={{ color: '#9ca3af', fontSize: '0.7rem' }}>{p.barcode}</span>
                                </span>
                                <span style={{ fontWeight: 700, color: isSelected ? '#dc2626' : '#111827' }}>
                                    {formatCurrency(p.price)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
