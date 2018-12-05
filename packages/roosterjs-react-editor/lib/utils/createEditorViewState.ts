import EditorViewState from '../schema/EditorViewState';
import { HtmlSanitizer, SanitizeHtmlOptions } from 'roosterjs-html-sanitizer';

export default function createEditorViewState(initialContent?: string, options?: SanitizeHtmlOptions): EditorViewState {
    return {
        content: HtmlSanitizer.sanitizeHtml(initialContent, options) || '',
        isDirty: false
    };
}
