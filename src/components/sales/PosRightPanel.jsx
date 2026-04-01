import React from "react";
import { PAYMENT_METHODS, formatCurrency } from "./posConstants";
import SelectPartnerComponent from "../SelectPartnerComponent";

export default function PosRightPanel({
  customerRef,
  selectedCustomer,
  onSelectCustomer,
  onClearCustomer,
  onAddNewCustomer,
  availablePaymentMethods = [],
  paymentMethod,
  setPaymentMethod,
  voucherInput,
  setVoucherInput,
  voucherStatus,
  setVoucherStatus,
  voucherMember,
  setVoucherMember,
  handleCekVoucher,
  subtotal,
  globalDisc,
  setGlobalDisc,
  globalDiscVal,
  tax,
  grandTotal,
  cart,
  openPay,
  transactionNote,
  setTransactionNote,
}) {

  return (
    <div className="pos-right">
      <div className="pos-right-content">
        <SelectPartnerComponent
          ref={customerRef}
          value={selectedCustomer}
          onSelect={onSelectCustomer}
          onClear={onClearCustomer}
          onAddNew={onAddNewCustomer}
        />

        {/* <div className="pos-field-wrap">
          <label className="pos-field-label">Total</label>
          <div className="pos-total-box">
            <span className="pos-total-label"></span>
            <span className="pos-total-val">{formatCurrency(grandTotal)}</span>
          </div>
        </div> */}

        <div>
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              color: "#6b7280",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Diskon Transaksi (%)
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              type="number"
              value={globalDisc}
              min={0}
              max={100}
              onChange={(e) =>
                setGlobalDisc(
                   Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                )
              }
              style={{
                width: 70,
                height: 34,
                border: "1px solid #d1d5db",
                borderRadius: 6,
                padding: "0 10px",
                fontSize: "0.85rem",
                fontWeight: 700,
                outline: "none",
                textAlign: "center",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
            />
            <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>%</span>
            {globalDiscVal > 0 && (
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#3b82f6",
                  marginLeft: 4,
                }}
              >
                -{formatCurrency(globalDiscVal)}
              </span>
            )}
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              color: "#6b7280",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Metode Pembayaran
          </div>
          <div className="pos-payment-methods">
            {/* TUNAI BUTTON */}
            <button
                key="tunai-btn"
                onClick={() => {
                    const firstTunai = availablePaymentMethods.find(m => m.type === 'TUNAI');
                    if (firstTunai) {
                        setPaymentMethod(firstTunai.id);
                    } else {
                        setPaymentMethod('TUNAI_DUMMY');
                    }
                    setVoucherInput("");
                    setVoucherStatus(null);
                    setVoucherMember(null);
                }}
                className={`pos-method-btn ${availablePaymentMethods.find(m => m.id === paymentMethod)?.type === 'TUNAI' || paymentMethod === 'TUNAI_DUMMY' ? "active" : ""}`}
            >
                <i className="pi pi-check-circle check-icon" />
                <div className="pos-method-icon">
                    <i className="pi pi-wallet" />
                </div>
                <span>Tunai</span>
            </button>

            {/* NON TUNAI BUTTON */}
            <button
                key="non-tunai-btn"
                onClick={() => {
                    const firstNonTunai = availablePaymentMethods.find(m => m.type === 'NON TUNAI');
                    if (firstNonTunai) {
                        setPaymentMethod(firstNonTunai.id);
                    } else {
                        setPaymentMethod('NONTUNAI_DUMMY');
                    }
                    setVoucherInput("");
                    setVoucherStatus(null);
                    setVoucherMember(null);
                }}
                className={`pos-method-btn ${availablePaymentMethods.find(m => m.id === paymentMethod)?.type === 'NON TUNAI' || paymentMethod === 'NONTUNAI_DUMMY' ? "active" : ""}`}
            >
                <i className="pi pi-check-circle check-icon" />
                <div className="pos-method-icon">
                    <i className="pi pi-credit-card" />
                </div>
                <span>Non Tunai</span>
            </button>

            {/* VOUCHER BUTTON */}
            <button
                key="voucher-btn"
                onClick={() => {
                    setPaymentMethod("Voucher");
                }}
                className={`pos-method-btn ${paymentMethod === "Voucher" ? "active" : ""}`}
            >
                <i className="pi pi-check-circle check-icon" />
                <div className="pos-method-icon">
                    <i className="pi pi-ticket" />
                </div>
                <span>Voucher</span>
            </button>
          </div>
        </div>

        {/* Voucher / Member */}
        {paymentMethod === "Voucher" && (
          <div className="pos-voucher-wrap">
            <div
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#6b7280",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              No. Anggota / Member
            </div>
            <div className="pos-voucher-input-row">
              <input
                type="text"
                value={voucherInput}
                onChange={(e) => {
                  setVoucherInput(e.target.value);
                  setVoucherStatus(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleCekVoucher()}
                placeholder="Masukkan nomor anggota..."
                className={`pos-voucher-inp ${voucherStatus === "invalid" ? "err" : ""}`}
              />
              <button onClick={handleCekVoucher} className="pos-cek-btn">
                Cek
              </button>
            </div>
            {voucherStatus === "invalid" && (
              <div className="pos-voucher-status-err">
                <i className="pi pi-times-circle" />
                <span>Anggota tidak ditemukan</span>
              </div>
            )}
            {voucherStatus === "valid" &&
              voucherMember &&
              (() => {
                const cukup = voucherMember.saldo >= grandTotal;
                const sisaSaldo = voucherMember.saldo - grandTotal;
                return (
                  <div className="pos-voucher-card">
                    <div className="pos-voucher-card-row">
                      <span className="pos-voucher-card-label">Nama</span>
                      <span className="pos-voucher-card-val">
                        {voucherMember.name}
                      </span>
                    </div>
                    <div className="pos-voucher-card-row">
                      <span className="pos-voucher-card-label">No.</span>
                      <span className="pos-voucher-card-val">
                        {voucherMember.no}
                      </span>
                    </div>
                    <div
                      className="pos-voucher-card-row"
                      style={{
                        marginTop: 2,
                        paddingTop: 6,
                        borderTop: "1px dashed #bbf7d0",
                      }}
                    >
                      <span className="pos-voucher-card-label">Saldo</span>
                      <span className="pos-voucher-card-val green">
                        {formatCurrency(voucherMember.saldo)}
                      </span>
                    </div>
                    <div
                      className="pos-voucher-card-row"
                      style={{
                        marginTop: 2,
                        paddingTop: 6,
                        borderTop: "1px dashed #bbf7d0",
                      }}
                    >
                      <span className="pos-voucher-card-label">
                        Total Tagihan
                      </span>
                      <span
                        className="pos-voucher-card-val"
                        style={{ color: "#374151" }}
                      >
                        {formatCurrency(grandTotal)}
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        padding: "7px 10px",
                        borderRadius: 6,
                        background: cukup ? "#f0fdf4" : "#fef2f2",
                        border: `1px solid ${cukup ? "#bbf7d0" : "#fecaca"}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                      }}
                    >
                      <i
                        className={`pi ${cukup ? "pi-check-circle" : "pi-exclamation-triangle"}`}
                        style={{
                          color: cukup ? "#16a34a" : "#dc2626",
                          fontSize: "0.9rem",
                        }}
                      />
                      <div>
                        <div
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            color: cukup ? "#15803d" : "#b91c1c",
                          }}
                        >
                          {cukup ? "Saldo Mencukupi" : "Saldo Tidak Mencukupi"}
                        </div>
                        <div
                          style={{
                            fontSize: "0.68rem",
                            color: cukup ? "#16a34a" : "#dc2626",
                            marginTop: 1,
                          }}
                        >
                          {cukup
                            ? `Sisa saldo setelah bayar: ${formatCurrency(sisaSaldo)}`
                            : `Kurang: ${formatCurrency(Math.abs(sisaSaldo))} — ubah metode pembayaran`}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
          </div>
        )}

        <div className="pos-summary">
          <div className="pos-summary-row">
            <span className="label">Subtotal</span>
            <span className="val">{formatCurrency(subtotal)}</span>
          </div>
          <div className="pos-summary-row">
            <span className="label">Diskon Transaksi ({globalDisc}%)</span>
            <span
              className="val"
              style={{ color: globalDiscVal > 0 ? "#dc2626" : "#111827" }}
            >
              {globalDiscVal > 0 ? "-" : ""}
              {formatCurrency(globalDiscVal)}
            </span>
          </div>
          <div className="pos-summary-row">
            <span className="label">PPN (10%)</span>
            <span className="val">{formatCurrency(tax)}</span>
          </div>
          {paymentMethod === "Voucher" &&
            voucherMember &&
            voucherStatus === "valid" && (
              <div className="pos-summary-row">
                <span className="label" style={{ color: "#047857" }}>
                  Bayar dgn Voucher
                </span>
                <span className="val" style={{ color: "#047857" }}>
                  -{formatCurrency(Math.min(grandTotal, voucherMember.saldo))}
                </span>
              </div>
            )}
          <div className="pos-summary-divider" />
          <div className="pos-summary-total">
            <span className="tlabel">TOTAL</span>
            <span className="tval">{formatCurrency(grandTotal)}</span>
          </div>

          <div>
            <div
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#6b7280",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Catatan
            </div>
            <textarea
              value={transactionNote}
              onChange={(e) => setTransactionNote(e.target.value)}
              placeholder="Catatan transaksi (opsional)..."
              rows={2}
              style={{
                width: "100%",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: "0.8rem",
                outline: "none",
                resize: "none",
                color: "#374151",
                fontFamily: "inherit",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
            />
          </div>
        </div>
      </div>

      <button
        className="pos-pay-btn"
        disabled={cart.length === 0}
        onClick={openPay}
      >
        <span>BAYAR</span>
        <span className="pos-pay-fkey">F12</span>
      </button>
    </div>
  );
}
