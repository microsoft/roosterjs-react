import Emoji from '../schema/Emoji';
import { forEachEmoji } from './emojiList';
import { Strings, getString } from '../../strings/strings';

export function searchEmojis(search: string, strings: Strings): Emoji[] {
    search = search.toLowerCase();
    let shortcutMatch = matchShortcut(search);
    let fullMatch: Emoji[] = shortcutMatch ? [shortcutMatch] : [];
    let partialMatch: Emoji[] = [];
    let partialSearch = ' ' + (search[0] == ':' ? search.substr(1) : search);
    forEachEmoji(emoji => {
        let keywords = emoji.keywords ? ' ' + getString(emoji.keywords, strings).toLowerCase() + ' ' : '';
        let index = (keywords).indexOf(partialSearch);
        if (index >= 0) {
            (keywords[index + partialSearch.length] == ' ' ? fullMatch : partialMatch).push(emoji);
        }
        return true;
    });

    return fullMatch.concat(partialMatch);
}

export function matchShortcut(search: string): Emoji {
    let result: Emoji;
    search = ' ' + search + ' ';
    forEachEmoji((emoji: Emoji) => {
        if (emoji.shortcut && (' ' + emoji.shortcut + ' ').indexOf(search) >= 0) {
            result = emoji;
            return false;
        }
        return true;
    });
    return result;
}