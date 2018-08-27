import { TooltipHost, TooltipOverflowMode } from "office-ui-fabric-react/lib/Tooltip";
import * as React from "react";
import { css, Strings } from "roosterjs-react-common";

import Emoji from "../schema/Emoji";
import * as StatusBarStyles from "./EmojiStatusBar.scss.g";

export interface EmojiStatusBarProps {
    emoji: Emoji;
    strings: Strings;
    className?: string;
    hasResult: boolean;
}

export default class EmojiStatusBar extends React.Component<EmojiStatusBarProps, {}> {
    public render() {
        const { emoji, strings, className, hasResult } = this.props;

        if (!hasResult) {
            const noResultDescription = strings["emjDNoSuggetions"];
            return (
                <div className={css(StatusBarStyles.statusBar, className)}>
                    <div style={{ display: "none" }} aria-live="polite">
                        {noResultDescription}
                    </div>
                    <div className={StatusBarStyles.statusBarNoResultDetailsContainer}>
                        <TooltipHost content={noResultDescription} overflowMode={TooltipOverflowMode.Parent}>
                            <span role="alert">{noResultDescription}</span>
                        </TooltipHost>
                    </div>
                </div>
            );
        }

        const icon = emoji ? emoji.codePoint : "";
        const description = emoji ? strings[emoji.description] : "";

        return (
            <div className={css(StatusBarStyles.statusBar, className)}>
                <i className={StatusBarStyles.statusBarIcon} role="presentation" aria-hidden="true">
                    {icon}
                </i>

                <div className={StatusBarStyles.statusBarDetailsContainer}>
                    <div className={StatusBarStyles.statusBarDetails}>
                        <TooltipHost content={description} overflowMode={TooltipOverflowMode.Parent}>
                            {description}
                        </TooltipHost>
                    </div>
                </div>
            </div>
        );
    }
}
