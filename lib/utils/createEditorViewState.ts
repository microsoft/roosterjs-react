import EditorViewState from '../schema/EditorViewState';

export default function createEditorViewState(initialContent?: string): EditorViewState {
    return {
        content: initialContent || '',
        isDirty: false,
    }
}