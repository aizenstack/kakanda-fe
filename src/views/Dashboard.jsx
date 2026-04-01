import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Icon from '../components/_Icon';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import SelectDateComponent from '../components/SelectDateComponent';
import { saleService } from '../services/saleService';
import { useNavigate } from 'react-router-dom';

function calcTrend(current, previous) {
    if (previous === 0) return { label: current > 0 ? '+100%' : '0%', isPositive: current >= 0 };
    const pct = ((current - previous) / previous) * 100;
    return {
        label: (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%',
        isPositive: pct >= 0,
    };
}

export default function Dashboard() {
    const navigate = useNavigate();

    const formatCurrency = useCallback((value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    }, []);

    const [dateRange, setDateRange] = useState(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = now;
        return { start, end };
    });

    const [allTransactions, setAllTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch a larger set for dashboard aggregations
            const res = await saleService.getAll({ limit: 1000 });
            setAllTransactions(res.data.data || []);
        } catch (err) {
            console.error("Dashboard fetch error", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const filteredTransactions = useMemo(() => {
        const { start, end } = dateRange || {};
        if (!start && !end) return allTransactions;
        return allTransactions.filter(tx => {
            const d = new Date(tx.transaction_date || tx.date);
            const afterStart = start ? d >= new Date(new Date(start).setHours(0, 0, 0, 0)) : true;
            const beforeEnd = end ? d <= new Date(new Date(end).setHours(23, 59, 59, 999)) : true;
            return afterStart && beforeEnd;
        });
    }, [dateRange, allTransactions]);

    const summaryStats = useMemo(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const yesterdayStr = new Date(now - 86400000).toISOString().split('T')[0];
        const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

        const filterPrefix = (arr, prefix) => arr.filter(tx => (tx.transaction_date || tx.date || '').startsWith(prefix));

        const sum = (arr) => arr.reduce((acc, tx) => acc + (Number(tx.total) || 0), 0);
        const items = (arr) => arr.reduce((acc, tx) => acc + (tx.details?.reduce((s, d) => s + Number(d.qty), 0) || tx.items || 0), 0);

        const todayTx = filterPrefix(allTransactions, todayStr);
        const yesterdayTx = filterPrefix(allTransactions, yesterdayStr);
        const thisMonthTx = filterPrefix(allTransactions, thisMonth);
        const lastMonthTx = filterPrefix(allTransactions, lastMonth);

        const tOmset = calcTrend(sum(todayTx), sum(yesterdayTx));
        const tTx = calcTrend(todayTx.length, yesterdayTx.length);
        const tItems = calcTrend(items(todayTx), items(yesterdayTx));
        const tBulan = calcTrend(sum(thisMonthTx), sum(lastMonthTx));

        return [
            { label: "Omset Penjualan", value: sum(filteredTransactions), isCurrency: true, trend: tOmset.label, isPositive: tOmset.isPositive, icon: "Wallet", color: "from-blue-500 to-indigo-600", bgIcon: "bg-blue-50", textCol: "text-blue-600" },
            { label: "Total Transaksi", value: filteredTransactions.length, isCurrency: false, trend: tTx.label, isPositive: tTx.isPositive, icon: "ShoppingCart", color: "from-purple-500 to-fuchsia-600", bgIcon: "bg-purple-50", textCol: "text-purple-600" },
            { label: "Total Items Terjual", value: items(filteredTransactions), isCurrency: false, trend: tItems.label, isPositive: tItems.isPositive, icon: "Package", color: "from-amber-500 to-orange-500", bgIcon: "bg-amber-50", textCol: "text-amber-600" },
            { label: "Omset Bulan Ini", value: sum(thisMonthTx), isCurrency: true, trend: tBulan.label, isPositive: tBulan.isPositive, icon: "TrendingUp", color: "from-emerald-500 to-teal-600", bgIcon: "bg-emerald-50", textCol: "text-emerald-600" },
        ];
    }, [filteredTransactions, allTransactions]);

    // Pilihan Range Grafik Khusus
    const [chartFilter, setChartFilter] = useState('mingguan'); // 'mingguan', 'bulanan', 'tahunan'
    const [isChartDropdownOpen, setIsChartDropdownOpen] = useState(false);

    const { chartLabels, chartData } = useMemo(() => {
        const labels = [];
        const data = [];
        const now = new Date();

        if (chartFilter === 'mingguan') {
            const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const total = allTransactions
                    .filter(tx => (tx.transaction_date || tx.date || '').startsWith(dateStr))
                    .reduce((acc, tx) => acc + (Number(tx.total) || 0), 0);
                labels.push(dayNames[d.getDay()]);
                data.push(total);
            }
        }
        else if (chartFilter === 'bulanan') {
            for (let i = 29; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const total = allTransactions
                    .filter(tx => (tx.transaction_date || tx.date || '').startsWith(dateStr))
                    .reduce((acc, tx) => acc + (Number(tx.total) || 0), 0);

                // Tampilkan label tiap 5 hari agar tidak sumpek
                labels.push(i % 5 === 0 || i === 0 || i === 29 ? d.getDate().toString() : '');
                data.push(total);
            }
        }
        else if (chartFilter === 'tahunan') {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
            for (let i = 11; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                const total = allTransactions
                    .filter(tx => (tx.transaction_date || tx.date || '').startsWith(monthStr))
                    .reduce((acc, tx) => acc + (Number(tx.total) || 0), 0);
                labels.push(monthNames[d.getMonth()]);
                data.push(total);
            }
        }

        return { chartLabels: labels, chartData: data };
    }, [allTransactions, chartFilter]);

    const chartOptions = {
        chart: {
            type: 'column',
            backgroundColor: 'transparent',
            style: { fontFamily: 'inherit' },
            height: 280
        },
        title: { text: null },
        xAxis: {
            categories: chartLabels,
            lineWidth: 0,
            tickWidth: 0,
            labels: {
                style: { color: '#94a3b8', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }
            }
        },
        yAxis: {
            title: { text: null },
            gridLineColor: '#f1f5f9',
            gridLineDashStyle: 'Dash',
            labels: {
                style: { color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' },
                formatter: function () {
                    return this.value >= 1000000 ? (this.value / 1000000) + 'M' : this.value;
                }
            }
        },
        plotOptions: {
            column: {
                borderRadius: 6,
                borderWidth: 0,
                pointPadding: 0.1,
                groupPadding: 0.1,
                states: { hover: { color: '#6366f1' } }
            }
        },
        tooltip: {
            backgroundColor: '#1e293b',
            borderColor: 'transparent',
            borderRadius: 8,
            padding: 12,
            style: { color: '#ffffff', fontSize: '12px' },
            formatter: function () {
                return '<div style="text-align:center"><span style="color:#94a3b8;font-size:10px;text-transform:uppercase;">' + this.x + '</span><br/><b>' +
                    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(this.y) + '</b></div>';
            },
            useHTML: true
        },
        series: [{
            name: 'Omset',
            data: chartData,
            color: {
                linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                stops: [[0, '#818cf8'], [1, '#e0e7ff']]
            },
            showInLegend: false
        }],
        credits: { enabled: false }
    };

    const recentTransactions = useMemo(() => {
        return filteredTransactions.slice(0, 5).map(tx => {
            const txDate = new Date(tx.transaction_date || tx.date);
            const diffMs = Date.now() - txDate.getTime();
            const diffMin = Math.floor(diffMs / 60000);
            let timeLabel;
            if (diffMin < 1) timeLabel = 'Baru saja';
            else if (diffMin < 60) timeLabel = `${diffMin} menit lalu`;
            else if (diffMin < 1440) timeLabel = `${Math.floor(diffMin / 60)} jam lalu`;
            else timeLabel = txDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });

            const methodIcon = tx.status === 'Tunai' ? 'Banknote'
                : tx.status === 'NonTunai' ? 'CreditCard'
                    : 'Ticket';

            return {
                id: tx.id,
                title: `${tx.partner_name || 'Walkin Customer'} · ${tx.code}`,
                time: timeLabel,
                amount: formatCurrency(tx.total || 0),
                items: tx.details?.reduce((s, d) => s + Number(d.qty), 0) || 0,
                method: tx.payment_method?.name || '-',
                icon: methodIcon,
            };
        });
    }, [filteredTransactions, formatCurrency]);


    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 bg-[#f8fafc] min-h-screen">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Ringkasan Bisnis
                    </h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        Pantau performa penjualan, metrik keuangan, dan aktivitas hari ini.
                    </p>
                </div>
                <div className="w-[280px] relative z-20 flex flex-col items-end">
                    <SelectDateComponent
                        value={dateRange}
                        onChange={(range) => setDateRange(range)}
                        placeholder="Pilih rentang tanggal..."
                    />
                    {loading && <span className="text-[10px] text-indigo-500 font-bold mt-1 animate-pulse">Memuat data...</span>}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {summaryStats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100/60 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.1)] transition-all duration-300 group overflow-hidden relative">
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-[0.03] group-hover:opacity-[0.08] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 transition-opacity duration-500`}></div>

                        <div className="flex items-start justify-between mb-6 relative z-10">
                            <div className={`w-12 h-12 ${stat.bgIcon} ${stat.textCol} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                                <Icon name={stat.icon} size={24} />
                            </div>
                            <div className={`flex items-center gap-1 text-[11px] font-black px-2 py-1 rounded-md shadow-sm border ${stat.isPositive ? 'text-emerald-700 bg-emerald-50 border-emerald-100/50' : 'text-rose-700 bg-rose-50 border-rose-100/50'}`}>
                                <Icon name={stat.isPositive ? "TrendingUp" : "TrendingDown"} size={12} strokeWidth={3} />
                                {stat.trend}
                            </div>
                        </div>

                        <div className="relative z-10">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                {stat.label}
                            </p>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                                {stat.isCurrency ? formatCurrency(stat.value) : stat.value}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000">

                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-black text-slate-800 tracking-tight">Performa Penjualan</h2>
                            <p className="text-[12px] font-medium text-slate-500 mt-1">
                                Grafik estimasi volume penjualan {chartFilter === 'mingguan' ? '7 hari' : chartFilter === 'bulanan' ? '30 hari' : '12 bulan'} terakhir
                            </p>
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setIsChartDropdownOpen(!isChartDropdownOpen)}
                                className="flex items-center gap-2 text-[12px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                            >
                                {chartFilter === 'mingguan' ? 'Mingguan' : chartFilter === 'bulanan' ? 'Bulanan' : 'Tahunan'} <Icon name="ChevronDown" size={14} />
                            </button>

                            {isChartDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsChartDropdownOpen(false)}></div>
                                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                        {['mingguan', 'bulanan', 'tahunan'].map(f => (
                                            <button
                                                key={f}
                                                onClick={() => { setChartFilter(f); setIsChartDropdownOpen(false); }}
                                                className={`w-full text-left px-4 py-2 text-[12px] font-bold hover:bg-slate-50 transition-colors ${chartFilter === f ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600'}`}
                                            >
                                                {f === 'mingguan' ? 'Mingguan' : f === 'bulanan' ? 'Bulanan' : 'Tahunan'}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 pb-2 border-b border-slate-100">
                        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
                    </div>
                    {chartData.every(v => v === 0) && (
                        <p className="text-center text-[12px] text-slate-400 mt-4">Belum ada transaksi pada periode ini</p>
                    )}
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-black text-slate-800 tracking-tight">Transaksi Terakhir</h2>
                            <p className="text-[11px] text-slate-400 mt-0.5">5 transaksi terbaru hari ini</p>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                            <Icon name="ReceiptText" size={16} />
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col space-y-4">
                        {recentTransactions.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 py-8">
                                <Icon name="ShoppingBag" size={32} strokeWidth={1.5} />
                                <p className="text-[12px] font-medium">Belum ada transaksi</p>
                            </div>
                        ) : (
                            recentTransactions.map((tx) => (
                                <div key={tx.id} className="flex items-center gap-3 group">
                                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-inner">
                                        <Icon name={tx.icon} size={16} strokeWidth={2} />
                                    </div>
                                    <div className="flex-1 min-w-0 border-b border-slate-50 pb-3">
                                        <p className="text-[12px] font-bold text-slate-800 truncate">{tx.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-medium text-slate-400">{tx.time}</span>
                                            <span className="text-[10px] text-slate-300">·</span>
                                            <span className="text-[10px] font-semibold text-slate-500">{tx.items} item</span>
                                        </div>
                                    </div>
                                    <div className="text-[12px] font-black text-emerald-600 pb-3 shrink-0">
                                        {tx.amount}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <button
                        onClick={() => navigate('/data-penjualan')}
                        className="mt-6 w-full py-3 rounded-xl border-2 border-slate-100 text-[12px] font-black text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all duration-200"
                    >
                        Lihat Riwayat Transaksi
                    </button>
                </div>
            </div>
        </div>
    );
}