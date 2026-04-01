import React, { useState } from 'react';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from 'primereact/inputtext';
import Icon from './_Icon';

export default function DataTableComponent({
  data = [],
  columns = [],
  loading = false,
  onEdit = null,
  onDelete = null,
  onAdd = null,
  onView = null,
  onPrint = null,
  onPost = null,
  onUpload = null,
  onReturn = null,
  onRefresh = null,
  onSyncAsis = null,
  showIndex = false,
  title = "Data Table",
  searchable = true,
  sortable = true,
  pageable = true,
  selection = null,
  onSelectionChange = null,
  selectionMode = null,
  rowExpansionTemplate = null,
  expandedRows = null,
  onRowToggle = null,
  dataKey = "id",
  isDataSelectable = null,
}) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '-';
    return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
  };

  const formatDate = (value) => {
    if (!value) return '-';
    try {
      return new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return value;
    }
  };

  const imageBodyTemplate = (rowData, field) => {
    const imageUrl = rowData[field];
    return imageUrl ? (
      <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-100/50 bg-slate-50 group-hover:shadow-md transition-all duration-300">
        <img src={imageUrl} alt="Image" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      </div>
    ) : (
      <div className="w-10 h-10 bg-slate-50 flex items-center justify-center rounded-xl border border-dashed border-slate-200">
        <Icon name="Image" size={16} className="text-slate-300" />
      </div>
    );
  };

  const actionBodyTemplate = (rowData) => {
    const isReturnedConsignment = rowData.is_consignment && rowData.qty === 0;

    return (
      <div className="flex items-center justify-end gap-1">
        <div className="flex items-center bg-white border border-slate-200/60 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-0.5 pointer-events-auto">
          {(!isReturnedConsignment && onView) && (
            <button onClick={() => onView(rowData)} title="Detail"
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group active:scale-95">
              <Icon name="Eye" size={14} className="group-hover:scale-110 transition-transform duration-300" />
            </button>
          )}
          {(!isReturnedConsignment && onEdit) && (
            <button onClick={() => onEdit(rowData)} title="Edit"
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all duration-200 group active:scale-95">
              <Icon name="Pencil" size={13} className="group-hover:scale-110 transition-transform duration-300" />
            </button>
          )}
          {(!isReturnedConsignment && onUpload && !rowData.uploaded) && (
            <button onClick={() => onUpload(rowData)} title="Upload ke Jurnal"
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all duration-200 group active:scale-95">
              <Icon name="CloudUpload" size={14} className="group-hover:-translate-y-0.5 transition-transform duration-300" />
            </button>
          )}
          {(!isReturnedConsignment && onSyncAsis && !rowData.asis_id) && (
            <button onClick={() => onSyncAsis(rowData)} title="Sync ASIS"
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group active:scale-95">
              <Icon name="RefreshCw" size={14} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>
          )}
  
          {(!isReturnedConsignment && onPost && (!rowData.status || rowData.status === 'DRAFT')) && (
            <button onClick={() => onPost(rowData)} title="Posting / Sinkron"
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 group active:scale-95">
              <Icon name="Cloud" size={14} className="group-hover:scale-110 transition-transform duration-300" />
            </button>
          )}
          {(!isReturnedConsignment && onPost && rowData.status && rowData.status !== 'DRAFT') && (
            <div title="Diposting" className="w-8 h-8 flex items-center justify-center text-emerald-500 bg-emerald-50 rounded-lg">
                <Icon name="CheckCircle" size={14} />
            </div>
          )}
          {(!isReturnedConsignment && onPrint) && (
            <button onClick={() => onPrint(rowData)} title="Cetak Struk"
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 group active:scale-95">
              <Icon name="Printer" size={14} className="group-hover:scale-110 transition-transform duration-300" />
            </button>
          )}
          {(!isReturnedConsignment && onReturn && rowData.is_consignment !== false && rowData.qty > 0) && (
            <button onClick={() => onReturn(rowData)} title="Tarik / Retur Stok"
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all duration-200 group active:scale-95">
              <Icon name="RotateCcw" size={13} className="group-hover:-rotate-45 transition-transform duration-300" />
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(rowData)} title="Hapus"
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200 group active:scale-95">
              <Icon name="Trash2" size={14} className="group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderColumnBody = (rowData, col) => {
    if (col.body) return col.body(rowData, col);
    if (col.type === 'image') return imageBodyTemplate(rowData, col.field);
    if (col.type === 'currency') return formatCurrency(rowData[col.field]);
    if (col.type === 'date') return formatDate(rowData[col.field]);
    const val = rowData[col.field];
    return val === null || val === undefined ? <span className="text-slate-300 font-medium">—</span> : val;
  };

  const header = (
    <div className="flex flex-wrap items-center justify-between px-6 py-5 border-b border-slate-100 gap-y-4 bg-white rounded-t-2xl">
      <div className="flex items-center gap-3 min-w-[200px]">
        <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.2)]"></div>
        <div>
          <h2 className="text-[15px] font-black text-slate-900 tracking-tight leading-none">{title}</h2>
          <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest">{data?.length || 0} Records Found</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        {searchable && (
          <div className="relative flex-1 sm:flex-none min-w-[240px] flex items-center">
            <InputText
              type="search"
              onInput={(e) => setGlobalFilter(e.target.value)}
              placeholder="Cari data..."
              className="w-full border border-slate-200 bg-slate-50/80 rounded-xl py-2.5 px-4 text-[12px] font-semibold text-slate-700 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all outline-none"
            />
          </div>
        )}

        {onAdd && (
          <button
            onClick={onAdd}
            className="h-9 px-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:shadow-[0_8px_20px_-6px_rgba(59,130,246,0.6)] hover:-translate-y-0.5 active:scale-95 border border-transparent"
          >
            <Icon name="Plus" size={14} />
            <span>Tambah</span>
          </button>
        )}

        <button
          onClick={() => {
             setGlobalFilter('');
             setFirst(0);
             if (typeof window !== 'undefined' && document.querySelector('input[type="search"]')) {
                 document.querySelector('input[type="search"]').value = '';
             }
             if (onRefresh) onRefresh();
          }}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 bg-white border border-slate-200 shadow-sm hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all duration-300 group active:scale-95"
          title="Refresh Data"
        >
          <Icon name="RotateCcw" size={14} className="group-hover:-rotate-90 transition-transform duration-500" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full bg-transparent">
      <style>{`
        /* ─── Header ─── */
        .p-datatable-header {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
        }

        /* ─── Column Headers ─── */
        .p-datatable .p-datatable-thead > tr > th {
          background: #f8fafc !important;
          color: #64748b !important;
          font-size: 0.65rem !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          padding: 0.85rem 1.5rem !important;
          border-top: 1px solid #f1f5f9 !important;
          border-bottom: 2px solid #e2e8f0 !important;
          border-left: none !important;
          border-right: none !important;
          white-space: nowrap !important;
          transition: background 0.3s ease !important;
        }
        .p-datatable .p-datatable-thead > tr > th:first-child {
          border-top-left-radius: 0 !important;
        }
        .p-datatable .p-datatable-thead > tr > th:last-child {
          border-top-right-radius: 0 !important;
        }

        /* ─── Sort ─── */
        .p-datatable .p-sortable-column .p-sortable-column-icon {
          color: #cbd5e1 !important;
          font-size: 0.6rem !important;
          transition: all 0.3s !important;
          margin-left: 0.5rem !important;
        }
        .p-datatable .p-sortable-column:not(.p-highlight):hover {
          background: #f1f5f9 !important;
          color: #0f172a !important;
        }
        .p-datatable .p-sortable-column:not(.p-highlight):hover .p-sortable-column-icon {
          color: #94a3b8 !important;
        }
        .p-datatable .p-sortable-column.p-highlight {
          background: #eff6ff !important;
          color: #2563eb !important;
        }
        .p-datatable .p-sortable-column.p-highlight .p-sortable-column-icon {
          color: #3b82f6 !important;
        }

        /* ─── Rows ─── */
        .p-datatable .p-datatable-tbody > tr {
          background: #ffffff !important;
          border-bottom: 1px solid #f1f5f9 !important;
          transition: all 0.2s ease !important;
          position: relative;
        }
        .p-datatable .p-datatable-tbody > tr.p-rowgroup-header {
           background: #f8fafc !important;
        }
        .p-datatable .p-datatable-tbody > tr:hover {
          background: #f8fafc !important;
          box-shadow: 0 4px 20px -10px rgba(0,0,0,0.05) !important;
          z-index: 10;
        }
        .p-datatable .p-datatable-tbody > tr.p-highlight {
          background: #eff6ff !important;
          color: #1e3a8a !important;
        }

        /* ─── Checkbox Options ─── */
        .p-datatable .p-selection-column {
          width: 3rem !important;
          text-align: center !important;
        }
        .p-checkbox-box {
          width: 1.1rem !important;
          height: 1.1rem !important;
          border-radius: 4px !important;
          border: 1.5px solid #cbd5e1 !important;
          transition: all 0.2s !important;
        }
        .p-checkbox-box.p-highlight {
          border-color: #2563eb !important;
          background: #2563eb !important;
          box-shadow: 0 0 0 0.1rem rgba(37,99,235,0.2) !important;
        }

        /* ─── Cells ─── */
        .p-datatable .p-datatable-tbody > tr > td {
          padding: 1rem 1.5rem !important;
          border: none !important;
          vertical-align: middle !important;
          color: #475569 !important;
          font-size: 0.82rem !important;
          font-weight: 600 !important;
        }

        /* ─── Empty ─── */
        .p-datatable .p-datatable-emptymessage > td {
          padding: 4rem 2rem !important;
          text-align: center !important;
          background: #ffffff !important;
        }

        /* ─── Paginator ─── */
        .p-paginator {
          background: #ffffff !important;
          border-top: 1px dashed #e2e8f0 !important;
          padding: 1rem 1.5rem !important;
          gap: 0.3rem !important;
          justify-content: flex-end !important;
          border-bottom-left-radius: 1rem !important;
          border-bottom-right-radius: 1rem !important;
        }
        .p-paginator .p-paginator-first,
        .p-paginator .p-paginator-prev,
        .p-paginator .p-paginator-next,
        .p-paginator .p-paginator-last {
          min-width: 2rem !important;
          height: 2rem !important;
          border-radius: 8px !important;
          color: #94a3b8 !important;
          transition: all 0.2s !important;
          background: transparent !important;
          border: 1px solid transparent !important;
        }
        .p-paginator .p-paginator-first:not(.p-disabled):hover,
        .p-paginator .p-paginator-prev:not(.p-disabled):hover,
        .p-paginator .p-paginator-next:not(.p-disabled):hover,
        .p-paginator .p-paginator-last:not(.p-disabled):hover {
          background: #f1f5f9 !important;
          color: #3b82f6 !important;
          border-color: #e2e8f0 !important;
        }
        .p-paginator .p-paginator-pages .p-paginator-page {
          min-width: 2rem !important;
          height: 2rem !important;
          border-radius: 8px !important;
          font-size: 0.75rem !important;
          font-weight: 700 !important;
          color: #64748b !important;
          border: 1px solid transparent !important;
          margin: 0 2px !important;
          transition: all 0.2s !important;
        }
        .p-paginator .p-paginator-pages .p-paginator-page:hover {
          background: #f1f5f9 !important;
          color: #2563eb !important;
        }
        .p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
          background: #2563eb !important;
          color: #fff !important;
          font-weight: 800 !important;
          border-color: #2563eb !important;
          box-shadow: 0 4px 10px -2px rgba(37,99,235,0.4) !important;
        }
        .p-paginator .p-dropdown {
          height: 2rem !important;
          border-radius: 8px !important;
          border: 1px solid #e2e8f0 !important;
          background: #f8fafc !important;
          margin-left: 0.5rem !important;
          box-shadow: none !important;
        }
        .p-paginator .p-dropdown:hover {
          border-color: #cbd5e1 !important;
        }
        .p-paginator .p-dropdown:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59,130,246,0.1) !important;
        }
        .p-paginator .p-dropdown .p-dropdown-label {
          padding: 0 0.75rem !important;
          font-size: 0.75rem !important;
          font-weight: 700 !important;
          color: #475569 !important;
          display: flex !important;
          align-items: center !important;
        }

        /* ─── Scrollbar ─── */
        .p-datatable-wrapper::-webkit-scrollbar { height: 6px !important; width: 6px !important; }
        .p-datatable-wrapper::-webkit-scrollbar-track { background: transparent !important; }
        .p-datatable-wrapper::-webkit-scrollbar-thumb { background: #cbd5e1 !important; border-radius: 99px !important; }
        .p-datatable-wrapper::-webkit-scrollbar-thumb:hover { background: #94a3b8 !important; }

        /* ─── Loading Overlay ─── */
        .p-datatable-loading-overlay {
          background: rgba(255,255,255,0.6) !important;
          backdrop-filter: blur(4px) !important;
        }
        .p-datatable-loading-icon { color: #3b82f6 !important; }
      `}</style>

      <div className="bg-white rounded-2xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
        <DataTable
          value={data}
          header={header}
          globalFilter={globalFilter}
          loading={loading}
          paginator={pageable}
          first={first}
          rows={rows}
          onPage={(e) => { setFirst(e.first); setRows(e.rows); }}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          rowsPerPageOptions={[5, 10, 20, 50]}
          tableStyle={{ minWidth: '100%' }}
          emptyMessage={
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
              <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <Icon name="Inbox" size={28} className="text-slate-300 relative z-10" />
              </div>
              <p className="text-[12px] font-bold tracking-widest uppercase text-slate-400">Belum ada data</p>
            </div>
          }
          responsiveLayout="scroll"
          selection={selection}
          onSelectionChange={onSelectionChange}
          selectionMode={selectionMode}
          dataKey={dataKey}
          expandedRows={expandedRows}
          onRowToggle={onRowToggle}
          rowExpansionTemplate={rowExpansionTemplate}
          metaKeySelection={false}
          isDataSelectable={isDataSelectable || undefined}
          className="group"
        >
          {selectionMode === "multiple" && (
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
          )}

          {showIndex && (
            <Column
              header="No"
              body={(_, options) => (
                <span className="text-[11px] font-black text-slate-400 tabular-nums">
                  {String(options.rowIndex + first + 1).padStart(2, '0')}
                </span>
              )}
              headerStyle={{ width: '4rem', textAlign: 'center' }}
              style={{ width: '4rem', textAlign: 'center' }}
            />
          )}

          {rowExpansionTemplate && (
            <Column expander headerStyle={{ width: '3rem' }} />
          )}

          {columns.map((col, index) => (
            <Column
              key={index}
              field={col.field}
              header={col.header}
              sortable={sortable && col.sortable !== false}
              style={{ width: col.width || 'auto', minWidth: col.minWidth || 'auto' }}
              body={(rowData) => renderColumnBody(rowData, col)}
              className={col.className || ''}
            />
          ))}

          {(onEdit || onDelete || onView || onPrint || onPost || onUpload || onReturn || onSyncAsis) && (
            <Column
              header="Action"
              body={actionBodyTemplate}
              style={{ width: '180px', textAlign: 'right' }}
              headerStyle={{ width: '180px', textAlign: 'right' }}
            />
          )}
        </DataTable>

        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/50">
          <span className="text-[11px] text-slate-500 font-semibold tabular-nums">
            Menampilkan data <strong className="text-slate-900 mx-0.5">{first + 1}</strong> hingga <strong className="text-slate-900 mx-0.5">{Math.min(first + rows, data?.length || 0)}</strong> dari{' '}
            <strong className="text-blue-600 mx-1 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] shadow-sm">{data?.length || 0}</strong> total
          </span>
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-2 h-2">
              <span className="absolute inline-flex w-full h-full bg-emerald-400 opacity-75 rounded-full animate-ping"></span>
              <span className="relative inline-flex w-2 h-2 bg-emerald-500 rounded-full"></span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Sinkron</span>
          </div>
        </div>
      </div>
    </div>
  );
}
