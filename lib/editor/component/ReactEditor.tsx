import * as React from 'react';
import EditorViewState from '../schema/EditorViewState';
import { Editor, EditorOptions, EditorPlugin, UndoService } from 'roosterjs-editor-core';
import {
    ClipBoardData,
    ContentEdit,
    HyperLink,
    PasteManager,
    DefaultShortcut,
} from 'roosterjs-editor-plugins';
import { convertInlineCss } from 'roosterjs-editor-dom';
import { DefaultFormat } from 'roosterjs-editor-types';

export interface ReactEditorProps {
    viewState: EditorViewState,
    className?: string,
    plugins?: EditorPlugin[],
    updateViewState?: (viewState: EditorViewState, content: string, isInitializing: boolean) => void;
    undo?: UndoService;
    pasteHandler?: (clipboardData: ClipBoardData) => void;
    isRtl?: boolean;
    hyperlinkToolTipCallback?: (href: string) => string;
    defaultFormat?: DefaultFormat;
    initialReadonly?: boolean;
}

export default class ReactEditor extends React.Component<ReactEditorProps, {}> {
    private contentDiv: HTMLDivElement;
    private editor: Editor;
    private updateViewStateWhenUnmount: boolean;

    render() {
        let { className, isRtl, viewState } = this.props;
        return <div
            dangerouslySetInnerHTML={{__html: convertInlineCss(viewState.content)}}
            dir={isRtl ? 'rtl' : 'ltr'}
            className={className}
            ref={ref => this.contentDiv = ref}></div>;
    }

    componentDidMount() {
        if (this.props.initialReadonly) {
            this.contentDiv.innerHTML = this.props.viewState.content;
        } else {
            this.createEditor();
        }
        this.updateContentToViewState(true /*isInitializing*/);
    }

    componentWillUnmount() {
        if (this.updateViewStateWhenUnmount) {
            this.updateContentToViewState();
            this.updateViewStateWhenUnmount = false;
        }
        this.disposeEditor();
    }

    setIsReadonly(isReadonly: boolean) {
        if (isReadonly) {
            this.disposeEditor();
        } else {
            this.createEditor();
        }
    }

    updateContentToViewState(isInitializing?: boolean) {
        if (this.editor) {
            let updateViewState = this.props.updateViewState || this.updateViewState;
            updateViewState(this.props.viewState, this.editor.getContent(), isInitializing);
        }
    }

    setUpdateViewStateWhenUnmount(updateViewStateWhenUnmount: boolean) {
        this.updateViewStateWhenUnmount = updateViewStateWhenUnmount;
    }

    private createEditor() {
        if (!this.editor) {
            this.editor = new Editor(this.contentDiv, this.getEditorOptions());
            this.updateViewStateWhenUnmount = true;
        }
    }

    private disposeEditor() {
        if (this.editor) {
            this.editor.dispose();
            this.editor = null;
        }
    }

    private getEditorOptions(): EditorOptions {
        let { pasteHandler, plugins, undo, hyperlinkToolTipCallback, defaultFormat } = this.props;
        let allPlugins: EditorPlugin[] = [
            new ContentEdit(),
            new HyperLink(hyperlinkToolTipCallback),
            new PasteManager(pasteHandler),
            new DefaultShortcut(),
        ];

        if (plugins) {
            allPlugins = allPlugins.concat(plugins);
        }

        let options: EditorOptions = {
            plugins: allPlugins,
            defaultFormat: defaultFormat,
            undo: undo,
        };

        return options;
    }

    private updateViewState(viewState: EditorViewState, content: string, isInitializing: boolean) {
        if (viewState.content != content) {
            viewState.content = content;
            if (!isInitializing) {
                viewState.isDirty = true;
            }
        }
    }
}