import RoosterCommandBarPluginInterface from '../schema/RoosterCommandBarPluginInterface';
import { ImageManagerInteface } from 'roosterjs-react-common';
import { EmojiPlugin } from 'roosterjs-react-emoji';
import { FormatState } from 'roosterjs-editor-types';

export interface RoosterCommandBarProps {
    imageManager?: ImageManagerInteface;
    strings?: { [key: string]: string };
    className?: string;
    roosterCommandBarPlugin: RoosterCommandBarPluginInterface;
    emojiPlugin?: EmojiPlugin
    visibleButtonKeys?: string[];
    calloutClassName?: string;
    calloutOnDismiss?: (ev: React.FocusEvent<HTMLElement>) => void;
}

export interface RoosterCommandBarState {
    formatState: FormatState;
}
