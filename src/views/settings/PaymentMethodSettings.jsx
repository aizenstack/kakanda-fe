import { useState, useEffect, useRef } from 'react';
import { masterService } from '../../services/masterService';
import DataTableComponent from '../../components/DataTableComponent';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import Icon from '../../components/_Icon';

export default function PaymentMethodSettings() {
    const [coas, setCoas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null); // 'TUNAI' or 'NON TUNAI'
    const toast = useRef(null);

    const fetchCoas = async () => {
        try {
            setLoading(true);
            const response = await masterService.getCoas();
            setCoas(response.data.data);
        } catch (error) {
            console.error("Failed to fetch COAs:", error);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Gagal mengambil data COA', life: 3000 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoas();
    }, []);

    const openMappingModal = (category) => {
        setCurrentCategory(category);
        setShowModal(true);
    };

    const handleSelectCoa = async (rowData) => {
        try {
            await masterService.updateCoa(rowData.id, {
                type: currentCategory
            });

            toast.current?.show({
                severity: 'success',
                summary: 'Berhasil',
                detail: `${rowData.name} sekarang terdaftar sebagai ${currentCategory}`,
                life: 3000
            });

            fetchCoas();
            setShowModal(false);
        } catch (error) {
            console.error("Update failed:", error);
            toast.current?.show({ severity: 'error', summary: 'Gagal', detail: 'Gagal menghubungkan COA', life: 3000 });
        }
    };

    const handleRemoveType = async (rowData) => {
        try {
            await masterService.updateCoa(rowData.id, {
                type: null
            });
            toast.current?.show({ severity: 'info', summary: 'Info', detail: 'Mapping dihapus', life: 2000 });
            fetchCoas();
        } catch (error) {
            console.error(error);
            toast.current?.show({ severity: 'error', summary: 'Gagal', detail: 'Gagal melepas mapping', life: 3000 });
        }
    };

    const tunaiList = coas.filter(c => c.type === 'TUNAI');
    const nonTunaiList = coas.filter(c => c.type === 'NON TUNAI');
    const voucherList = [
        { name: "Voucher / Kupon Belanja", type: "VOUCHER", is_const: true }
    ];

    const modalColumns = [
        {
            field: 'code', header: 'Kode COA', sortable: true, width: '120px',
            body: (rowData) => <span className="font-bold text-blue-600">{rowData.code}</span>
        },
        {
            field: 'name', header: 'Nama Akun (COA)', sortable: true,
            body: (rowData) => (
                <div className="flex flex-col">
                    <span className="text-[13px] font-black text-slate-800 uppercase">{rowData.name}</span>
                    <span className="text-[10px] text-slate-400 tabular-nums">Sub: {rowData.sub_category?.name || '-'}</span>
                </div>
            )
        },
        {
            header: 'Pilih', width: '100px',
            body: (rowData) => (
                <Button
                    label="Pilih"
                    onClick={() => handleSelectCoa(rowData)}
                    className="p-button-sm p-button-outlined rounded-xl font-bold py-1.5 px-3 text-[11px]"
                    disabled={rowData.type === currentCategory}
                />
            )
        }
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-[#f8fafc] min-h-screen">
            <Toast ref={toast} />

            <HeaderWidget />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* CARD TUNAI */}
                <SettingCard
                    title="Tunai"
                    icon="banknote"
                    color="emerald"
                    description="Metode pembayaran menggunakan uang tunai (Cash)."
                    items={tunaiList}
                    onOpenModal={() => openMappingModal('TUNAI')}
                    onRemove={handleRemoveType}
                />

                {/* CARD NON TUNAI */}
                <SettingCard
                    title="Non Tunai"
                    icon="credit-card"
                    color="blue"
                    description="Metode pembayaran via QRIS, Transfer, atau EDC."
                    items={nonTunaiList}
                    onOpenModal={() => openMappingModal('NON TUNAI')}
                    onRemove={handleRemoveType}
                />

                {/* CARD VOUCHER */}
                <SettingCard
                    title="Voucher"
                    icon="ticket"
                    color="amber"
                    description="Metode pembayaran khusus menggunakan voucher belanja."
                    items={voucherList}
                    isConst={true}
                />
            </div>

            <Dialog
                header={`Pilih Metode Pembayaran untuk ${currentCategory}`}
                visible={showModal}
                style={{ width: '800px' }}
                onHide={() => setShowModal(false)}
                className="rounded-3xl overflow-hidden shadow-2xl"
                headerClassName="bg-slate-50 py-4 px-6 border-b border-slate-100 font-black text-slate-900"
            >
                <div className="py-2">
                    <DataTableComponent
                        data={coas}
                        columns={modalColumns}
                        loading={loading}
                        searchable={true}
                        pageable={true}
                        title="Daftar Akun COA"
                        showIndex={true}
                    />
                </div>
            </Dialog>
        </div>
    );
}

