import { FocusZone } from 'office-ui-fabric-react/lib/FocusZone';
import { Pivot, PivotItem, PivotLinkFormat, PivotLinkSize, IPivotItemProps } from 'office-ui-fabric-react/lib/Pivot';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import * as React from 'react';
import { browserData } from 'roosterjs-editor-core';
import { css, Strings } from 'roosterjs-react-common';

import Emoji from '../schema/Emoji';
import EmojiList, { commonEmojis, EmojiFabricIconCharacterMap, EmojiFamilyKeys, moreEmoji } from '../utils/emojiList';
import { searchEmojis } from '../utils/searchEmojis';
import * as Styles from './emoji.scss.g';
import EmojiIcon from './EmojiIcon';
import EmojiStatusBar from './EmojiStatusBar';

enum EmojiPaneMode {
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
    onLayoutChange?: () => void;
}

export interface InternalEmojiPaneProps extends EmojiPaneProps {
    onSelect: (emoji: Emoji, wordBeforeCursor: string) => void;
    strings: Strings;
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
            currentEmojiList: commonEmojis,
            currentFamily: EmojiFamilyKeys.People,
            search: ':',
            searchInBox: ''
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
        const prevEmojisLength = prevState.currentEmojiList ? prevState.currentEmojiList.length : EmojiList[prevState.currentFamily].length;
        if (mode !== EmojiPaneMode.Quick && currentEmojisLength !== prevEmojisLength) {
            onLayoutChange();
            return;
        }
    }

    public navigate(change: number): void {
        let newIndex = this.state.index + change;
        let length = this.state.currentEmojiList.length;
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
            return '';
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
        return isQuickMode ? emojiList.slice(0, 5).concat([moreEmoji]) : emojiList;
    }

    private _renderQuickPicker(): JSX.Element {
        const { quickPickerClassName, strings } = this.props;

        return (
            <div className={css(Styles.quickPicker, quickPickerClassName)}>
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
        const { fullPickerClassName } = this.props;

        return (
            <div className={fullPickerClassName}>
                <TextField ref={this._searchRefCallback} value={this.state.searchInBox} onChanged={this._onSearchChange} inputClassName={Styles.emojiTextInput} />
                {this.state.mode === EmojiPaneMode.Full ? this._renderFullList() : this._renderPartialList()}
            </div>
        );
    }

    // For IE, fixed width not accounting for scroll bar glitches and content is overlapped with content.
    // A workaround is to refresh the overflow value.
    private _resizeOnRefForIE =
        browserData.isIE &&
        ((ref: HTMLDivElement): void => {
            if (ref) {
                const prevValue = ref.style.overflowY;
                ref.style.overflowY = 'hidden';
                requestAnimationFrame(() => (ref.style.overflowY = prevValue));
            }
        });

    private _renderPartialList(): JSX.Element {
        const { partialListClassName, strings } = this.props;

        return (
            <div>
                <div className={css(Styles.partialList, partialListClassName)} data-is-scrollable={true} ref={this._resizeOnRefForIE}>
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
                <EmojiStatusBar emoji={this.getSelectedEmoji()} strings={strings} />
            </div>
        );
    }

    private _renderFullList(): JSX.Element {
        const { fullListClassName, fullListContentClassName, strings = {} } = this.props;

        return (
            <div className={css(Styles.fullList, fullListClassName)}>
                <div className={Styles.fullListBody} data-is-scrollable={true} ref={this._resizeOnRefForIE}>
                    <Pivot
                        className={Styles.pivot}
                        linkFormat={PivotLinkFormat.links}
                        linkSize={PivotLinkSize.normal}
                        aria-labelledby={this._getTabId(this.state.currentFamily)}
                        selectedKey={this.state.currentFamily}
                        onLinkClick={this._pivotClick}
                        headersOnly={true}
                        getTabId={this._getTabId}
                    >
                        {Object.keys(EmojiList).map((key, index) => (
                            <PivotItem
                                key={key}
                                itemIcon={EmojiFabricIconCharacterMap[key]}
                                itemKey={key}
                                headerButtonProps={{ title: strings[key] }}
                                onRenderItemLink={this._renderPivotTooltip}
                            />
                        ))}
                    </Pivot>
                    <div className={Styles.fullListContentContainer}>
                        <div>
                            <FocusZone className={css(Styles.fullListContent, fullListContentClassName)}>
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

                <EmojiStatusBar emoji={this.getSelectedEmoji()} strings={strings} />
            </div>
        );
    }

    private _renderPivotTooltip(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element): JSX.Element {
        return (
            <TooltipHost content={link.itemKey} id={link.itemKey} calloutProps={{ gapSpace: 0 }}>
                {defaultRenderer(link)}
            </TooltipHost>
        );
    }

    private _pivotClick = (item: PivotItem): void => {
        const currentFamily = item.props.itemKey as EmojiFamilyKeys;

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

    private _onSelect = (e: React.MouseEvent<EventTarget>, emoji: Emoji): void => {
        e.stopPropagation();
        e.preventDefault();
        this.props.onSelect && this.props.onSelect(emoji, this.state.search);
    };
}
