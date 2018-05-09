import { ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { IIconProps } from 'office-ui-fabric-react/lib/Icon';
import { Editor } from 'roosterjs-editor-core';
import { FormatState } from 'roosterjs-editor-types';
import { ImageManagerInteface } from 'roosterjs-react-common';
import { EmojiPlugin } from 'roosterjs-react-emoji';

import RoosterCommandBarPluginInterface from '../schema/RoosterCommandBarPluginInterface';

export interface RoosterCommandBarProps {
    imageManager?: ImageManagerInteface;
    strings?: { [key: string]: string };
    className?: string;
    roosterCommandBarPlugin: RoosterCommandBarPluginInterface;
    emojiPlugin?: EmojiPlugin;
    additionalButtons?: RoosterCommandBarButton[];
    visibleButtonKeys?: string[];
    buttonIconProps?: { [key: string]: IIconProps };
    calloutClassName?: string;
    calloutOnDismiss?: (ev: React.FocusEvent<HTMLElement>) => void;
}

export interface RoosterCommandBarState {
    formatState: FormatState;
}

export interface RoosterCommandBarButton extends ICommandBarItemProps {
    handleChange?: (editor: Editor, props: RoosterCommandBarProps, state: RoosterCommandBarState) => void;
    getSelected?: (formatState: FormatState) => boolean;
    getChecked?: (formatState: FormatState) => boolean;
}
