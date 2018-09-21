import { css } from "office-ui-fabric-react/lib/Utilities";
import * as React from "react";
import { getDataAndAriaProps, Strings } from "roosterjs-react-common";

import Emoji from "../schema/Emoji";
import * as Styles from "./emoji.scss.g";

export interface EmojiIconProps {
    id: string;
    emoji: Emoji;
    strings: Strings;
    onClick?: (e: React.MouseEvent<EventTarget>) => void;
    onMouseOver?: (number) => void;
    onFocus?: (number) => void;
    isSelected?: boolean;
    className?: string;
    selectedClassName?: string;
}

export default class EmojiIcon extends React.Component<EmojiIconProps, {}> {
    public render() {
        const { emoji, onClick, isSelected, onMouseOver, onFocus, strings, id, className, selectedClassName } = this.props;
        const content = strings[emoji.description];

        return (
            <button
                id={id}
                role="option"
                className={css(Styles.emoji, className, { "rooster-emoji-selected": isSelected, [selectedClassName]: isSelected })}
                onClick={onClick}
                onMouseOver={onMouseOver}
                onFocus={onFocus}
                data-is-focusable={true}
                aria-label={content}
                aria-selected={isSelected}
                {...getDataAndAriaProps(this.props)}
            >
                {emoji.codePoint || "…"}
            </button>
        );
    }
}
