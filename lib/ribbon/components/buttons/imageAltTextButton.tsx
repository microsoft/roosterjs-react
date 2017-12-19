import * as React from 'react';
import RibbonButton, { RibbonButtonState } from '../../schema/RibbonButton';
import ConfirmCustomizationOptions from '../../../dialog/ConfirmCustomizationOptions';
import DialogResponse from '../../../dialog/DialogResponse';
import { Editor } from 'roosterjs-editor-core';
import { queryNodesWithSelection, setImageAltText } from 'roosterjs-editor-api';
import confirm from '../../../dialog/confirm';

require('./imageAltTextButton.scss');

const IMAGE_ALT_TEXT_SVG = require('../../icons/imagealttext.svg');
export const imageAltTextButton: RibbonButton = {
    title: 'Insert alternate text',
    imageUrl: IMAGE_ALT_TEXT_SVG,
    onClick: startImagetAltText,
    buttonState: formatState => formatState.canAddImageAltText ? RibbonButtonState.Normal : RibbonButtonState.Disabled,
};

function startImagetAltText(editor: Editor, stringMap: {[key: string]: string}) {
    editor.saveSelectionRange();
    let node = queryNodesWithSelection(editor, 'img')[0];
    let alt = '';
    if (node) {
        try {
            alt = (node as HTMLImageElement).alt;
        } catch (e) {}
    }

    new ImageAltTextDialog(alt, stringMap).show().then(alt => {
        editor.focus();
        setImageAltText(editor, alt);
    });
}

class ImageAltTextDialog {
    private imageAltTextInput: HTMLInputElement;
    constructor(private alt: string, private stringMap: {[key: string]: string}) {}

    async show(): Promise<string> {
        let linkDialogOptions: ConfirmCustomizationOptions = {
            okText: this.stringMap['okButton'] || 'OK',
            cancelText: this.stringMap['cancelButton'] || 'Cancel',
            bodyElement: (
                <div>
                    <input
                        role="textbox"
                        type="text"
                        ref={ref => (this.imageAltTextInput = ref)}
                        onChange={() => this.alt = this.imageAltTextInput.value}
                        defaultValue={this.alt}
                        className={'altTextInput'}
                    />
                </div>
            ),
            delayCallbackAfterAnimation: true,
            focusCallback: () => {
                this.imageAltTextInput && this.imageAltTextInput.focus();
            },
        };
        return confirm(this.stringMap['altTextTitle'] || 'Insert alternate text', null, false, linkDialogOptions).then(
            (response: DialogResponse) => {
                if (response === DialogResponse.ok) {
                    return this.alt;
                } else {
                    return null;
                }
            }
        );
    }
}