function SettingCard({ title, icon, color, description, items, onOpenModal, onRemove, isConst }) {
    const colorClasses = {
        emerald: 'from-emerald-500 to-teal-600 bg-emerald-50 text-emerald-600',
        blue: 'from-blue-500 to-indigo-600 bg-blue-50 text-blue-600',
        amber: 'from-amber-500 to-orange-600 bg-amber-50 text-amber-600',
    };

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-500 group flex flex-col h-full">
            <div className={`h-2 bg-gradient-to-r ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]}`} />
            <div className="p-8 space-y-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between">
                    <div className={`p-4 rounded-2xl ${colorClasses[color].split(' ')[2]} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                        <Icon name={icon} size={24} />
                    </div>
                </div>

                <div>
                    <h3 className="text-[18px] font-black text-slate-900 tracking-tight">{title}</h3>
                    <p className="text-[12px] font-medium text-slate-400 mt-1 uppercase tracking-widest">{description}</p>
                </div>

                <div className="space-y-3 flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Metode Aktif:</p>
                    {items.length === 0 ? (
                        <div className="py-4 border-2 border-dashed border-slate-100 rounded-2xl flex flex-center text-[11px] font-bold text-slate-300 italic justify-center">
                            Belum ada mapping
                        </div>
                    ) : (
                        items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100/80 hover:border-slate-200 transition-all group/item">
                                <div className="flex flex-col">
                                    <span className="text-[12px] font-black text-slate-700 uppercase">{item.name}</span>
                                    <span className="text-[10px] text-blue-500 font-bold">{item.code}</span>
                                </div>
                                {!isConst && (
                                    <button
                                        onClick={() => onRemove(item)}
                                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover/item:opacity-100 transition-all"
                                        title="Hapus"
                                    >
                                        <Icon name="X" size={14} />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {!isConst && (
                    <button
                        onClick={onOpenModal}
                        className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 text-white text-[12px] font-black hover:bg-slate-800 transition-all group-hover:shadow-lg active:scale-95"
                    >
                        <Icon name="Plus" size={16} />
                        <span>Pilih Metode</span>
                    </button>
                )}
                {isConst && (
                    <div className="h-12 flex items-center justify-center rounded-2xl bg-amber-50 text-amber-600 text-[11px] font-black italic select-none">
                        Default / Constant (Voucher)
                    </div>
                )}
            </div>
        </div>
    );
}

function HeaderWidget() {
    return (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                <span className="text-[10px] font-bold text-indigo-600 tracking-[0.2em] uppercase">
                    Setup Pembayaran
                </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pengaturan Kasir</h1>
            <p className="text-sm font-medium text-slate-500 mt-1 max-w-2xl">
                Petakan data metode pembayaran dari ASIS ke dalam 3 kategori utama (Tunai, Non Tunai, Voucher) untuk memudahkan transaksi di POS.
            </p>
        </div>
    );
}
