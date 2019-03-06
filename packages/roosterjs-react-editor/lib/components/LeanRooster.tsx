import "./LeanRooster.scss.g";

import * as React from "react";
import { CoreApiMap, Editor, EditorOptions, EditorPlugin, Undo, UndoService } from "roosterjs-editor-core";
import { isNodeEmpty, Browser, findClosestElementAncestor } from "roosterjs-editor-dom";
import { ContentEdit, ContentEditFeatures, getDefaultContentEditFeatures, HyperLink, Paste } from "roosterjs-editor-plugins";
import { DefaultFormat } from "roosterjs-editor-types";
import { AttributeCallbackMap } from "roosterjs-html-sanitizer";
import { css, getDataAndAriaProps, LeanRoosterPlugin, NullFunction } from "roosterjs-react-common";

import EditorViewState from "../schema/EditorViewState";

const ContentEditableDivStyle = { userSelect: "text", msUserSelect: "text", WebkitUserSelect: "text" } as React.CSSProperties;
const ReadOnlyClassName = "readonly";

export const enum LeanRoosterModes {
    View = 0,
    Edit = 1
}

// Initial editor options
export interface LeanRoosterInitialOptions {
    /**
     * (Optional) True to activate rooster and its plugins when component is mounted
     */
    activateRoosterOnMount?: boolean;

    /**
     * (Optional) Feature options for the editor
     */
    contentEditFeatures?: ContentEditFeatures;

    /**
     * (Optional) Core API override for the editor (useful for tracking timings)
     */
    coreApiOverride?: Partial<CoreApiMap>;

    /**
     * (Optional) Default format for the editor
     */
    defaultFormat?: DefaultFormat;

    /**
     * (Optional) Enable restore selection on focus
     */
    enableRestoreSelectionOnFocus?: boolean;

    /**
     * (Optional) Plugins for the editor
     */
    plugins?: LeanRoosterPlugin[];

    /**
     * (Optional) Custom undo plugin
     */
    undo?: UndoService;

    /**
     * (Optional) Callback map for santizing attributes (used by Paste plugin)
     */
    sanitizeAttributeCallbacks?: AttributeCallbackMap;

    /**
     * (Optional) Update view state callback
     */
    updateViewState?: (viewState: EditorViewState, content: string, isInitializing: boolean) => void;

    /**
     * (Optional) Initial view state for the editor
     */
    viewState: EditorViewState;
}

export interface LeanRoosterProps extends LeanRoosterInitialOptions {
    /**
     * Additional CSS class(es) to apply to the ColorPicker.
     */
    className?: string;

    /**
     * (Optional) True to use right to left locale
     */
    isRtl?: boolean;

    /**
     * (Optional) Placeholder text
     */
    placeholder?: string;

    /**
     * (Optional) Threshold for isEmpty() check
     */
    thresholdForIsEmptyCheck?: number;

    /**
     * (Optional) Trim when calling isEmpty()
     */
    trimWithEmptyCheck?: boolean;

    /**
     * (Optional) True to enable readonly mode
     */
    readonly?: boolean;

    /**
     * (Optional) True to allow hyperlink to be opened while in view mode
     */
    clickOpenHyperlinkViewMode?: boolean;

    /**
     * (Optional) Callback for the content DIV reference
     */
    contentDivRef?: (ref: HTMLDivElement) => void;

    /**
     * (Optional) Callback for getting the tooltip for a hyperlink
     */
    hyperlinkToolTipCallback?: (href: string, anchor: HTMLAnchorElement) => string;

    /**
     * (Optional) Custom isEmpty() function
     */
    isEmptyFunction?: (element: HTMLDivElement, trim?: boolean) => boolean;

    /**
     * (Optional) Callback for after a mode change
     */
    onAfterModeChange?: (newMode: LeanRoosterModes) => void;

    /**
     * (Optional) Callback for before a mode change
     */
    onBeforeModeChange?: (newMode: LeanRoosterModes) => boolean;

    /**
     * (Optional) Callback for editor blur event
     */
    onBlur?: (ev: React.FocusEvent<HTMLDivElement>) => void;

    /**
     * (Optional) Callback for editor focus event
     */
    onFocus?: (ev: React.FocusEvent<HTMLDivElement>) => void;

    /**
     * (Optional) Callback for editor drop event
     */
    onDrop?: (ev: React.DragEvent<HTMLDivElement>) => void;

    /**
     * (Optional) Callback for editor drag enter event
     */
    onDragEnter?: (ev: React.DragEvent<HTMLDivElement>) => void;

    /**
     * (Optional) Callback for editor drag leave event
     */
    onDragLeave?: (ev: React.DragEvent<HTMLDivElement>) => void;

