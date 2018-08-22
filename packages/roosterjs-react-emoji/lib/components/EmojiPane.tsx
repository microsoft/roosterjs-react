import { FocusZone } from "office-ui-fabric-react/lib/FocusZone";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import * as React from "react";
import { KeyCodes } from "office-ui-fabric-react/lib/Utilities";
import { css, Strings } from "roosterjs-react-common";

import Emoji from "../schema/Emoji";
import EmojiList, { CommonEmojis, EmojiFamilyKeys, MoreEmoji } from "../utils/emojiList";
import { searchEmojis } from "../utils/searchEmojis";
import * as Styles from "./emoji.scss.g";
import EmojiIcon from "./EmojiIcon";
import EmojiNavBar, { EmojiNavBarProps } from "./EmojiNavBar";
import EmojiStatusBar, { EmojiStatusBarProps } from "./EmojiStatusBar";

// "When a div contains an element that is bigger (either taller or wider) than the parent and has the property
// overflow-x or overflow-y set to any value, then it can receive the focus."
// https://bugzilla.mozilla.org/show_bug.cgi?id=1069739
const TabIndexForFirefoxBug = -1;

export const enum EmojiPaneMode {
    Quick,
    Partial,
    Full
}

export interface EmojiPaneState {
    index: number;
    mode: EmojiPaneMode;
    currentEmojiList: Emoji[];
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
    navBarProps?: Partial<EmojiNavBarProps>;
    statusBarProps?: Partial<EmojiStatusBarProps>;
    searchDisabled?: boolean;
}

export interface InternalEmojiPaneProps extends EmojiPaneProps {
    onSelect: (emoji: Emoji, wordBeforeCursor: string) => void;
    strings: Strings;
    onLayoutChange?: () => void;
}

export default class EmojiPane extends React.PureComponent<InternalEmojiPaneProps, EmojiPaneState> {
    private static IdCounter = 0;

    private _baseId = EmojiPane.IdCounter++;
    private _searchBox: TextField;

    constructor(props: InternalEmojiPaneProps) {
        super(props);

        this.state = {
            index: 0,
            mode: EmojiPaneMode.Quick,
            currentEmojiList: CommonEmojis,
            currentFamily: EmojiFamilyKeys.People,
            search: ":",
            searchInBox: ""
        };
    }

    public render(): JSX.Element {
        return this.state.mode === EmojiPaneMode.Quick ? this._renderQuickPicker() : this._renderFullPicker();
    }

    public componentDidUpdate(_: EmojiPaneProps, prevState: EmojiPaneState) {
        // call onLayoutChange when the call out parent of the EmojiPane needs to reorient itself on the page
        const { onLayoutChange } = this.props;
        const { currentEmojiList, mode, currentFamily } = this.state;

        if (mode !== prevState.mode) {
            onLayoutChange();
            return;
        }

        const currentEmojisLength = currentEmojiList ? currentEmojiList.length : EmojiList[currentFamily].length;
        const prevEmojisLength = prevState.currentEmojiList
            ? prevState.currentEmojiList.length
            : EmojiList[prevState.currentFamily].length;
        if (mode !== EmojiPaneMode.Quick && currentEmojisLength !== prevEmojisLength) {
            onLayoutChange();
            return;
        }
    }

    public navigate(change: number): void {
        const newIndex = this.state.index + change;
        const length = this.state.currentEmojiList.length;
        if (newIndex >= 0 && newIndex < length) {
            this.setState({ index: newIndex });
        }
    }

    public getSelectedEmoji(): Emoji {
        const { currentEmojiList, index } = this.state;

        return currentEmojiList[index];
    }

    public showFullPicker(fullSearchText: string): void {
        const normalizedSearchValue = this._normalizeSearchText(fullSearchText, true);
        const newMode = normalizedSearchValue.length === 0 ? EmojiPaneMode.Full : EmojiPaneMode.Partial;
        this.setState({
            index: 0,
            mode: newMode,
            currentEmojiList: this._getSearchResult(normalizedSearchValue, newMode),
            search: fullSearchText,
            searchInBox: normalizedSearchValue
        });
    }

    public setSearch(value: string): void {
        const normalizedSearchValue = this._normalizeSearchText(value, false);
        this.setState({
            index: 0,
            currentEmojiList: this._getSearchResult(normalizedSearchValue, this.state.mode),
            search: value
        });
    }

    private _normalizeSearchText(text: string, colonIncluded: boolean): string {
        if (text == null) {
            return "";
        }

        if (colonIncluded) {
            text = text.substr(1);
        }
        return text.trim();
    }

    private _getSearchResult(searchValue: string, mode: EmojiPaneMode): Emoji[] {
        const isQuickMode = mode === EmojiPaneMode.Quick;
        if (!searchValue) {
            return isQuickMode ? this.state.currentEmojiList : EmojiList[this.state.currentFamily];
        }

        const emojiList = searchEmojis(searchValue, this.props.strings);
        return isQuickMode ? emojiList.slice(0, 5).concat([MoreEmoji]) : emojiList;
    }

