import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { productService } from "../../../services/productService";
import { printConsignmentSettlement } from "../../../services/printService";

export default function DetailProduct({ visible, onHide, product, onRefresh, initialShowAdjust = false }) {
    const [loading, setLoading] = useState(false);
    const [showSettlement, setShowSettlement] = useState(false);
    const [consignmentData, setConsignmentData] = useState(null);
    const [settlementReason, setSettlementReason] = useState('');
    const toast = useRef(null);

    React.useEffect(() => {
        if (visible && initialShowAdjust && product?.is_consignment) {
            setShowSettlement(true);
        } else if (!visible) {
            setShowSettlement(false);
            setConsignmentData(null);
            setSettlementReason('');
        }
    }, [visible, initialShowAdjust, product]);

    React.useEffect(() => {
        if (product?.is_consignment && showSettlement) {
            fetchConsignmentInfo();
        }
    }, [product, showSettlement]);

    const fetchConsignmentInfo = async () => {
        if (!product?.inventories?.[0]?.id) return;
        try {
            setLoading(true);
            const res = await productService.getConsignmentInfo(product.inventories[0].id);
            setConsignmentData(res.data);
        } catch (err) {
            console.error(err);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data settlement' });
        } finally {
            setLoading(false);
        }
    };

    const handleSettlement = async () => {
        if (!product.inventories?.[0]?.id) return;
        try {
            setLoading(true);
            await productService.settleConsignment(product.inventories[0].id, {
                reason: settlementReason
            });

            toast.current.show({ severity: 'success', summary: 'Berhasil', detail: 'Settlement Konsinyasi selesai' });

            try {
                const user = JSON.parse(localStorage.getItem('user'));
                await printConsignmentSettlement({
                    productName: product.name,
                    barcode: product.barcode,
                    stok_awal: consignmentData?.stok_awal || 0,
                    terjual: consignmentData?.terjual || 0,
                    stok_sisa: consignmentData?.stok_sisa || 0,
                    pendapatan: consignmentData?.pendapatan || 0,
                    reason: settlementReason,
                    userName: user?.nik || 'Petugas',
                    date: new Date().toLocaleString('id-ID')
                });
            } catch (err) {
                console.error(err);
            }

            setShowSettlement(false);
            if (onRefresh) onRefresh();
            onHide();
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Gagal', detail: error.response?.data?.message || 'Terjadi kesalahan' });
        } finally {
            setLoading(false);
        }
    };

    if (!product) return null;

    const formatCurrency = (val) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val || 0);

    const stockStatus = product.qty === 0
        ? { label: "Habis", color: "#ef4444", bg: "#fef2f2", dot: "#ef4444" }
        : product.qty <= 10
            ? { label: "Menipis", color: "#f59e0b", bg: "#fffbeb", dot: "#f59e0b" }
            : { label: "Tersedia", color: "#22c55e", bg: "#f0fdf4", dot: "#22c55e" };

    const header = (
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg">
                <i className="pi pi-box text-white text-xl" />
            </div>
            <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none">Informasi Produk</h3>
                <p className="text-xs font-bold text-slate-400 mt-1.5 uppercase tracking-widest">Detail & Status Stok</p>
            </div>
        </div>
    );

    const footer = (
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">ID: {product.id?.slice(0,8)}</span>
            <Button 
                label="Tutup" 
                onClick={onHide} 
                className="px-8 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-black rounded-xl hover:bg-slate-100 transition-all active:scale-95 shadow-sm" 
            />
        </div>
    );

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                visible={visible}
                onHide={onHide}
                header={header}
                footer={footer}
                style={{ width: '95vw', maxWidth: '520px' }}
                modal
                className="p-dialog-premium"
                closable
            >
                <div className="space-y-4">
                    {/* Main Info Card */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-slate-50 flex items-center justify-between">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Master Data</span>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ring-1 ring-inset" 
                                 style={{ background: stockStatus.bg, color: stockStatus.color, ringColor: stockStatus.color + '20' }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: stockStatus.dot }} />
                                {stockStatus.label}
                            </div>
                        </div>
                        
                        <div className="p-5 space-y-4">
                            <div>
                                <h1 className="text-xl font-black text-slate-900 leading-tight mb-1">{product.name}</h1>
                                <code className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md tracking-widest">{product.barcode}</code>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Kategori / Brand</span>
                                    <p className="text-xs font-black text-slate-700">{product.category?.name || '-'} <span className="text-slate-300 mx-1">/</span> {product.brand?.name || '-'}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Tipe Produk</span>
                                    {product.is_consignment ? (
                                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 uppercase">Kongsi</span>
                                    ) : (
                                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 uppercase">Normal</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 border-t border-slate-50 bg-slate-50/30">
                            <div className="p-5 border-r border-slate-50">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Stok Saat Ini</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-slate-900">{product.qty}</span>
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">Units</span>
                                </div>
                            </div>
                            <div className="p-5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Harga Retail</span>
                                <span className="text-xl font-black text-slate-900">{formatCurrency(product.price)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Settlement Panel for Kongsi */}
                    {showSettlement && product.is_consignment && (
                        <div className="bg-blue-600 rounded-2xl p-5 shadow-xl shadow-blue-500/20 animate-in fade-in slide-in-from-top-4 duration-500 overflow-hidden relative">
                            <i className="pi pi-sync absolute -right-4 -top-4 text-blue-500/20" style={{ fontSize: '8rem' }} />
                            
                            <div className="relative z-10">
                                <h4 className="text-white text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <i className="pi pi-check-circle" /> Settlement Mitra
                                </h4>

                                {loading ? (
                                    <div className="py-8 text-center text-blue-200 text-xs font-bold animate-pulse">Menghitung data transaksi...</div>
                                ) : consignmentData && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="bg-blue-700/50 p-3 rounded-xl border border-white/10">
                                                <span className="text-[9px] font-bold text-blue-200 uppercase block mb-1">Awal</span>
                                                <span className="text-sm font-black text-white">{consignmentData.stok_awal} <small className="text-[9px] opacity-60">U</small></span>
                                            </div>
                                            <div className="bg-emerald-500/80 p-3 rounded-xl border border-white/10 shadow-inner">
                                                <span className="text-[9px] font-bold text-emerald-100 uppercase block mb-1">Laku</span>
                                                <span className="text-sm font-black text-white">{consignmentData.terjual} <small className="text-[9px] opacity-60">U</small></span>
                                            </div>
                                            <div className="bg-rose-500/80 p-3 rounded-xl border border-white/10">
                                                <span className="text-[9px] font-bold text-rose-100 uppercase block mb-1">Retur</span>
                                                <span className="text-sm font-black text-white">{consignmentData.stok_sisa} <small className="text-[9px] opacity-60">U</small></span>
                                            </div>
                                        </div>

                                        <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                                            <span className="text-[10px] font-bold text-blue-100 uppercase tracking-widest block mb-1">Jatah Bayar ke Mitra</span>
                                            <span className="text-2xl font-black text-white">{formatCurrency(consignmentData.pendapatan)}</span>
                                        </div>

                                        <InputText 
                                            value={settlementReason}
                                            onChange={(e) => setSettlementReason(e.target.value)}
                                            placeholder="Catatan penarikan (opsional)..."
                                            className="w-full bg-white/20 border-white/10 text-white placeholder:text-blue-200 text-xs py-2 rounded-lg"
                                        />

                                        <div className="flex gap-2 pt-1">
                                            <Button 
                                                label="Batal" 
                                                onClick={() => setShowSettlement(false)}
                                                className="flex-1 bg-transparent hover:bg-white/10 text-white border-none text-[11px] font-black h-10"
                                            />
                                            <Button 
                                                label="Selesaikan & Cetak" 
                                                icon="pi pi-print"
                                                onClick={handleSettlement}
                                                className="flex-2 bg-white text-blue-700 border-none text-[11px] font-black h-10 shadow-lg active:scale-95"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Dialog>

            <style>{`
                .p-dialog-premium .p-dialog-header {
                    padding: 1.5rem !important;
                    background: #ffffff !important;
                    border-radius: 1.5rem 1.5rem 0 0 !important;
                    border-bottom: 1px solid #f1f5f9 !important;
                }
                .p-dialog-premium .p-dialog-content {
                    padding: 1.5rem !important;
                    background: #f8fafc !important;
                }
                .p-dialog-premium .p-dialog-footer {
                    padding: 0 !important;
                    border: none !important;
                }
                .p-dialog-premium .p-dialog-header-close {
                    width: 2.25rem !important;
                    height: 2.25rem !important;
                    background: #f1f5f9 !important;
                    border-radius: 12px !important;
                    color: #94a3b8 !important;
                    transition: all 0.2s !important;
                }
                .p-dialog-premium .p-dialog-header-close:hover {
                    background: #e2e8f0 !important;
                    color: #475569 !important;
                }
            `}</style>
        </>
    );
}
