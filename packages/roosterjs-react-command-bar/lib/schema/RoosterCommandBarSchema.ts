import { ICommandBarItemProps } from 'office-ui-fabric-react/lib/CommandBar';
import { IContextualMenuProps } from 'office-ui-fabric-react/lib/ContextualMenu';
import { Editor } from 'roosterjs-editor-core';
import { FormatState } from 'roosterjs-editor-types';
import { ImageManagerInteface, Strings } from 'roosterjs-react-common';
import { EmojiPlugin } from 'roosterjs-react-emoji';

import RoosterCommandBarPluginInterface from '../schema/RoosterCommandBarPluginInterface';

export interface RoosterCommandBarProps {
    imageManager?: ImageManagerInteface;
    strings?: Strings;
    className?: string;
    commandBarClassName?: string;
    roosterCommandBarPlugin: RoosterCommandBarPluginInterface;
    emojiPlugin?: EmojiPlugin;
    buttonOverrides?: RoosterCommandBarButton[];
    calloutClassName?: string;
    calloutOnDismiss?: (ev: React.FocusEvent<HTMLElement>) => void;
    onButtonClicked?: (buttonKey: string) => void;
    overflowMenuProps?: Partial<IContextualMenuProps>;
    disableListWorkaround?: boolean;
}

export interface RoosterCommandBarState {
    formatState: FormatState;
}

export interface RoosterCommandBarButton extends ICommandBarItemProps {
    handleChange?: (editor: Editor, props: RoosterCommandBarProps, state: RoosterCommandBarState) => void;
    isContextMenuItem?: boolean;
    getChecked?: (formatState: FormatState) => boolean;
    order?: number;
    exclude?: boolean;
}
