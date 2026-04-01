import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "primereact/button";
import { productService } from "../../../services/productService";
import MasterDropdown from "../../MasterDropdown";
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

const SectionHeader = ({ title, icon }) => (
    <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
            <i className={`pi ${icon} text-slate-400 text-xs`} />
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
    </div>
);

export default function EditProduct({ visible, onHide, product, onSave }) {
    const [formData, setFormData] = useState({
        name: "",
        barcode: "",
        unit: "PCS",
        category_id: null,
        brand_id: null,
        supplier_id: null,
        date_of_entry: new Date(),
        expired_date: null,
        is_consignment: false,
        stock: 0,
        base_price: 0,
        extra_cost: 0,
        is_ppn: false,
        default_price: 0,
        consignment_base_price: 0,
        consignment_markup: 0,
        consignment_markup_type: 'nominal',
        promo_discount: 0,
        promo_discount_type: 'nominal',
        discount_period_start: null,
        discount_period_end: null
    });

    const [isAdvanced, setIsAdvanced] = useState(false);
    const [loading, setLoading] = useState(false);
    const [scannerVisible, setScannerVisible] = useState(false);
    const barcodeInputRef = useRef(null);
    const toast = useRef(null);

    useEffect(() => {
        if (visible && product) {
            const detail = product.inventories?.[0] || {};
            setFormData({
                name: product.name || "",
                barcode: product.barcode || "",
                unit: product.unit || "PCS",
                category_id: product.category_id || null,
                brand_id: product.brand_id || null,
                supplier_id: product.supplier_id || null,
                date_of_entry: product.date_of_entry ? new Date(product.date_of_entry) : new Date(),
                is_consignment: !!product.is_consignment,
                stock: detail.stock ?? 0,
                expired_date: detail.expired_date ? new Date(detail.expired_date) : null,
                base_price: detail.base_price ?? 0,
                extra_cost: detail.extra_cost ?? 0,
                is_ppn: !!detail.is_ppn,
                consignment_base_price: detail.consignment_base_price ?? 0,
                consignment_markup: detail.consignment_markup ?? 0,
                consignment_markup_type: detail.consignment_markup_type || 'nominal',
                default_price: detail.default_price ?? 0,
                promo_discount: detail.promo_discount ?? 0,
                promo_discount_type: detail.promo_discount_type || 'nominal',
                discount_period_start: detail.promo_start ? new Date(detail.promo_start) : null,
                discount_period_end: detail.promo_end ? new Date(detail.promo_end) : null
            });
            setIsAdvanced(false);
        }
    }, [visible, product]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    const startScanner = () => setScannerVisible(true);
    const stopScanner = () => setScannerVisible(false);

    const videoCallbackRef = useCallback((videoEl) => {
        if (!videoEl) return;
        const reader = new BrowserMultiFormatReader();
        reader.decodeFromConstraints({ video: { facingMode: 'environment' } }, videoEl, (result) => {
            if (result) {
                setFormData(prev => ({ ...prev, barcode: result.getText() }));
                setScannerVisible(false);
            }
        });
    }, []);

    // Logic Harga (Sync from AddProduct)
    const PPN_RATE = 0.11;
    const basePrice = Number(formData.base_price || 0);
    const extraCost = Number(formData.extra_cost || 0);
    const defaultPrice = Number(formData.default_price || 0);
    const consignmentBase = Number(formData.consignment_base_price || 0);
    const consignmentMarkup = Number(formData.consignment_markup || 0);

    const hppPreTax = basePrice + extraCost;
    const calculatedHPP = formData.is_ppn ? hppPreTax * (1 + PPN_RATE) : hppPreTax;

    const markupValue = formData.consignment_markup_type === 'percentage' 
        ? (consignmentBase * (consignmentMarkup / 100)) 
        : consignmentMarkup;

    const calculatedBaseSelling = formData.is_consignment 
        ? (consignmentBase + markupValue) 
        : defaultPrice;

    const calculatedFinalPrice = Math.ceil((calculatedBaseSelling || 0) / 100) * 100;
    const calculatedGain = formData.is_consignment 
        ? (calculatedFinalPrice - consignmentBase) 
        : (calculatedFinalPrice - calculatedHPP);

    const handleSubmit = async () => {
        if (!formData.name || !formData.category_id || !formData.barcode) {
            toast.current.show({ severity: 'warn', summary: 'Peringatan', detail: 'Mohon lengkapi field wajib' });
            return;
        }

        setLoading(true);
        try {
            const payload = { 
                ...formData,
                default_price: calculatedFinalPrice,
                pembulatan_harga_jual: "100",
                date_of_entry: formatDate(formData.date_of_entry),
                expired_date: formatDate(formData.expired_date),
                promo_start: formatDate(formData.discount_period_start),
                promo_end: formatDate(formData.discount_period_end),
            };

            const response = await productService.update(product.id, payload);
            toast.current.show({ severity: 'success', summary: 'Berhasil', detail: 'Produk diperbarui' });
            if (onSave) onSave(response.data.data);
            onHide();
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Gagal', detail: error.response?.data?.message || 'Terjadi kesalahan' });
        } finally {
            setLoading(false);
        }
    };

    const headerContent = (
        <div className="flex items-center justify-between w-full pr-8">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${formData.is_consignment ? 'bg-amber-500' : 'bg-slate-900'}`}>
                    <i className="pi pi-pencil text-white" />
                </div>
                <div>
                    <h3 className="text-[15px] font-black text-slate-800 leading-none">Edit Produk</h3>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">{formData.is_consignment ? 'Barang Konsinyasi' : 'Persediaan Normal'}</p>
                </div>
            </div>
            <div 
                onClick={() => setIsAdvanced(!isAdvanced)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full cursor-pointer transition-all border-2 ${isAdvanced ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
            >
                <i className={`pi ${isAdvanced ? 'pi-bolt' : 'pi-cog'} text-[10px]`} />
                <span className="text-[10px] font-black uppercase tracking-widest">{isAdvanced ? 'Mode Advanced' : 'Mode Simpel'}</span>
            </div>
        </div>
    );

    const footerContent = (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white">
            <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Potensi Laba/Komisi</span>
                <span className={`text-sm font-black ${calculatedGain >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(calculatedGain)}</span>
            </div>
            <div className="flex items-center gap-3">
                <Button label="Batal" onClick={onHide} className="p-button-text text-slate-400 font-bold text-[12px]" />
                <Button label="Simpan Perubahan" icon="pi pi-check" onClick={handleSubmit} loading={loading} className={`px-6 py-2.5 rounded-xl border-none text-white font-black text-[12px] shadow-lg active:scale-95 transition-all ${formData.is_consignment ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-900 hover:bg-slate-800'}`} />
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
                modal
                onHide={onHide}
                footer={footerContent}
                className="p-dialog-modern"
                closable={true}
                draggable={false}
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
                        {/* Section 1: Identity */}
                        <div className="space-y-5">
                            <SectionHeader title="Identitas Produk" icon="pi-tag" />
                            <div>
                                <span className="field-label-small">Barcode / Scan <span className="text-rose-400">*</span></span>
                                <div className="flex gap-2">
                                    <InputText value={formData.barcode} onChange={handleInputChange} name="barcode" className="input-clean flex-1 font-mono" />
                                    <button onClick={startScanner} className="w-12 h-[42px] bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-400"><i className="pi pi-qrcode" /></button>
                                </div>
                            </div>
                            <div>
                                <span className="field-label-small">Nama Barang <span className="text-rose-400">*</span></span>
                                <InputText value={formData.name} onChange={handleInputChange} name="name" className="input-clean" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="field-label-small">Kategori <span className="text-rose-400">*</span></span>
                                    <MasterDropdown type="category" value={formData.category_id} onChange={(val) => handleNumberChange('category_id', val)} className="w-full h-[42px] border-2 border-slate-100 rounded-xl" />
                                </div>
                                <div>
                                    <span className="field-label-small">Brand</span>
                                    <MasterDropdown type="brand" value={formData.brand_id} onChange={(v) => handleNumberChange('brand_id', v)} className="w-full h-[42px] border-2 border-slate-100 rounded-xl" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><span className="field-label-small">Satuan</span><InputText value={formData.unit} onChange={handleInputChange} name="unit" className="input-clean uppercase" /></div>
                                <div><span className="field-label-small">Stok Sedia</span><InputNumber value={formData.stock} onValueChange={(e) => handleNumberChange('stock', e.value)} className="w-full" inputClassName="input-clean text-center" /></div>
                            </div>
                        </div>

                        {/* Section 2: Pricing */}
                        <div className="space-y-5">
                            <SectionHeader title="Harga & Profit" icon="pi-money-bill" />
                            {!formData.is_consignment ? (
                                <>
                                    <div>
                                        <span className="field-label-small">Harga Beli Dasar (HPP)</span>
                                        <InputNumber value={formData.base_price} onValueChange={(e) => handleNumberChange('base_price', e.value)} mode="currency" currency="IDR" locale="id-ID" inputClassName="input-clean font-black text-blue-600" className="w-full" />
                                    </div>
                                    <div>
                                        <span className="field-label-small">Harga Jual POS</span>
                                        <InputNumber value={formData.default_price} onValueChange={(e) => handleNumberChange('default_price', e.value)} mode="currency" currency="IDR" locale="id-ID" inputClassName="input-clean font-black text-slate-900 bg-blue-50/30 border-blue-100" className="w-full" />
                                    </div>
                                    {isAdvanced && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div><span className="field-label-small">Extra Cost</span><InputNumber value={formData.extra_cost} onValueChange={(e) => handleNumberChange('extra_cost', e.value)} inputClassName="input-clean" /></div>
                                            <div><span className="field-label-small">PPN 11%</span><div className="h-[42px] flex items-center px-4 bg-slate-50 rounded-xl gap-2"><Checkbox checked={formData.is_ppn} onChange={e => setFormData(prev => ({ ...prev, is_ppn: e.checked }))} /><span className="text-[10px] font-bold text-slate-500">AKTIF</span></div></div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div>
                                        <span className="field-label-small">Modal Titipan (Kongsi)</span>
                                        <InputNumber value={formData.consignment_base_price} onValueChange={(e) => handleNumberChange('consignment_base_price', e.value)} mode="currency" currency="IDR" locale="id-ID" inputClassName="input-clean font-black text-amber-600" className="w-full" />
                                    </div>
                                    <div>
                                        <span className="field-label-small">Markup Koperasi</span>
                                        <div className="flex gap-2">
                                            <InputNumber value={formData.consignment_markup} onValueChange={(e) => handleNumberChange('consignment_markup', e.value)} className="flex-1" inputClassName="input-clean" />
                                            <Dropdown value={formData.consignment_markup_type} options={MARKUP_TYPE_OPTIONS} onChange={(e) => handleNumberChange('consignment_markup_type', e.value)} className="w-[100px] border-2 border-slate-100 rounded-xl" />
                                        </div>
                                    </div>
                                    <div>
                                        <span className="field-label-small">Harga Jual Final</span>
                                        <div className="input-clean bg-amber-50 h-[42px] flex items-center px-4 text-amber-700 font-black border-amber-100">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(calculatedFinalPrice)}</div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Section 3: Advanced Logics */}
                        <div className={`space-y-5 ${!isAdvanced && 'opacity-30 grayscale pointer-events-none hidden lg:block'}`}>
                            <SectionHeader title="Logistik & Promo" icon="pi-list" />
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2"><span className="field-label-small">Supplier</span><MasterDropdown type="supplier" value={formData.supplier_id} onChange={(v) => handleNumberChange('supplier_id', v)} className="w-full" /></div>
                                <div><span className="field-label-small">Tgl Masuk</span><Calendar value={formData.date_of_entry} onChange={(e) => handleNumberChange('date_of_entry', e.value)} dateFormat="dd/mm/yy" className="w-full h-[42px] border-2 border-slate-100 rounded-xl" /></div>
                                <div><span className="field-label-small">Expired</span><Calendar value={formData.expired_date} onChange={(e) => handleNumberChange('expired_date', e.value)} dateFormat="dd/mm/yy" className="w-full h-[42px] border-2 border-slate-100 rounded-xl" /></div>
                            </div>
                            
                            <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100">
                                <span className="field-label-small text-rose-400">Promo Toko</span>
                                <div className="flex gap-2 mb-3">
                                    <InputNumber value={formData.promo_discount} onValueChange={(v) => handleNumberChange('promo_discount', v.value)} className="flex-1" inputClassName="input-clean text-rose-600" />
                                    <Dropdown options={DISCOUNT_TYPE_OPTIONS} value={formData.promo_discount_type} onChange={(e) => handleNumberChange('promo_discount_type', e.value)} className="w-[85px] border-none bg-white rounded-xl" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Calendar value={formData.discount_period_start} onChange={(e) => handleNumberChange('discount_period_start', e.value)} dateFormat="dd/mm/yy" placeholder="Mulai" className="w-full" inputClassName="input-clean !py-1.5 !text-[11px] !border-rose-100" />
                                    <Calendar value={formData.discount_period_end} onChange={(e) => handleNumberChange('discount_period_end', e.value)} dateFormat="dd/mm/yy" placeholder="Selesai" className="w-full" inputClassName="input-clean !py-1.5 !text-[11px] !border-rose-100" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>

            <Dialog visible={scannerVisible} onHide={stopScanner} header="Scan Barcode" style={{ width: '90vw', maxWidth: '500px' }} modal>
                <div className="relative bg-black rounded-2xl overflow-hidden" style={{ aspectRatio: '1/1' }}>
                    <video ref={videoCallbackRef} className="w-full h-full object-cover" playsInline muted />
                    <div className="absolute inset-0 border-[40px] border-black/50 pointer-events-none"><div className="w-full h-full border-2 border-blue-400 rounded-lg animate-pulse" /></div>
                </div>
            </Dialog>
        </>
    );
}
