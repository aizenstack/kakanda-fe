import React, { useState, useRef, useCallback, useEffect } from "react";
import { productService } from "../../../services/productService";
import MasterDropdown from "../../MasterDropdown";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { useBarcodeScanner } from "../../../hooks/useBarcodeScanner";


const DISCOUNT_TYPE_OPTIONS = [
    { label: 'Nominal (Rp)', value: 'nominal' },
    { label: 'Persen (%)', value: 'percentage' }
];

const MARKUP_TYPE_OPTIONS = [
    { label: 'Nominal (Rp)', value: 'nominal' },
    { label: 'Persen (%)', value: 'percentage' }
];

const SectionHeader = ({ title, icon, badge }) => (
    <div className="flex items-center justify-between mb-2.5 border-b border-slate-100 pb-1.5">
        <div className="flex items-center gap-2">
            <i className={`pi ${icon} text-slate-400 text-sm`} />
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{title}</span>
        </div>
        {badge && (
            <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight">
                {badge}
            </span>
        )}
    </div>
);

const FormLabel = ({ label, required }) => (
    <label className="field-label">
        {label} {required && <span className="text-rose-400 normal-case font-bold">*</span>}
    </label>
);

const Section = ({ children }) => (
    <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm transition-all">
        {children}
    </div>
);

