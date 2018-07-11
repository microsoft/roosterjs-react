import './LeanRooster.scss.g';

import * as React from 'react';
import { Editor, EditorOptions, EditorPlugin, Undo, UndoService } from 'roosterjs-editor-core';
import { isNodeEmpty } from 'roosterjs-editor-dom';
import { ContentEdit, ContentEditFeatures, getDefaultContentEditFeatures, HyperLink, Paste } from 'roosterjs-editor-plugins';
import { DefaultFormat } from 'roosterjs-editor-types';
import { css, getDataAndAriaProps, NullFunction } from 'roosterjs-react-common';

import EditorViewState from '../schema/EditorViewState';

const ContentEditableDivStyle = { userSelect: 'text', msUserSelect: 'text', WebkitUserSelect: 'text' } as React.CSSProperties;

export const enum LeanRoosterModes {
    View = 0,
    Edit = 1
}

export interface LeanRoosterProps {
    activateRoosterOnMount?: boolean;
    className?: string;
    contentDivRef?: (ref: HTMLDivElement) => void;
    contentEditFeatures?: ContentEditFeatures;
    defaultFormat?: DefaultFormat;
    disableRestoreSelectionOnFocus?: boolean;
    hyperlinkToolTipCallback?: (href: string) => string;
    isRtl?: boolean;
    onAfterModeChange?: (newMode: LeanRoosterModes) => void;
    onBeforeModeChange?: (newMode: LeanRoosterModes) => boolean;
    onBlur?: (ev: React.FocusEvent<HTMLDivElement>) => void;
    onFocus?: (ev: React.FocusEvent<HTMLDivElement>) => void;
    plugins?: EditorPlugin[];
    readonly?: boolean;
    undo?: UndoService;
    updateViewState?: (viewState: EditorViewState, content: string, isInitializing: boolean) => void;
    viewState: EditorViewState;
    placeholder?: string;
    isEmptyFunction?: (element: HTMLDivElement, trim?: boolean) => boolean;
    isEmptyCheckThreshold?: number;
    isEmptyTrimValue?: boolean;
}

export default class LeanRooster extends React.Component<LeanRoosterProps, {}> {
    private _contentDiv: HTMLDivElement;
    private _editor: Editor;
    private _mode: LeanRoosterModes = LeanRoosterModes.View;
    // Note: set React DIV up with an intial inner HTML, but don't change it after creating rooster editor, otherwise
    // React will recreate the elements defined by the inner HTML
    private _initialContent: { __html: string } = undefined;
    private _editorOptions: EditorOptions = null;
    private _hasPlaceholder: boolean = false;
    private _placeholderVisible: boolean = false;

    constructor(props: LeanRoosterProps) {
        super(props);

        this._setInitialReactContent(true);
        this._editorOptions = this._createEditorOptions();
    }

    public render(): JSX.Element {
        const { className, isRtl, readonly } = this.props;

        return (
            <div
                {...getDataAndAriaProps(this.props)}
                className={css('lean-rooster', className, this.mode === LeanRoosterModes.View ? 'view-mode' : 'edit-mode', {
                    readonly,
                    'show-placeholder': this._placeholderVisible
                })}
                data-placeholder={this.props.placeholder}
                contentEditable={!readonly}
                dir={isRtl ? 'rtl' : 'ltr'}
                onBlur={this._onBlur}
                onFocus={this._onFocus}
                onMouseDown={this._onMouseDown}
                onMouseUp={this._onMouseUp}
                onDrop={this._onDrop}
                ref={this._contentDivOnRef}
                style={ContentEditableDivStyle}
                suppressContentEditableWarning={true}
                tabIndex={0}
                dangerouslySetInnerHTML={this._initialContent}
                aria-multiline="true"
                role="textbox"
            />
        );
    }

    public componentDidMount(): void {
        const { readonly, activateRoosterOnMount } = this.props;

        if (!readonly && activateRoosterOnMount) {
            this._trySwithToEditMode();
        } else if (!this._hasPlaceholder) {
            this._refreshPlaceholder();
        }
    }

