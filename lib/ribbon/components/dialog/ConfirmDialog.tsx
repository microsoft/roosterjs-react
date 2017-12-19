import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { Dialog, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';

require('./ConfirmDialog.scss');

interface ConfirmDialogProps {
    onClose: () => void;
    title: string;
    onOkCallback: (value: string) => void;
    initialValue?: string;
    subText?: string;
    stringMap?: {[key: string]: string};
}

interface ConfirmDialogState {
    isShown: boolean;
    value: string;
}

class ConfirmDialog extends React.Component<ConfirmDialogProps, ConfirmDialogState> {
    private delayedCallback: (value: string) => void;
    private input: HTMLInputElement;

    constructor(props: ConfirmDialogProps) {
        super(props);
        this.state = {
            isShown: true,
            value: this.props.initialValue || '',
        };
    }

    render() {
        let onOk = () => this.onClick(this.props.onOkCallback);
        let onCancel = () => this.onClick(null);
        let stringMap = this.props.stringMap || {};
        return (
            <Dialog
                isOpen={this.state.isShown}
                onDismissed={this.onDismissed}
                title={this.props.title}>
                <form
                    onSubmit={evt => {
                        evt.preventDefault();
                        onOk();
                    }}>
                    <div className={'roosterDialogContent'}>
                        <label className={'roosterDialogLabel'}>
                            {this.props.subText}
                            <input
                                role="textbox"
                                type="text"
                                ref={ref => (this.input = ref)}
                                onChange={() => this.setState({
                                    isShown: this.state.isShown,
                                    value: this.input.value,
                                })}
                                value={this.state.value}
                                className={'roosterDialogInput'}
                            />
                        </label>
                    </div>
                </form>
                <DialogFooter>
                    <Button
                        buttonType={ButtonType.primary}
                        onClick={onOk}>
                        {stringMap['ok'] || 'OK'}
                    </Button>
                    <Button
                        buttonType={ButtonType.normal}
                        onClick={onCancel}>
                        {stringMap['cancel'] || 'Cancel'}
                    </Button>
                </DialogFooter>
            </Dialog>
        );
    }

    componentDidMount() {
        if (this.input) {
            this.input.focus();
        }
    }

    private onClick = callback => {
        this.delayedCallback = callback;
        this.setState({
            isShown: false,
            value: this.state.value,
        });
    };

    private onDismissed = () => {
        if (this.delayedCallback) {
            this.delayedCallback(this.state.value);
            this.delayedCallback = null;
        }

        this.props.onClose();
    };
}

export default function confirm(
    title: string,
    subText: string,
    initialValue?: string,
    stringMap?: {[key: string]: string}
): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        let confirmDialogDiv = document.createElement('div');
        document.body.appendChild(confirmDialogDiv);
        ReactDOM.render(
            <ConfirmDialog
                title={title}
                subText={subText}
                onOkCallback={value => resolve(value)}
                initialValue={initialValue}
                stringMap={stringMap}
                onClose={() => {
                    ReactDOM.unmountComponentAtNode(confirmDialogDiv);
                    document.body.removeChild(confirmDialogDiv);
                }}
            />,
            confirmDialogDiv
        );
    });
}
