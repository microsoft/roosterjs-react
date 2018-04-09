import EditorViewState from '../schema/EditorViewState';
import { convertInlineCss } from 'roosterjs-editor-dom';

export default function createEditorViewState(initialContent?: string): EditorViewState {
    return {
        content: convertInlineCss(initialContent) || '',
        isDirty: false
    };
}
