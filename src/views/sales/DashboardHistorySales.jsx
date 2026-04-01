import React, { useState, useRef } from "react";
import { saleService } from "../../services/saleService";
import { printReceipt } from "../../services/printService";
import DataTableComponent from "../../components/DataTableComponent";
import { Toast } from "primereact/toast";
import Icon from "../../components/_Icon";
import DetailHistorySales from "../../components/modal/history-sales/DetailHistorySales";
import EditHistorySales from "../../components/modal/history-sales/EditHistorySalees";
import SelectDateComponent from "../../components/SelectDateComponent";

export default function DashboardHistorySales() {
  const toast = useRef(null);
  const [loading, setLoading] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [historyData, setHistoryData] = useState([]);
  const [selectedDate, setSelectedDate] = useState({ start: new Date(), end: new Date() });

  const fetchHistory = React.useCallback(async () => {
    setLoading(true);
    try {
      const startDate = selectedDate?.start
          ? `${selectedDate.start.getFullYear()}-${String(selectedDate.start.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.start.getDate()).padStart(2, '0')}`
          : '';
      const endDate = selectedDate?.end
          ? `${selectedDate.end.getFullYear()}-${String(selectedDate.end.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.end.getDate()).padStart(2, '0')}`
          : startDate;

      const res = await saleService.getAll({ start_date: startDate, end_date: endDate });
      const mapped = (res.data.data || []).map(tx => {
        const coaType = (tx?.coa?.type || '').toUpperCase();
        const coaName = (tx?.coa?.name || '').toUpperCase();
        const pmName = (tx?.paymentMethod?.name || '').toUpperCase();
        const searchStr = `${coaType} ${coaName} ${pmName}`;
        
        let txStatus = 'Non-Tunai';
        if (searchStr.includes('VOUCHER')) {
            txStatus = 'Voucher';
        } else if (coaType === 'TUNAI' || coaName.includes('TUNAI') || pmName.includes('TUNAI') || pmName.includes('CASH')) {
            txStatus = 'Tunai';
        }

        return {
          ...tx,
          uuid: tx.id,
          id: tx.code,
          date: tx.transaction_date,
          customer: tx.partner_name || "Walk-in Customer",
          items: tx.details?.reduce((acc, d) => acc + Number(d.qty), 0) || 0,
          total: Number(tx.total),
          status: txStatus,
          uploaded: tx.is_closing
        };
      });
      setHistoryData(mapped);
    } catch (err) {
      console.error("Failed to fetch sales history", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  React.useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);



  const columns = [
    {
      field: "id",
      header: "Kode",
      sortable: true,
      width: "140px",
      body: (rowData) => (
        <span className="font-mono text-[11px] font-semibold text-slate-700">
          {rowData.id}
        </span>
      ),
    },

    {
      field: "date",
      header: "Tanggal",
      sortable: true,
      width: "160px",
      body: (rowData) => (
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-slate-700">
            {new Date(rowData.date).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
          <span className="text-[9px] text-slate-400 font-medium">
            {new Date(rowData.date).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ),
    },
    {
      field: "customer",
      header: "Pelanggan",
      sortable: true,
      body: (rowData) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
            <Icon name="User" size={10} className="text-slate-400" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700">
            {rowData.customer}
          </span>
        </div>
      ),
    },
    {
      field: "items",
      header: "Qty",
      sortable: true,
      width: "80px",
      body: (rowData) => (
        <div className="flex justify-center">
          <span className="text-[11px] font-black text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
            {rowData.items}
          </span>
        </div>
      ),
    },
    {
      field: "total",
      header: "Total",
      sortable: true,
      width: "140px",
      body: (rowData) => (
        <span className="text-[12px] font-black text-slate-900">
          {rowData.total.toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          })}
        </span>
      ),
    },
    {
      field: "status",
      header: "Metode",
      sortable: true,
      width: "150px",
      body: (rowData) => (
        <div className="flex items-center gap-2 text-[12px] font-bold text-slate-700">
          <Icon
            name={rowData.status === "Tunai" ? "Wallet" : "CreditCard"}
            size={14}
            className="text-slate-400"
          />
          {rowData.status}
        </div>
      ),
    },
  ];

  const handleUpload = () => {
    toast.current?.show({
      severity: 'info',
      summary: 'Informasi',
      detail: 'Fitur Upload Jurnal masih dalam tahap pengembangan',
      life: 3000
    });
  };


  const handlePrint = async (data) => {
    const cart = (data.details || []).map(d => ({
        name: d.product?.name || "Produk",
        qty: Number(d.qty),
        price: Number(d.price),
        disc: Number(d.discount_percent || 0),
    }));

    if (cart.length === 0) {
        // Fallback jika detail tidak ada (seharusnya tidak terjadi)
        cart.push({
            name: "Item",
            qty: data.items || 1,
            price: Math.round(data.total / (data.items || 1)),
            disc: 0,
        });
    }

    const subtotal = cart.reduce((acc, i) => {
      const discVal = i.price * ((i.disc || 0) / 100);
      return acc + ((i.price - discVal) * i.qty);
    }, 0);
    const discount = data.discount || 0;
    const tax = Math.round(subtotal * 0.1);

    const d = new Date(data.date);
    const dateStr = d.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" })
      + " " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    const txData = {
      kasirName: data.cashier || "Admin",
      noStruk: data.id,
      date: dateStr,
      cart,
      subtotal,
      discount,
      tax,
      grandTotal: data.total,
      paymentMethod: data.status,
      cash: data.cash || 0,
      changes: data.change || 0,
      customerName: data.customer || "Walkin Customer",
    };

    const success = await printReceipt(txData);

    if (success) {
      toast.current.show({
        severity: "success",
        summary: "Cetak Nota",
        detail: `Nota ${data.id} berhasil dikirim ke printer`,
        life: 2500,
      });
    } else {
      toast.current.show({
        severity: "error",
        summary: "Gagal Cetak",
        detail: "Pastikan QZ Tray aktif dan printer terhubung",
        life: 4000,
      });
    }
  };

  const handleDetail = (data) => {
    setSelectedTransaction(data);
    setShowDetail(true);
  };

  const handleEdit = (data) => {
    setSelectedTransaction(data);
    setShowEdit(true);
  };

  const handleSaveTransaction = (updated) => {
    setHistoryData(prev => {
      const newList = prev.map(t => t.id === updated.id ? updated : t);
      localStorage.setItem('pos_transactions', JSON.stringify(newList));
      return newList;
    });
    toast.current.show({
      severity: "success",
      summary: "Berhasil",
      detail: `Transaksi ${updated.id} berhasil diperbarui`,
      life: 3000,
    });
  };

  return (
    <div className="p-5 space-y-6 bg-[#f7f8fc] min-h-screen">
      <Toast ref={toast} />

      <div className="flex flex-wrap items-end justify-between gap-6 pb-2">
        <div className="flex-1 min-w-[300px]">
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-1.5 h-4 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
            <span className="text-[10px] font-black text-blue-600 tracking-[0.2em] uppercase">
              Sales Module
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Riwayat Transaksi
          </h1>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">
            Kelola dan pantau seluruh aktivitas penjualan Anda secara real-time
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-[350px]">
             <SelectDateComponent 
                value={selectedDate} 
                onChange={setSelectedDate} 
             />
          </div>

          <div className="w-px h-8 bg-slate-200 mx-1 hidden sm:block" />

          {isBatchMode && (
            <div className="flex items-center gap-1.5 bg-white border border-slate-100 rounded-xl px-2 py-1.5 shadow-sm animate-in fade-in slide-in-from-right-3 duration-200">
              <button
                onClick={() => setSelectedItems(historyData.filter(tx => !tx.uploaded))}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"
              >
                <Icon name="CheckCheck" size={11} />
                Pilih Semua
              </button>
              <div className="w-px h-4 bg-slate-100" />
              <button
                onClick={() => setSelectedItems([])}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-400 transition-all group"
                title="Reset"
              >
                <Icon
                  name="RotateCcw"
                  size={11}
                  className="group-hover:-rotate-90 transition-transform duration-300"
                />
              </button>
            </div>
          )}

          {isBatchMode && selectedItems?.length > 0 && (
            <button
              onClick={() => handleUpload(selectedItems)}
              className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-xl text-[10px] font-black text-white shadow-lg shadow-blue-200/60 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95 animate-in fade-in zoom-in duration-200"
            >
              <Icon name="CloudUpload" size={13} />
              Upload ({selectedItems.length})
            </button>
          )}

          <div className="flex items-center bg-white border border-slate-100 rounded-xl p-1 shadow-sm gap-0.5">
            <button
              onClick={() => {
                setIsBatchMode(false);
                setSelectedItems([]);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${!isBatchMode
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-600"
                }`}
            >
              <Icon name="User" size={11} />
              Single
            </button>
            <button
              onClick={() => setIsBatchMode(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${isBatchMode
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-600"
                }`}
            >
              <Icon name="Users" size={11} />
              Batch
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <DataTableComponent
          data={historyData}
          columns={columns}
          loading={loading}
          onView={handleDetail}
          onUpload={isBatchMode ? null : handleUpload}
          onPrint={handlePrint}
          showIndex={true}
          selectionMode={isBatchMode ? "multiple" : null}
          selection={isBatchMode ? selectedItems : []}
          onSelectionChange={(e) => setSelectedItems(e.value || [])}
          onRefresh={fetchHistory}
          isDataSelectable={(e) => !e.data?.uploaded}
          dataKey="id"
          title="Daftar Transaksi"
        />
      </div>
      <DetailHistorySales
        visible={showDetail}
        onHide={() => setShowDetail(false)}
        transaction={selectedTransaction}
        onEdit={handleEdit}
        onPrint={handlePrint}
      />

      <EditHistorySales
        visible={showEdit}
        onHide={() => setShowEdit(false)}
        transaction={selectedTransaction}
        onSave={handleSaveTransaction}
      />
    </div>
  );
}
