import EditorViewState from '../schema/EditorViewState';
import { sanitizeHtml } from 'roosterjs-editor-dom';

export default function createEditorViewState(initialContent?: string): EditorViewState {
    return {
        content: sanitizeHtml(initialContent) || '',
        isDirty: false
    };
}
