import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

export default function DetailHistorySales({ visible, onHide, transaction }) {
    if (!transaction) return null;

    const formatCurrency = (val) =>
        new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return {
            date: d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }),
            time: d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        };
    };

    const { date, time } = formatDate(transaction.date);

    const methodColor = 
        transaction.status === "Tunai" || transaction.payment_method?.type === "Tunai"
        ? { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0", icon: "pi-wallet" }
        : transaction.status === "Non Tunai" || transaction.payment_method?.type === "Kredit"
            ? { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe", icon: "pi-credit-card" }
            : { bg: "#fefce8", text: "#ca8a04", border: "#fde68a", icon: "pi-ticket" };

     const items = transaction.details || [];

    const subtotal = Number(transaction.subtotal) || 0;
    const discount = Number(transaction.discount) || 0;
    const tax = Number(transaction.ppnAmount ?? (subtotal * 0.1));

    const headerContent = (
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
                <i className="pi pi-receipt text-white" style={{ fontSize: "0.85rem" }} />
            </div>
            <div>
                <h3 className="text-sm font-semibold text-slate-800 leading-none tracking-tight">Detail Transaksi</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{transaction.id}</p>
            </div>
        </div>
    );

    const footerContent = (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white">
            <button
                onClick={onHide}
                className="text-slate-400 text-xs font-medium hover:text-slate-600 transition-colors"
            >
                Tutup
            </button>
            {/* <div className="flex items-center gap-2">
                {onPrint && (
                    <Button
                        label="Cetak Struk"
                        icon="pi pi-print"
                        onClick={() => { onPrint(transaction); onHide(); }}
                        className="text-slate-700 text-sm font-medium px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all"
                    />
                )}
                {onEdit && (
                    <Button
                        label="Edit"
                        icon="pi pi-pencil"
                        onClick={() => { onHide(); onEdit(transaction); }}
                        className="text-white text-sm font-semibold px-5 py-2 rounded-lg border-none bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all"
                    />
                )}
            </div> */}
        </div>
    );

    return (
        <Dialog
            header={headerContent}
            visible={visible}
            style={{ width: "95vw", maxWidth: "600px" }}
            modal
            onHide={onHide}
            footer={footerContent}
            className="p-dialog-history-detail"
            contentClassName="p-0 border-none overflow-hidden"
            closable={true}
        >
            <style>{`
                .p-dialog-history-detail .p-dialog-header {
                    padding: 1.1rem 1.5rem !important;
                    border-bottom: 1px solid #f1f5f9 !important;
                    background: #ffffff !important;
                    border-radius: 1rem 1rem 0 0 !important;
                }
                .p-dialog-history-detail .p-dialog-header-close {
                    color: #94a3b8 !important;
                    width: 2rem !important;
                    height: 2rem !important;
                    border-radius: 8px !important;
                }
                .p-dialog-history-detail .p-dialog-header-close:hover {
                    background: #f8fafc !important;
                }
                .p-dialog-history-detail .p-dialog-content {
                    padding: 0 !important;
                    background: #f8fafc !important;
                }
                .p-dialog-history-detail .p-dialog-footer {
                    padding: 0 !important;
                    border: none !important;
                    background: transparent !important;
                }
            `}</style>

             <div className="bg-white px-6 py-4 flex flex-wrap gap-5 border-b border-slate-100">
                <div className="flex-1 min-w-[120px]">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Tanggal</p>
                    <p className="text-sm font-semibold text-slate-800">{date}</p>
                    <p className="text-[11px] text-slate-400">{time}</p>
                </div>
                <div className="flex-1 min-w-[120px]">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Pelanggan</p>
                    <p className="text-sm font-semibold text-slate-800">{transaction.customer}</p>
                </div>
                <div className="flex-1 min-w-[120px]">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Metode Bayar</p>
                    <div
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold mt-0.5"
                        style={{ background: methodColor.bg, color: methodColor.text, border: `1px solid ${methodColor.border}` }}
                    >
                        <i className={`pi ${methodColor.icon}`} style={{ fontSize: "0.65rem" }} />
                        {transaction.status}
                    </div>
                </div>
            </div>

             <div className="px-6 py-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
                    Item Pembelian ({transaction.items} item)
                </p>
                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                    {items.map((item, idx) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between px-4 py-3"
                            style={{ borderBottom: idx < items.length - 1 ? "1px solid #f1f5f9" : "none" }}
                        >
                            <div className="flex items-center gap-3">
                                <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 flex-shrink-0">
                                    {idx + 1}
                                </span>
                                <div>
                                    <p className="text-xs font-semibold text-slate-800">{item.product?.name || 'Produk'}</p>
                                    <p className="text-[10px] text-slate-400">{item.qty} × {formatCurrency(item.price)}</p>
                                </div>
                            </div>
                            <span className="text-xs font-semibold text-slate-700">
                                {formatCurrency(item.subtotal)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

             <div className="px-6 pb-5">
                <div className="bg-white rounded-xl border border-slate-100 px-4 py-3 space-y-2">
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>Subtotal</span>
                        <span className="font-semibold text-slate-700">{formatCurrency(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>Diskon</span>
                            <span className="font-semibold text-rose-500">-{formatCurrency(discount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>Pajak (10%)</span>
                        <span className="font-semibold text-slate-700">{formatCurrency(tax)}</span>
                    </div>
                    <div className="h-px bg-slate-100" />
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-700">Total</span>
                        <span className="text-lg font-black text-slate-900">{formatCurrency(transaction.total)}</span>
                    </div>
                </div>
            </div>
        </Dialog>
    );
}
