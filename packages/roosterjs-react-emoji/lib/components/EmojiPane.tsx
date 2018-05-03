import * as React from 'react';
import * as Styles from './emoji.scss.g';
import Emoji from '../schema/Emoji';
import EmojiIcon from './EmojiIcon';
import emojiList, { EmojiFamily, commonEmojis, moreEmoji } from '../utils/emojiList';
import { Strings } from '../strings/emojiStrings';
import { searchEmojis } from '../utils/searchEmojis';
import { FocusZone } from 'office-ui-fabric-react/lib/FocusZone';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

export interface EmojiPaneState {
    index: number;
    isFullPicker: boolean;
    emojis: Emoji[];
    currentFamily: EmojiFamily;
    search: string;
    searchInBox: string;
}

export interface EmojiPaneProps {
    onSelect: (emoji: Emoji, wordBeforeCursor: string) => void;
    strings: Strings;
}

export default class EmojiPane extends React.Component<EmojiPaneProps, EmojiPaneState> {
    private searchBox: TextField;

    constructor(props: EmojiPaneProps) {
        super(props);
        this.state = {
            index: 0,
            isFullPicker: false,
            emojis: commonEmojis,
            currentFamily: 'People',
            search: ':',
            searchInBox: '',
        };
    }

    render() {
        return this.state.isFullPicker ? this.renderFullPicker() : this.renderQuickPicker();
    }

    navigate(change: number) {
        let newIndex = this.state.index + change;
        let length = this.state.emojis.length;
        if (newIndex >= 0 && newIndex < length) {
            this.setState({ index: newIndex });
        }
    }

    getSelectedEmoji(): Emoji {
        return this.state.emojis[this.state.index];
    }

    showFullPicker(search: string) {
        let searchInBox = search.substr(1);
        this.setState({
            index: 0,
            isFullPicker: true,
            emojis: search ? this.getSearchResult(searchInBox, true) : null,
            search: search,
            searchInBox: searchInBox,
        });
    }

    setSearch(search: string) {
        this.setState({
            index: 0,
            emojis: this.getSearchResult(search, this.state.isFullPicker),
            search: search,
        });
    }

    private getSearchResult(search: string, isFullPicker: boolean): Emoji[] {
        if (!search) {
            return isFullPicker ? null : this.state.emojis;
        }

        let emojis = searchEmojis(search, this.props.strings);
        return isFullPicker ? emojis : emojis.slice(0, 5).concat([moreEmoji]);
    }

    private renderQuickPicker() {
        return (
            <div>
                {this.state.emojis.map((emoji, index) => (
                    <EmojiIcon
                        key={emoji.key}
                        strings={this.props.strings}
                        emoji={emoji}
                        isSelected={index == this.state.index}
                        onClick={e => this.onSelect(e, emoji)}
                    />
                ))}
            </div>
        );
    }

    private renderFullPicker() {
        return (
            <div>
                <div>
                    <TextField ref={this.searchRefCallback} value={this.state.searchInBox} onChanged={this.onSearchChange} />
                </div>
                <FocusZone className={Styles.emojiPane}>
                    {this.state.emojis
                        ? this.state.emojis.map((emoji, index) => (
                            <EmojiIcon
                                key={emoji.key}
                                strings={this.props.strings}
                                emoji={emoji}
                                isSelected={false}
                                onClick={e => this.onSelect(e, emoji)}
                            />
                        ))
                        : this.renderFullList()}
                </FocusZone>
            </div>
        );
    }

    private renderFullList(): JSX.Element {
        return (
            <FocusZone>
                <div className={Styles.header}>
                    {Object.keys(emojiList).map((key, index) => (
                        <EmojiIcon
                            key={key}
                            strings={this.props.strings}
                            emoji={emojiList[key][0]}
                            isSelected={this.state.currentFamily == key}
                            onClick={() => this.setState({ currentFamily: key as EmojiFamily })}
                        />
                    ))}
                </div>
                <div>
                    {emojiList[this.state.currentFamily].map((emoji: Emoji) => (
                        <EmojiIcon
                            key={emoji.key}
                            strings={this.props.strings}
                            emoji={emoji}
                            isSelected={false}
                            onClick={e => this.onSelect(e, emoji)}
                        />
                    ))}
                </div>
            </FocusZone>
        );
    }

    private searchRefCallback = (ref: TextField) => {
        this.searchBox = ref;
        if (this.searchBox) {
            this.searchBox.focus();
            this.searchBox.setSelectionStart(this.searchBox.value.length);
        }
    };

    private onSearchChange = (newValue: string) => {
        this.setState({
            index: 0,
            emojis: this.getSearchResult(newValue, this.state.isFullPicker),
            searchInBox: newValue,
        });
    };

    private onSelect = (e: React.MouseEvent<EventTarget>, emoji: Emoji) => {
        e.stopPropagation();
        e.preventDefault();
        this.props.onSelect && this.props.onSelect(emoji, this.state.search);
    };
}
