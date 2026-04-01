const ShortCutMenus = [
    {
        name: "Dashboard",
        path: "/",
        icon: "layout-dashboard",
        keywords: ["home", "dashboard", "halaman utama", "beranda"]
    },
    {
        name: "Kelola Produk",
        path: "/products",
        icon: "package-search",
        keywords: ["manage product", "kelola produk", "produk", "list produk"]
    },
    {
        name: "Riwayat Penjualan",
        path: "/data-penjualan",
        icon: "history",
        keywords: ["penjualan", "history", "riwayat", "riwayat penjualan", "history sales", "sales"]
    },
    {
        name: "POS",
        path: "/sales",
        icon: "store",
        keywords: ["pos", "market", "store", "toko"]
    },
    {
        name: "Pengaturan Pembayaran",
        path: "/pengaturan/metode-pembayaran",
        icon: "credit-card",
        keywords: ["setting", "pengaturan", "metode pembayaran", "coa", "pembayaran"]
    },
    {
        name: "Tambah Produk Baru",
        type: "modal",
        action: "OPEN_MODAL_ADD_PRODUK"
    }
]

export default ShortCutMenus;
