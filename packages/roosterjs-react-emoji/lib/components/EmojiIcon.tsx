import Emoji from "../schema/Emoji";
import * as React from "react";
import * as Styles from "./emoji.scss.g";
import { TooltipHost } from "office-ui-fabric-react/lib/Tooltip";
import { css } from "office-ui-fabric-react/lib/Utilities";
import { Strings } from 'roosterjs-react-common';

export interface EmojiIconProps {
    emoji: Emoji;
    strings: Strings;
    onClick?: (e: React.MouseEvent<EventTarget>) => void;
    onMouseOver?: (number) => void;
    onFocus?: (number) => void;
    isSelected?: boolean;
    cssClassName?: string;
    showTooltip?: boolean;
}

export default class EmojiIcon extends React.Component<EmojiIconProps, {}> {
    public render() {
        const { emoji, onClick, isSelected, onMouseOver, onFocus, strings, showTooltip } = this.props;
        const content = strings[emoji.description];

        const button = (
            <button
                className={css(Styles.emoji, { "rooster-emoji-selected": isSelected })}
                onClick={onClick}
                onMouseOver={onMouseOver}
                onFocus={onFocus}
                data-is-focusable={true}
                aria-label={content}
            >
                {emoji.codePoint || "..."}
            </button>
        );

        return showTooltip ? <TooltipHost content={content} hostClassName={Styles.tooltipHost}>{button}</TooltipHost> : button;
    }
}
