import RoosterCommandBar from '../components/RoosterCommandBar';
import { Editor } from 'roosterjs-editor-core';

export default interface RoosterCommandBarPluginInterface {
    getEditor: () => Editor;
    registerRoosterCommandBar: (ribbon: RoosterCommandBar) => void;
    unregisterRoosterCommandBar: (ribbon: RoosterCommandBar) => void;
}
