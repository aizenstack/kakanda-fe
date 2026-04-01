import qz from 'qz-tray';

const getPrinterName = () => {
    return localStorage.getItem('thermal_printer_name') || import.meta.env?.VITE_PRINTER_NAME || 'POS-80';
};

export const getPrintMode = () => {
    return localStorage.getItem('thermal_print_mode') || 'bluetooth'; // 'qz' atau 'bluetooth'
};

export const getPaperWidth = () => {
    const raw = Number(localStorage.getItem('thermal_paper_width')) || 32;
    return raw > 32 ? 46 : 30; // Berikan 2 karakter safety margin agar tidak terpotong tepi
};

const ESC = "\x1b";
const GS = "\x1d";
const ALIGN_LEFT = ESC + "a" + "\x00";
const ALIGN_CENTER = ESC + "a" + "\x01";
const ALIGN_RIGHT = ESC + "a" + "\x02";
const BOLD_ON = ESC + "E" + "\x01";
const BOLD_OFF = ESC + "E" + "\x00";
const CUT_PAPER = GS + "V" + "\x41" + "\x00";
const DOUBLE_ON = GS + "!" + "\x11";
const HEIGHT_ON = GS + "!" + "\x01";
const DOUBLE_OFF = GS + "!" + "\x00";
const FONT_SMALL = ESC + "M" + "\x01";
const FONT_NORMAL = ESC + "M" + "\x00";


const connectQz = async () => {
    if (qz.websocket.isActive()) {
        return;
    }
    try {
        await qz.websocket.connect({ retries: 2, delay: 1 });
        console.log("QZ Tray Terhubung!");
    } catch (err) {
        console.error("Gagal menghubungkan ke QZ Tray. Pastikan QZ Tray berjalan di background.", err);
        throw err;
    }
};


const padAlign = (leftText, rightText, totalWidth) => {
    if (!totalWidth) totalWidth = getPaperWidth();

    let left = String(leftText || "");
    let right = String(rightText || "");

    if (left.length + right.length >= totalWidth) {
        let maxLeftLen = totalWidth - right.length - 1;
        if (maxLeftLen > 0) {
            left = left.substring(0, maxLeftLen);
        } else {
            left = "";
        }
    }

    const padding = totalWidth - left.length - right.length;
    if (padding > 0) {
        // Berikan 1 spasi di paling kiri untuk printer 58mm agar tidak terpotong tepi
        const prefix = totalWidth <= 32 ? " " : "";
        const adjustedPadding = totalWidth <= 32 ? padding - 1 : padding;
        return prefix + left + " ".repeat(Math.max(0, adjustedPadding)) + right;
    }
    return left + " " + right;
};

const getBase64Image = async (url) => {
    try {
        const res = await fetch(url);
        const blob = await res.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (err) {
        console.error("Gagal load logo:", err);
        return null;
    }
};

let btDevice = null;
let btCharacteristic = null;

export const connectBluetooth = async () => {
    if (btCharacteristic) return btCharacteristic;
    try {
        if (navigator.bluetooth.getDevices) {
            const devices = await navigator.bluetooth.getDevices();
            if (devices.length > 0) {
                btDevice = devices[0];
                console.log("Menggunakan device Bluetooth yang sudah ada:", btDevice.name);
            }
        }

        if (!btDevice) {
            btDevice = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb', 'e7810a71-73ae-499d-8c15-faa9aef0c3f2', '0000ff00-0000-1000-8000-00805f9b34fb']
            });
        }

        const server = await btDevice.gatt.connect();

        const services = await server.getPrimaryServices();
        let service = services.find(s => s.uuid.includes('18f0') || s.uuid.includes('e7810a71') || s.uuid.includes('ff00'));
        if (!service) service = services[0];

        const characteristics = await service.getCharacteristics();
        btCharacteristic = characteristics.find(c => c.properties.write || c.properties.writeWithoutResponse);

        btDevice.addEventListener('gattserverdisconnected', () => {
            console.log("Bluetooth Disconnected");
            btDevice = null;
            btCharacteristic = null;
        });

        return btCharacteristic;
    } catch (err) {
        console.error("Gagal koneksi Bluetooth:", err);
        btDevice = null;
        btCharacteristic = null;
        throw err;
    }
};

