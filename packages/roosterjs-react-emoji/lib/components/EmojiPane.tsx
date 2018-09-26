import { Callout, DirectionalHint, ICalloutProps } from "office-ui-fabric-react/lib/Callout";
import { FocusZone } from "office-ui-fabric-react/lib/FocusZone";
import { TextField, ITextField } from "office-ui-fabric-react/lib/TextField";
import { KeyCodes } from "office-ui-fabric-react/lib/Utilities";
import * as React from "react";
import { AriaAttributes, css, NullFunction, Strings } from "roosterjs-react-common";

import Emoji from "../schema/Emoji";
import EmojiList, { CommonEmojis, EmojiFamilyKeys, MoreEmoji } from "../utils/emojiList";
import { searchEmojis } from "../utils/searchEmojis";
import * as Styles from "./emoji.scss.g";
import EmojiIcon, { EmojiIconProps } from "./EmojiIcon";
import EmojiNavBar, { EmojiNavBarProps } from "./EmojiNavBar";
import EmojiStatusBar, { EmojiStatusBarProps } from "./EmojiStatusBar";

// "When a div contains an element that is bigger (either taller or wider) than the parent and has the property
// overflow-x or overflow-y set to any value, then it can receive the focus."
// https://bugzilla.mozilla.org/show_bug.cgi?id=1069739
const TabIndexForFirefoxBug = -1;

const PaneBaseClassName = "rooster-emoji-pane";
const EmojisPerRow = 7;
const EmojiVisibleRowCount = 5;
const EmojiVisibleWithoutNavBarRowCount = 6;
const EmojiHeightPx = 40;
const VerticalDirectionKeys = [KeyCodes.up, KeyCodes.down];
const DirectionKeys = [KeyCodes.left, KeyCodes.right, KeyCodes.up, KeyCodes.down, KeyCodes.home, KeyCodes.end];

const TooltipCalloutProps: ICalloutProps = {
    isBeakVisible: true,
    beakWidth: 16,
    gapSpace: 0,
    setInitialFocus: true,
    doNotLayer: false,
    directionalHint: DirectionalHint.bottomCenter
};

export const enum EmojiPaneMode {
    Quick,
    Partial,
    Full
}

export const enum EmojiPaneNavigateDirection {
    Horizontal,
    Vertical
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
    tooltipClassName?: string;
    searchInputAriaLabel?: string;
    searchPlaceholder?: string;
    onLayoutChanged?: () => void;
    onModeChanged?: (newMode: EmojiPaneMode, previousMode: EmojiPaneMode) => void;
    navBarProps?: Partial<EmojiNavBarProps>;
    statusBarProps?: Partial<EmojiStatusBarProps>;
    emojiIconProps?: Partial<EmojiIconProps>;
    searchDisabled?: boolean;
    hideStatusBar?: boolean;
}

export interface InternalEmojiPaneProps extends EmojiPaneProps {
    onSelect: (emoji: Emoji, wordBeforeCursor: string) => void;
    strings: Strings;
    onLayoutChange?: () => void;
}

export default class EmojiPane extends React.PureComponent<InternalEmojiPaneProps, EmojiPaneState> {
    private static IdCounter = 0;

    private _baseId = EmojiPane.IdCounter++;
    private _searchBox: ITextField;
    private _listId = `EmojiPane${this._baseId}`;
    private _emojiBody: HTMLElement;
    private _input: HTMLInputElement;

    public static defaultProps: EmojiPaneProps = { onLayoutChanged: NullFunction, onModeChanged: NullFunction };

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
        const { onLayoutChanged, onModeChanged } = this.props;
        const { currentEmojiList, mode, currentFamily } = this.state;

        if (mode !== prevState.mode) {
            onModeChanged(mode, prevState.mode);
            onLayoutChanged();
            return;
        }

