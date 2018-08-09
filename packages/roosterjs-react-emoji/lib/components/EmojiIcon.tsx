import Emoji from '../schema/Emoji';
import { CommandButton } from 'office-ui-fabric-react/lib/Button';
import * as React from 'react';
import * as Styles from './emoji.scss.g';
import { Strings } from 'roosterjs-react-common';

// The Component props
export interface EmojiIconProps {
    emoji: Emoji;
    strings: Strings;
    onClick?: (e: React.MouseEvent<EventTarget>) => void;
    isSelected?: boolean;
    cssClassName?: string;
}

export default class EmojiIcon extends React.Component<EmojiIconProps, {}> {
    public render() {
        const { emoji, onClick, isSelected, strings } = this.props;
        const iconClassNames = `${Styles.emoji} ${isSelected ? Styles.selected : ""}`;

        return (
            <CommandButton
                className={iconClassNames}
                title={strings[emoji.description]}
                onClick={onClick}
                text={emoji.codePoint || "..."}
                data-is-focusable={true}
                styles={{ textContainer: { flexGrow: 1 }, root: { width: 40 } }}
            />
        );
    }
}