const sendToBluetoothPrinter = async (dtArray) => {
    try {
        const characteristic = await connectBluetooth();
        const encoder = new TextEncoder();
        let uint8arrays = [];

        // INITIALIZE & SAFE MARGIN: 
        // ESC @ (\x1b\x40) = Reset printer
        // GS L (\x1d\x4c) = Set left margin
        const INIT_PRINTER = "\x1b\x40";
        const LEFT_MARGIN = "\x1d\x4c\x08\x00"; // Geser sekitar 1mm (8 dots) agar tidak mepet tepi

        uint8arrays.push(encoder.encode(INIT_PRINTER + LEFT_MARGIN));

        dtArray.forEach(item => {
            if (typeof item === 'string') {
                uint8arrays.push(encoder.encode(item));
            }
        });

        let totalLength = uint8arrays.reduce((acc, val) => acc + val.length, 0);
        let result = new Uint8Array(totalLength);
        let offset = 0;
        uint8arrays.forEach(arr => {
            result.set(arr, offset);
            offset += arr.length;
        });

        // Memecah menjadi chunk 100-byte agar Bluetooth tidak overload
        const CHUNK_SIZE = 100;
        for (let i = 0; i < result.length; i += CHUNK_SIZE) {
            let chunk = result.slice(i, i + CHUNK_SIZE);
            await characteristic.writeValue(chunk);
        }
        console.log("Struk berhasil dikirim via Bluetooth!");
        return true;
    } catch (err) {
        console.error("Web Bluetooth Print Error:", err);
        throw err;
    }
};

