import { useState, useEffect, useRef } from 'react';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { TieredMenu } from 'primereact/tieredmenu';
import { Button } from 'primereact/button';
import DataTableComponent from '../../components/DataTableComponent';
import AddProduct from '../../components/modal/product/AddProduct';
import DetailProduct from '../../components/modal/product/DetailProduct';
import EditProduct from '../../components/modal/product/EditProduct';
import { productService } from '../../services/productService';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useRef(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll();
      const mappedData = response.data.data.map(p => ({
        ...p,
        qty: p.inventories?.[0]?.stock || 0,
        price: p.inventories?.[0]?.default_price || 0,
      }));
      setProducts(mappedData);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAdjustMode, setIsAdjustMode] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [isConsignmentMode, setIsConsignmentMode] = useState(false);
  const menuExport = useRef(null);

  const handleExport = async (type) => {
    toast.current?.show({ severity: 'info', summary: 'Menyiapkan Data', detail: 'Tunggu sebentar, file sedang dibuat...', life: 2000 });
    try {
      await productService.exportProducts(type);
      toast.current?.show({ severity: 'success', summary: 'Berhasil', detail: 'File Excel sedang diunduh', life: 3000 });
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Gagal', detail: 'Gagal mengekspor data', life: 3000 });
    }
  };

  const exportItems = [
    { label: 'Export Semua Produk', icon: 'pi pi-file-excel', command: () => handleExport('all') },
    { label: 'Laporan Produk Expired', icon: 'pi pi-clock', command: () => handleExport('expired') },
    { label: 'Laporan Produk Kongsi', icon: 'pi pi-users', command: () => handleExport('consignment') },
  ];

  const columns = [
    {
      field: 'barcode', header: 'Barcode', sortable: true, width: '130px',
      body: (rowData) => (
        <span >
          {rowData.barcode}
        </span>
      )
    },
    {
      field: 'name', header: 'Nama Produk', sortable: true,
      body: (rowData) => (
        <span className="text-[13px] font-black text-slate-800">
          {rowData.name}
        </span>
      )
    },
    {
      field: 'qty', header: 'Sisa Stok', sortable: true, width: '100px',
      body: (rowData) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${rowData.qty > 10 ? 'bg-emerald-500' : rowData.qty > 0 ? 'bg-amber-500' : 'bg-rose-500'} shadow-sm`} />
          <span className={`text-[12px] font-black ${rowData.qty === 0 ? 'text-rose-600' : 'text-slate-700'}`}>
            {rowData.qty}
          </span>
        </div>
      )
    },
    { 
      field: 'price', 
      header: 'Harga Satuan', 
      sortable: true, 
      width: '150px',
      body: (rowData) => (
        <span className="font-black text-slate-700">
          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 2 }).format(rowData.price)}
        </span>
      )
    },
    {
      field: 'is_consignment', header: 'Tipe', width: '120px',
      body: (rowData) => (
        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${rowData.is_consignment
          ? 'text-amber-600 bg-amber-50 border-amber-100'
          : 'text-blue-600 bg-blue-50 border-blue-100'
          }`}>
          {rowData.is_consignment ? 'KONSINYASI' : 'NORMAL'}
        </span>
      )
    },
  ];

  const handleView = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleReturn = (product) => {
    setSelectedProduct(product);
    setIsAdjustMode(true);
    setShowDetailModal(true);
  };

  const handleSaveProduct = async () => {
    fetchProducts();
  };

  const handleDelete = (product) => {
    confirmDialog({
      message: `Apakah Anda yakin ingin menghapus produk "${product.name}"? Tindakan ini tidak dapat dibatalkan.`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-trash',
      acceptClassName: 'p-button-danger p-button-sm',
      acceptLabel: 'Ya, Hapus',
      rejectLabel: 'Batal',
      rejectClassName: 'p-button-text p-button-sm',
      accept: async () => {
        try {
          await productService.delete(product.id);
          fetchProducts();
          toast.current?.show({ 
            severity: 'success', 
            summary: 'Berhasil', 
            detail: `Produk "${product.name}" telah dihapus`, 
            life: 3000 
          });
        } catch (error) {
          console.error("Delete failed:", error);
          const errMsg = error.response?.data?.message || 'Gagal menghapus produk';
          toast.current?.show({ 
            severity: 'error', 
            summary: 'Gagal', 
            detail: errMsg, 
            life: 4000 
          });
        }
      }
    });
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleAddProduct = () => {
    fetchProducts();
  };

  const handleSyncAsis = (product) => {
    confirmDialog({
      message: `Sinkronisasi produk ${product.name} ke ASIS?`,
      header: 'Konfirmasi Sinkronisasi',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-primary p-button-sm',
      acceptLabel: 'Ya, Sinkronkan',
      rejectLabel: 'Batal',
      rejectClassName: 'p-button-text p-button-sm',
      accept: async () => {
        try {
          await productService.syncAsis(product.id);
          fetchProducts();
          toast.current.show({ severity: 'success', summary: 'Sukses', detail: 'Produk berhasil disinkronisasi ke ASIS' });
        } catch (error) {
          console.error("Sync failed:", error);
          const errMsg = error.response?.data?.message || error.response?.data?.detail || 'Gagal sinkronisasi produk';
          toast.current.show({ severity: 'error', summary: 'Gagal', detail: errMsg });
        }
      }
    });
  };

  const filteredProducts = products.filter(p => {
    if (filterType === 'consignment') return p.is_consignment;
    if (filterType === 'regular') return !p.is_consignment;
    return true;
  });


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 bg-[#f8fafc] min-h-screen">
      <Toast ref={toast} position="top-right" />
      <ConfirmDialog style={{ width: '400px' }} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-4 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.4)]" />
              <span className="text-[10px] font-bold text-blue-600 tracking-[0.2em] uppercase">Master Data</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Katalog Produk</h1>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 w-fit h-fit">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${filterType === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >SEMUA</button>
            <button
              onClick={() => setFilterType('consignment')}
              className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${filterType === 'consignment' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >KONGSI</button>
            <button
              onClick={() => setFilterType('regular')}
              className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${filterType === 'regular' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >NORMAL</button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <TieredMenu model={exportItems} popup ref={menuExport} />
          <button
            onClick={(e) => menuExport.current.toggle(e)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-slate-100 text-slate-500 rounded-xl text-[12px] font-black hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95 shadow-sm"
          >
            <i className="pi pi-download" />
            <span>Export Laporan</span>
          </button>
          <button
            onClick={() => { setIsConsignmentMode(false); setShowAddModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[12px] font-black hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            <i className="pi pi-plus" />
            <span>Produk Normal</span>
          </button>
          <button
            onClick={() => { setIsConsignmentMode(true); setShowAddModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl text-[12px] font-black hover:bg-amber-600 transition-all shadow-lg active:scale-95"
          >
            <i className="pi pi-users" />
            <span>Produk Kongsi</span>
          </button>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
        <DataTableComponent
          data={filteredProducts}
          loading={loading}
          columns={columns}
          title="Daftar Produk"
          searchable={true}
          sortable={true}
          pageable={true}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReturn={handleReturn}
          onRefresh={fetchProducts}
          onSyncAsis={handleSyncAsis}
          showIndex={true}
        />
      </div>

      <AddProduct
        visible={showAddModal}
        onHide={() => setShowAddModal(false)}
        onAdd={handleAddProduct}
        initialConsignment={isConsignmentMode}
      />

      <DetailProduct
        visible={showDetailModal}
        onHide={() => {
          setShowDetailModal(false);
          setIsAdjustMode(false);
        }}
        product={selectedProduct}
        onEdit={handleEdit}
        onRefresh={fetchProducts}
        initialShowAdjust={isAdjustMode}
      />

      <EditProduct
        visible={showEditModal}
        onHide={() => setShowEditModal(false)}
        product={selectedProduct}
        onSave={handleSaveProduct}
      />
    </div>
  );
}
