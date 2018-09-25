import { DefaultButton, PrimaryButton } from "office-ui-fabric-react/lib/components/Button";
import { Dialog, DialogFooter, DialogType } from "office-ui-fabric-react/lib/Dialog";
import { ITextField, TextField } from "office-ui-fabric-react/lib/TextField";
import { css, KeyCodes } from "office-ui-fabric-react/lib/Utilities";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { createLink } from "roosterjs-editor-api";
import { Editor } from "roosterjs-editor-core";
import { NullFunction, Strings } from "roosterjs-react-common";

export const InsertLinkStringKeys = {
    LinkFieldLabel: "linkFieldLabel",
    Title: "linkPromptTitle",
    InsertButton: "insertLinkText",
    CancelButton: "cancelLinkText"
};

export interface LinkDialogProps {
    calloutClassName?: string;
    calloutOnDismiss?: (ev: React.FocusEvent<HTMLElement>) => void;
    className?: string;
    editor: Editor;
    strings?: Strings;
}

export interface LinkDialogState {
    insertButtonDisabled: boolean;
}

class LinkDialog extends React.PureComponent<LinkDialogProps, LinkDialogState> {
    private linkField: ITextField;

    constructor(props: LinkDialogProps) {
        super(props);

        this.state = { insertButtonDisabled: true };
    }

    public render(): JSX.Element {
        const { strings = {}, calloutClassName, className } = this.props;

        return (
            <Dialog
                onDismiss={this.dismissDialog}
                dialogContentProps={{ type: DialogType.normal, title: strings[InsertLinkStringKeys.Title] }}
                hidden={false}
                modalProps={{ isBlocking: true }}
                className={css(calloutClassName, className)}
            >
                <TextField
                    label={strings[InsertLinkStringKeys.LinkFieldLabel] || "Link"}
                    componentRef={this.onLinkFieldRef}
                    onKeyDown={this.onLinkFieldKeyDown}
                    required={true}
                    onChanged={this.onLinkFieldChanged}
                />
                <DialogFooter>
                    <PrimaryButton onClick={this.insertLink} text={strings[InsertLinkStringKeys.InsertButton] || "Insert"} disabled={this.state.insertButtonDisabled} />
                    <DefaultButton onClick={this.dismissDialog} text={strings[InsertLinkStringKeys.CancelButton] || "Cancel"} />
                </DialogFooter>
            </Dialog>
        );
    }

    private onLinkFieldRef = (ref: ITextField): void => {
        this.linkField = ref;
    };

    private onLinkFieldChanged = (newValue: string): void => {
        this.setState({ insertButtonDisabled: newValue.trim().length === 0 });
    };

    private onLinkFieldKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>): void => {
        if (ev.which === KeyCodes.enter) {
            this.insertLink();
            ev.preventDefault();
            ev.stopPropagation();
        }
    };

    private insertLink = (): void => {
        const { editor } = this.props;

        if (!this.linkField || !editor || editor.isDisposed()) {
            return;
        }

        createLink(editor, this.linkField.value);
        this.dismissDialog();
    };

    private dismissDialog = (ev?: React.MouseEvent<HTMLButtonElement>): void => {
        const { editor, calloutOnDismiss = NullFunction } = this.props;
        calloutOnDismiss(ev as any);
        editor && !editor.isDisposed() && editor.restoreSavedRange();
    };
}

export function createLinkDialog(doc: Document, props: LinkDialogProps): () => void {
    let container = doc.createElement("div");
    doc.body.appendChild(container);
    const dispose = (): void => {
        if (container) {
            ReactDOM.unmountComponentAtNode(container);
            container.parentElement.removeChild(container);
            container = null;
        }
    };

    ReactDOM.render(
        <LinkDialog
            {...props}
            calloutOnDismiss={(ev: React.FocusEvent<HTMLElement>): void => {
                dispose();
                props.calloutOnDismiss && props.calloutOnDismiss(ev);
            }}
        />,
        container
    );

    return dispose;
}
