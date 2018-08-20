import { FocusZone } from "office-ui-fabric-react/lib/FocusZone";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import * as React from "react";
import { browserData } from "roosterjs-editor-core";
import { css, Strings } from "roosterjs-react-common";

import Emoji from "../schema/Emoji";
import EmojiList, { CommonEmojis, EmojiFamilyKeys, MoreEmoji } from "../utils/emojiList";
import { searchEmojis } from "../utils/searchEmojis";
import * as Styles from "./emoji.scss.g";
import EmojiIcon from "./EmojiIcon";
import EmojiNavBar from "./EmojiNavBar";

// "When a div contains an element that is bigger (either taller or wider) than the parent and has the property
// overflow-x or overflow-y set to any value, then it can receive the focus."
// https://bugzilla.mozilla.org/show_bug.cgi?id=1069739
const TabIndexForFirefoxBug = -1;

export interface EmojiPaneState {
    index: number;
    isFullPicker: boolean;
    emojis: Emoji[];
    currentFamily: EmojiFamilyKeys;
    search: string;
    searchInBox: string;
}

export interface EmojiPaneProps {
    quickPickerClassName?: string;
    fullPickerClassName?: string;
    fullListClassName?: string;
    fullListContentClassName?: string;
    partialListClassName?: string;
    navbarThemeClassName?: string;
    navbarButtonThemeClassName?: string;
    navbarIconThemeClassName?: string;
    searchDisabled?: boolean;
}

export interface InternalEmojiPaneProps extends EmojiPaneProps {
    onSelect: (emoji: Emoji, wordBeforeCursor: string) => void;
    strings: Strings;
    onLayoutChange?: () => void;
}

export default class EmojiPane extends React.Component<InternalEmojiPaneProps, EmojiPaneState> {
    private static IdCounter = 0;

    private baseId = EmojiPane.IdCounter++;
    private searchBox: TextField;

    constructor(props: InternalEmojiPaneProps) {
        super(props);

        this.state = {
            index: 0,
            isFullPicker: false,
            emojis: CommonEmojis,
            currentFamily: EmojiFamilyKeys.People,
            search: ":",
            searchInBox: ""
        };
    }

    public render(): JSX.Element {
        return this.state.isFullPicker ? this.renderFullPicker() : this.renderQuickPicker();
    }

    public componentDidUpdate(_: EmojiPaneProps, prevState: EmojiPaneState) {
        const { onLayoutChange } = this.props;
        const { emojis, isFullPicker, currentFamily } = this.state;

        if (isFullPicker !== prevState.isFullPicker) {
            onLayoutChange();
            return;
        }

        const currentEmojisLength = emojis ? emojis.length : EmojiList[currentFamily].length;
        const prevEmojisLength = prevState.emojis ? prevState.emojis.length : EmojiList[prevState.currentFamily].length;
        if (isFullPicker && currentEmojisLength !== prevEmojisLength) {
            onLayoutChange();
            return;
        }
    }

    public navigate(change: number): void {
        let newIndex = this.state.index + change;
        let length = this.state.emojis.length;
        if (newIndex >= 0 && newIndex < length) {
            this.setState({ index: newIndex });
        }
    }

    public getSelectedEmoji(): Emoji {
        return this.state.emojis[this.state.index];
    }

    public showFullPicker(search: string): void {
        let searchInBox = search == null ? "" : search.substr(1);
        this.setState({
            index: 0,
            isFullPicker: true,
            emojis: search ? this.getSearchResult(this.props.searchDisabled ? "" : searchInBox, true) : null,
            search: search,
            searchInBox: searchInBox
        });
    }

    public setSearch(search: string): void {
        this.setState({
            index: 0,
            emojis: this.getSearchResult(search, this.state.isFullPicker),
            search: search
        });
    }

    private getSearchResult(search: string, isFullPicker: boolean): Emoji[] {
        if (!search) {
            return isFullPicker ? null : this.state.emojis;
        }

        let emojis = searchEmojis(search, this.props.strings);
        return isFullPicker ? emojis : emojis.slice(0, 5).concat([MoreEmoji]);
    }

    // For IE, fixed width not accounting for scroll bar glitches and content is overlapped with content.
    // A workaround is to refresh the overflow value.
    private _resizeOnRefForIE =
        browserData.isIE &&
        ((ref: HTMLDivElement): void => {
            if (ref) {
                const prevValue = ref.style.overflowY;
                ref.style.overflowY = "hidden";
                requestAnimationFrame(() => (ref.style.overflowY = prevValue));
            }
        });

