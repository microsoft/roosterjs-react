import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { Dialog, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Strings, getString } from '../strings/dialogStrings';
import * as Styles from './ConfirmDialog.scss.g';

interface ConfirmDialogProps {
    onClose: () => void;
    title: string;
    onOkCallback: (value: string) => void;
    initialValue?: string;
    subText?: string;
    strings?: Strings;
    className?: string;
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
        let strings = this.props.strings;
        return (
            <Dialog className={this.props.className}
                isOpen={this.state.isShown}
                onDismissed={this.onDismissed}
                title={this.props.title}>
                <form
                    onSubmit={evt => {
                        evt.preventDefault();
                        onOk();
                    }}>
                    <div className={Styles.dialogContent}>
                        <label className={Styles.dialogLabel}>
                            {this.props.subText}
                            <input
                                role="textbox"
                                type="text"
                                ref={ref => (this.input = ref)}
                                onChange={() =>
                                    this.setState({
                                        isShown: this.state.isShown,
                                        value: this.input.value,
                                    })
                                }
                                value={this.state.value}
                                className={Styles.dialogInput}
                            />
                        </label>
                    </div>
                </form>
                <DialogFooter>
                    <Button buttonType={ButtonType.primary} onClick={onOk}>
                        {getString('dlgOk', strings)}
                    </Button>
                    <Button buttonType={ButtonType.normal} onClick={onCancel}>
                        {getString('dlgCancel', strings)}
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
    strings?: Strings,
    className?: string
): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        let confirmDialogDiv = document.createElement('div');
        document.body.appendChild(confirmDialogDiv);
        ReactDOM.render(
            <ConfirmDialog
                className={className}
                title={title}
                subText={subText}
                onOkCallback={value => resolve(value)}
                initialValue={initialValue}
                strings={strings}
                onClose={(ev?: any) => {
                    ReactDOM.unmountComponentAtNode(confirmDialogDiv);
                    document.body.removeChild(confirmDialogDiv);
                    reject();
                }}
            />,
            confirmDialogDiv
        );
    });
}
