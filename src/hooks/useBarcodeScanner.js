import { useRef, useEffect } from 'react';

export function useBarcodeScanner({ disabled, onScan }) {
    const barcodeBuffer = useRef('');
    const barcodeTimeout = useRef(null);

    useEffect(() => {
        const handleScan = (e) => {
            if (disabled) return;

            if (e.key !== 'Enter' && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                barcodeBuffer.current += e.key;
                if (barcodeTimeout.current) clearTimeout(barcodeTimeout.current);
                barcodeTimeout.current = setTimeout(() => {
                    barcodeBuffer.current = '';
                }, 50);
            } else if (e.key === 'Enter') {
                if (barcodeBuffer.current.length >= 3) {
                    const scannedBarcode = barcodeBuffer.current;
                    barcodeBuffer.current = '';
                    if (barcodeTimeout.current) clearTimeout(barcodeTimeout.current);
                    e.preventDefault();
                    e.stopPropagation();
                    onScan(scannedBarcode);
                } else {
                    barcodeBuffer.current = '';
                }
            }
        };

        window.addEventListener('keydown', handleScan, { capture: true });
        return () => window.removeEventListener('keydown', handleScan, { capture: true });
    }, [disabled, onScan]);
}
