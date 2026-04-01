import React from 'react';

export default function PosScanFeedback({ feedback }) {
    if (!feedback) return null;

    const isSuccess = feedback.type === 'success';

    return (
        <div style={{
            position: 'fixed',
            top: 64,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 8888,
            background: isSuccess ? '#15803d' : '#b91c1c',
            color: 'white',
            padding: '10px 22px',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            fontSize: '0.85rem',
            fontWeight: 700,
            animation: 'scanFeedbackIn 0.2s ease',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
        }}>
            <i
                className={`pi ${isSuccess ? 'pi-check-circle' : 'pi-times-circle'}`}
                style={{ fontSize: '1.2rem' }}
            />
            <div>
                <div>{feedback.message}</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.75, fontWeight: 500, marginTop: 1 }}>
                    Barcode: {feedback.barcode}
                </div>
            </div>
        </div>
    );
}