export const printReceipt = async (txData) => {
    const {
        kasirName, noStruk, date,
        cart, subtotal, discount, grandTotal,
        paymentMethod, cash, changes,
        customerName, logoBase64
    } = txData;

    try {
        const dt = [];

        const fetchedLogoBase64 = await getBase64Image('/iconThermal.svg');

        if (fetchedLogoBase64 || logoBase64) {
            dt.push(ALIGN_LEFT);
            dt.push({
                type: 'raw',
                format: 'image',
                flavor: 'base64',
                data: (fetchedLogoBase64 || logoBase64).replace(/^data:image\/(svg\+xml|png|jpg|jpeg);base64,/, ""),
                options: { language: "ESCPOS", dotDensity: 'double' }
            });
            dt.push("\x0A");
        }

        dt.push(ALIGN_CENTER);
        if (getPaperWidth() <= 30) {
            dt.push(HEIGHT_ON, BOLD_ON, "KOPERASI KAKANDA", "\x0A", BOLD_OFF, DOUBLE_OFF);
        } else {
            dt.push(DOUBLE_ON, "KOPERASI KAKANDA", "\x0A", DOUBLE_OFF);
        }

        dt.push(FONT_SMALL);
        if (getPaperWidth() <= 30) {
            dt.push("Jl. Jend. A. Yani No.138 Brebes,", "\x0A");
            dt.push("Jateng 52212", "\x0A");
        } else if (getPaperWidth() <= 40) {
            dt.push("Jl. Jenderal A. Yani No.138, Brebes,", "\x0A");
            dt.push("Jateng 52212", "\x0A");
        } else {
            dt.push("Jl. Jenderal A. Yani No.138, Pangembon", "\x0A");
            dt.push("Kec. Brebes, Kab. Brebes, Jateng 52212", "\x0A");
        }
        dt.push(FONT_NORMAL);
        dt.push("-".repeat(getPaperWidth()), "\x0A");

        dt.push(ALIGN_LEFT);
        if (getPaperWidth() <= 30) {
            dt.push(` No.   : ${noStruk}`, "\x0A");
            dt.push(` Tgl   : ${date}`, "\x0A");
            dt.push(` Kasir : ${kasirName}`, "\x0A");
            if (customerName) dt.push(` Plg   : ${customerName}`, "\x0A");
        } else {
            dt.push(padAlign(`No.   : ${noStruk}`, `Tgl: ${date}`), "\x0A");
            dt.push(padAlign(`Kasir : ${kasirName}`, customerName ? `Plg: ${customerName}` : 'Plg: Walkin Customer'), "\x0A");
        }
        dt.push("-".repeat(getPaperWidth()), "\x0A");

        cart.forEach(item => {
            const discVal = item.price * ((item.disc || 0) / 100);
            const finalPrice = item.price - discVal;
            const sub = finalPrice * item.qty;

            dt.push(ALIGN_LEFT);
            dt.push(item.name, "\x0A");

            const leftDetail = `  ${item.qty} x ${finalPrice.toLocaleString('id-ID')}`;
            const rightSub = sub.toLocaleString('id-ID');
            dt.push(padAlign(leftDetail, rightSub), "\x0A");

            if (item.disc > 0) {
                dt.push(`  (Diskon ${item.disc}%)\x0A`);
            }
        });

        dt.push("-".repeat(getPaperWidth()), "\x0A");
        dt.push(ALIGN_LEFT);
        dt.push(padAlign("Subtotal:", subtotal.toLocaleString('id-ID')), "\x0A");
        if (discount > 0) {
            dt.push(padAlign("Diskon Trx:", `-${discount.toLocaleString('id-ID')}`), "\x0A");
        }
        // PPN dihapus sesuai request

        dt.push(BOLD_ON);
        dt.push(padAlign("TOTAL:", `Rp ${grandTotal.toLocaleString('id-ID')}`), "\x0A");
        dt.push(BOLD_OFF);

        dt.push("-".repeat(getPaperWidth()), "\x0A");
        dt.push(ALIGN_LEFT);
        dt.push(padAlign("Metode:", paymentMethod), "\x0A");

        if (paymentMethod === 'Tunai') {
            dt.push(padAlign("Jumlah Tunai:", `Rp ${cash.toLocaleString('id-ID')}`), "\x0A");
            dt.push(padAlign("Kembalian:", `Rp ${changes.toLocaleString('id-ID')}`), "\x0A");
        }

        dt.push("\x0A", ALIGN_CENTER);
        if (getPaperWidth() <= 30) {
            dt.push("Terima Kasih Atas\x0A");
            dt.push("Kunjungan Anda\x0A");
        } else {
            dt.push("Terima Kasih Atas Kunjungan Anda\x0A");
        }
        dt.push("Barang yang sudah dibeli tidak\x0A");
        dt.push("dapat ditukar/dikembalikan.\x0A");

        dt.push("\x0A\x0A\x0A\x0A");
        dt.push(CUT_PAPER);

        // --- Cek Mode Cetak ---
        if (getPrintMode() === 'bluetooth') {
            await sendToBluetoothPrinter(dt);
            return true;
        }

        // --- Eksekusi via QZ Tray (Default) ---
        await connectQz();
        const printerConfig = qz.configs.create(getPrinterName(), { encoding: 'UTF-8' });
        await qz.print(printerConfig, dt);
        console.log("Struk berhasil dikirim ke printer (QZ)!");

        return true;
    } catch (err) {
        console.error("Print Failed:", err);
        return false;
    }
};

export const printStockAdjustment = async (adjData) => {
    const {
        productName,
        barcode,
        qty,
        type, // 'in' or 'out'
        reason,
        note,
        userName,
        date
    } = adjData;

    try {
        const dt = [];

        dt.push(ALIGN_CENTER);
        dt.push(BOLD_ON, "BUKTI PERGERAKAN STOK", "\x0A", BOLD_OFF);
        dt.push(DOUBLE_ON, "KOPERASI KAKANDA", "\x0A", DOUBLE_OFF);
        dt.push("-".repeat(getPaperWidth()), "\x0A");

        dt.push(ALIGN_LEFT);
        dt.push(padAlign(`Tgl: ${date}`, `Petugas: ${userName}`), "\x0A");
        dt.push(`Jenis: ${type === 'out' ? 'Tarik Stok (Keluar)' : 'Tambah Stok (Masuk)'}`, "\x0A");
        dt.push("-".repeat(getPaperWidth()), "\x0A");

        dt.push(BOLD_ON, productName, "\x0A", BOLD_OFF);
        dt.push(`Barcode: ${barcode}`, "\x0A");
        dt.push(`Jumlah : ${qty} unit`, "\x0A");
        dt.push(`Alasan : ${reason}`, "\x0A");
        if (note) {
            dt.push(`Catatan: ${note}`, "\x0A");
        }
        dt.push("-".repeat(getPaperWidth()), "\x0A");

        dt.push("\x0A", ALIGN_CENTER);
        dt.push(padAlign("Penerima/Supplier", "Petugas Koperasi"), "\x0A\x0A\x0A\x0A");
        dt.push(padAlign("(________________)", `(${userName})`), "\x0A");

        dt.push("\x0A\x0A\x0A\x0A");
        dt.push(CUT_PAPER);

        if (getPrintMode() === 'bluetooth') {
            await sendToBluetoothPrinter(dt);
            return true;
        }

        await connectQz();
        const printerConfig = qz.configs.create(getPrinterName(), { encoding: 'UTF-8' });
        await qz.print(printerConfig, dt);
        return true;
    } catch (err) {
        console.error("Print Adjustment Failed:", err);
        return false;
    }
};

