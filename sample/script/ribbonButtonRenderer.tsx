import * as React from 'react';
import { Image } from 'office-ui-fabric-react/lib/Image';

const BOLD_SVG = require('./icons/bold.svg');
const ITALIC_SVG = require('./icons/italic.svg');
const UNDERLINE_SVG = require('./icons/underline.svg');
const BULLETS_SVG = require('./icons/bullets.svg');
const BULLETS_RTL_SVG = require('./icons/bullets-rtl.svg');
const NUMBERING_SVG = require('./icons/numbering.svg');
const NUMBERING_RTL_SVG = require('./icons/numbering-rtl.svg');
const OUTDENT_SVG = require('./icons/outdent.svg');
const OUTDENT_RTL_SVG = require('./icons/outdent-rtl.svg');
const INDENT_SVG = require('./icons/indent.svg');
const INDENT_RTL_SVG = require('./icons/indent-rtl.svg');
const BLOCKQUOTE_SVG = require('./icons/blockquote.svg');
const ALIGNLEFT_SVG = require('./icons/alignleft.svg');
const ALIGNCENTER_SVG = require('./icons/aligncenter.svg');
const ALIGNRIGHT_SVG = require('./icons/alignright.svg');
const UNLINK_SVG = require('./icons/unlink.svg');
const SUPERSCRIPT_SVG = require('./icons/superscript.svg');
const SUBSCRIPT_SVG = require('./icons/subscript.svg');
const STRIKETHROUGH_SVG = require('./icons/strikethrough.svg');
const LTR_SVG = require('./icons/ltr.svg');
const RTL_SVG = require('./icons/rtl.svg');
const UNDO_SVG = require('./icons/undo.svg');
const REDO_SVG = require('./icons/redo.svg');
const REMOVEFORMAT_SVG = require('./icons/removeformat.svg');
const DROPDOWN_SVG = require('./icons/dropdown.svg');
const BACKCOLOR_SVG = require('./icons/backcolor.svg');
const TEXTCOLOR_SVG = require('./icons/textcolor.svg');
const CREATELINK_SVG = require('./icons/createlink.svg');
const IMAGE_ALT_TEXT_SVG = require('./icons/imagealttext.svg');
const FONTSIZE_SVG = require('./icons/fontsize.svg');
const FONTNAME_SVG = require('./icons/fontname.svg');

let buttonImages: {[key: string]: string} = {};
buttonImages['bold'] = BOLD_SVG;
buttonImages['italic'] = ITALIC_SVG;
buttonImages['underline'] = UNDERLINE_SVG;
buttonImages['bullet'] = BULLETS_SVG;
buttonImages['number'] = NUMBERING_SVG;
buttonImages['indent'] = INDENT_SVG;
buttonImages['outdent'] = OUTDENT_SVG;
buttonImages['quote'] = BLOCKQUOTE_SVG;
buttonImages['left'] = ALIGNLEFT_SVG;
buttonImages['center'] = ALIGNCENTER_SVG;
buttonImages['right'] = ALIGNRIGHT_SVG;
buttonImages['unlink'] = UNLINK_SVG;
buttonImages['sub'] = SUBSCRIPT_SVG;
buttonImages['super'] = SUPERSCRIPT_SVG;
buttonImages['strike'] = STRIKETHROUGH_SVG;
buttonImages['ltr'] = LTR_SVG;
buttonImages['rtl'] = RTL_SVG;
buttonImages['undo'] = UNDO_SVG;
buttonImages['redo'] = REDO_SVG;
buttonImages['unformat'] = REMOVEFORMAT_SVG;
buttonImages['bkcolor'] = BACKCOLOR_SVG;
buttonImages['color'] = TEXTCOLOR_SVG;
buttonImages['link'] = CREATELINK_SVG;
buttonImages['font'] = FONTNAME_SVG;
buttonImages['size'] = FONTSIZE_SVG;
buttonImages['alttext'] = IMAGE_ALT_TEXT_SVG;
buttonImages['more'] = DROPDOWN_SVG;

buttonImages['bold-rtl'] = BOLD_SVG;
buttonImages['italic-rtl'] = ITALIC_SVG;
buttonImages['underline-rtl'] = UNDERLINE_SVG;
buttonImages['bullet-rtl'] = BULLETS_RTL_SVG;
buttonImages['number-rtl'] = NUMBERING_RTL_SVG;
buttonImages['indent-rtl'] = INDENT_RTL_SVG;
buttonImages['outdent-rtl'] = OUTDENT_RTL_SVG;
buttonImages['quote-rtl'] = BLOCKQUOTE_SVG;
buttonImages['left-rtl'] = ALIGNLEFT_SVG;
buttonImages['center-rtl'] = ALIGNCENTER_SVG;
buttonImages['right-rtl'] = ALIGNRIGHT_SVG;
buttonImages['unlink-rtl'] = UNLINK_SVG;
buttonImages['sub-rtl'] = SUBSCRIPT_SVG;
buttonImages['super-rtl'] = SUPERSCRIPT_SVG;
buttonImages['strike-rtl'] = STRIKETHROUGH_SVG;
buttonImages['ltr-rtl'] = LTR_SVG;
buttonImages['rtl-rtl'] = RTL_SVG;
buttonImages['undo-rtl'] = UNDO_SVG;
buttonImages['redo-rtl'] = REDO_SVG;
buttonImages['unformat-rtl'] = REMOVEFORMAT_SVG;
buttonImages['bkcolor-rtl'] = BACKCOLOR_SVG;
buttonImages['color-rtl'] = TEXTCOLOR_SVG;
buttonImages['link-rtl'] = CREATELINK_SVG;
buttonImages['font-rtl'] = FONTNAME_SVG;
buttonImages['size-rtl'] = FONTSIZE_SVG;
buttonImages['alttext-rtl'] = IMAGE_ALT_TEXT_SVG;
buttonImages['more-rtl'] = DROPDOWN_SVG;

export default function ribbonButtonRenderer(buttonName: string, isRtl: boolean): JSX.Element {
    let image = buttonImages[isRtl ? buttonName + '-rtl' : buttonName];
    return <Image
        className={'roosterRibbonButtonImage'}
        style={{width: '32px'}}
        shouldFadeIn={false}
        src={image}
    />
}