    public componentWillUnmount(): void {
        this._updateContentToViewState();
        if (this._editor) {
            this._editor.dispose();
            this._editor = null;
        }
    }

    public shouldComponentUpdate(): boolean {
        return false;
    }

    public get mode(): LeanRoosterModes {
        return this._mode;
    }

    public set mode(value: LeanRoosterModes) {
        if (value === LeanRoosterModes.Edit) {
            this._trySwithToEditMode();
        } else {
            this._trySwitchToViewMode();
        }
    }

    public hasPlaceholder(): boolean {
        return this._hasPlaceholder;
    }

    public focus(): void {
        if (this._editor) {
            this._editor.focus();
        } else if (this._contentDiv) {
            this._contentDiv.focus();
        }
    }

    public reloadContent(): void {
        const { viewState } = this.props;

        if (this._editor) {
            this._editor.setContent(viewState.content);
            this._editorOptions.undo.clear();
            this._editor.addUndoSnapshot();
            this._refreshPlaceholder();
        } else {
            this._setInitialReactContent();
            this.forceUpdate(this._refreshPlaceholder);
        }
    }

    public selectAll(): void {
        const contentDiv = this._contentDiv;
        if (!contentDiv) {
            return;
        }

        if (this._editor && !this._editor.isDisposed()) {
            const range = this._editor.getDocument().createRange();
            range.selectNodeContents(contentDiv);
            this._editor.updateSelection(range);
        } else {
            const range = contentDiv.ownerDocument.createRange();
            range.selectNodeContents(contentDiv);
            const selection = window.getSelection();

            // Workaround IE exception 800a025e
            try {
                selection.removeAllRanges();
            } catch (e) {}

            selection.addRange(range);
        }
    }

    public isEmpty(): boolean {
        const { isEmptyTrimValue = false, isEmptyCheckThreshold, viewState, isEmptyFunction = isNodeEmpty } = this.props;

        if (!this._contentDiv) {
            return !viewState.content || viewState.content.length === 0;
        }

        if (isEmptyCheckThreshold && this._contentDiv.innerHTML.length >= isEmptyCheckThreshold) {
            return false;
        }

        return isEmptyFunction(this._contentDiv, isEmptyTrimValue);
    }

    public getContent(): string {
        return this._editor ? this._editor.getContent() : this._contentDiv.innerHTML;
    }

    private _refreshPlaceholder = (): void => {
        const isEmpty = this.props.placeholder && this.isEmpty();
        const wasPlaceholderVisible = this._placeholderVisible;
        const hasFocus = this._editor && this._editor.hasFocus();
        this._hasPlaceholder = isEmpty;
        this._placeholderVisible = isEmpty && !hasFocus;

        // refresh if the placeholder's visibility was changed
        if (wasPlaceholderVisible !== this._placeholderVisible) {
            this.forceUpdate();
        }
    };

    private _setInitialReactContent(fromConstructor: boolean = false): void {
        const { viewState } = this.props;
        const hasContent = viewState.content != null && viewState.content.length > 0;
        if (fromConstructor) {
            this._hasPlaceholder = this.props.placeholder && !hasContent;
            this._placeholderVisible = this._hasPlaceholder;
        }
        this._initialContent = hasContent ? { __html: viewState.content } : undefined;
    }

    private _updateContentToViewState(isInitializing?: boolean): string {
        if (this._editor && !this._editor.isDisposed()) {
            const { updateViewState = this._updateViewState, viewState } = this.props;

            const content = this._editor.getContent();
            updateViewState(viewState, content, isInitializing);
            return content;
        }

        return null;
    }

    private _createEditorOptions(): EditorOptions {
        const { plugins: additionalPlugins = [], undo = new Undo(), hyperlinkToolTipCallback, defaultFormat = {}, contentEditFeatures } = this.props;
        const plugins: EditorPlugin[] = [
            new ContentEdit({ ...getDefaultContentEditFeatures(), ...contentEditFeatures }),
            new HyperLink(hyperlinkToolTipCallback),
            new Paste(true /*useDirectPaste*/),
            ...additionalPlugins
        ];

        // Important: don't set the initial content, the content editable already starts with initial HTML content
        return { plugins, defaultFormat, undo, omitContentEditableAttributeChanges: true /* avoid unnecessary reflow */ };
    }

