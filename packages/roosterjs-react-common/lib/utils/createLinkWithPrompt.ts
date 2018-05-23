import { createLink } from 'roosterjs-editor-api';
import { Editor } from 'roosterjs-editor-core';
import { Strings } from '../strings/strings';

export const CreateLinkWithPromptStringKey = "linkPrompt";

export default function createLinkWithPrompt(editor: Editor, strings: Strings): void {
    if (!editor || editor.isDisposed()) {
        return;
    }

    let message = "Enter address";
    if (strings) {
        message = strings[CreateLinkWithPromptStringKey] || message;
    }

    const link = prompt(message);
    if (link) {
        createLink(editor, link);
    }
}
