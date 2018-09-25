import { EditorPlugin } from "roosterjs-editor-core";

export interface LeanRoosterPlugin extends EditorPlugin {
    initializeContentEditable?: (contentEditable: HTMLDivElement, hasContainer: boolean) => void;
}
