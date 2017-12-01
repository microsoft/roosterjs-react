import * as React from 'react';
import * as ReactDom from 'react-dom';
import { ReactEditor, createEditorViewState, Ribbon, RibbonPlugin, EditorViewState } from '../../lib';
import { MouseEvent } from 'react';

interface MainState {
    isReadonly: boolean;
}
interface MainProps {
    viewState: EditorViewState;
}
class AutoHydrateEditor extends React.Component<MainProps, MainState> {
    private ribbonPlugin: RibbonPlugin;
    private editor: ReactEditor;
    private contentDiv: HTMLDivElement;
    constructor(props: MainProps) {
        super(props);
        this.ribbonPlugin = new RibbonPlugin();
        this.state = {
            isReadonly: true,
        };
    }

    componentDidMount() {
        document.body.addEventListener('click', this.onBlur);
        window.addEventListener('resize', this.onResize);
    }

    componentWillMount() {
        document.body.removeEventListener('click', this.onBlur);
        window.removeEventListener('resize', this.onResize);
    }

    render() {
        let isReadonly = this.state.isReadonly;
        return <div
            onMouseDown={isReadonly ? this.onMouseDown : null}
            onClick={this.onClick}
            className={'editorContainer'}
            ref={ref => this.contentDiv = ref}>
            { !isReadonly && <Ribbon ribbonPlugin={this.ribbonPlugin} className={'myRibbon'} />}
            <ReactEditor
                ref={ref => this.editor = ref}
                initialReadonly={true}
                className={isReadonly ? 'editor' : 'editor editing'}
                viewState={viewState}
                plugins={[this.ribbonPlugin]} />
        </div>;
    }

    private onMouseDown = () => {
        this.editor.setIsReadonly(false);
        this.setState({
            isReadonly: false
        });
    }

    private onBlur = () => {
        if (document.activeElement && !this.contentDiv.contains(document.activeElement)) {
            this.editor.setIsReadonly(true);
            this.setState({
                isReadonly: true
            });
        }
    }

    private onClick = (e: MouseEvent<EventTarget>) => {
        e.stopPropagation();
    }

    private onResize = () => {
        this.ribbonPlugin && this.ribbonPlugin.resize();
    }
}

let container = document.getElementById('container');
let viewState = createEditorViewState('Hello ReactEditor! Click me to edit.');
let editor = <AutoHydrateEditor viewState={viewState}/>
ReactDom.render(editor, container, null);
