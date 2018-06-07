import RoosterCommandBar from '../components/RoosterCommandBar';
import { Editor } from 'roosterjs-editor-core';

export default interface RoosterCommandBarPluginInterface {
    getEditor: () => Editor;
    registerRoosterCommandBar: (commandBar: RoosterCommandBar) => void;
    unregisterRoosterCommandBar: (commandBar: RoosterCommandBar) => void;
}