    private renderQuickPicker(): JSX.Element {
        const { quickPickerClassName, strings } = this.props;

        return (
            <div className={css(Styles.quickPicker, "rooster-emoji-pane", quickPickerClassName)}>
                {this.state.emojis.map((emoji, index) => (
                    <EmojiIcon
                        key={emoji.key}
                        strings={strings}
                        emoji={emoji}
                        isSelected={index === this.state.index}
                        onClick={e => this.onSelect(e, emoji)}
                    />
                ))}
            </div>
        );
    }

    private renderFullPicker(): JSX.Element {
        const { fullPickerClassName, searchDisabled } = this.props;

        return (
            <div className={css("rooster-emoji-pane", fullPickerClassName)}>
                {!searchDisabled && (
                    <TextField
                        ref={this.searchRefCallback}
                        value={this.state.searchInBox}
                        onChanged={this.onSearchChange}
                        inputClassName={Styles.emojiTextInput}
                    />
                )}
                {this.state.emojis ? this.renderPartialList() : this.renderFullList()}
            </div>
        );
    }

    private renderPartialList(): JSX.Element {
        const { partialListClassName, strings } = this.props;

        return (
            <div
                className={css(Styles.partialList, partialListClassName)}
                data-is-scrollable={true}
                ref={this._resizeOnRefForIE}
                tabIndex={TabIndexForFirefoxBug}
            >
                <FocusZone className={Styles.partialListContent}>
                    {this.state.emojis.map(emoji => (
                        <EmojiIcon
                            key={emoji.key}
                            strings={strings}
                            emoji={emoji}
                            isSelected={false}
                            onClick={e => this.onSelect(e, emoji)}
                        />
                    ))}
                </FocusZone>
            </div>
        );
    }

    private renderFullList(): JSX.Element {
        const {
            fullListClassName,
            fullListContentClassName,
            strings,
            navbarThemeClassName,
            navbarButtonThemeClassName,
            navbarIconThemeClassName
        } = this.props;

        return (
            <div className={css(Styles.fullList, fullListClassName)}>
                <div
                    className={Styles.fullListBody}
                    data-is-scrollable={true}
                    ref={this._resizeOnRefForIE}
                    tabIndex={TabIndexForFirefoxBug}
                >
                    <EmojiNavBar
                        onClick={this.pivotClick}
                        currentSelected={this.state.currentFamily}
                        getTabId={this.getTabId}
                        strings={strings}
                        navbarThemeClassName={navbarThemeClassName}
                        navbarButtonThemeClassName={navbarButtonThemeClassName}
                        navbarIconThemeClassName={navbarIconThemeClassName}
                    />
                    <div
                        className={Styles.fullListContentContainer}
                        role="tabpanel"
                        aria-labeledby={this.getTabId(this.state.currentFamily)}
                    >
                        <div>
                            <FocusZone
                                className={css(Styles.fullListContent, fullListContentClassName)}
                                ref={this.focusZoneRefCallback}
                            >
                                {EmojiList[this.state.currentFamily].map((emoji: Emoji) => (
                                    <EmojiIcon
                                        key={emoji.key}
                                        strings={strings}
                                        emoji={emoji}
                                        isSelected={false}
                                        onClick={e => this.onSelect(e, emoji)}
                                    />
                                ))}
                            </FocusZone>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private pivotClick = (selected: string): void => {
        const currentFamily = selected as EmojiFamilyKeys;

        this.setState({ currentFamily });
    };

    private getTabId = (itemKey: EmojiFamilyKeys): string => {
        return `family_${itemKey}_${this.baseId}`;
    };

    private searchRefCallback = (ref: TextField): void => {
        this.searchBox = ref;
        if (this.searchBox) {
            this.searchBox.focus();
            this.searchBox.setSelectionStart(this.searchBox.value.length);
        }
    };

    private focusZoneRefCallback = (ref: FocusZone): void => {
        if (this.props.searchDisabled && ref) {
            ref.focus();
        }
    };

    private onSearchChange = (newValue: string): void => {
        this.setState({
            index: 0,
            emojis: this.getSearchResult(newValue, this.state.isFullPicker),
            searchInBox: newValue
        });
    };

    private onSelect = (e: React.MouseEvent<EventTarget>, emoji: Emoji): void => {
        e.stopPropagation();
        e.preventDefault();
        this.props.onSelect && this.props.onSelect(emoji, this.state.search);
    };
}
