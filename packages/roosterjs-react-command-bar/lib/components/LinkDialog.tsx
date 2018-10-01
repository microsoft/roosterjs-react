import * as Styles from "./LinkDialog.scss.g";

import { DefaultButton, PrimaryButton } from "office-ui-fabric-react/lib/Button";
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
    className?: string;
    onDismiss?: (ev: React.FocusEvent<HTMLElement>) => void;
    editor: Editor;
    strings?: Strings;
    selectionRange?: Range;
}

export interface LinkDialogState {
    insertButtonDisabled: boolean;
}

class LinkDialog extends React.PureComponent<LinkDialogProps, LinkDialogState> {
    private linkField: ITextField;
    private linkInserted: boolean;

    constructor(props: LinkDialogProps) {
        super(props);

        this.state = { insertButtonDisabled: true };
    }

    public render(): JSX.Element {
        const { strings = {}, className } = this.props;

        return (
            <Dialog
                onDismiss={this.dismissDialog}
                dialogContentProps={{ type: DialogType.normal, title: strings[InsertLinkStringKeys.Title] }}
                hidden={false}
                modalProps={{ isBlocking: true }}
                className={css(Styles.modal, className)}
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

    public componentDidMount(): void {
        this.linkField && this.linkField.focus();
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
        const { editor, selectionRange } = this.props;

        if (!this.linkField || !editor || editor.isDisposed()) {
            return;
        }

        editor && !editor.isDisposed() && editor.updateSelection(selectionRange);
        this.linkInserted = true; // don't need to restore the selection after dismiss if we're changing selection into a link
        createLink(editor, this.linkField.value);
        this.dismissDialog();
    };

    private dismissDialog = (ev?: React.MouseEvent<HTMLButtonElement>): void => {
        const { editor, onDismiss = NullFunction, selectionRange } = this.props;
        onDismiss(ev as any);
        !this.linkInserted && editor && !editor.isDisposed() && editor.updateSelection(selectionRange);
    };
}

export function createLinkDialog(doc: Document, props: LinkDialogProps, calloutClassName?: string): () => void {
    const { editor, onDismiss } = props;

    let container = doc.createElement("div");
    doc.body.appendChild(container);
    const dispose = (): void => {
        if (container) {
            ReactDOM.unmountComponentAtNode(container);

            // hack to clear placeholder and also for Firefox, to get cursor visible again
            container.setAttribute("tabindex", "0");
            calloutClassName && container.setAttribute("class", calloutClassName);
            container.focus();
            editor && !editor.isDisposed() && editor.focus();

            container.parentElement.removeChild(container);
            container = null;
        }
    };

    // for the case that selection isn't tracked, we need to save the selection before bringing up the dialog
    // and from there, we need to restore it before converting the selected text into a link or restore
    // the selection if the dialog was cancelled
    const selectionRange = editor && !editor.isDisposed() ? editor.getSelectionRange() : null;
    ReactDOM.render(
        <LinkDialog
            {...props}
            selectionRange={selectionRange}
            onDismiss={(ev: React.FocusEvent<HTMLElement>): void => {
                dispose();
                onDismiss && onDismiss(ev);
            }}
            className={css(calloutClassName, props.className)}
        />,
        container
    );

    return dispose;
}
