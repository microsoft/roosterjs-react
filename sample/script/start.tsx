import * as React from 'react';
import * as ReactDom from 'react-dom';
import { ReactEditor, createEditorViewState, Ribbon, RibbonPlugin, EmojiPlugin, createEmojiButton } from '../../lib';
import ribbonButtonRenderer from './ribbonButtonRenderer';

let container = document.getElementById('container');
let viewState = createEditorViewState('Hello ReactEditor!');
let ribbonPlugin = new RibbonPlugin();
let emojiPlugin = new EmojiPlugin();
let emojiButton = createEmojiButton(emojiPlugin);
let ribbonButtons = [
    'emoji',
    'bold',
    'italic',
    'underline',
    'font',
    'size',
    'bkcolor',
    'color',
    'bullet',
    'number',
    'indent',
    'outdent',
    'quote',
    'left',
    'center',
    'right',
    'link',
    'unlink',
    'sub',
    'super',
    'strike',
    'alttext',
    'ltr',
    'rtl',
    'undo',
    'redo',
    'unformat',
]
let editor = <div>
    <Ribbon
        ribbonPlugin={ribbonPlugin}
        className={'myRibbon'}
        buttonRenderer={ribbonButtonRenderer}
        buttonNames={ribbonButtons}
        additionalButtons={{emoji: emojiButton}}
        />
    <ReactEditor
        className={'editor'}
        viewState={viewState}
        plugins={[ribbonPlugin, emojiPlugin]} />
</div>;
window.addEventListener('resize', () => {
    ribbonPlugin.resize();
});
ReactDom.render(editor, container, null);