import ConfirmCustomizationOptions from './ConfirmCustomizationOptions';
import DialogResponse from './DialogResponse';
import showConfirmDialog from './ConfirmDialog';

export default function confirm(
    title: string,
    subText?: string,
    resolveImmediately?: boolean,
    customizationOptions?: ConfirmCustomizationOptions
): Promise<DialogResponse> {
    if (resolveImmediately) {
        return Promise.resolve(DialogResponse.ok);
    }

    return new Promise<DialogResponse>((resolve, reject) => {
        showConfirmDialog(
            title,
            subText,
            customizationOptions,
            () => {
                resolve(DialogResponse.ok);
            },
            () => {
                resolve(DialogResponse.cancel);
            },
            () => {
                resolve(DialogResponse.dismiss);
            }
        );
    });
}


