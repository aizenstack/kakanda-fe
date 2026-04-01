import React from 'react';
import Icon from '../_Icon';
import { formatCurrency } from './posConstants';

export default function PosCartTable({ cart, selectedRow, setSelectedRow, updateQty, removeItem }) {
    return (
        <div className="pos-table-wrap">
            <div className="pos-table-head">
                <span className="pos-th center">No.</span>
                <span className="pos-th">Items</span>
                <span className="pos-th center">QTY</span>
                <span className="pos-th center">DISC (%)</span>
                <span className="pos-th right">Harga Satuan</span>
                <span className="pos-th right">Subtotal</span>
                <span className="pos-th" />
            </div>
            <div className="pos-table-body">
                {cart.length === 0 ? (
                    <div className="pos-empty">
                        <Icon name="ShoppingCart" size={48} />
                        <p>Belum ada produk</p>
                        <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                            Tekan F1 atau scan barcode untuk menambah item
                        </p>
                    </div>
                ) : (
                    cart.map((item, idx) => {
                        const discVal = item.price * (item.disc / 100);
                        const priceAfterDisc = item.price - discVal;
                        const rowSubtotal = priceAfterDisc * item.qty;
                        return (
                            <div
                                key={item.id}
                                className={`pos-row ${selectedRow === item.id ? 'selected' : ''}`}
                                onClick={() => setSelectedRow(item.id)}
                            >
                                <span className="pos-td center">{idx + 1}</span>
                                <span className="pos-td bold">{item.name}</span>
                                <div className="pos-qty-ctrl">
                                    <button className="pos-qty-btn" onClick={(e) => { e.stopPropagation(); updateQty(item.id, -1); }}>−</button>
                                    <span className="pos-qty-val">{item.qty}</span>
                                    <button className="pos-qty-btn" onClick={(e) => { e.stopPropagation(); updateQty(item.id, 1); }}>+</button>
                                </div>
                                <span className="pos-td center" style={{ color: item.disc > 0 ? '#10b981' : '#9ca3af', fontWeight: 600 }}>
                                    {item.disc || 0}%
                                </span>
                                <span className="pos-td right money">{formatCurrency(priceAfterDisc)}</span>
                                <span className="pos-td right money" style={{ color: '#2563eb' }}>{formatCurrency(rowSubtotal)}</span>
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                                        style={{
                                            width: 24, height: 24, display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', borderRadius: 4, cursor: 'pointer',
                                            background: 'transparent', border: 'none', color: '#d1d5db', transition: 'color 0.1s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                        onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}
                                    >
                                        <Icon name="X" size={13} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