        const currentEmojisLength = currentEmojiList ? currentEmojiList.length : EmojiList[currentFamily].length;
        const prevEmojisLength = prevState.currentEmojiList ? prevState.currentEmojiList.length : EmojiList[prevState.currentFamily].length;
        if (mode !== EmojiPaneMode.Quick && currentEmojisLength !== prevEmojisLength) {
            onLayoutChanged();
            return;
        }
    }

    public navigate(change: number, direction: EmojiPaneNavigateDirection = EmojiPaneNavigateDirection.Horizontal): number {
        const { index, currentEmojiList } = this.state;
        if (direction === EmojiPaneNavigateDirection.Vertical && index !== -1) {
            change *= EmojisPerRow;
        }

        const newIndex = index + change;
        const length = currentEmojiList.length;
        if (newIndex >= 0 && newIndex < length) {
            this.setState({ index: newIndex });
            return newIndex;
        }

        return -1;
    }

    public getSelecteElementId(index: number): string {
        const { currentEmojiList } = this.state;
        const emoji = currentEmojiList[index];
        if (emoji) {
            return this._getEmojiIconId(emoji);
        }

        return null;
    }

    public getSelectedEmoji(): Emoji {
        const { currentEmojiList, index } = this.state;

        return currentEmojiList[index];
    }

    public showFullPicker(fullSearchText: string): void {
        const normalizedSearchValue = this._normalizeSearchText(fullSearchText, true);
        const newMode = normalizedSearchValue.length === 0 ? EmojiPaneMode.Full : EmojiPaneMode.Partial;
        this.setState({
            index: newMode === EmojiPaneMode.Full ? -1 : 0,
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

    public get listId(): string {
        return this._listId;
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
        const { quickPickerClassName, tooltipClassName, strings } = this.props;
        const selectedEmoji = this.getSelectedEmoji();
        const target = selectedEmoji ? `#${this._getEmojiIconId(selectedEmoji)}` : undefined;
        const content = selectedEmoji ? strings[selectedEmoji.description] : undefined;

        // note: we're using a callout since TooltipHost does not support manual trigger, and we need to show the tooltip since quick picker is shown
        // as an autocomplete menu (false focus based on transferring navigation keyboard event)
        return (
            <div id={this._listId} role="listbox" className={css(Styles.quickPicker, PaneBaseClassName, "quick-picker", quickPickerClassName)}>
                {this._renderCurrentEmojiIcons()}
                <Callout {...TooltipCalloutProps} role="tooltip" target={target} hidden={!content} className={css(Styles.tooltip, tooltipClassName)}>
                    {content}
                </Callout>
            </div>
        );
    }

    private _renderFullPicker(): JSX.Element {
        const { fullPickerClassName, searchDisabled, searchPlaceholder, searchInputAriaLabel } = this.props;
        const emojiId = this._getEmojiIconId(this.getSelectedEmoji());
        const autoCompleteAttributes = {
            [AriaAttributes.AutoComplete]: "list",
            [AriaAttributes.Expanded]: "true",
            [AriaAttributes.HasPopup]: "listbox",
            [AriaAttributes.Owns]: this._listId
        };
        if (emojiId) {
            autoCompleteAttributes[AriaAttributes.ActiveDescendant] = emojiId;
        }

        return (
            <div className={css(PaneBaseClassName, fullPickerClassName)}>
                {!searchDisabled && (
                    <TextField
                        role="combobox"
                        componentRef={this._searchRefCallback}
                        value={this.state.searchInBox}
                        onChanged={this._onSearchChange}
                        inputClassName={Styles.emojiTextInput}
                        onKeyPress={this._onSearchKeyPress}
                        onKeyDown={this._onSearchKeyDown}
                        onFocus={this._onSearchFocus}
                        placeholder={searchPlaceholder}
                        ariaLabel={searchInputAriaLabel}
                        {...autoCompleteAttributes}
                    />
                )}
                {this.state.mode === EmojiPaneMode.Full ? this._renderFullList() : this._renderPartialList()}
            </div>
        );
    }

    private _onSearchFocus = (e: React.FocusEvent<HTMLInputElement>): void => {
        this._input = e.target as HTMLInputElement;
    };

    private _onSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (!e || e.which !== KeyCodes.enter) {
            return;
        }

        const { index, currentEmojiList } = this.state;

        if (index >= 0 && currentEmojiList && currentEmojiList.length > 0) {
            this._onSelect(e, currentEmojiList[index]);
        }
    };

    private _onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
        if (!e || DirectionKeys.indexOf(e.which) < 0) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        const { _emojiBody } = this;
        if (e.which === KeyCodes.home) {
            this.setState({ index: 0 });
            _emojiBody.scrollTop = 0;
            return;
        }
        if (e.which === KeyCodes.end) {
            this.setState({ index: this.state.currentEmojiList.length - 1 });
            _emojiBody.scrollTop = _emojiBody.scrollHeight; // scrollHeight will be larger than max
            return;
        }

        const direction = VerticalDirectionKeys.indexOf(e.which) < 0 ? EmojiPaneNavigateDirection.Horizontal : EmojiPaneNavigateDirection.Vertical;
        const newIndex = this.navigate(e.which === KeyCodes.left || e.which === KeyCodes.up ? -1 : 1, direction);
        if (newIndex > -1) {
            const visibleRowCount = this.state.mode === EmojiPaneMode.Full ? EmojiVisibleRowCount : EmojiVisibleWithoutNavBarRowCount;
            const currentRow = Math.floor(newIndex / EmojisPerRow);
            const visibleTop = _emojiBody.scrollTop;
            const visibleBottom = visibleTop + visibleRowCount * EmojiHeightPx;
            const currentRowTop = currentRow * EmojiHeightPx;
            const currentRowBottom = currentRowTop + EmojiHeightPx;
            if (visibleTop <= currentRowTop && visibleBottom >= currentRowBottom) {
                return; // row is visible, so exit
            }

            _emojiBody.scrollTop = currentRow * EmojiHeightPx;
        }
    };

    private _renderCurrentEmojiIcons(): JSX.Element[] {
        const { strings, emojiIconProps } = this.props;
        const { currentEmojiList } = this.state;

        return currentEmojiList.map((emoji, index) => (
            <EmojiIcon
                strings={strings}
                {...emojiIconProps}
                id={this._getEmojiIconId(emoji)}
                key={emoji.key}
                onMouseOver={() => this.setState({ index })}
                onFocus={() => this.setState({ index })}
                emoji={emoji}
                isSelected={index === this.state.index}
                onClick={e => this._onSelect(e, emoji)}
                aria-posinset={index + 1}
                aria-setsize={currentEmojiList.length}
            />
        ));
    }

    private _getEmojiIconId(emoji: Emoji): string {
        return emoji ? `${this._listId}-${emoji.key}` : undefined;
    }

    private _renderPartialList(): JSX.Element {
        const { partialListClassName, strings, hideStatusBar, statusBarProps } = this.props;
        const { currentEmojiList } = this.state;
        const hasResult = currentEmojiList && currentEmojiList.length > 0;

        return (
            <div>
                <div className={css(Styles.partialList, partialListClassName)} data-is-scrollable={true} tabIndex={TabIndexForFirefoxBug} ref={this._onEmojiBodyRef}>
                    <FocusZone id={this._listId} role="listbox" className={Styles.partialListContent} ref={this._focusZoneRefCallback}>
                        {this._renderCurrentEmojiIcons()}
                    </FocusZone>
                </div>
                {!hideStatusBar && <EmojiStatusBar strings={strings} {...statusBarProps} hasResult={hasResult} emoji={this.getSelectedEmoji()} />}
            </div>
        );
    }

    private _renderFullList(): JSX.Element {
        const { fullListClassName, fullListContentClassName, strings, hideStatusBar, navBarProps, statusBarProps } = this.props;
        const { currentEmojiList } = this.state;
        const hasResult = currentEmojiList && currentEmojiList.length > 0;

        return (
            <div className={css(Styles.fullList, fullListClassName)}>
                <div className={Styles.fullListBody} data-is-scrollable={true} tabIndex={TabIndexForFirefoxBug} ref={this._onEmojiBodyRef}>
                    <EmojiNavBar strings={strings} {...navBarProps} onClick={this._pivotClick} currentSelected={this.state.currentFamily} getTabId={this._getTabId} />
                    <div className={Styles.fullListContentContainer} role="tabpanel" aria-labelledby={this._getTabId(this.state.currentFamily)}>
                        <div>
                            <FocusZone id={this._listId} role="listbox" className={css(Styles.fullListContent, fullListContentClassName)} ref={this._focusZoneRefCallback}>
                                {this._renderCurrentEmojiIcons()}
                            </FocusZone>
                        </div>
                    </div>
                </div>

                {!hideStatusBar && <EmojiStatusBar strings={strings} {...statusBarProps} hasResult={hasResult} emoji={this.getSelectedEmoji()} />}
            </div>
        );
    }

    private _onEmojiBodyRef = (ref: HTMLDivElement) => {
        this._emojiBody = ref;
    };

    private _pivotClick = (selected: string): void => {
        const currentFamily = selected as EmojiFamilyKeys;

        this.setState({ currentEmojiList: EmojiList[currentFamily], currentFamily });
    };

    private _getTabId = (itemKey: EmojiFamilyKeys): string => {
        return `family_${itemKey}_${this._baseId}`;
    };

    private _searchRefCallback = (ref: ITextField): void => {
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

        if (this._input) {
            // make sure to announce the active descending after the focus zone containing the emojis is ready
            this._input.removeAttribute(AriaAttributes.ActiveDescendant);
            const emojiId = this._getEmojiIconId(this.getSelectedEmoji());
            // we need to delay so NVDA will announce the first selection
            emojiId && setTimeout(() => this._input.setAttribute(AriaAttributes.ActiveDescendant, emojiId), 0);
        }
    };

    private _onSearchChange = (newValue: string): void => {
        const normalizedSearchValue = this._normalizeSearchText(newValue, false);
        const newMode = normalizedSearchValue.length === 0 ? EmojiPaneMode.Full : EmojiPaneMode.Partial;
        this.setState({
            index: newMode === EmojiPaneMode.Full ? -1 : 0,
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
