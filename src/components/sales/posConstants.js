export const formatCurrency = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);

export const formatTime = (d) => {
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
};
export const formatDate = (d) => {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

export const ALL_PRODUCTS = [
    { id: 1, barcode: '899123410', name: 'Black Burger', price: 40000, category: 'Makanan' },
    { id: 2, barcode: '899123411', name: 'Black King Burger', price: 60000, category: 'Makanan' },
    { id: 3, barcode: '899123412', name: 'Mexican Burger', price: 45000, category: 'Makanan' },
    { id: 4, barcode: '899123413', name: 'Paket Ham Sandwich', price: 50000, category: 'Makanan' },
    { id: 5, barcode: '899123414', name: 'French Fries', price: 25000, category: 'Snack' },
    { id: 6, barcode: '899123415', name: 'Fanta Strawberry', price: 10000, category: 'Minuman' },
    { id: 7, barcode: '899123416', name: 'Fanta Orange', price: 10000, category: 'Minuman' },
    { id: 8, barcode: '899123417', name: 'Sprite', price: 10000, category: 'Minuman' },
    { id: 9, barcode: '899123418', name: 'Milo', price: 15000, category: 'Minuman' },
];

export const DUMMY_CUSTOMERS = [
    { id: 1, name: 'Setiawan Budi', type: 'anggota', no: '111111', saldo: 10000000, phone: '08123456789' },
    { id: 2, name: 'Ahmad Fauzi', type: 'anggota', no: '222222', saldo: 500000, phone: '08234567890' },
    { id: 3, name: 'Rini Hartati', type: 'anggota', no: '333333', saldo: 250000, phone: '08345678901' },
    { id: 4, name: 'Budi Santoso', type: 'anggota', no: '444444', saldo: 0, phone: '08456789012' },
    { id: 5, name: 'Siti Rahayu', type: 'anggota', no: '555555', saldo: 750000, phone: '08567890123' },
    { id: 6, name: 'Hendra Wijaya', type: 'anggota', no: '666666', saldo: 1200000, phone: '08678901234' },
    { id: 7, name: 'CV Maju Bersama', type: 'mitra', no: 'MITR001', phone: '02112345678' },
    { id: 8, name: 'Toko Sumber Rejeki', type: 'mitra', no: 'MITR002', phone: '02198765432' },
    { id: 9, name: 'UD Karya Mandiri', type: 'mitra', no: 'MITR003', phone: '0315678901' },
    { id: 10, name: 'PT Sejahtera Abadi', type: 'mitra', no: 'MITR004', phone: '02187654321' },
];

export const PAYMENT_METHODS = [
    { id: 'Tunai', icon: 'pi-wallet', label: 'Tunai' },
    { id: 'NonTunai', icon: 'pi-credit-card', label: 'Non Tunai' },
    { id: 'Voucher', icon: 'pi-ticket', label: 'Voucher' },
];

export const SHORTCUTS = [
    { key: 'F1', label: 'Tambah Produk' },
    { key: 'F2', label: 'Pelanggan' },
    { key: 'F3', label: 'Pel. Baru' },
    { key: 'F4', label: 'Hapus Item' },
    { key: 'F5', label: 'Kosongkan' },
    { key: 'F6', label: 'Parkir Trx' },
    { key: 'F7', label: 'Recall Trx' },
    { key: 'F8', label: 'Bayar Tunai' },
    { key: 'F12', label: 'Bayar' },
    { key: 'ESC', label: 'Keluar' },
];
