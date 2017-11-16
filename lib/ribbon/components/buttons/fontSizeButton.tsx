import * as React from 'react';
import {
    ContextualMenu,
    DirectionalHint,
    IContextualMenuItem,
} from 'office-ui-fabric-react/lib/components/ContextualMenu';
import { setFontSize } from 'roosterjs-editor-api';
import RibbonButton from '../../schema/RibbonButton';

require('./fontSizeButton.scss');
const FONTSIZE_SVG = require('../../icons/fontsize.svg');
const FONTSIZE_REGEX = /(\d+)pt/i;

// This list is used to populate font size picker drop down
const FONT_SIZE_LIST: string[] = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '26', '28', '36', '48', '72'];

export const fontSizeButton: RibbonButton = {
    title: 'Font size',
    imageUrl: FONTSIZE_SVG,
    dropdown: (target, editor, dismiss, stringFormat, format) =>
        <FontSizePicker
            menuTargetElement={target}
            onDismissMenu={dismiss}
            onSelectSize={fontSize => setFontSize(editor, fontSize + 'pt')}
            selectedSize={format.fontSize}
        />,
};

interface FontSizePickerProps {
    menuTargetElement: HTMLElement;
    onDismissMenu: () => void;
    onSelectSize: (size: string) => void;
    selectedSize?: string;
}

class FontSizePicker extends React.Component<FontSizePickerProps, {}> {
    private createMenuItems(selectedSize: string): IContextualMenuItem[] {
        return FONT_SIZE_LIST.map(size => {
            return {
                key: size,
                name: size,
                data: size,
                checked: selectedSize == size,
                canCheck: true,
                onClick: () => {
                    this.props.onDismissMenu();
                    this.props.onSelectSize(size);
                }
            };
        });
    }

    render() {
        let { onDismissMenu, menuTargetElement, selectedSize } = this.props;
        let matches = (selectedSize || '').match(FONTSIZE_REGEX);
        selectedSize = matches && matches.length == 2 ? matches[1] : selectedSize;
        return (
            <ContextualMenu
                className={'roosterRibbonFontSizePicker customScrollBar'}
                shouldFocusOnMount={true}
                target={menuTargetElement}
                directionalHint={DirectionalHint.bottomLeftEdge}
                onDismiss={onDismissMenu}
                items={this.createMenuItems(selectedSize)}
            />
        );
    }
}
