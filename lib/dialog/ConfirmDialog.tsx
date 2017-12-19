import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ConfirmCustomizationOptions from './ConfirmCustomizationOptions';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';

interface ConfirmDialogProps {
    title?: string;
    subText?: string;
    customizationOptions?: ConfirmCustomizationOptions;
    onOkCallback?: () => void;
    onCancelCallback?: () => void;
    onDismissCallback?: () => void;
    onClose: () => void;
}

interface ConfirmDialogState {
    isShown: boolean;
}

class ConfirmDialog extends React.Component<ConfirmDialogProps, ConfirmDialogState> {
    public static defaultProps = {
        customizationOptions: {},
    };

    private delayedCallback: () => void;
    private cancel;
    private ok;

    constructor(props: any) {
        super(props);
        this.state = {
            isShown: true,
        };
    }

    render() {
        let customizationOptions = this.props.customizationOptions;
        let onOk = () => this.onClick(this.props.onOkCallback);
        let onCancel = () => this.onClick(this.props.onCancelCallback);
        return (
            <Dialog
                isOpen={this.state.isShown}
                type={DialogType.normal}
                onDismiss={this.onDismiss}
                onDismissed={this.onDismissed}
                subText={this.props.subText}
                title={this.props.title}
                containerClassName={customizationOptions.containerClassName}>
                <form
                    onSubmit={evt => {
                        evt.preventDefault();
                        onOk();
                    }}>
                    {customizationOptions.bodyElement}
                </form>

                <DialogFooter>
                    <Button
                        componentRef={buttonRef => {
                            this.ok = buttonRef;
                        }}
                        buttonType={ButtonType.primary}
                        onClick={onOk}
                        title={customizationOptions.okToolTip}>
                        {customizationOptions.okText}
                    </Button>
                    {customizationOptions.hideCancelButton
                        ? null
                        : <Button
                              componentRef={buttonRef => {
                                  this.cancel = buttonRef;
                              }}
                              buttonType={ButtonType.normal}
                              onClick={onCancel}
                              title={customizationOptions.cancelToolTip}>
                              {customizationOptions.cancelText}
                          </Button>}
                </DialogFooter>
            </Dialog>
        );
    }

    componentDidMount() {
        if (this.cancel && this.props.customizationOptions.focusOnCancel) {
            this.cancel.focus();
        } else if (this.props.customizationOptions.focusCallback) {
            this.props.customizationOptions.focusCallback();
        } else if (this.ok) {
            // if no custom focus is implemented, autofocus on "OK"
            this.ok.focus();
        }
    }

    private onClick = callback => {
        if (callback) {
            if (
                this.props.customizationOptions &&
                this.props.customizationOptions.delayCallbackAfterAnimation
            ) {
                this.delayedCallback = callback;
            } else {
                callback();
            }
        }

        this.setState({
            isShown: false,
        });
    };

    private onDismiss = () => {
        if (this.props.onDismissCallback) {
            // We dismissed without issuing a callback.
            // Call 'cancel'
            this.props.onDismissCallback();
        }

        if (!this.props.customizationOptions.preventSoftDismiss) {
            this.setState({
                isShown: false,
            });
        }
    };

    private onDismissed = () => {
        if (this.delayedCallback) {
            this.delayedCallback();
            this.delayedCallback = null;
        }

        this.props.onClose();
    };
}

let instance = 0;

export default function showConfirmDialog(
    title: string,
    subText?: string,
    customizationOptions?: ConfirmCustomizationOptions,
    onOkCallback?: () => void,
    onCancelCallback?: () => void,
    onDismissCallback?: () => void
) {
    // Initialize it and append it to the body.
    let confirmDialogDiv = document.createElement('div');
    confirmDialogDiv.id = `confirmDialog${instance++}`;
    document.body.appendChild(confirmDialogDiv);
    ReactDOM.render(
        <ConfirmDialog
            title={title}
            subText={subText}
            customizationOptions={customizationOptions}
            onOkCallback={onOkCallback}
            onCancelCallback={onCancelCallback}
            onDismissCallback={onDismissCallback}
            onClose={() => {
                ReactDOM.unmountComponentAtNode(confirmDialogDiv);
                document.body.removeChild(confirmDialogDiv);
            }}
        />,
        confirmDialogDiv
    );
}