    private _updateViewState = (viewState: EditorViewState, content: string, isInitializing: boolean): void => {
        if (viewState.content !== content) {
            viewState.content = content;
            if (!isInitializing) {
                const originalContent = this._initialContent ? this._initialContent.__html : null;
                viewState.isDirty = content !== originalContent;
            }
        }
    };

    private _trySwithToEditMode(alwaysForceUpdateForEditMode: boolean = false): boolean {
        const { readonly, onBeforeModeChange = NullFunction, onAfterModeChange = NullFunction } = this.props;

        if (readonly) {
            return false;
        }
        if (this.mode === LeanRoosterModes.Edit) {
            if (alwaysForceUpdateForEditMode) {
                this.forceUpdate();
            }
            return false;
        }
        if (onBeforeModeChange(LeanRoosterModes.Edit)) {
            return;
        }
        const isInitializing = !this._editor;
        if (isInitializing) {
            this._editor = new Editor(this._contentDiv, this._editorOptions);
        }
        this._mode = LeanRoosterModes.Edit;

        this._updateContentToViewState(isInitializing);
        this.forceUpdate();
        onAfterModeChange(LeanRoosterModes.Edit);

        return true;
    }

    private _trySwitchToViewMode(): boolean {
        const { onBeforeModeChange = NullFunction, onAfterModeChange = NullFunction } = this.props;

        if (this.mode === LeanRoosterModes.View) {
            return false;
        }
        if (onBeforeModeChange(LeanRoosterModes.View)) {
            return false;
        }

        this._updateContentToViewState();
        this._mode = LeanRoosterModes.View;
        this.forceUpdate();
        onAfterModeChange(LeanRoosterModes.View);

        return true;
    }

    private _onMouseDown = (ev: React.MouseEvent<HTMLDivElement>): void => {
        this._placeholderVisible = false;
        const forceUpdate = true;
        this._trySwithToEditMode(forceUpdate);
    };

    private _onMouseUp = (ev: React.MouseEvent<HTMLDivElement>): void => {
        if (this._editor && !this._editor.hasFocus()) {
            this._editor.focus();
        }
    };

    private _onBlur = (ev: React.FocusEvent<HTMLDivElement>): void => {
        const { onBlur = NullFunction } = this.props;

        this._hasPlaceholder = false; // reset flag each time we blur
        const content = this._updateContentToViewState();
        if (content !== null) {
            this._refreshPlaceholder();
        }

        onBlur(ev);
    };

    private _onFocus = (ev: React.FocusEvent<HTMLDivElement>): void => {
        const { onFocus = NullFunction } = this.props;
        onFocus(ev);
    };

    // When used with FocusOutShell and CommandBar, React doesn't fire focus event when toggle
    // buttons with callout, so use the native event which is still triggered.
    private _onFocusNative = (ev: FocusEvent): void => {
        let forceUpdate = false;
        if (this._placeholderVisible) {
            this._placeholderVisible = false;
            forceUpdate = true;
        }
        if (this._trySwithToEditMode(forceUpdate)) {
            this._editor.focus();
        }
    };

    private _onDrop = (ev: React.DragEvent<HTMLDivElement>): void => {
        // handles the drop content scenario when editor is not yet activated and there's a placeholder
        if (this._contentDiv) {
            this.focus();
        }
    };

    private _contentDivOnRef = (ref: HTMLDivElement): void => {
        const { contentDivRef = NullFunction } = this.props;

        const eventName = 'focus';
        if (this._contentDiv) {
            this._contentDiv.removeEventListener(eventName, this._onFocusNative);
        }
        if (ref) {
            ref.addEventListener(eventName, this._onFocusNative);
        }
        this._contentDiv = ref;

        contentDivRef(ref);
    };
}
