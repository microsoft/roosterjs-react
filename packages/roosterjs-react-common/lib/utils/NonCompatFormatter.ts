import { Editor } from 'roosterjs-editor-core';
import { getFormatState } from 'roosterjs-editor-api';
import { DocumentCommand, Indentation, QueryScope } from 'roosterjs-editor-types';

function execCommand(editor: Editor, command: DocumentCommand, addUndoSnapshotWhenCollapsed?: boolean) {
    editor.focus();
    const formatter = () => editor.getDocument().execCommand(command, false, null);

    const range = editor.getSelectionRange();
    if (range && range.collapsed && !addUndoSnapshotWhenCollapsed) {
        formatter();
    } else {
        editor.addUndoSnapshot(formatter);
    }
}

/**
 * Toggle numbering at selection
 * If selection contains numbering in deep level, toggle numbering will decrease the numbering level by one
 * If selection contains bullet list, toggle numbering will convert the bullet list into number list
 * If selection contains both bullet/numbering and normal text, the behavior is decided by corresponding
 * realization of browser execCommand API
 * @param editor The editor instance
 */
export function toggleNonCompatNumbering(editor: Editor) {
    execCommand(editor, DocumentCommand.InsertOrderedList, true);
}

/**
 * Toggle bullet at selection
 * If selection contains bullet in deep level, toggle bullet will decrease the bullet level by one
 * If selection contains number list, toggle bullet will convert the number list into bullet list
 * If selection contains both bullet/numbering and normal text, the behavior is decided by corresponding
 * browser execCommand API
 * @param editor The editor instance
 */
export function toggleNonCompatBullet(editor: Editor) {
    execCommand(editor, DocumentCommand.InsertUnorderedList, true);
}

/**
 * Set indentation at selection
 * If selection contains bullet/numbering list, increase/decrease indentation will
 * increase/decrease the list level by one.
 * @param editor The editor instance
 * @param indentation The indentation option:
 * Indentation.Increase to increase indentation or Indentation.Decrease to decrease indentation
 */
export function setNonCompatIndentation(editor: Editor, indentation: Indentation) {
    editor.focus();
    const command = indentation == Indentation.Increase ? 'indent' : 'outdent';
    editor.addUndoSnapshot(() => {
        const format = getFormatState(editor);
        editor.getDocument().execCommand(command, false, null);
        if (!format.isBullet && !format.isNumbering) {
            editor.queryElements('blockquote', QueryScope.OnSelection, node => {
                node.style.marginTop = '0';
                node.style.marginBottom = '0';
            });
        }
    });
}