export default function AddProduct({ visible, onHide, onAdd, initialConsignment = false }) {
    const initialFormState = {
        name: "",
        barcode: "",
        picture: "",
        category_id: null,
        brand_id: null,
        supplier_id: null,
        date_of_entry: new Date(),
        billing_date: null,
        is_consignment: initialConsignment,
        unit: 'PCS',
        stock: 0,
        expired_date: null,
        base_price: 0,
        extra_cost: 0,
        discount: 0,
        discount_type: 'nominal',
        is_ppn: false,
        consignment_percent: 0,
        default_price: 0,
        pembulatan_harga_jual: '100',
        rounding_other: 0,
        consignment_base_price: 0,
        consignment_markup: 0,
        consignment_markup_type: 'nominal',
        promo_discount: 0,
        promo_discount_type: 'nominal',
        discount_period_start: null,
        discount_period_end: null
    };

    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [isAdvanced, setIsAdvanced] = useState(false);
    const [scannerVisible, setScannerVisible] = useState(false);
    const toast = useRef(null);
    const controlsRef = useRef(null);
    const hasScannedRef = useRef(false);
    const barcodeInputRef = useRef(null);

    useEffect(() => {
        if (visible) {
            setFormData(prev => ({ ...prev, is_consignment: initialConsignment }));
            const timer = setTimeout(() => barcodeInputRef.current?.focus(), 200);
            return () => clearTimeout(timer);
        }
    }, [visible, initialConsignment]);

    useBarcodeScanner({
        disabled: !visible,
        onScan: (code) => {
            setFormData(prev => ({ ...prev, barcode: code }));
        }
    });

    // ... scan logic tetap sama ...
    const startScanner = () => {
        hasScannedRef.current = false;
        setScannerVisible(true);
    };

    const stopScanner = () => {
        if (controlsRef.current) {
            controlsRef.current.stop();
            controlsRef.current = null;
        }
        setScannerVisible(false);
    };

    const videoCallbackRef = useCallback((videoEl) => {
        if (!videoEl) return;
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Browser tidak mendukung akses kamera.' });
            return;
        }

        const reader = new BrowserMultiFormatReader();
        const constraints = {
            video: { facingMode: { ideal: 'environment' } }
        };

        reader.decodeFromConstraints(
            constraints,
            videoEl,
            (result) => {
                if (!result || hasScannedRef.current) return;
                hasScannedRef.current = true;
                const code = result.getText();
                if (controlsRef.current) controlsRef.current.stop();
                setFormData(prev => ({ ...prev, barcode: code }));
                setScannerVisible(false);
                toast.current?.show({ severity: 'success', summary: 'Scan Berhasil', detail: `Barcode: ${code}`, life: 3000 });
            }
        ).then(c => controlsRef.current = c).catch(() => {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Tidak dapat mengakses kamera.' });
        });
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const formatDate = (date) => {
        if (!date) return null;
        try { return new Date(date).toISOString().split('T')[0]; } catch { return null; }
    };

    const handleReset = () => {
        setFormData(initialFormState);
        setIsAdvanced(false);
    };

    const handleSubmit = async () => {
        if (!formData.name.trim() || !formData.category_id || !formData.barcode.trim()) {
            toast.current.show({ severity: 'warn', summary: 'Peringatan', detail: 'Nama, Kategori, dan Barcode wajib diisi' });
            return;
        }

        if (!formData.is_consignment && !formData.brand_id) {
            toast.current.show({ severity: 'warn', summary: 'Peringatan', detail: 'Brand wajib diisi untuk produk normal' });
            return;
        }

        const mValue = formData.consignment_markup_type === 'percentage'
            ? (formData.consignment_base_price * (formData.consignment_markup / 100))
            : formData.consignment_markup;
        const bPrice = formData.is_consignment ? ((formData.consignment_base_price || 0) + (mValue || 0)) : (formData.default_price || 0);

        if (bPrice <= 0) {
            toast.current.show({ severity: 'warn', summary: 'Peringatan', detail: 'Harga jual harus lebih dari 0' });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                default_price: bPrice,
                picture: formData.picture || "",
                pembulatan_harga_jual: formData.pembulatan_harga_jual ? formData.pembulatan_harga_jual.toString() : "100",
                date_of_entry: formatDate(formData.date_of_entry) || formatDate(new Date()),
                billing_date: formatDate(formData.billing_date),
                expired_date: formatDate(formData.expired_date),
                discount_period_start: formatDate(formData.discount_period_start),
                discount_period_end: formatDate(formData.discount_period_end),
            };

            await productService.create(payload);
            toast.current.show({ severity: 'success', summary: 'Berhasil', detail: 'Produk disimpan' });
            if (onAdd) onAdd();
            handleReset();
            onHide();
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Gagal', detail: error.response?.data?.message || 'Gagal menyimpan' });
        } finally { setLoading(false); }
    };

    // --- Calculation Logic ---
    const PPN_RATE = 0.11;
    const basePrice = Number(formData.base_price || 0);
    const discount = Number(formData.discount || 0);
    const extraCost = Number(formData.extra_cost || 0);
    const defaultPrice = Number(formData.default_price || 0);
    const consignmentBase = Number(formData.consignment_base_price || 0);
    const consignmentMarkup = Number(formData.consignment_markup || 0);

    const discountValue = formData.discount_type === 'percentage' ? (basePrice * (discount / 100)) : discount;
    const hppPreTax = (basePrice - discountValue) + extraCost;
    const calculatedHPP = formData.is_ppn ? hppPreTax * (1 + PPN_RATE) : hppPreTax;

    let baseSellingPrice = defaultPrice;
    if (formData.is_consignment) {
        const markupValue = formData.consignment_markup_type === 'percentage' ? (consignmentBase * (consignmentMarkup / 100)) : consignmentMarkup;
        baseSellingPrice = consignmentBase + (markupValue || 0);
    }

    const roundingStep = formData.pembulatan_harga_jual === 'other' ? (Number(formData.rounding_other) || 1) : parseInt(formData.pembulatan_harga_jual || '1');
    const calculatedFinalPrice = roundingStep > 1 ? Math.ceil((baseSellingPrice || 0) / roundingStep) * roundingStep : (baseSellingPrice || 0);
    const calculatedGain = formData.is_consignment ? (calculatedFinalPrice - consignmentBase) : (calculatedFinalPrice - calculatedHPP);

    const headerContent = (
        <div className="flex items-center justify-between w-full pr-8">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-br ${formData.is_consignment ? 'from-amber-500 to-orange-600' : 'from-blue-600 to-indigo-700'}`}>
                    <i className={`pi ${formData.is_consignment ? 'pi-users' : 'pi-box'} text-white`} />
                </div>
                <div>
                    <h3 className="text-[14px] font-black text-slate-800 leading-none">Tambah Produk {formData.is_consignment ? 'Kongsi (Titipan)' : 'Normal'}</h3>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Mode Input {isAdvanced ? 'Lengkap' : 'Cepat'}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                <button onClick={() => setIsAdvanced(false)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${!isAdvanced ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>SIMPLE</button>
                <button onClick={() => setIsAdvanced(true)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${isAdvanced ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>ADVANCED</button>
            </div>
        </div>
    );

    const footerContent = (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white">
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Potensi Laba/Komisi</span>
                    <span className={`text-sm font-black ${calculatedGain >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(calculatedGain)}</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Button label="Batal" onClick={() => { handleReset(); onHide(); }} className="p-button-text text-slate-400 font-bold text-[12px]" />
                <Button label="Simpan Produk" icon="pi pi-check" onClick={handleSubmit} loading={loading} className={`px-6 py-2.5 rounded-xl border-none text-white font-black text-[12px] shadow-lg active:scale-95 transition-all ${formData.is_consignment ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-900 hover:bg-slate-800'}`} />
            </div>
        </div>
    );

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header={headerContent}
                visible={visible}
                style={{ width: isAdvanced ? '95vw' : '500px', maxWidth: isAdvanced ? '1280px' : '95vw' }}
                breakpoints={{ '960px': '95vw', '641px': '100vw' }}
                modal
                onHide={() => { handleReset(); onHide(); }}
                footer={footerContent}
                className="p-dialog-modern"
                closable={true}
                draggable={false}
                resizable={false}
                contentClassName="p-0 overflow-hidden"
            >
                <style>{`
                    .input-clean { border: 2px solid #f1f5f9; border-radius: 12px; padding: 0.6rem 1rem; font-size: 14px; font-weight: 700; color: #1e293b; width: 100%; transition: all 0.2s; }
                    .input-clean:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 4px rgba(59,130,246,0.1); }
                    .field-label-small { display: block; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.025em; }
                    .custom-scroll::-webkit-scrollbar { width: 4px; }
                    .custom-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                `}</style>
                
                <div className={`p-6 custom-scroll overflow-y-auto ${isAdvanced ? 'max-h-[65vh]' : 'max-h-[80vh]'}`}>
                    <div className={`grid gap-8 ${isAdvanced ? 'lg:grid-cols-3' : 'grid-cols-1'}`}>
                        <div className="space-y-5">
                            <SectionHeader title="Informasi Utama" icon="pi-tag" />
                            <div>
                                <span className="field-label-small">Barcode / Scan <span className="text-rose-400">*</span></span>
                                <div className="flex gap-2">
                                    <InputText ref={barcodeInputRef} value={formData.barcode} onChange={handleInputChange} name="barcode" placeholder="Scan atau Ketik..." className="input-clean flex-1 font-mono" />
                                    <button onClick={startScanner} className="w-12 h-[42px] bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-400 hover:text-blue-500 active:scale-90 transition-all"><i className="pi pi-qrcode" /></button>
                                </div>
                            </div>
                            <div>
                                <span className="field-label-small">Nama Barang <span className="text-rose-400">*</span></span>
                                <InputText value={formData.name} onChange={handleInputChange} name="name" placeholder="E.g. Indomie Goreng" className="input-clean" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="field-label-small">Kategori <span className="text-rose-400">*</span></span>
                                    <MasterDropdown type="category" value={formData.category_id} onChange={(val) => handleNumberChange('category_id', val)} placeholder="Pilih Kategori" className="w-full h-[42px] border-2 border-slate-100 rounded-xl" />
                                </div>
                                <div>
                                    <span className="field-label-small">Brand {!formData.is_consignment && <span className="text-rose-400">*</span>}</span>
                                    <MasterDropdown type="brand" value={formData.brand_id} onChange={(v) => handleNumberChange('brand_id', v)} placeholder="Pilih Brand" className="w-full h-[42px] border-2 border-slate-100 rounded-xl" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="field-label-small">Satuan (Unit) <span className="text-rose-400">*</span></span>
                                    <InputText value={formData.unit} onChange={handleInputChange} name="unit" placeholder="E.g. PCS, BOX" className="input-clean uppercase" />
                                </div>
                                <div>
                                    <span className="field-label-small">Sisa Stok</span>
                                    <InputNumber value={formData.stock} onValueChange={(e) => handleNumberChange('stock', e.value)} className="w-full" inputClassName="input-clean text-center" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <SectionHeader title="Harga & Profit" icon="pi-money-bill" />
                            {!formData.is_consignment ? (
                                <>
                                    <div>
                                        <span className="field-label-small">Harga Beli Dasar (HPP)</span>
                                        <InputNumber value={formData.base_price} onValueChange={(e) => handleNumberChange('base_price', e.value)} mode="currency" currency="IDR" locale="id-ID" inputClassName="input-clean font-black text-blue-600" className="w-full" />
                                    </div>
                                    {isAdvanced && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div><span className="field-label-small">Ektra Cost</span><InputNumber value={formData.extra_cost} onValueChange={(e) => handleNumberChange('extra_cost', e.value)} inputClassName="input-clean" /></div>
                                            <div><span className="field-label-small">PPN 11%</span><div className="h-[42px] flex items-center px-4 bg-slate-50 rounded-xl gap-2"><Checkbox checked={formData.is_ppn} onChange={e => setFormData(prev => ({ ...prev, is_ppn: e.checked }))} /><span className="text-[10px] font-bold text-slate-500">AKTIF</span></div></div>
                                        </div>
                                    )}
                                    <div>
                                        <span className="field-label-small">Harga Jual POS</span>
                                        <InputNumber value={formData.default_price} onValueChange={(e) => handleNumberChange('default_price', e.value)} mode="currency" currency="IDR" locale="id-ID" inputClassName="input-clean font-black text-slate-900 bg-blue-50/30 border-blue-100" className="w-full" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <span className="field-label-small">Harga Titipan (Modal Kongsi)</span>
                                        <InputNumber value={formData.consignment_base_price} onValueChange={(e) => handleNumberChange('consignment_base_price', e.value)} mode="currency" currency="IDR" locale="id-ID" inputClassName="input-clean font-black text-amber-600" className="w-full" />
                                    </div>
                                    <div>
                                        <span className="field-label-small">Margin Koperasi (Laba)</span>
                                        <div className="flex gap-2">
                                            <InputNumber value={formData.consignment_markup} onValueChange={(e) => handleNumberChange('consignment_markup', e.value)} className="flex-1" inputClassName="input-clean" />
                                            <Dropdown value={formData.consignment_markup_type} options={MARKUP_TYPE_OPTIONS} onChange={(e) => handleNumberChange('consignment_markup_type', e.value)} className="w-[100px] border-2 border-slate-100 rounded-xl" />
                                        </div>
                                    </div>
                                    <div>
                                        <span className="field-label-small">Harga Jual Final (Pembulatan 100)</span>
                                        <div className="input-clean bg-amber-50 h-[42px] flex items-center px-4 text-amber-700 font-black border-amber-100">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(calculatedFinalPrice)}</div>
                                    </div>
                                </>
                            )}
                        </div>

                        {isAdvanced && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                                <SectionHeader title="Opsi Lanjutan" icon="pi-list" />
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2">
                                        <span className="field-label-small">Supplier</span>
                                        <MasterDropdown type="supplier" value={formData.supplier_id} onChange={(v) => handleNumberChange('supplier_id', v)} className="w-full" />
                                    </div>
                                    <div><span className="field-label-small">Tgl Masuk</span><Calendar value={formData.date_of_entry} onChange={(e) => handleNumberChange('date_of_entry', e.value)} dateFormat="dd/mm/yy" className="w-full h-[42px] border-2 border-slate-100 rounded-xl" /></div>
                                    <div><span className="field-label-small">Expired</span><Calendar value={formData.expired_date} onChange={(e) => handleNumberChange('expired_date', e.value)} dateFormat="dd/mm/yy" className="w-full h-[42px] border-2 border-slate-100 rounded-xl" /></div>
                                </div>
                                {!formData.is_consignment && (
                                    <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100">
                                        <span className="field-label-small text-rose-400">Setting Promo Toko</span>
                                        <div className="flex gap-2 mb-3">
                                            <InputNumber 
                                                value={formData.promo_discount} 
                                                onValueChange={(v) => handleNumberChange('promo_discount', v.value)} 
                                                placeholder="Set Diskon" 
                                                className="flex-1" 
                                                inputClassName="input-clean text-rose-600" 
                                            />
                                            <Dropdown 
                                                options={DISCOUNT_TYPE_OPTIONS} 
                                                value={formData.promo_discount_type} 
                                                onChange={(e) => handleNumberChange('promo_discount_type', e.value)} 
                                                className="w-[85px] border-none bg-white rounded-xl" 
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <span className="text-[9px] font-black text-rose-300 uppercase block mb-1">Mulai Promo</span>
                                                <Calendar 
                                                    value={formData.discount_period_start} 
                                                    onChange={(e) => handleNumberChange('discount_period_start', e.value)} 
                                                    dateFormat="dd/mm/yy" 
                                                    className="w-full" 
                                                    inputClassName="input-clean !py-1.5 !text-[11px] !border-rose-100" 
                                                    placeholder="Pilih"
                                                />
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black text-rose-300 uppercase block mb-1">Selesai Promo</span>
                                                <Calendar 
                                                    value={formData.discount_period_end} 
                                                    onChange={(e) => handleNumberChange('discount_period_end', e.value)} 
                                                    dateFormat="dd/mm/yy" 
                                                    className="w-full" 
                                                    inputClassName="input-clean !py-1.5 !text-[11px] !border-rose-100" 
                                                    placeholder="Pilih"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Dialog>

            <Dialog visible={scannerVisible} onHide={stopScanner} header="Scan Barcode" style={{ width: '90vw', maxWidth: '500px' }} modal closable={true}>
                <div className="relative bg-black rounded-2xl overflow-hidden" style={{ aspectRatio: '1/1' }}>
                    <video ref={videoCallbackRef} className="w-full h-full object-cover" playsInline muted />
                    <div className="absolute inset-0 border-[40px] border-black/50 pointer-events-none">
                        <div className="w-full h-full border-2 border-blue-400 rounded-lg animate-pulse" />
                    </div>
                </div>
            </Dialog>
        </>
    );
}
