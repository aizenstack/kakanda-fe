import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect, useMemo } from "react";
import Icon from "../_Icon";
import { authService } from "../../services/authService";
import { saleService } from "../../services/saleService";

const NAV_SHORTCUTS = [
  { label: "Dashboard", path: "/", icon: "LayoutDashboard", desc: "Ringkasan bisnis & statistik" },
  { label: "POS / Kasir", path: "/sales", icon: "ShoppingCart", desc: "Transaksi penjualan" },
  { label: "Produk", path: "/products", icon: "Package", desc: "Manajemen katalog produk" },
  { label: "Data Penjualan", path: "/data-penjualan", icon: "History", desc: "Riwayat transaksi penjualan" },
];

const fmt = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v || 0);

export default function Topbar({ onToggleSidebar, isSidebarMinimized, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTx, setSelectedTx] = useState(null);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const txPanelRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
        setSearchQuery("");
      }
      if (txPanelRef.current && !txPanelRef.current.contains(event.target)) {
        setSelectedTx(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery("");
        setSelectedTx(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const [searchedTxs, setSearchedTxs] = useState([]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchedTxs([]);
        return;
      }
      try {
        const res = await saleService.getAll({
          search: searchQuery,
          limit: 5
        });
        const mapped = (res.data.data || []).map(tx => ({
          id: tx.code,
          realId: tx.id,
          customer: tx.partner_name || 'Walkin Customer',
          total: Number(tx.total) || 0,
          status: tx.coa?.type === 'TUNAI' ? 'Tunai' : (tx.coa?.name || 'Non Tunai'),
          date: tx.transaction_date ? new Date(tx.transaction_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-',
          original: tx
        }));
        setSearchedTxs(mapped);
      } catch (err) {
        console.error("Topbar search error", err);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const openTxDetail = (tx) => {
    setSelectedTx(tx.original || tx);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const filteredNav = useMemo(() => {
    if (!searchQuery.trim()) return NAV_SHORTCUTS;
    const q = searchQuery.toLowerCase();
    return NAV_SHORTCUTS.filter(n =>
      n.label.toLowerCase().includes(q) || n.desc.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredTransactions = searchedTxs;

  const pageTitle = useMemo(() => {
    const match = NAV_SHORTCUTS.find(n => location.pathname === n.path || (n.path !== '/' && location.pathname.startsWith(n.path)));
    return match?.label ?? "KOPERASI KAKANDA";
  }, [location.pathname]);

  const timeStr = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const dateStr = currentTime.toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short' });

  const handleLogout = async () => {
    await authService.logout();
    navigate('/auth/login');
  };

  const methodBadge = (status) => {
    if (status === 'Tunai') return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    if (status === 'NonTunai') return 'bg-indigo-50 text-indigo-600 border border-indigo-100';
    return 'bg-amber-50 text-amber-600 border border-amber-100';
  };

  return (
    <>
      <header className="h-[64px] bg-white border-b border-slate-100 sticky top-0 z-40 w-full flex items-center px-5 gap-4 shadow-[0_1px_0_0_#f1f5f9]">

        <div className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0" onClick={() => navigate("/")}>
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 rotate-45 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700" />
            <Icon name="Store" className="text-white relative z-10" size={18} />
          </div>
          <div className="hidden sm:block">
            <p className="text-[14px] font-black text-slate-800 tracking-tight leading-none uppercase">KAKANDA</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-0.5">Koperasi Kakanda</p>
          </div>
        </div>

        <button
          onClick={onToggleSidebar}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all flex-shrink-0 mx-2"
          aria-label="Toggle Menu"
        >
          <Icon name={isSidebarMinimized ? "Menu" : "Menu"} size={16} />
        </button>

        <div className="hidden sm:block h-6 w-px bg-slate-200 flex-shrink-0" />

        <p className="hidden md:block text-[13px] font-bold text-slate-500 flex-shrink-0">{pageTitle}</p>

        <div className="relative flex-1 max-w-sm" ref={searchRef}>
          <div
            onClick={() => { setIsSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[13px] cursor-text transition-all duration-200 ${isSearchOpen ? 'bg-white border-indigo-300 ring-4 ring-indigo-500/10' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
          >
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari menu, kode trx, pelanggan..."
              className="bg-transparent border-none outline-none w-full text-slate-700 font-medium placeholder:text-slate-400 placeholder:font-normal text-[13px]"
            />
            <div className="flex items-center gap-0.5 flex-shrink-0 opacity-50">
              <kbd className="px-1.5 py-0.5 text-[9px] font-bold bg-white border border-slate-200 rounded text-slate-500 shadow-sm">⌘</kbd>
              <kbd className="px-1.5 py-0.5 text-[9px] font-bold bg-white border border-slate-200 rounded text-slate-500 shadow-sm">K</kbd>
            </div>
          </div>

          {isSearchOpen && (
            <div className="absolute top-full mt-2 left-0 bg-white border border-slate-100 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150" style={{ minWidth: '360px' }}>

              {filteredNav.length > 0 && (
                <div className="p-2">
                  {searchQuery.trim() && (
                    <p className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Menu</p>
                  )}
                  {filteredNav.map(item => (
                    <button
                      key={item.path}
                      onClick={() => { navigate(item.path); setIsSearchOpen(false); setSearchQuery(""); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                    >
                      <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                        <Icon name={item.icon} size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-bold text-slate-800">{item.label}</p>
                        <p className="text-[11px] text-slate-400 font-medium truncate">{item.desc}</p>
                      </div>
                      <Icon name="ArrowRight" size={13} className="text-slate-300 flex-shrink-0 group-hover:text-indigo-500 transition-colors" />
                    </button>
                  ))}
                </div>
              )}

              {filteredTransactions.length > 0 && (
                <>
                  <div className="h-px bg-slate-100 mx-3" />
                  <div className="p-2">
                    <p className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaksi</p>
                    {filteredTransactions.map(tx => (
                      <button
                        key={tx.id}
                        onClick={() => openTxDetail(tx)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50 active:scale-[0.98] transition-all text-left group"
                      >
                        <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                          <Icon name="ReceiptText" size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-bold text-slate-800 font-mono group-hover:text-indigo-700">{tx.id}</p>
                          <p className="text-[11px] text-slate-400 font-medium">{tx.customer} &middot; {tx.date}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-[12px] font-black text-slate-700">{fmt(tx.total)}</span>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest ${methodBadge(tx.status)}`}>{tx.status}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {searchQuery.trim() && filteredNav.length === 0 && filteredTransactions.length === 0 && (
                <div className="flex flex-col items-center py-8 gap-2 text-slate-400">
                  <Icon name="SearchX" size={24} strokeWidth={1.5} />
                  <p className="text-[12px] font-medium">Tidak ada hasil untuk &ldquo;{searchQuery}&rdquo;</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          <div className="hidden lg:flex flex-col items-end mr-1">
            <span className="text-[13px] font-black text-slate-700 tabular-nums leading-none">{timeStr}</span>
            <span className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wide">{dateStr}</span>
          </div>
          <div className="hidden lg:block h-6 w-px bg-slate-200" />

          <button
            onClick={() => navigate('/pengaturan/printer')}
            className="relative p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 group"
            title="Koneksi Printer Bluetooth/USB"
          >
            <Icon name="Bluetooth" size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />
          </button>

          <button className="relative p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200">
            <Icon name="Bell" size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
          </button>

          <div className="h-6 w-px bg-slate-200" />

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100/50 bg-white transition-all duration-200 group"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center overflow-hidden border border-indigo-100 flex-shrink-0">
                <img
                  src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=eff6ff&color=4f46e5&bold=true&size=64`}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-[12px] font-black text-slate-700 leading-none group-hover:text-slate-900">{user?.name || 'Admin'}</span>
                <span className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{user?.role || 'KASIR'}</span>
              </div>
              <Icon name="ChevronDown" size={13} className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-indigo-500' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-100 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3.5 border-b border-slate-50 bg-gradient-to-br from-indigo-50/60 to-white">
                  <p className="text-[13px] font-black text-slate-800">{user?.name || 'Admin Koperasi'}</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">{user?.email || (user?.username ? `${user.username}@asis.com` : 'user@koperasi.com')}</p>
                  <span className="inline-block mt-2 text-[9px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
                    {user?.role || 'Kasir'}
                  </span>
                </div>
                <div className="p-2 space-y-0.5">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 text-[12px] font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all group">
                    <Icon name="User" size={15} className="text-slate-400 group-hover:text-indigo-500" />
                    Profil Saya
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 text-[12px] font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all group">
                    <Icon name="Settings" size={15} className="text-slate-400 group-hover:text-indigo-500" />
                    Pengaturan Sistem
                  </button>
                  <div className="h-px bg-slate-100 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-[12px] font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all group"
                  >
                    <Icon name="LogOut" size={15} className="text-rose-400 group-hover:text-rose-600" />
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {selectedTx && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40 animate-in fade-in duration-200"
            onClick={() => setSelectedTx(null)}
          />
          <div
            ref={txPanelRef}
            className="fixed top-0 right-0 h-full w-[360px] bg-white shadow-[0_0_60px_-10px_rgba(0,0,0,0.2)] z-50 flex flex-col animate-in slide-in-from-right duration-250"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/60 to-white flex-shrink-0">
              <div>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-0.5">Detail Transaksi</p>
                <p className="text-[15px] font-black text-slate-800 font-mono">{selectedTx.id}</p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <Icon name="X" size={16} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-3 border-b border-slate-100 flex-shrink-0">
              {[
                { icon: 'User', label: 'Pelanggan', val: selectedTx.customer || 'Walkin Customer' },
                {
                  icon: 'CalendarDays', label: 'Waktu',
                  val: selectedTx.date
                    ? new Date(selectedTx.date).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : '-'
                },
                {
                  icon: 'CreditCard', label: 'Metode Bayar',
                  val: selectedTx.status || '-',
                  badge: true,
                  badgeColor: methodBadge(selectedTx.status)
                },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name={row.icon} size={13} className="text-slate-400" />
                  </div>
                  <div className="flex-1 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{row.label}</span>
                    {row.badge
                      ? <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${row.badgeColor}`}>{row.val}</span>
                      : <span className="text-[12px] font-bold text-slate-700 text-right">{row.val}</span>
                    }
                  </div>
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Item Dibeli</p>
              {(selectedTx.details || selectedTx.cart || []).length === 0 ? (
                <p className="text-[12px] text-slate-400 text-center py-6">Tidak ada data item</p>
              ) : (
                <div className="space-y-2">
                  {(selectedTx.details || selectedTx.cart || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors"
                    >
                      <div className="w-7 h-7 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-[11px] font-black text-slate-500 flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-slate-800 truncate">{item.product?.name || item.name || item.id}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{item.qty} × {fmt(item.price)}</p>
                      </div>
                      <span className="text-[12px] font-black text-slate-700 flex-shrink-0">{fmt((item.price || 0) * (item.qty || 0))}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/60 flex-shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-slate-500">Total Transaksi</span>
                <span className="text-[18px] font-black text-slate-900">{fmt(selectedTx.total)}</span>
              </div>
              {selectedTx.discount > 0 && (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-slate-400">Diskon</span>
                  <span className="text-[11px] font-bold text-rose-500">-{fmt(selectedTx.discount)}</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
