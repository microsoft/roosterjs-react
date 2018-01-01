import { Editor } from 'roosterjs-editor-core';
import RibbonComponent from './RibbonComponent';

interface RibbonPluginInterface {
    getEditor: () => Editor;
    buttonClick: (buttonName: string) => void;
    registerRibbonComponent: (ribbon: RibbonComponent) => void;
    unregisterRibbonComponent: (ribbon: RibbonComponent) => void;
}

export default RibbonPluginInterface;
