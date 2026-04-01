import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';

import { ALL_PRODUCTS, formatCurrency, formatTime, formatDate } from '../../components/sales/posConstants';
import { useCart } from '../../hooks/useCart';
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

import PosHeader from '../../components/sales/PosHeader';
import PosSearchBar from '../../components/sales/PosSearchBar';
import PosCartTable from '../../components/sales/PosCartTable';
import PosShortcutsBar from '../../components/sales/PosShortcutsBar';
import PosRightPanel from '../../components/sales/PosRightPanel';
import PosPayModal from '../../components/sales/PosPayModal';
import PosExitModal from '../../components/sales/PosExitModal';
import PosClearConfirmModal from '../../components/sales/PosClearConfirmModal';
import PosScanFeedback from '../../components/sales/PosScanFeedback';
import PosHoldModal from '../../components/sales/PosHoldModal';
import PosAddCustomerModal from '../../components/sales/PosAddCustomerModal';
import { printReceipt } from '../../services/printService';
import { productService } from '../../services/productService';
import { customerService } from '../../services/customerService';
import { authService } from '../../services/authService';
import { saleService } from '../../services/saleService';
import { voucherService } from '../../services/voucherService';
import { soundService } from '../../services/soundService';
import '../../components/sales/pos.css';


export default function DashboardSales() {
    const navigate = useNavigate();
    const searchRef = useRef(null);
    const cashRef = useRef(null);
    const customerRef = useRef(null);
    const toast = useRef(null);

    const [user, setUser] = useState(null);
    const [time, setTime] = useState(formatTime(new Date()));
    const [currentTrxNumber, setCurrentTrxNumber] = useState('...');
    const [txCountToday, setTxCountToday] = useState(0);

    const [customerName, setCustomerName] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [availablePaymentMethods, setAvailablePaymentMethods] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState(''); // ID
    const [voucherInput, setVoucherInput] = useState('');
    const [voucherStatus, setVoucherStatus] = useState(null);
    const [voucherMember, setVoucherMember] = useState(null);

    const [showPayModal, setShowPayModal] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [showHoldModal, setShowHoldModal] = useState(false);
    const [showAddCustomer, setShowAddCustomer] = useState(false);
    const [addCustomerInitialName, setAddCustomerInitialName] = useState('');

    const handleOpenAddCustomer = useCallback((name = '') => {
        setAddCustomerInitialName(name);
        setShowAddCustomer(true);
    }, []);

    useEffect(() => {
        const recoverFocus = (e) => {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON' && !showPayModal) {
                searchRef.current?.focus();
            }
        };
        window.addEventListener('mousedown', recoverFocus);
        return () => window.removeEventListener('mousedown', recoverFocus);
    }, [showPayModal]);

    const [cashInput, setCashInput] = useState('');
    const [scanFeedback, setScanFeedback] = useState(null);
    const scanFeedbackTimer = useRef(null);

    const [heldCarts, setHeldCarts] = useState(() => {
        try { return JSON.parse(localStorage.getItem('pos_held_carts') || '[]'); }
        catch { return []; }
    });

    const addQtyRef = useRef(1);
    const [addQty, setAddQtyDisplay] = useState(1);
    const setAddQty = useCallback((n) => { addQtyRef.current = n; setAddQtyDisplay(n); }, []);

    const [globalDisc, setGlobalDisc] = useState(0);
    const [transactionNote, setTransactionNote] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const { cart, setCart, selectedRow, setSelectedRow, addToCart, updateQty, removeItem, clearCart, subtotal } = useCart();


    useEffect(() => {
        const t = setInterval(() => setTime(formatTime(new Date())), 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await authService.getUser();
                setUser(res.data.data);
            } catch (err) {
                console.error("Failed to fetch user", err);
            }
        };
        fetchUser();

        const fetchTrxNumber = async () => {
            try {
                const res = await saleService.generateTrxNumber();
                setCurrentTrxNumber(res.data.trx_number);

                const todayStr = new Date().toISOString().split('T')[0];
                const countRes = await saleService.getAll({
                    start_date: todayStr,
                    end_date: todayStr,
                    limit: 1
                });
                setTxCountToday(countRes.data.total || 0);
            } catch (err) {
                console.error("Failed to fetch TRX number / count", err);
            }
        };
        fetchTrxNumber();

        const fetchPaymentMethods = async () => {
            try {
                const res = await saleService.getCoas();
                const allCoas = res.data.data || [];
                const methods = allCoas.filter(c => c.type !== null);

                setAvailablePaymentMethods(methods);
                const firstTunai = methods.find(m => m.type === 'TUNAI');
                if (firstTunai) {
                    setPaymentMethod(firstTunai.id);
                } else {
                    setPaymentMethod('TUNAI_DUMMY');
                }
            } catch (err) {
                console.error("Failed to fetch payment methods via COA", err);
            }
        };
        fetchPaymentMethods();

        try {
            const draft = JSON.parse(localStorage.getItem('pos_draft') || 'null');
            if (draft && draft.cart && draft.cart.length > 0) {
                setCart(draft.cart);
                setCustomerName(draft.customerName || '');
                setSelectedCustomer(draft.selectedCustomer || null);
                setGlobalDisc(draft.globalDisc || 0);
                setTransactionNote(draft.transactionNote || '');
                toast.current?.show({
                    severity: 'info',
                    summary: 'Draft Dipulihkan',
                    detail: `${draft.cart.length} item dari sesi sebelumnya dikembalikan.`,
                    life: 4000
                });
            }
        } catch { /* abaikan error parse */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (cart.length > 0) {
            localStorage.setItem('pos_draft', JSON.stringify({
                cart,
                customerName,
                selectedCustomer,
                globalDisc,
                transactionNote,
            }));
        }
    }, [cart, customerName, selectedCustomer, globalDisc, transactionNote]);

    useEffect(() => {
        localStorage.setItem('pos_held_carts', JSON.stringify(heldCarts));
    }, [heldCarts]);

    const globalDiscVal = Math.round(subtotal * (globalDisc / 100));
    const isUserPpn = user?.is_ppn || false;
    const tax = isUserPpn ? Math.round((subtotal - globalDiscVal) * 0.11 / 1.11) : 0; // Info saja
    const grandTotal = Math.max(0, subtotal - globalDiscVal);
    const cashNum = Number(String(cashInput).replace(/\D/g, '')) || 0;
    const kembalian = cashNum - grandTotal;

    const filterProducts = useCallback((query) => {
        const search = async (q) => {
            if (!q) {
                setSearchResults([]);
                return;
            }
            try {
                const res = await productService.getAll({ search: q });
                const productsFound = res.data.data || [];
                const mapped = productsFound.map(p => ({
                    ...p,
                    price: p.inventories?.[0]?.final_price || 0,
                    stock: p.inventories?.[0]?.stock || 0
                }));
                
                // SPEED FIX: Jika scan barcode menghasilkan match sempurna
                const exactMatch = mapped.find(p => p.barcode === q);
                if (exactMatch) {
                    addToCart(exactMatch, addQtyRef.current);
                    setAddQty(1);
                    setSearchQuery('');
                    setSearchResults([]);
                    soundService.playSuccess();
                    return;
                }

                setSearchResults(mapped);
            } catch (err) {
                console.error("Search failed", err);
            }
        };

        if (window.searchTimer) clearTimeout(window.searchTimer);
        window.searchTimer = setTimeout(() => search(query), 300);
    }, [addToCart, setSearchQuery, setAddQty]);

    const handleCekVoucher = async () => {
        if (voucherInput.length < 3) {
            setVoucherStatus('invalid');
            setVoucherMember(null);
            toast.current?.show({ severity: 'warn', summary: 'Cek Gagal', detail: 'Nomor terlalu pendek.' });
            return;
        }

        try {
            setVoucherStatus('checking');
            const res = await voucherService.checkBalance(voucherInput);

            const memberData = res.data.data;
            setVoucherStatus('valid');
            setVoucherMember(memberData);
            toast.current?.show({ severity: 'success', summary: 'Member Ditemukan', detail: `Saldo: ${formatCurrency(memberData.saldo)}` });

        } catch (err) {
            setVoucherStatus('invalid');
            setVoucherMember(null);
            toast.current?.show({ severity: 'error', summary: 'Cek Gagal', detail: err.message || 'Voucher tidak valid.' });
        }
    };

    const handleSelectCustomer = useCallback((customer) => {
        setSelectedCustomer(customer);
        setCustomerName(customer.name);
        if (customer.type === 'anggota') {
            setVoucherMember({ name: customer.name, no: customer.no, saldo: customer.saldo ?? 0 });
            setVoucherInput(customer.no);
            setVoucherStatus('valid');
        }
    }, []);

    const handleClearCustomer = useCallback(() => {
        setSelectedCustomer(null);
        setCustomerName('');
        setVoucherInput('');
        setVoucherStatus(null);
        setVoucherMember(null);
    }, []);

    const openPay = useCallback(() => {
        if (cart.length === 0) return;
        setCashInput('');
        setShowPayModal(true);
        setTimeout(() => cashRef.current?.focus(), 100);
    }, [cart.length]);

    const handleConfirmPay = useCallback(async () => {
        const pm = availablePaymentMethods.find(m => m.id === paymentMethod);
        const pmType = paymentMethod === 'Voucher' ? 'Voucher' : pm?.type || '';

        if (pmType === 'Tunai' && cashNum < grandTotal) return;

        let voucherPotongan = 0;
        if (pmType === 'Voucher') {
            if (!voucherMember) return;
            const sisaBayar = Math.max(0, grandTotal - voucherMember.saldo);
            if (sisaBayar > 0 && cashNum < sisaBayar) return;

            voucherPotongan = Math.min(voucherMember.saldo, grandTotal);

            // POST ke API pemotongan saldo (Saat ini Dummy)
            try {
                toast.current?.show({ severity: 'info', summary: 'Memproses...', detail: 'Memotong saldo voucher ke server pusat...', life: 2000 });
                await voucherService.cutBalance({
                    no_member: voucherMember.no,
                    amount_to_cut: voucherPotongan,
                    trx_code: currentTrxNumber
                });
            } catch (err) {
                toast.current?.show({ severity: 'error', summary: 'Gagal', detail: err.message, life: 5000 });
                return; // Batalkan pembuatan transaksi karena potong saldo gagal
            }
        }

        try {
            const payload = {
                code: currentTrxNumber,
                transaction_date: new Date().toISOString(),
                company_id: user?.company_id,
                branch_id: user?.branch_id,
                warehouse_id: user?.warehouse_id,
                partner_id: selectedCustomer?.id,
                partner_name: selectedCustomer?.name,
                payment_methode_id: null,
                payment_method_name: pmType === 'Voucher' ? 'Voucher' : pm?.name,
                coa_id: pmType === 'Voucher' ? null : paymentMethod,
                discount: globalDiscVal,
                discount_type: 'nominal',
                discount_percent: globalDisc,
                ppn_type: user?.is_ppn ? 'INCLUDE' : 'NON',
                total_customer_payments: cashNum || grandTotal,
                description: transactionNote,
                items: cart.map(item => ({
                    product_stock_id: item.inventories?.[0]?.id,
                    qty: item.qty
                }))
            };

            const res = await saleService.create(payload);

            toast.current?.show({
                severity: 'success',
                summary: 'Transaksi Berhasil',
                detail: `Nomor: ${res.data.data.code}`,
                life: 4000
            });

            const getPaymentMethodLabel = () => {
                if (pmType === 'Voucher') return 'Voucher';
                if (pmType === 'TUNAI') return 'Tunai';
                if (pmType === 'NON TUNAI') return 'Non Tunai';
                return pm?.name || 'Tidak Diketahui';
            };

            const txDataForPrint = {
                kasirName: user?.name || "Kasir",
                noStruk: res.data.data.code,
                date: formatDate(new Date()) + " " + formatTime(new Date()),
                cart,
                subtotal,
                discount: globalDiscVal,
                tax,
                grandTotal,
                paymentMethod: getPaymentMethodLabel(),
                cash: cashNum,
                changes: Math.max(0, kembalian),
                customerName: pmType === 'Voucher' && voucherMember ? voucherMember.name : (customerName || 'Walkin Customer')
            };
            printReceipt(txDataForPrint).catch(err => console.error("Struk gagal diprint otomatis", err));

            localStorage.removeItem('pos_draft');
            setCart([]);
            setShowPayModal(false);
            setVoucherInput('');
            setVoucherStatus(null);
            setVoucherMember(null);
            if (availablePaymentMethods.length > 0) {
                const firstTunai = availablePaymentMethods.find(m => m.type === 'TUNAI');
                setPaymentMethod(firstTunai ? firstTunai.id : 'TUNAI_DUMMY');
            }
            setCustomerName('');
            setSelectedCustomer(null);
            setGlobalDisc(0);
            setTransactionNote('');
            setAddQty(1);
            setTxCountToday(prev => prev + 1);
            searchRef.current?.focus();
            soundService.playSuccess(); // Lonceng Kas ketika selesai
            
            const nextTrxRes = await saleService.generateTrxNumber();
            setCurrentTrxNumber(nextTrxRes.data.trx_number);

        } catch (err) {
            console.error("Transaction failed", err);
            toast.current?.show({
                severity: 'error',
                summary: 'Gagal',
                detail: err.response?.data?.message || 'Gagal menyimpan transaksi',
                life: 4000
            });
        }
    }, [availablePaymentMethods, paymentMethod, cashNum, grandTotal, currentTrxNumber, user, selectedCustomer, globalDiscVal, globalDisc, transactionNote, cart, subtotal, tax, kembalian, customerName, voucherMember, setCart, setAddQty]);

    const showScanFeedback = useCallback((type, message, barcode) => {
        if (scanFeedbackTimer.current) clearTimeout(scanFeedbackTimer.current);
        setScanFeedback({ type, message, barcode });
        scanFeedbackTimer.current = setTimeout(() => setScanFeedback(null), 2500);
    }, []);

    useBarcodeScanner({
        disabled: showPayModal || showExitConfirm,
        onScan: useCallback(async (barcode) => {
            try {
                const res = await productService.getAll({ search: barcode });
                const found = (res.data.data || []).find(p => p.barcode === barcode);

                if (found) {
                    const mapped = {
                        ...found,
                        price: found.inventories?.[0]?.final_price || 0,
                        stock: found.inventories?.[0]?.stock || 0
                    };
                    const qty = addQtyRef.current;
                    addToCart(mapped, qty);
                    setAddQty(1);
                    soundService.playSuccess(); // BEEP SUKSES SCAN
                    showScanFeedback('success', `${mapped.name}${qty > 1 ? ` ×${qty}` : ''} ditambahkan`, barcode);
                } else {
                    soundService.playError(); // BUZZER ERROR
                    showScanFeedback('error', 'Barcode tidak ditemukan', barcode);
                }
            } catch (err) {
                console.error("Barcode scan error", err);
                showScanFeedback('error', 'Gagal memproses barcode', barcode);
            }
        }, [addToCart, showScanFeedback, setAddQty]),
    });

    const handleRequestClear = useCallback(() => {
        if (cart.length === 0) return;
        setShowClearConfirm(true);
    }, [cart.length]);

    const handleConfirmClear = useCallback(() => {
        clearCart();
        localStorage.removeItem('pos_draft');
        setShowClearConfirm(false);
        searchRef.current?.focus();
    }, [clearCart, searchRef]);

    const handlePark = useCallback(() => {
        if (cart.length === 0) return;
        setHeldCarts(prev => [...prev, {
            id: Date.now(),
            cart: [...cart],
            customerName,
            selectedCustomer,
            paymentMethod,
            globalDisc,
            transactionNote,
            timestamp: new Date(),
        }]);
        clearCart();
        setCustomerName('');
        setSelectedCustomer(null);
        setPaymentMethod('Tunai');
        setGlobalDisc(0);
        setTransactionNote('');
        setVoucherInput('');
        setVoucherStatus(null);
        setVoucherMember(null);
        searchRef.current?.focus();
    }, [cart, customerName, selectedCustomer, paymentMethod, globalDisc, transactionNote, clearCart]);

    const handleRecall = useCallback((holdItem) => {
        setCart(holdItem.cart);
        setCustomerName(holdItem.customerName || '');
        setSelectedCustomer(holdItem.selectedCustomer || null);
        setPaymentMethod(holdItem.paymentMethod || 'Tunai');
        setGlobalDisc(holdItem.globalDisc || 0);
        setTransactionNote(holdItem.transactionNote || '');
        setHeldCarts(prev => prev.filter(h => h.id !== holdItem.id));
        setShowHoldModal(false);
        searchRef.current?.focus();
    }, [setCart, setCustomerName, setSelectedCustomer, setPaymentMethod, setGlobalDisc, setTransactionNote, setHeldCarts, setShowHoldModal]);

    const handleDeleteHold = useCallback((id) => {
        setHeldCarts(prev => prev.filter(h => h.id !== id));
    }, []);

    useKeyboardShortcuts({
        showPayModal, setShowPayModal,
        showExitConfirm, setShowExitConfirm,
        showClearConfirm, setShowClearConfirm,
        showHoldModal, setShowHoldModal,
        selectedRow, setSelectedRow,
        cart, navigate,
        searchQuery: '',
        searchRef,
        removeItem,
        onRequestClear: handleRequestClear,
        onConfirmClear: handleConfirmClear,
        onPark: handlePark,
        setPaymentMethod, openPay, updateQty,
        onConfirmPay: handleConfirmPay,
        customerRef,
        showAddCustomer, setShowAddCustomer: () => handleOpenAddCustomer(''),
    });

    return (
        <div className="pos-root">
            <Toast ref={toast} position="top-right" />
            <PosHeader
                time={time}
                kasirName={user?.name || "Kasir"}
                branchName={user?.branch?.name || "Koperasi"}
                noStruk={currentTrxNumber}
                txCountToday={txCountToday}
                heldCount={heldCarts.length}
            />

            <div className="pos-body">
                <div className="pos-left">
                    <div className="pos-top-row">
                        <PosSearchBar
                            searchRef={searchRef}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            searchResults={searchResults}
                            onSearchChange={filterProducts}
                            addToCart={addToCart}
                            addQty={addQty}
                            setAddQty={setAddQty}
                        />
                        <div className="pos-field-wrap">
                            <label className="pos-field-label">Total</label>
                            <div className="pos-total-box">
                                <span className="pos-total-label"></span>
                                <span className="pos-total-val ">{formatCurrency(grandTotal)}</span>
                            </div>
                        </div>
                        {/* <div className="pos-field-wrap">
                            <label className="pos-field-label">Total</label>
                            <div className="pos-total-box">
                                <span className="pos-total-label">{cart.length} item</span>
                                <span className="pos-total-val">{formatCurrency(grandTotal)}</span>
                            </div>
                        </div> */}
                    </div>

                    <PosCartTable
                        cart={cart}
                        selectedRow={selectedRow}
                        setSelectedRow={setSelectedRow}
                        updateQty={updateQty}
                        removeItem={removeItem}
                    />

                    <PosShortcutsBar />
                </div>

                <PosRightPanel
                    customerRef={customerRef}
                    selectedCustomer={selectedCustomer}
                    onSelectCustomer={handleSelectCustomer}
                    onClearCustomer={handleClearCustomer}
                    onAddNewCustomer={handleOpenAddCustomer}
                    availablePaymentMethods={availablePaymentMethods}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    voucherInput={voucherInput}
                    setVoucherInput={setVoucherInput}
                    voucherStatus={voucherStatus}
                    setVoucherStatus={setVoucherStatus}
                    voucherMember={voucherMember}
                    setVoucherMember={setVoucherMember}
                    handleCekVoucher={handleCekVoucher}
                    subtotal={subtotal}
                    globalDisc={globalDisc}
                    setGlobalDisc={setGlobalDisc}
                    globalDiscVal={globalDiscVal}
                    tax={tax}
                    grandTotal={grandTotal}
                    cart={cart}
                    openPay={openPay}
                    transactionNote={transactionNote}
                    setTransactionNote={setTransactionNote}
                />
            </div>

            <PosPayModal
                showPayModal={showPayModal}
                setShowPayModal={setShowPayModal}
                paymentMethod={paymentMethod}
                availablePaymentMethods={availablePaymentMethods}
                grandTotal={grandTotal}
                cashInput={cashInput}
                setCashInput={setCashInput}
                cashRef={cashRef}
                cashNum={cashNum}
                kembalian={kembalian}
                handleConfirmPay={handleConfirmPay}
                customerName={customerName}
                transactionNote={transactionNote}
                voucherMember={voucherMember}
            />

            <PosExitModal
                showExitConfirm={showExitConfirm}
                setShowExitConfirm={setShowExitConfirm}
                cart={cart}
                searchRef={searchRef}
                navigate={navigate}
                onPark={handlePark}
            />

            <PosClearConfirmModal
                show={showClearConfirm}
                cart={cart}
                onConfirm={handleConfirmClear}
                onCancel={() => setShowClearConfirm(false)}
            />

            <PosHoldModal
                show={showHoldModal}
                heldCarts={heldCarts}
                onRecall={handleRecall}
                onDelete={handleDeleteHold}
                onClose={() => setShowHoldModal(false)}
            />

            {showAddCustomer && (
                <PosAddCustomerModal
                    isOpen={showAddCustomer}
                    initialName={addCustomerInitialName}
                    onClose={() => setShowAddCustomer(false)}
                    onSave={async (newCustomerData) => {
                        try {
                            const res = await customerService.create({
                                name: newCustomerData.name,
                                phone: newCustomerData.phone || '0000000000',
                            });
                            const saved = {
                                ...res.data.data,
                                no: res.data.data.member_code || '-',
                                type: 'pelanggan'
                            };
                            handleSelectCustomer(saved);
                            setShowAddCustomer(false);
                        } catch (err) {
                            console.error("Save customer failed", err);
                            handleSelectCustomer(newCustomerData);
                            setShowAddCustomer(false);
                        }
                    }}
                />
            )}

            <PosScanFeedback feedback={scanFeedback} />
        </div>
    );
}