import { useEffect } from 'react';
export function useKeyboardShortcuts({
    showPayModal,
    setShowPayModal,
    showExitConfirm,
    setShowExitConfirm,
    showClearConfirm,
    setShowClearConfirm,
    showHoldModal,
    setShowHoldModal,
    selectedRow,
    setSelectedRow,
    cart,
    navigate,
    searchQuery,
    searchRef,
    removeItem,
    onRequestClear,
    onConfirmClear,
    onPark,
    setPaymentMethod,
    openPay,
    updateQty,
    onConfirmPay,
    customerRef,
    showAddCustomer,
    setShowAddCustomer,
}) {
    useEffect(() => {
        const handler = (e) => {
            if (showExitConfirm) {
                if (e.key === 'y' || e.key === 'Y' || e.key === 'Enter') {
                    e.preventDefault();
                    if (cart.length > 0) onPark();
                    navigate('/');
                }
                if (e.key === 'n' || e.key === 'N' || e.key === 'Escape') {
                    e.preventDefault();
                    setShowExitConfirm(false);
                    searchRef.current?.focus();
                }
                return;
            }

            if (showClearConfirm) {
                if (e.key === 'y' || e.key === 'Y' || e.key === 'Enter') {
                    e.preventDefault(); onConfirmClear();
                }
                if (e.key === 'n' || e.key === 'N' || e.key === 'Escape') {
                    e.preventDefault(); setShowClearConfirm(false);
                }
                return;
            }

            if (showAddCustomer) {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    setShowAddCustomer(false);
                }
                return;
            }

            if (showHoldModal) {
                if (e.key === 'Escape') { e.preventDefault(); setShowHoldModal(false); }
                return;
            }

            if (showPayModal) {
                if (e.key === 'Enter' || e.key === 'y' || e.key === 'Y') {
                    e.preventDefault();
                    e.stopPropagation();
                    onConfirmPay();
                }
                if (e.key === 'Escape') setShowPayModal(false);
                return;
            }

            if (e.key === 'F1') { e.preventDefault(); searchRef.current?.focus(); }
            if (e.key === 'F2') { e.preventDefault(); customerRef.current?.focus(); }
            if (e.key === 'F3') { e.preventDefault(); setShowAddCustomer(true); }
            if (e.key === 'F4' && selectedRow) { e.preventDefault(); removeItem(selectedRow); }
            if (e.key === 'F5') { e.preventDefault(); onRequestClear(); }
            if (e.key === 'F6') { e.preventDefault(); onPark(); }
            if (e.key === 'F7') { e.preventDefault(); setShowHoldModal(true); }
            if (e.key === 'F8') { e.preventDefault(); setPaymentMethod('Tunai'); openPay(); }
            if (e.key === 'F12') { e.preventDefault(); openPay(); }
            if (e.key === 'Escape') { e.preventDefault(); setShowExitConfirm(true); }

            if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && cart.length > 0 && searchQuery === '') {
                e.preventDefault();
                const idx = cart.findIndex(i => i.id === selectedRow);
                let nxt = idx;
                if (e.key === 'ArrowUp') nxt = idx > 0 ? idx - 1 : cart.length - 1;
                if (e.key === 'ArrowDown') nxt = idx >= 0 && idx < cart.length - 1 ? idx + 1 : 0;
                setSelectedRow(cart[nxt]?.id || cart[0].id);
            }

            if ((e.key === '+' || e.key === '=' || e.key === '-') && selectedRow && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                updateQty(selectedRow, e.key === '-' ? -1 : 1);
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [
        showPayModal, showExitConfirm, showClearConfirm, showHoldModal, showAddCustomer,
        selectedRow, cart, navigate, searchQuery,
        onConfirmPay, removeItem, onRequestClear, onConfirmClear, onPark, setPaymentMethod, openPay, updateQty, setShowAddCustomer, setShowHoldModal, setShowClearConfirm, setShowExitConfirm, setShowPayModal, setSelectedRow, customerRef, searchRef
    ]);
}