    /**
     * (Optional) Callback for editor drag over event
     */
    onDragOver?: (ev: React.DragEvent<HTMLDivElement>) => void;

    /**
     * (Optional) Handler for when hyperlink is clicked
     */
    onHyperlinkClick?: (anchor: HTMLAnchorElement, ev: MouseEvent) => boolean;
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
        const { isRtl, readonly } = this.props;
        return (
            // tslint:disable-next-line: react-no-dangerous-html
            <div
                {...getDataAndAriaProps(this.props)}
                className={this._getClassName(this.props)}
                data-placeholder={this.props.placeholder}
                contentEditable={!readonly}
                dir={this._getDirValue(isRtl)}
                onBlur={this._onBlur}
                onFocus={this._onFocus}
                onMouseDown={this._onMouseDown}
                onMouseUp={this._onMouseUp}
                onDragEnter={this._onDragEnter}
                onDragLeave={this._onDragLeave}
                onDragOver={this._onDragOver}
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

    public componentWillReceiveProps(nextProps: LeanRoosterProps, nextState: {}) {
        const div = this._contentDiv;
        if (!div) {
            return;
        }

        const { className, readonly, isRtl, placeholder } = nextProps;

        if (className !== this.props.className) {
            div.setAttribute("class", this._getClassName(nextProps));
        }

        if (readonly !== this.props.readonly) {
            if (readonly) {
                div.classList.add(ReadOnlyClassName);
            } else {
                div.classList.remove(ReadOnlyClassName);
            }
            div.setAttribute("contentEditable", (!readonly).toString());
        }

        if (isRtl !== this.props.isRtl) {
            div.setAttribute("dir", this._getDirValue(isRtl));
        }

        if (placeholder !== this.props.placeholder) {
            div.setAttribute("data-placeholder", placeholder == null ? "" : placeholder);
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

    public get hasActivated(): boolean {
        return !!this._editor;
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

    public reloadContent(triggerContentChangedEvent: boolean = true, resetUndo: boolean = true): void {
        const { viewState } = this.props;

        if (this._editor) {
            this._editor.setContent(viewState.content, triggerContentChangedEvent);
            if (resetUndo && this._editorOptions.undo) {
                this._editorOptions.undo.clear();
                this._editor.addUndoSnapshot();
            }
            this._refreshPlaceholder();
        } else {
            this._setInitialReactContent();
            this.forceUpdate(this._refreshPlaceholder);
        }
    }

    public triggerContentChangedEvent(source?: string): void {
        this._editor && this._editor.triggerContentChangedEvent(source);
    }

    public selectAll(): void {
        const contentDiv = this._contentDiv;
        if (!contentDiv) {
            return;
        }

        if (this._editor && !this._editor.isDisposed()) {
            const range = this._editor.getDocument().createRange();
            range.selectNodeContents(contentDiv);
            this._editor.select(range);
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
        const { trimWithEmptyCheck = false, thresholdForIsEmptyCheck, viewState, isEmptyFunction = isNodeEmpty } = this.props;

        if (!this._contentDiv) {
            return !viewState.content || viewState.content.length === 0;
        }

        if (thresholdForIsEmptyCheck && this._contentDiv.innerHTML.length >= thresholdForIsEmptyCheck) {
            return false;
        }

        return isEmptyFunction(this._contentDiv, trimWithEmptyCheck);
    }

    public getContent(): string {
        return this._editor ? this._editor.getContent() : this._contentDiv.innerHTML;
    }

    private _getClassName(props: LeanRoosterProps): string {
        const { className, readonly } = props;
        const modeClassName = this.mode === LeanRoosterModes.View ? "view-mode" : "edit-mode";

        return css("lean-rooster", className, modeClassName, {
            readonly,
            "show-placeholder": this._placeholderVisible
        });
    }

    private _getDirValue(isRtl: boolean): string {
        return isRtl ? "rtl" : "ltr";
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
        const {
            plugins: additionalPlugins = [],
            undo = new Undo(),
            defaultFormat = {},
            contentEditFeatures,
            enableRestoreSelectionOnFocus,
            coreApiOverride,
            sanitizeAttributeCallbacks
        } = this.props;
        const plugins: EditorPlugin[] = [
            new ContentEdit({ ...getDefaultContentEditFeatures(), defaultShortcut: false, smartOrderedList: true, ...contentEditFeatures }),
            new HyperLink(this._hyperlinkToolTipCallback, undefined, this._onHyperlinkClick),
            new Paste(null, { istemptitle: v => v, ...sanitizeAttributeCallbacks }),
            ...additionalPlugins
        ];
        const disableRestoreSelectionOnFocus = !enableRestoreSelectionOnFocus;

        // Important: don't set the initial content, the content editable already starts with initial HTML content
        return { plugins, defaultFormat, undo, disableRestoreSelectionOnFocus, omitContentEditableAttributeChanges: true /* avoid unnecessary reflow */, coreApiOverride };
    }

    private _onHyperlinkClick = (anchor: HTMLAnchorElement, mouseEvent: MouseEvent): boolean => {
        const { onHyperlinkClick = _ => false } = this.props;
        return onHyperlinkClick(anchor, mouseEvent);
    };

    private _hyperlinkToolTipCallback = (href: string, anchor: HTMLAnchorElement): string => {
        const { hyperlinkToolTipCallback = (href, _) => href } = this.props;
        return hyperlinkToolTipCallback(href, anchor);
    };

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
        const target = ev.target as HTMLElement;
        const anchor = this._getAnchorForClickOpenHyperlink(ev, target);
        if (anchor) {
            // we're going to handle click for the href, so don't switch to view mode
            ev.preventDefault();
            ev.stopPropagation();
            return;
        }

        this._placeholderVisible = false;
        const forceUpdate = true;
        this._trySwithToEditMode(forceUpdate);
    };

    private _onMouseUp = (ev: React.MouseEvent<HTMLDivElement>): void => {
        const target = ev.target as HTMLElement;
        const anchor = this._getAnchorForClickOpenHyperlink(ev, target);
        if (anchor) {
            const { onHyperlinkClick } = this.props;
            // if editor has already activated, let the Hyperlink plugin call onHyperlinkClick
            if (this.hasActivated && onHyperlinkClick) {
                return;
            }

            // if no custom click handler or it returned false, open the link
            if (!onHyperlinkClick || onHyperlinkClick(anchor, ev.nativeEvent) === false) {
                try {
                    window.open(anchor.getAttribute("href"), "_blank");
                } catch {}
            }

            return;
        }

        if (this._editor && !this._editor.hasFocus()) {
            this._editor.focus();
        }
    };

    private _getAnchorForClickOpenHyperlink(ev: React.MouseEvent<HTMLDivElement>, element: HTMLElement): HTMLAnchorElement {
        const { clickOpenHyperlinkViewMode, readonly } = this.props;
        if (!clickOpenHyperlinkViewMode || readonly || this.mode !== LeanRoosterModes.View) {
            return null;
        }

        // Hyperlink plugin will handle CTRL+Click when editor is created and FireFox will handle for contenteditable
        const ctrlOpen = Browser.isMac ? ev.metaKey : ev.ctrlKey;
        if ((this._editor && ctrlOpen) || (Browser.isFirefox && ctrlOpen)) {
            return null;
        }

        const anchor = findClosestElementAncestor(element, this._contentDiv, "a[href]");
        if (anchor) {
            return anchor as HTMLAnchorElement;
        }

        return null;
    }

    private _onBlur = (ev: React.FocusEvent<HTMLDivElement>): void => {
        const { onBlur = NullFunction } = this.props;

        this._hasPlaceholder = false; // reset flag each time we blur
        const content = this._updateContentToViewState();
        if (content !== null) {
            this._refreshPlaceholder();
        }

        onBlur(ev);
    };

    private _onDragEnter = (ev: React.DragEvent<HTMLDivElement>): void => {
        const { onDragEnter = NullFunction } = this.props;
        onDragEnter(ev);
    };

    private _onDragLeave = (ev: React.DragEvent<HTMLDivElement>): void => {
        const { onDragLeave = NullFunction } = this.props;
        onDragLeave(ev);
    };

    private _onDragOver = (ev: React.DragEvent<HTMLDivElement>): void => {
        const { onDragOver = NullFunction } = this.props;
        onDragOver(ev);
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
        const { onDrop = NullFunction } = this.props;

        // handles the drop content scenario when editor is not yet activated and there's a placeholder
        if (this._contentDiv) {
            this.focus();
        }

        onDrop(ev);
    };

    private _contentDivOnRef = (ref: HTMLDivElement): void => {
        const { contentDivRef = NullFunction, plugins } = this.props;

        const eventName = "focus";
        if (this._contentDiv) {
            this._contentDiv.removeEventListener(eventName, this._onFocusNative);
        }
        if (ref) {
            ref.addEventListener(eventName, this._onFocusNative);
        }
        this._contentDiv = ref;
        plugins.forEach(p => p.initializeContentEditable && p.initializeContentEditable(ref));

        contentDivRef(ref);
    };
}
