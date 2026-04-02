import React, { useEffect, useCallback } from 'react';
import { PAYMENT_METHODS, formatCurrency } from './posConstants';

export default function PosPayModal({
    showPayModal, setShowPayModal,
    paymentMethod, availablePaymentMethods = [], grandTotal,
    cashInput, setCashInput,
    cashRef, cashNum, kembalian,
    handleConfirmPay, customerName,
    transactionNote, voucherMember,
    isSubmitting = false,
}) {
    if (!showPayModal) return null;

    const pm = availablePaymentMethods?.find(m => m.id === paymentMethod);
    const pmTypeRaw = (pm?.type || '').toUpperCase();
    const pmNameRaw = (pm?.name || '').toUpperCase();

    let pmType = 'NonTunai';

    if (paymentMethod === 'TUNAI_DUMMY') {
        pmType = 'Tunai';
    } else if (paymentMethod === 'NONTUNAI_DUMMY') {
        pmType = 'NonTunai';
    } else if (paymentMethod === 'Voucher') {
        pmType = 'Voucher';
    } else if (pmTypeRaw.includes('NON TUNAI') || pmNameRaw.includes('NON TUNAI')) {
        pmType = 'NonTunai';
    } else if (pmTypeRaw.includes('TUNAI') || pmTypeRaw === 'PENJUALAN TUNAI' || pmTypeRaw === 'CASH' || pmNameRaw.includes('TUNAI') || pmNameRaw.includes('CASH')) {
        pmType = 'Tunai';
    } else if (pmTypeRaw.includes('VOUCHER') || pmNameRaw.includes('VOUCHER')) {
        pmType = 'Voucher';
    }

    return (
        <div className="pos-modal-overlay" onClick={() => setShowPayModal(false)}>
            <div className="pos-modal" onClick={(e) => e.stopPropagation()}>
                <div className="pos-modal-header">
                    <span>KONFIRMASI PEMBAYARAN</span>
                    <button
                        onClick={() => setShowPayModal(false)}
                        style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1rem' }}
                    >✕</button>
                </div>
                <div className="pos-modal-body">
                    <div className="pos-modal-total-row">
                        <span className="label">Total Tagihan</span>
                        <span className="val">{formatCurrency(grandTotal)}</span>
                    </div>

                    {customerName && (
                        <div style={{ marginBottom: 6, fontSize: '0.8rem', color: '#6b7280' }}>
                            Pelanggan: <strong style={{ color: '#111827' }}>{customerName}</strong>
                        </div>
                    )}
                    {transactionNote && (
                        <div style={{ marginBottom: 10, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', fontSize: '0.78rem', color: '#374151' }}>
                            <span style={{ fontWeight: 700, color: '#6b7280', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Catatan: </span>
                            {transactionNote}
                        </div>
                    )}

                    <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                            Metode: {pm?.name || 'Metode Pembayaran'}
                        </div>
                    </div>

                    {pmType === 'Tunai' && (
                        <TunaiSection
                            cashRef={cashRef}
                            cashInput={cashInput}
                            setCashInput={setCashInput}
                            handleConfirmPay={handleConfirmPay}
                            grandTotal={grandTotal}
                            cashNum={cashNum}
                            kembalian={kembalian}
                            isSubmitting={isSubmitting}
                        />
                    )}

                    {pmType === 'NonTunai' && (
                        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
                            <i className="pi pi-credit-card" style={{ fontSize: '1.5rem', color: '#3b82f6', marginBottom: 6, display: 'block' }} />
                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e40af', margin: 0 }}>Arahkan ke mesin EDC</p>
                            <p style={{ fontSize: '0.75rem', color: '#3b82f6', margin: '4px 0 0' }}>QRIS / Debit / Kredit</p>
                        </div>
                    )}

                    {pmType === 'Voucher' && (() => {
                        if (!voucherMember) {
                            return (
                                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
                                    <i className="pi pi-exclamation-triangle" style={{ fontSize: '1.5rem', color: '#c2410c', marginBottom: 6, display: 'block' }} />
                                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c2410c', margin: 0 }}>Belum ada anggota dicek</p>
                                    <p style={{ fontSize: '0.75rem', color: '#ea580c', margin: '4px 0 0' }}>Kembali dan tekan tombol Cek nomor anggota</p>
                                </div>
                            );
                        }

                        const saldo = voucherMember.saldo;
                        const voucherUsed = Math.min(saldo, grandTotal);
                        const sisaBayar = Math.max(0, grandTotal - voucherUsed);
                        const bayarPenuh = sisaBayar === 0;
                        const voucherKembalian = cashNum - sisaBayar;

                        return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '10px 14px' }}>
                                    <div style={{ fontSize: '0.7rem', color: '#0369a1', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Info Anggota</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 3 }}>
                                        <span style={{ color: '#6b7280' }}>Nama</span>
                                        <strong>{voucherMember.name}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 3 }}>
                                        <span style={{ color: '#6b7280' }}>Saldo</span>
                                        <strong style={{ color: '#15803d' }}>{formatCurrency(saldo)}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', borderTop: '1px solid #bae6fd', paddingTop: 6, marginTop: 4 }}>
                                        <span style={{ color: '#6b7280' }}>Total Tagihan</span>
                                        <strong style={{ color: '#2563eb' }}>{formatCurrency(grandTotal)}</strong>
                                    </div>
                                </div>

                                <div style={{
                                    padding: '8px 14px', borderRadius: 8,
                                    background: bayarPenuh ? '#f0fdf4' : '#fffbeb',
                                    border: `1px solid ${bayarPenuh ? '#bbf7d0' : '#fde68a'}`,
                                    display: 'flex', alignItems: 'center', gap: 10
                                }}>
                                    <i className={`pi ${bayarPenuh ? 'pi-check-circle' : 'pi-wallet'}`}
                                        style={{ fontSize: '1.3rem', color: bayarPenuh ? '#16a34a' : '#d97706' }} />
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '0.82rem', color: bayarPenuh ? '#15803d' : '#b45309' }}>
                                            {bayarPenuh ? 'Bayar Penuh dengan Saldo ✓' : `Saldo sebagai Potongan: ${formatCurrency(voucherUsed)}`}
                                        </div>
                                        {!bayarPenuh && (
                                            <div style={{ fontSize: '0.72rem', color: '#92400e', marginTop: 1 }}>
                                                Sisa yang perlu dibayar tunai: <strong>{formatCurrency(sisaBayar)}</strong>
                                            </div>
                                        )}
                                        {bayarPenuh && (
                                            <div style={{ fontSize: '0.72rem', color: '#16a34a', marginTop: 1 }}>
                                                Sisa saldo setelah transaksi: {formatCurrency(saldo - grandTotal)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {!bayarPenuh && (
                                    <>
                                        <div className="pos-modal-field-label">Uang Diterima (Sisa Tunai)</div>
                                        <input
                                            ref={cashRef}
                                            type="number"
                                            value={cashInput}
                                            onChange={(e) => setCashInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleConfirmPay()}
                                            placeholder="0"
                                            className="pos-modal-input"
                                            style={{ borderColor: '#d97706' }}
                                            disabled={isSubmitting}
                                        />
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            {[sisaBayar, ...([5000, 10000, 20000, 50000].filter(n => n > sisaBayar))].slice(0, 5).map(nominal => (
                                                <button key={nominal} onClick={() => setCashInput(String(nominal))} onMouseDown={(e) => e.preventDefault()}
                                                    disabled={isSubmitting}
                                                    style={{
                                                        flex: 1, height: 30, border: '1px solid', borderRadius: 6,
                                                        background: cashInput == nominal ? '#fffbeb' : '#f9fafb',
                                                        borderColor: cashInput == nominal ? '#d97706' : '#e5e7eb',
                                                        color: cashInput == nominal ? '#d97706' : '#374151',
                                                        fontSize: '0.68rem', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer'
                                                    }}
                                                >
                                                    {nominal === sisaBayar ? 'Pas' : new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(nominal)}
                                                </button>
                                            ))}
                                        </div>
                                        {cashNum > 0 && (
                                            <div className="pos-modal-kembalian">
                                                <span className="label">Kembalian Tunai</span>
                                                <span className="val" style={{ color: voucherKembalian >= 0 ? '#15803d' : '#ef4444' }}>
                                                    {formatCurrency(Math.abs(voucherKembalian))}
                                                    {voucherKembalian < 0 ? ' (kurang)' : ''}
                                                </span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })()}
                </div>
                <div className="pos-modal-footer">
                    <button className="pos-modal-cancel" onClick={() => setShowPayModal(false)}>Batal (ESC)</button>
                    <button
                        className="pos-modal-confirm"
                        disabled={
                            isSubmitting ||
                            (pmType === 'Tunai' && cashNum < grandTotal) ||
                            (pmType === 'Voucher' && !voucherMember) ||
                            (pmType === 'Voucher' && voucherMember && (() => {
                                const sisaBayar = Math.max(0, grandTotal - voucherMember.saldo);
                                return sisaBayar > 0 && cashNum < sisaBayar;
                            })())
                        }
                        onClick={handleConfirmPay}
                    >
                        {isSubmitting ? 'MEMPROSES...' : 'KONFIRMASI BAYAR'}
                        <span style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 4, padding: '1px 7px', fontSize: '0.7rem', marginLeft: 8, letterSpacing: '0.04em' }}>Y / Enter</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

function TunaiSection({ cashRef, cashInput, setCashInput, handleConfirmPay, grandTotal, cashNum, kembalian, isSubmitting }) {
    const cashNum_ = parseInt(cashInput, 10);
    const displayValue = cashInput && !isNaN(cashNum_)
        ? new Intl.NumberFormat('id-ID').format(cashNum_)
        : '';

    const handleChange = (e) => {
        const raw = e.target.value.replace(/\D/g, '');
        setCashInput(raw);
    };

    const handlePas = useCallback(() => {
        setCashInput(String(grandTotal));
        setTimeout(() => cashRef?.current?.focus(), 0);
    }, [grandTotal, setCashInput, cashRef]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'p' || e.key === 'P') {
                const tag = document.activeElement?.tagName;
                if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
                    e.preventDefault();
                    handlePas();
                }
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [handlePas]);

    return (
        <>
            <div className="pos-modal-field-label">Uang Diterima</div>
            <input
                ref={cashRef}
                type="text"
                inputMode="numeric"
                value={displayValue}
                onChange={handleChange}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmPay();
                    if (e.key === 'p' || e.key === 'P') { e.preventDefault(); handlePas(); }
                }}
                placeholder="Rp 0"
                className="pos-modal-input"
                disabled={isSubmitting}
            />

            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                {[5000, 10000, 20000, 50000, 100000].map(nominal => (
                    <button
                        key={nominal}
                        onClick={() => setCashInput(String(nominal))}
                        onMouseDown={(e) => e.preventDefault()}
                        style={{
                            flex: 1, height: 32, border: '1px solid #e5e7eb', borderRadius: 6,
                            background: cashInput == nominal ? '#fef2f2' : '#f9fafb',
                            borderColor: cashInput == nominal ? '#3b82f6' : '#e5e7eb',
                            color: cashInput == nominal ? '#3b82f6' : '#374151',
                            fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                            transition: 'all 0.15s'
                        }}
                    >
                        {new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(nominal)}
                    </button>
                ))}
                <button
                    onClick={handlePas}
                    onMouseDown={(e) => e.preventDefault()}
                    style={{
                        flex: 1, height: 32, border: '1px solid', borderRadius: 6,
                        background: cashInput == grandTotal ? '#fef2f2' : '#f9fafb',
                        borderColor: cashInput == grandTotal ? '#3b82f6' : '#e5e7eb',
                        color: cashInput == grandTotal ? '#3b82f6' : '#374151',
                        fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                        transition: 'all 0.15s'
                    }}
                >
                    Pas <span style={{ opacity: 0.55, fontSize: '0.65rem' }}>[P]</span>
                </button>
            </div>

            {cashNum > 0 && (
                <div className="pos-modal-kembalian">
                    <span className="label">Kembalian</span>
                    <span className="val" style={{ color: kembalian >= 0 ? '#15803d' : '#ef4444' }}>
                        {formatCurrency(Math.abs(kembalian))}
                        {kembalian < 0 ? ' (kurang)' : ''}
                    </span>
                </div>
            )}
        </>
    );
}
