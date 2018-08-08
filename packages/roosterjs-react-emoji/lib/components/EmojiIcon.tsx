import Emoji from "../schema/Emoji";
import { Strings, getDescriptionString } from "../strings/emojiStrings";
import * as React from "react";
import * as Styles from "./emoji.scss.g";
import { TooltipHost } from "office-ui-fabric-react/lib/Tooltip";
import { css } from "office-ui-fabric-react/lib/Utilities";

// The Component props
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
        const content = getDescriptionString(emoji.description, strings);

        const button = (
            <button
                className={css(Styles.emoji, { [Styles.selected]: isSelected })}
                onClick={onClick}
                onMouseOver={onMouseOver}
                onFocus={onFocus}
                data-is-focusable={true}
            >
                {emoji.codePoint || "..."}
            </button>
        );

        return showTooltip ? <TooltipHost content={content}>{button}</TooltipHost> : button;
    }
}

// export default class EmojiIcon extends React.Component<EmojiIconProps, {}> {
//     public render() {
//         const { emoji, onClick, isSelected, onMouseOver, onFocus, strings, showTooltip } = this.props;
//         const content = getDescriptionString(emoji.description, strings);

//         const button = (
//             <CommandButton
//                 className={css(Styles.emoji, { [Styles.selected]: isSelected } )}
//                 onClick={onClick}
//                 onMouseOver={onMouseOver}
//                 onFocus={onFocus}
//                 text={emoji.codePoint || "..."}
//                 data-is-focusable={true}
//                 styles={{ textContainer: { flexGrow: 1 }, root: { width: 40 } }}
//             />
//         );

//         return showTooltip ? <TooltipHost content={content}>{button}</TooltipHost> : button;
//     }
// }
