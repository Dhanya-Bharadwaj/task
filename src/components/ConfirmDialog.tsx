/**
 * src/components/ConfirmDialog.tsx
 * Reusable confirmation dialog popup.
 */
import React from "react";

type Props = {
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
};

const ConfirmDialog: React.FC<Props> = ({
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
}) => {
    return (
        <div className="popup-overlay">
            <div className="popup-box">
                <p className="popup-title">{message}</p>
                <div className="popup-footer">
                    <button className="btn-secondary" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className="btn-primary" onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
