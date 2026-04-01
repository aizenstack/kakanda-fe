import { useState, useCallback } from 'react';

export function useCart() {
    const [cart, setCart] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);

    const addToCart = useCallback((product, qty = 1) => {
        setCart(prev => {
            const exists = prev.find(i => String(i.id) === String(product.id));
            if (exists) return prev.map(i => String(i.id) === String(product.id) ? { ...i, qty: i.qty + qty } : i);
            const newItem = { ...product, qty, disc: 0 };
            setSelectedRow(newItem.id);
            return [...prev, newItem];
        });
    }, []);

    const updateQty = useCallback((id, delta) => {
        setCart(prev => prev.flatMap(i => {
            if (String(i.id) !== String(id)) return [i];
            const qty = i.qty + delta;
            return qty > 0 ? [{ ...i, qty }] : [];
        }));
    }, []);

    const updateDisc = useCallback((id, disc) => {
        const val = Math.max(0, Math.min(100, Number(disc) || 0));
        setCart(prev => prev.map(i => String(i.id) === String(id) ? { ...i, disc: val } : i));
    }, []);

    const removeItem = useCallback((id) => {
        setCart(prev => prev.filter(i => String(i.id) !== String(id)));
    }, []);

    const clearCart = useCallback(() => setCart([]), []);

    const subtotal = cart.reduce((s, i) => {
        const discVal = i.price * (i.disc / 100);
        return s + (i.price - discVal) * i.qty;
    }, 0);

    return {
        cart, setCart,
        selectedRow, setSelectedRow,
        addToCart, updateQty, updateDisc, removeItem, clearCart,
        subtotal,
    };
}
