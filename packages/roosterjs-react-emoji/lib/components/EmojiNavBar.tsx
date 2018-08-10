import { FocusZone, FocusZoneDirection } from "office-ui-fabric-react/lib/FocusZone";
import { Icon } from "office-ui-fabric-react/lib/Icon";
import { TooltipHost } from "office-ui-fabric-react/lib/Tooltip";
import * as React from "react";
import { css, Strings } from "roosterjs-react-common";

import EmojiList, { EmojiFabricIconCharacterMap } from "../utils/emojiList";
import * as EmojiNavBarStyles from "./EmojiNavBar.scss.g";

export interface EmojiNavBarProps {
    onClick?: (selected: string) => void;
    currentSelected?: string;
    getTabId?: (selected: string) => string;
    strings: Strings;
}

export default class EmojiNavBar extends React.Component<EmojiNavBarProps, {}> {
    public render() {
        const { currentSelected, getTabId, strings } = this.props;

        return (
            // for each emoji family key, create a button to use as nav bar
            <div className={EmojiNavBarStyles.navBar} role="tablist">
                <FocusZone direction={FocusZoneDirection.horizontal}>
                    {Object.keys(EmojiList).map((key, index) => {
                        const selected = key === currentSelected;
                        const friendlyName = strings[key];
                        return (
                            <TooltipHost hostClassName={EmojiNavBarStyles.navBarTooltip} content={friendlyName} key={key}>
                                <button
                                    className={css(EmojiNavBarStyles.navBarButton, { [EmojiNavBarStyles.selected]: selected })}
                                    key={key}
                                    onClick={this.onFamilyClick.bind(this, key)}
                                    id={getTabId(currentSelected)}
                                    role="tab"
                                    aria-selected="false"
                                    aria-label={friendlyName}
                                    data-is-focusable="true"
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

    private onFamilyClick(key: string): void {
        if (this.props.onClick) {
            this.props.onClick(key);
        }
    }
}