    private _renderQuickPicker(): JSX.Element {
        const { quickPickerClassName, strings } = this.props;

        return (
            <div className={css(Styles.quickPicker, "rooster-emoji-pane", "quick-picker", quickPickerClassName)}>
                {this.state.currentEmojiList.map((emoji, index) => (
                    <EmojiIcon
                        key={emoji.key}
                        strings={strings}
                        onMouseOver={() => this.setState({ index })}
                        onFocus={() => this.setState({ index })}
                        emoji={emoji}
                        isSelected={index === this.state.index}
                        onClick={e => this._onSelect(e, emoji)}
                        showTooltip={true}
                    />
                ))}
            </div>
        );
    }

    private _renderFullPicker(): JSX.Element {
        const { fullPickerClassName, searchDisabled } = this.props;

        return (
            <div className={css("rooster-emoji-pane", fullPickerClassName)}>
                {!searchDisabled && (
                    <TextField
                        ref={this._searchRefCallback}
                        value={this.state.searchInBox}
                        onChanged={this._onSearchChange}
                        inputClassName={Styles.emojiTextInput}
                        onKeyPress={this._onSearchKeyPress}
                    />
                )}
                {this.state.mode === EmojiPaneMode.Full ? this._renderFullList() : this._renderPartialList()}
            </div>
        );
    }

    private _onSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (!e || e.which !== KeyCodes.enter) {
            return;
        }

        const { index, currentEmojiList } = this.state;

        if (index >= 0 && currentEmojiList && currentEmojiList.length > 0) {
            this._onSelect(e, currentEmojiList[index]);
        }
    };

    private _renderPartialList(): JSX.Element {
        const { partialListClassName, strings, statusBarProps } = this.props;

        return (
            <div>
                <div
                    className={css(Styles.partialList, partialListClassName)}
                    data-is-scrollable={true}
                    tabIndex={TabIndexForFirefoxBug}
                >
                    <FocusZone className={Styles.partialListContent}>
                        {this.state.currentEmojiList.map((emoji, index) => (
                            <EmojiIcon
                                key={emoji.key}
                                onMouseOver={() => this.setState({ index })}
                                onFocus={() => this.setState({ index })}
                                strings={strings}
                                emoji={emoji}
                                isSelected={index === this.state.index}
                                onClick={e => this._onSelect(e, emoji)}
                            />
                        ))}
                    </FocusZone>
                </div>
                <EmojiStatusBar emoji={this.getSelectedEmoji()} strings={strings} {...statusBarProps} />
            </div>
        );
    }

    private _renderFullList(): JSX.Element {
        const { fullListClassName, fullListContentClassName, strings, navBarProps, statusBarProps } = this.props;

        return (
            <div className={css(Styles.fullList, fullListClassName)}>
                <div className={Styles.fullListBody} data-is-scrollable={true} tabIndex={TabIndexForFirefoxBug}>
                    <EmojiNavBar
                        strings={strings}
                        {...navBarProps}
                        onClick={this._pivotClick}
                        currentSelected={this.state.currentFamily}
                        getTabId={this._getTabId}
                    />
                    <div
                        className={Styles.fullListContentContainer}
                        role="tabpanel"
                        aria-labeledby={this._getTabId(this.state.currentFamily)}
                    >
                        <div>
                            <FocusZone
                                className={css(Styles.fullListContent, fullListContentClassName)}
                                ref={this._focusZoneRefCallback}
                            >
                                {this.state.currentEmojiList.map((emoji: Emoji, index) => (
                                    <EmojiIcon
                                        key={emoji.key}
                                        onMouseOver={() => this.setState({ index })}
                                        onFocus={() => this.setState({ index })}
                                        strings={strings}
                                        emoji={emoji}
                                        isSelected={index === this.state.index}
                                        onClick={e => this._onSelect(e, emoji)}
                                    />
                                ))}
                            </FocusZone>
                        </div>
                    </div>
                </div>

                <EmojiStatusBar emoji={this.getSelectedEmoji()} strings={strings} {...statusBarProps} />
            </div>
        );
    }

    private _pivotClick = (selected: string): void => {
        const currentFamily = selected as EmojiFamilyKeys;

        this.setState({ currentEmojiList: EmojiList[currentFamily], currentFamily });
    };

    private _getTabId = (itemKey: EmojiFamilyKeys): string => {
        return `family_${itemKey}_${this._baseId}`;
    };

    private _searchRefCallback = (ref: TextField): void => {
        this._searchBox = ref;
        if (this._searchBox) {
            this._searchBox.focus();
            this._searchBox.setSelectionStart(this._searchBox.value.length);
        }
    };

    private _focusZoneRefCallback = (ref: FocusZone): void => {
        if (this.props.searchDisabled && ref) {
            ref.focus();
        }
    };

    private _onSearchChange = (newValue: string): void => {
        const normalizedSearchValue = this._normalizeSearchText(newValue, false);
        const newMode = normalizedSearchValue.length === 0 ? EmojiPaneMode.Full : EmojiPaneMode.Partial;
        this.setState({
            index: 0,
            currentEmojiList: this._getSearchResult(normalizedSearchValue, this.state.mode),
            searchInBox: newValue,
            mode: newMode
        });
    };

    private _onSelect = (e: React.MouseEvent<EventTarget> | React.KeyboardEvent<HTMLInputElement>, emoji: Emoji): void => {
        e.stopPropagation();
        e.preventDefault();
        this.props.onSelect && this.props.onSelect(emoji, this.state.search);
    };
}
