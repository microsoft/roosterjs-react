import * as React from 'react';
import RibbonButton from '../../schema/RibbonButton';
import ConfirmCustomizationOptions from '../../../dialog/ConfirmCustomizationOptions';
import DialogResponse from '../../../dialog/DialogResponse';
import { Editor } from 'roosterjs-editor-core';
import { queryNodesWithSelection, createLink } from 'roosterjs-editor-api';
import confirm from '../../../dialog/confirm';

require('./createLinkButton.scss');

const CREATELINK_SVG = require('../../icons/createlink.svg');
export const createLinkButton: RibbonButton = {
    title: 'Insert hyperlink',
    imageUrl: CREATELINK_SVG,
    onClick: startCreateLink,
};

function startCreateLink(editor: Editor, stringMap: {[key: string]: string}) {
    editor.saveSelectionRange();
    let node = queryNodesWithSelection(editor, 'a[href]')[0];
    let link = '';
    if (node) {
        try {
            link = (node as HTMLAnchorElement).href;
        } catch (e) {}
    }

    new CreateLinkDialog(link, stringMap).show().then(link => {
        if (link) {
            editor.focus();
            createLink(editor, link, link);
        }
    });
}

class CreateLinkDialog {
    private linkInput: HTMLInputElement;
    constructor(private link: string, private stringMap: {[key: string]: string}) {}

    async show(): Promise<string> {
        let linkDialogOptions: ConfirmCustomizationOptions = {
            okText: this.stringMap['okButton'] || 'OK',
            cancelText: this.stringMap['cancelButton'] || 'Cancel',
            bodyElement: (
                <div className={'linkContent'}>
                    <label className={'linkLabel'}>
                        {this.stringMap['urlLabel'] || 'URL:'}
                        <input
                            role="textbox"
                            type="text"
                            ref={ref => (this.linkInput = ref)}
                            onChange={() => (this.link = this.linkInput.value)}
                            defaultValue={this.link}
                            className={'linkInput'}
                        />
                    </label>
                </div>
            ),
            delayCallbackAfterAnimation: true,
            containerClassName: 'linkDialog',
            focusCallback: () => {
                this.linkInput && this.linkInput.focus();
            },
        };
        return confirm(this.stringMap['linkTitle'] || 'Insert link', null, false, linkDialogOptions).then(
            (response: DialogResponse) => {
                if (response === DialogResponse.ok) {
                    return this.link;
                } else {
                    return null;
                }
            }
        );
    }
}
