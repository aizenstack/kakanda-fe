import React, { useState, useMemo } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { useRef } from "react";

const PAYMENT_OPTIONS = [
    { label: "Tunai", value: "Tunai" },
    { label: "Non Tunai", value: "Non Tunai" },
    { label: "Voucher", value: "Voucher" },
];

export default function EditHistorySales({ visible, onHide, transaction, onSave }) {
    const toast = useRef(null);
    const [loading, setLoading] = useState(false);

    const initialForm = useMemo(() => ({
        customer: transaction?.customer || "",
        status: transaction?.status || "Tunai",
    }), [transaction]);

    const [formData, setFormData] = useState(initialForm);

    if (!transaction) return null;

    const formatCurrency = (val) =>
        new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) +
            " · " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    };

    const handleSubmit = () => {
        if (!formData.customer.trim()) {
            toast.current.show({ severity: "warn", summary: "Peringatan", detail: "Nama pelanggan wajib diisi" });
            return;
        }
        setLoading(true);
        setTimeout(() => {
            onSave?.({ ...transaction, ...formData });
            toast.current.show({ severity: "success", summary: "Berhasil", detail: "Transaksi berhasil diperbarui" });
            setLoading(false);
            onHide();
        }, 600);
    };

    const headerContent = (
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
                <i className="pi pi-pencil text-white" style={{ fontSize: "0.85rem" }} />
            </div>
            <div>
                <h3 className="text-sm font-semibold text-slate-800 leading-none tracking-tight">Edit Transaksi</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{transaction.id}</p>
            </div>
        </div>
    );

    const footerContent = (
        <div className="flex items-center justify-between px-7 py-4 border-t border-slate-100 bg-white">
            <span className="text-[11px] text-slate-400"><span className="text-slate-500">*</span> Wajib diisi</span>
            <div className="flex items-center gap-3">
                <Button
                    label="Batal"
                    onClick={onHide}
                    className="text-slate-500 text-sm font-medium px-5 py-2 rounded-lg border border-slate-200 bg-transparent hover:bg-slate-50 transition-colors"
                />
                <Button
                    label="Simpan Perubahan"
                    icon="pi pi-check"
                    onClick={handleSubmit}
                    loading={loading}
                    className="text-white text-sm font-semibold px-6 py-2 rounded-lg border-none bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all"
                />
            </div>
        </div>
    );

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header={headerContent}
                visible={visible}
                style={{ width: "95vw", maxWidth: "560px" }}
                modal
                onHide={onHide}
                footer={footerContent}
                className="p-dialog-history-edit"
                contentClassName="p-0 border-none overflow-hidden"
                closable={true}
            >
                <style>{`
                    .p-dialog-history-edit .p-dialog-header {
                        padding: 1.1rem 1.5rem !important;
                        border-bottom: 1px solid #f1f5f9 !important;
                        background: #ffffff !important;
                        border-radius: 1rem 1rem 0 0 !important;
                    }
                    .p-dialog-history-edit .p-dialog-header-close {
                        color: #94a3b8 !important;
                        width: 2rem !important;
                        height: 2rem !important;
                        border-radius: 8px !important;
                    }
                    .p-dialog-history-edit .p-dialog-header-close:hover {
                        background: #f8fafc !important;
                    }
                    .p-dialog-history-edit .p-dialog-content {
                        padding: 1.5rem !important;
                        background: #f8fafc !important;
                    }
                    .p-dialog-history-edit .p-dialog-footer {
                        padding: 0 !important;
                        border: none !important;
                        background: transparent !important;
                    }
                    .field-label-trx {
                        display: block;
                        font-size: 0.6875rem;
                        font-weight: 600;
                        color: #64748b;
                        letter-spacing: 0.08em;
                        text-transform: uppercase;
                        margin-bottom: 0.5rem;
                    }
                    .input-trx {
                        transition: border-color 0.15s, box-shadow 0.15s !important;
                        border: 1px solid #e2e8f0 !important;
                        border-radius: 8px !important;
                        background: #ffffff !important;
                        color: #1e293b !important;
                        font-size: 0.875rem !important;
                    }
                    .input-trx:focus {
                        border-color: #334155 !important;
                        box-shadow: 0 0 0 3px rgba(51,65,85,0.08) !important;
                        outline: none !important;
                    }
                    .p-dialog-history-edit .p-dropdown {
                        border: 1px solid #e2e8f0 !important;
                        border-radius: 8px !important;
                        background: #ffffff !important;
                    }
                    .p-dialog-history-edit .p-dropdown:not(.p-disabled).p-focus {
                        border-color: #334155 !important;
                        box-shadow: 0 0 0 3px rgba(51,65,85,0.08) !important;
                        outline: none !important;
                    }
                `}</style>

                {/* Read-only info */}
                <div className="bg-white rounded-xl border border-slate-100 px-5 py-4 mb-5 space-y-2">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Info Transaksi</p>
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Kode</span>
                        <span className="font-mono font-semibold text-slate-700">{transaction.id}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Tanggal</span>
                        <span className="font-semibold text-slate-700">{formatDate(transaction.date)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Total</span>
                        <span className="font-bold text-slate-900">{formatCurrency(transaction.total)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Jumlah Item</span>
                        <span className="font-semibold text-slate-700">{transaction.items} item</span>
                    </div>
                </div>

                {/* Editable fields */}
                <div className="space-y-4">
                    <div>
                        <label className="field-label-trx">Nama Pelanggan <span className="text-red-400 normal-case">*</span></label>
                        <InputText
                            value={formData.customer}
                            onChange={(e) => setFormData(prev => ({ ...prev, customer: e.target.value }))}
                            placeholder="Nama pelanggan"
                            className="w-full px-4 py-2.5 input-trx"
                        />
                    </div>

                    <div>
                        <label className="field-label-trx">Metode Pembayaran</label>
                        <Dropdown
                            value={formData.status}
                            options={PAYMENT_OPTIONS}
                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.value }))}
                            className="w-full"
                            panelClassName="text-sm"
                        />
                    </div>
                </div>
            </Dialog>
        </>
    );
}
