import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import qz from 'qz-tray';
import { testPrint } from '../../services/printService';

export default function PrinterThermalConfig() {
    const [printerName, setPrinterName] = useState('');
    const [availablePrinters, setAvailablePrinters] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const [printMode, setPrintMode] = useState('bluetooth');
    const [paperWidth, setPaperWidth] = useState(32); // 32 for 58mm, 48 for 80mm
    const [virtualBluetooth, setVirtualBluetooth] = useState(true);
    const toast = useRef(null);

    useEffect(() => {
        const savedPrinter = localStorage.getItem('thermal_printer_name') || import.meta.env?.VITE_PRINTER_NAME || 'POS-80';
        setPrinterName(savedPrinter);
        const savedMode = localStorage.getItem('thermal_print_mode') || 'bluetooth';
        setPrintMode(savedMode);
        const savedWidth = localStorage.getItem('thermal_paper_width') || '32';
        setPaperWidth(Number(savedWidth));
    }, []);

    const handlePaperWidthChange = (width) => {
        setPaperWidth(width);
        localStorage.setItem('thermal_paper_width', String(width));
    };

    useEffect(() => {
        if (virtualBluetooth) {
            scanPrinters(true);
        }
    }, [virtualBluetooth]);

    const scanPrinters = async (isSilent = false) => {
        if (!isSilent) setIsScanning(true);
        try {
            if (!qz.websocket.isActive()) {
                await qz.websocket.connect({ retries: 2, delay: 1 });
            }
            const printers = await qz.printers.find();
            setAvailablePrinters(printers);

            if (!isSilent) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Scan Selesai',
                    detail: `Ditemukan ${printers.length} perangkat printer.`
                });
            }
        } catch (err) {
            console.error(err);
            if (!isSilent) {
                let errMsg = err.message || "Gagal menghubungkan ke QZ Tray.";
                if (errMsg.includes('connection refused')) errMsg = "Tolong pastikan aplikasi QZ Tray sedang berjalan di background Windows Anda.";

                toast.current?.show({
                    severity: 'error',
                    summary: 'Gagal Scan',
                    detail: errMsg,
                    life: 6000
                });
            }
        } finally {
            if (!isSilent) setIsScanning(false);
        }
    };

    const handleSelectPrinter = (name) => {
        setPrinterName(name);
        localStorage.setItem('thermal_printer_name', name);
        toast.current?.show({
            severity: 'success',
            summary: 'Tersambung',
            detail: `Printer "${name}" kini aktif digunakan untuk POS ini.`
        });
    };

    const handleModeChange = (mode) => {
        setPrintMode(mode);
        localStorage.setItem('thermal_print_mode', mode);
        if (mode === 'bluetooth') {
            toast.current?.show({
               severity: 'info',
               summary: 'Mode Bluetooth Aktif',
               detail: 'Printer Bluetooth akan dipairing via Pop-up saat pertama kali menekan tombol Bayar/Print.'
            });
        }
    };

    const handleDisconnectPrinter = () => {
        setPrinterName('');
        localStorage.removeItem('thermal_printer_name');
        toast.current?.show({
            severity: 'info',
            summary: 'Terputus',
            detail: `Printer berhasil dilepas (Disconnected).`
        });
    };

    const handleToggleBluetooth = (isOn) => {
        setVirtualBluetooth(isOn);
        if (!isOn) {
            setAvailablePrinters([]); // Kosongkan daftar jika dimatikan
        } else {
            scanPrinters(); // Otomatis menyapu jika dinyalakan
        }
    };

    const activePrinter = printerName;
    const idlePrinters = availablePrinters.filter(p => p !== printerName);

    const [isTesting, setIsTesting] = useState(false);
    const handleTestPrint = async () => {
        setIsTesting(true);
        try {
            const success = await testPrint();
            if (success) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Test Print Berhasil',
                    detail: 'Tanda bukti test telah dikirim ke printer.'
                });
            } else {
                throw new Error("Gagal mengirim data");
            }
        } catch (err) {
            toast.current?.show({
                severity: 'error',
                summary: 'Test Print Gagal',
                detail: err.message || 'Pastikan printer menyala dan terkoneksi.'
            });
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="bg-white font-sans text-slate-900 min-h-screen w-full rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-10 mb-10 overflow-y-auto">
            <Toast ref={toast} />

            <div className="max-w-[1400px] w-full mx-auto pb-20">
                <h1 className="text-[34px] font-bold tracking-tight text-black mb-3">
                    Koneksi Mesin
                </h1>
                <p className="text-[15px] font-semibold text-black leading-snug max-w-2xl mb-12">
                    Scan dan hubungkan printer Thermal kasir Anda (USB, LAN, atau Bluetooth). Sistem akan
                    otomatis mencari perangkat keras yang terinstal di komputer/OS Anda saat konektor dinyalakan.
                </p>

                <div className="space-y-8">

                    {/* Pemilihan Mode Cetak */}
                    <div className="flex flex-col gap-2 pt-2 pb-6 border-b border-slate-200/80">
                        <span className="text-[17px] font-bold text-slate-800 tracking-tight">1. Jalur Koneksi Printer</span>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-3">
                            <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                                <input 
                                    type="radio" 
                                    name="printMode" 
                                    value="qz" 
                                    checked={printMode === 'qz'}
                                    onChange={() => handleModeChange('qz')}
                                    className="w-5 h-5 text-[#007AFF] accent-[#007AFF]"
                                />
                                <div className="flex flex-col">
                                    <span className="text-[15px] font-bold text-slate-800">QZ Tray App</span>
                                    <span className="text-[13px] text-slate-500">USB / LAN via PC Server</span>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                                <input 
                                    type="radio" 
                                    name="printMode" 
                                    value="bluetooth" 
                                    checked={printMode === 'bluetooth'}
                                    onChange={() => handleModeChange('bluetooth')}
                                    className="w-5 h-5 text-[#007AFF] accent-[#007AFF]"
                                />
                                <div className="flex flex-col">
                                    <span className="text-[15px] font-bold text-slate-800">Web Bluetooth</span>
                                    <span className="text-[13px] text-slate-500">Koneksi Lagsung via Tablet/HP</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Pemilihan Lebar Kertas */}
                    <div className="flex flex-col gap-2 pt-2 pb-6 border-b border-slate-200/80">
                        <span className="text-[17px] font-bold text-slate-800 tracking-tight">2. Ukuran Kertas Printer</span>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-3">
                            <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                                <input 
                                    type="radio" 
                                    name="paperWidth" 
                                    value={32} 
                                    checked={paperWidth === 32}
                                    onChange={() => handlePaperWidthChange(32)}
                                    className="w-5 h-5 text-[#007AFF] accent-[#007AFF]"
                                />
                                <div className="flex flex-col">
                                    <span className="text-[15px] font-bold text-slate-800">58mm (Mobile/Mini)</span>
                                    <span className="text-[13px] text-slate-500">Kapasitas 32 Karakter</span>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                                <input 
                                    type="radio" 
                                    name="paperWidth" 
                                    value={48} 
                                    checked={paperWidth === 48}
                                    onChange={() => handlePaperWidthChange(48)}
                                    className="w-5 h-5 text-[#007AFF] accent-[#007AFF]"
                                />
                                <div className="flex flex-col">
                                    <span className="text-[15px] font-bold text-slate-800">80mm (Standar POS)</span>
                                    <span className="text-[13px] text-slate-500">Kapasitas 48 Karakter</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {printMode === 'qz' && (
                       <>
                        <div className="flex items-center justify-between py-1">
                            <span className="text-[17px] font-bold text-black tracking-tight">3. Konektor QZ Tray</span>

                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={virtualBluetooth}
                                onChange={(e) => handleToggleBluetooth(e.target.checked)}
                            />
                            <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-[28px] after:w-[28px] after:transition-all peer-checked:bg-[#007AFF]"></div>
                        </label>
                    </div>

                    {/* Connected Device Section */}
                    {virtualBluetooth && (
                        <div>
                            <div className="border-b border-slate-200/80 pb-2 mb-2">
                                <h3 className="text-[16px] font-bold text-slate-700 tracking-tight">Connected Device</h3>
                            </div>

                            {activePrinter ? (
                                <div
                                    onClick={handleDisconnectPrinter}
                                    className="border-b border-slate-200/80 py-4 flex items-center gap-4 cursor-pointer hover:bg-rose-50/50 group transition-colors"
                                    title="Klik untuk memutuskan sambungan Printer"
                                >
                                    <div className="relative">
                                        <i className="pi pi-print text-blue-500 text-2xl group-hover:text-rose-400"></i>
                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full">
                                            <i className="pi pi-check-circle text-emerald-500 text-sm group-hover:hidden"></i>
                                            <i className="pi pi-times-circle text-rose-500 text-sm hidden group-hover:block"></i>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[16px] font-bold text-slate-700 group-hover:text-rose-600 transition-colors">{activePrinter}</span>
                                        <span className="text-[12px] font-medium text-slate-400 group-hover:text-rose-400">Ketuk untuk melepaskan printer</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-b border-slate-200/80 py-4 text-center">
                                    <span className="text-[15px] font-medium text-slate-400">Belum ada perangkat terhubung.</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Available Device Section */}
                    {virtualBluetooth && (
                        <div className="pt-2">
                            <div className="border-b border-slate-200/80 pb-2 mb-2 flex items-center justify-between">
                                <h3 className="text-[16px] font-bold text-slate-700 tracking-tight">Available Device</h3>
                                <button
                                    onClick={scanPrinters}
                                    disabled={isScanning}
                                    className={`px-6 py-1.5 rounded-full text-white font-semibold text-[15px] bg-[#005c7a] hover:bg-[#004861] transition-colors ${isScanning ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                    {isScanning ? 'Scanning...' : 'Scanning'}
                                </button>
                            </div>

                            {idlePrinters.length === 0 ? (
                                <div className="border-b border-slate-200/80 py-8 text-center">
                                    <span className="text-[15px] font-medium text-slate-400">
                                        {isScanning ? 'Mencari perangkat di sekitar...' : 'Tidak ada perangkat tersedia. Coba lakukan Scanning.'}
                                    </span>
                                </div>
                            ) : (
                                <div>
                                    {idlePrinters.map((pName, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => handleSelectPrinter(pName)}
                                            className="border-b border-slate-200/80 py-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                                        >
                                            <i className="pi pi-print text-slate-400 text-2xl"></i>
                                            <span className="text-[16px] font-bold text-slate-600">{pName}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                       </>
                    )}

                    {printMode === 'bluetooth' && (
                        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex flex-col items-center justify-center text-center space-y-4">
                            <i className="pi pi-bluetooth text-blue-500 text-4xl mb-1"></i>
                            <h3 className="text-lg font-bold text-blue-900">Mode Bluetooth Chrome (Web Bluetooth)</h3>
                            <p className="text-[15px] text-blue-700 max-w-lg">
                                Mode ini sangat efektif untuk Tablet/HP karena tidak perlu install aplikasi tambahan. 
                                Cukup klik tombol di bawah untuk Pairing pertama kali.
                            </p>
                            <button
                                onClick={handleTestPrint}
                                disabled={isTesting}
                                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-white font-bold text-[16px] bg-[#007AFF] hover:bg-[#005bbd] shadow-lg shadow-blue-200 transition-all active:scale-95 ${isTesting ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                <i className={`pi ${isTesting ? 'pi-spin pi-spinner' : 'pi-print'}`}></i>
                                {isTesting ? 'Sedang Memproses...' : 'Pairing & Test Print Otomatis'}
                            </button>
                            <p className="text-[12px] text-blue-400 font-medium">
                                *Pastikan Bluetooth perangkat Anda menyala dan printer dalam mode Pairing.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
