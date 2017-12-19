export default interface ConfirmCustomizationOptions {
    bodyElement?: JSX.Element;
    okText?: string;
    cancelText?: string;
    okToolTip?: string;
    cancelToolTip?: string;
    hideCancelButton?: boolean;
    delayCallbackAfterAnimation?: boolean;
    containerClassName?: string;
    preventSoftDismiss?: boolean;
    focusOnCancel?: boolean;
    focusCallback?: () => void;
}
