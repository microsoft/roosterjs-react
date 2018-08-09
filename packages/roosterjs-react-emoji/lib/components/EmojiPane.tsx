import { FocusZone } from 'office-ui-fabric-react/lib/FocusZone';
import { Pivot, PivotItem, PivotLinkFormat, PivotLinkSize } from 'office-ui-fabric-react/lib/Pivot';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import * as React from 'react';
import { browserData } from 'roosterjs-editor-core';
import { css, Strings } from 'roosterjs-react-common';

import Emoji from '../schema/Emoji';
import EmojiList, { CommonEmojis, EmojiFabricIconCharacterMap, EmojiFamilyKeys, MoreEmoji } from '../utils/emojiList';
import { searchEmojis } from '../utils/searchEmojis';
import * as Styles from './emoji.scss.g';
import EmojiIcon from './EmojiIcon';

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
    onLayoutChange?: () => void;
    searchDisabled?: boolean;
}

export interface InternalEmojiPaneProps extends EmojiPaneProps {
    onSelect: (emoji: Emoji, wordBeforeCursor: string) => void;
    strings: Strings;
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
            search: ':',
            searchInBox: ''
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
        let searchInBox = search == null ? '' : search.substr(1);
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

    private renderQuickPicker(): JSX.Element {
        const { quickPickerClassName, strings } = this.props;

        return (
            <div className={css(Styles.quickPicker, quickPickerClassName)}>
                {this.state.emojis.map((emoji, index) => (
                    <EmojiIcon key={emoji.key} strings={strings} emoji={emoji} isSelected={index === this.state.index} onClick={e => this.onSelect(e, emoji)} />
                ))}
            </div>
        );
    }

    private renderFullPicker(): JSX.Element {
        const { fullPickerClassName, searchDisabled } = this.props;

        return (
            <div className={fullPickerClassName}>
                {!searchDisabled && <TextField ref={this.searchRefCallback} value={this.state.searchInBox} onChanged={this.onSearchChange} inputClassName={Styles.emojiTextInput} />}
                {this.state.emojis ? this.renderPartialList() : this.renderFullList()}
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

    private renderPartialList(): JSX.Element {
        const { partialListClassName, strings } = this.props;

        return (
            <div className={css(Styles.partialList, partialListClassName)} data-is-scrollable={true} ref={this._resizeOnRefForIE}>
                <FocusZone className={Styles.partialListContent}>
                    {this.state.emojis.map(emoji => <EmojiIcon key={emoji.key} strings={strings} emoji={emoji} isSelected={false} onClick={e => this.onSelect(e, emoji)} />)}
                </FocusZone>
            </div>
        );
    }

    private renderFullList(): JSX.Element {
        const { fullListClassName, fullListContentClassName, strings } = this.props;

        return (
            <div className={css(Styles.fullList, fullListClassName)}>
                <div className={Styles.fullListBody} data-is-scrollable={true} ref={this._resizeOnRefForIE}>
                    <Pivot
                        className={Styles.pivot}
                        linkFormat={PivotLinkFormat.links}
                        linkSize={PivotLinkSize.normal}
                        aria-labelledby={this.getTabId(this.state.currentFamily)}
                        selectedKey={this.state.currentFamily}
                        onLinkClick={this.pivotClick}
                        headersOnly={true}
                        getTabId={this.getTabId}
                    >
                        {Object.keys(EmojiList).map((key, index) => (
                            <PivotItem key={key} itemIcon={EmojiFabricIconCharacterMap[key]} itemKey={key} headerButtonProps={{ title: strings[key] }} />
                        ))}
                    </Pivot>
                    <div className={Styles.fullListContentContainer}>
                        <div>
                            <FocusZone className={css(Styles.fullListContent, fullListContentClassName)} ref={this.focusZoneRefCallback}>
                                {EmojiList[this.state.currentFamily].map((emoji: Emoji) => (
                                    <EmojiIcon key={emoji.key} strings={strings} emoji={emoji} isSelected={false} onClick={e => this.onSelect(e, emoji)} />
                                ))}
                            </FocusZone>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private pivotClick = (item: PivotItem): void => {
        const currentFamily = item.props.itemKey as EmojiFamilyKeys;

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