export const printConsignmentSettlement = async (data) => {
    const {
        productName, barcode,
        stok_awal, terjual, stok_sisa, pendapatan,
        reason, userName, date
    } = data;

    try {
        const dt = [];

        dt.push(ALIGN_CENTER);
        dt.push(BOLD_ON, "SETTLEMENT KONGSI", "\x0A", BOLD_OFF);
        dt.push(DOUBLE_ON, "KOPERASI KAKANDA", "\x0A", DOUBLE_OFF);
        dt.push("-".repeat(getPaperWidth()), "\x0A");

        dt.push(ALIGN_LEFT);
        dt.push(padAlign(`Tgl: ${date}`, `Admin: ${userName}`), "\x0A");
        dt.push("-".repeat(getPaperWidth()), "\x0A");

        dt.push(BOLD_ON, productName, "\x0A", BOLD_OFF);
        dt.push(`Barcode: ${barcode}`, "\x0A");
        dt.push("-".repeat(getPaperWidth()), "\x0A");

        dt.push(padAlign("Stok Awal:", `${stok_awal} unit`), "\x0A");
        dt.push(padAlign("Stok Terjual:", `${terjual} unit`), "\x0A");
        dt.push(padAlign("Stok Ditarik (Sisa):", `${stok_sisa} unit`), "\x0A");

        dt.push("-".repeat(getPaperWidth()), "\x0A");
        dt.push(BOLD_ON);
        dt.push(padAlign("TOTAL DIBAYARKAN:", `Rp ${pendapatan.toLocaleString('id-ID')}`), "\x0A");
        dt.push(BOLD_OFF);

        if (reason) {
            dt.push("-".repeat(getPaperWidth()), "\x0A");
            dt.push(`Catatan: ${reason}`, "\x0A");
        }

        dt.push("-".repeat(getPaperWidth()), "\x0A");
        dt.push("\x0A", ALIGN_CENTER);
        dt.push(padAlign("Penerima/Mitra", "Petugas Koperasi"), "\x0A\x0A\x0A\x0A");
        dt.push(padAlign("(________________)", `(${userName})`), "\x0A");

        dt.push("\x0A\x0A\x0A\x0A");
        dt.push(CUT_PAPER);

        if (getPrintMode() === 'bluetooth') {
            await sendToBluetoothPrinter(dt);
            return true;
        }

        await connectQz();
        const printerConfig = qz.configs.create(getPrinterName(), { encoding: 'UTF-8' });
        await qz.print(printerConfig, dt);
        return true;
    } catch (err) {
        console.error("Print Settlement Failed:", err);
        return false;
    }
};

export const testPrint = async () => {
    const dummyData = {
        kasirName: "Admin Test",
        noStruk: "TEST/0000/000",
        date: "01/01/2026 00:00",
        cart: [{ name: "Example Product", price: 5000, qty: 1, disc: 0 }],
        subtotal: 5000,
        discount: 0,
        tax: 0,
        grandTotal: 5000,
        paymentMethod: "TEST",
        cash: 5000,
        changes: 0,
        customerName: "Pelanggan Test"
    };
    return await printReceipt(dummyData);
};
