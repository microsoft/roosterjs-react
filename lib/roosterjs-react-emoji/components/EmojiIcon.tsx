import Emoji from '../schema/Emoji';
import { CommandButton } from 'office-ui-fabric-react/lib/Button';
import { Strings, getDescriptionString } from '../strings/emojiStrings';
import * as React from 'react';
import * as Styles from './emoji.scss.g';

// The Component props
export interface EmojiIconProps {
    emoji: Emoji;
    strings: Strings;
    onClick?: (e: React.MouseEvent<EventTarget>) => void;
    isSelected?: boolean;
    cssClassName?: string;
}

export default class EmojiIcon extends React.Component<EmojiIconProps, {}> {
    render() {
        let { emoji, onClick, isSelected } = this.props;
        let iconClassNames = `${Styles.emoji} ${isSelected ? Styles.selected : ''}`;

        return (
            <CommandButton
                className={iconClassNames}
                title={getDescriptionString(emoji.description, this.props.strings)}
                onClick={onClick}
                text={emoji.codePoint || '...'}
                data-is-focusable={true}
            />
        );
    }
}
