export interface WarningBoxButtonStates {
    normal: string;
    loading: string;
    success: string;
    error: string;
}

export interface WarningBox {
    header: string;
    text: string;
    nonce?: string;
    buttonStates: WarningBoxButtonStates;
    inputtedText?: string;
    onConfirm: () => Promise<boolean>;
}

export const setupWarning = (wb: WarningBox) => {
    wb.nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    wb = wb // Ensure warningBox is updated
};

export const commonButtonReactStates = {
    loading: 'Please Wait...',
    success: 'Showing confirmation box now...',
    error: 'Failed to show confirmation box'
}