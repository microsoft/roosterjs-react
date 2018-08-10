import * as React from "react";
import { TooltipHost } from "office-ui-fabric-react/lib/Tooltip";
import { Icon } from "office-ui-fabric-react/lib/Icon";
import EmojiList, { EmojiFabricIconCharacterMap } from "../utils/emojiList";
import * as EmojiNavBarStyles from "./EmojiNavBar.scss.g";
import { css } from "roosterjs-react-common";
import { FocusZone } from "office-ui-fabric-react/lib/FocusZone";

export interface EmojiNavBarProps {
    onClick?: (selected: string) => void;
    currentSelected?: string;
}

export default class EmojiNavBar extends React.Component<EmojiNavBarProps, {}> {
    public render() {
        const { onClick, currentSelected } = this.props;

        return (
            // for each emoji family key, create a button to use as nav bar
            <div className={EmojiNavBarStyles.navBar}>
                <FocusZone>
                    {Object.keys(EmojiList).map((key, index) => {
                        const selectedClassName = key === currentSelected ? EmojiNavBarStyles.selected : "";

                        return (
                            <TooltipHost hostClassName={EmojiNavBarStyles.navBarTooltip} content={key} key={key}>
                                <button
                                    className={css(EmojiNavBarStyles.navBarButton, selectedClassName)}
                                    key={key}
                                    onClick={() => onClick(key)}
                                >
                                    <Icon iconName={EmojiFabricIconCharacterMap[key]} />
                                </button>
                            </TooltipHost>
                        );
                    })}
                </FocusZone>
            </div>
        );
    }
}