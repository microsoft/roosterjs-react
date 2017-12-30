import RibbonButton from '../../ribbon/schema/RibbonButton';
import EmojiPlugin from '../plugins/EmojiPlugin';

export default function createEmojiButton(emojiPlugin: EmojiPlugin): RibbonButton {
    return {
        name: 'btnEmoji',
        onClick: (editor) => {
            emojiPlugin.setIsSuggesting(true);
            editor.insertContent(':');
        }
    };
}
