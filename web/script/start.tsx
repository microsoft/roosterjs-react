import * as React from 'react';
import * as ReactDom from 'react-dom';
import { ReactEditor, createEditorViewState } from '../../lib';

let container = document.getElementById('container');
let viewState = createEditorViewState('Hello ReactEditor!');
let editor = <ReactEditor className={'editor'} viewState={viewState} />
ReactDom.render(editor, container, null);