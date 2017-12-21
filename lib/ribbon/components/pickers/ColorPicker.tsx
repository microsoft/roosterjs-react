import * as React from 'react';
import {
    ContextualMenu,
    DirectionalHint,
    IContextualMenuItem,
} from 'office-ui-fabric-react/lib/ContextualMenu';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
import { FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import * as Styles from './Picker.scss.g';

export interface ColorPickerItem {
    name: string;
    title: string;
    code: string;
    borderColor?: string;
}

export const textColors = [
    { name: 'colorLightBlue', title: 'Light blue', code: '#51a7f9' },
    { name: 'colorLightGreen', title: 'Light green', code: '#6fc040' },
    { name: 'colorLightYellow', title: 'Light yellow', code: '#f5d427' },
    { name: 'colorLightOrange', title: 'Light orange', code: '#f3901d' },
    { name: 'colorLightRed', title: 'Light red', code: '#ed5c57' },
    { name: 'colorLightPurple', title: 'Light purple', code: '#b36ae2' },
    { name: 'colorBlue', title: 'Blue', code: '#0c64c0' },
    { name: 'colorGreen', title: 'Green', code: '#0c882a' },
    { name: 'colorYellow', title: 'Yellow', code: '#dcbe22' },
    { name: 'colorOrange', title: 'Orange', code: '#de6a19' },
    { name: 'colorRed', title: 'Red', code: '#c82613' },
    { name: 'colorPurple', title: 'Purple', code: '#763e9b' },
    { name: 'colorDarkBlue', title: 'Dark blue', code: '#174e86' },
    { name: 'colorDarkGreen', title: 'Dark green', code: '#0f5c1a' },
    { name: 'colorDarkYellow', title: 'Dark yellow', code: '#c3971d' },
    { name: 'colorDarkOrange', title: 'Dark orange', code: '#be5b17' },
    { name: 'colorDarkRed', title: 'Dark red', code: '#861106' },
    { name: 'colorDarkPurple', title: 'Dark purple', code: '#5e327c' },
    { name: 'colorDarkerBlue', title: 'Darker blue', code: '#002451' },
    { name: 'colorDarkerGreen', title: 'Darker green', code: '#06400c' },
    { name: 'colorDarkerYellow', title: 'Darker yellow', code: '#a37519' },
    { name: 'colorDarkerOrange', title: 'Darker orange', code: '#934511' },
    { name: 'colorDarkerRed', title: 'Darker red', code: '#570606' },
    { name: 'colorDarkerPurple', title: 'Darker purple', code: '#3b204d' },
    { name: 'colorWhite', title: 'White', code: '#ffffff', borderColor: '#bebebe' },
    { name: 'colorLightGray', title: 'Light gray', code: '#cccccc' },
    { name: 'colorGray', title: 'Gray', code: '#999999' },
    { name: 'colorDarkGray', title: 'Dark gray', code: '#666666' },
    { name: 'colorDarkerGray', title: 'Darker gray', code: '#333333' },
    { name: 'colorBlack', title: 'Black', code: '#000000' },
] as ColorPickerItem[];

export const blackColors = [
    { name: 'colorCyan', title: 'Cyan', code: '#00ffff' },
    { name: 'colorGreen', title: 'Green', code: '#00ff00' },
    { name: 'colorYellow', title: 'Yellow', code: '#ffff00' },
    { name: 'colorOrange', title: 'Orange', code: '#ff8000' },
    { name: 'colorRed', title: 'Red', code: '#ff0000' },
    { name: 'colorMagenta', title: 'Magenta', code: '#ff00ff' },
    { name: 'colorLightCyan', title: 'Light cyna', code: '#80ffff' },
    { name: 'colorLightGreen', title: 'Light green', code: '#80ff80' },
    { name: 'colorLightYellow', title: 'Light yellow', code: '#ffff80' },
    { name: 'colorLightOrange', title: 'Light orange', code: '#ffc080' },
    { name: 'colorLightRed', title: 'Light red', code: '#ff8080' },
    { name: 'colorLightMagenta', title: 'Light magenta', code: '#ff80ff' },
    { name: 'colorWhite', title: 'White', code: '#ffffff', borderColor: '#bebebe' },
    { name: 'colorLightGray', title: 'Light gray', code: '#cccccc' },
    { name: 'colorGray', title: 'Gray', code: '#999999' },
    { name: 'colorDarkGray', title: 'Dark gray', code: '#666666' },
    { name: 'colorDarkerGray', title: 'Darker gray', code: '#333333' },
    { name: 'colorBlack', title: 'Black', code: '#000000' },
] as ColorPickerItem[];

export interface ColorPickerProps {
    menuTargetElement: HTMLElement;
    colors: ColorPickerItem[];
    onDismissMenu: () => void;
    onSelectColor: (value: ColorPickerItem) => void;
    stringMap?: {[name: string]: string};
}

export default class ColorPicker extends React.Component<ColorPickerProps, {}> {
    private renderColorMenuItem = (item: IContextualMenuItem): JSX.Element => {
        let color = item.data as ColorPickerItem;
        let inlineStyles: React.CSSProperties = { backgroundColor: color.code };
        let title = (this.props.stringMap && this.props.stringMap[color.name]) || color.title;
        if (color.borderColor) {
            inlineStyles.borderColor = color.borderColor;
        }

        return (
            <Button
                buttonType={ButtonType.normal}
                data-is-focusable={true}
                title={title}
                onClick={() => this.onSelectColor(color)}
                key={item.key}>
                <div className={Styles.ribbonColor} style={inlineStyles} />
            </Button>
        );
    };

    private onSelectColor = (color: ColorPickerItem) => {
        this.props.onDismissMenu();
        this.props.onSelectColor(color);
    };

    render() {
        let { onDismissMenu, menuTargetElement } = this.props;
        let pickerStyle = Styles.ribbonColorPicker;
        return (
            <ContextualMenu
                className={pickerStyle}
                target={menuTargetElement}
                directionalHint={DirectionalHint.bottomLeftEdge}
                onDismiss={onDismissMenu}
                arrowDirection={FocusZoneDirection.bidirectional}
                shouldFocusOnMount={true}
                items={this.props.colors.map((color: ColorPickerItem) => {
                    return {
                        key: color.name,
                        name: color.name,
                        onRender: this.renderColorMenuItem,
                        data: color,
                        className: Styles.ribbonColorItem,
                    };
                })}
            />
        );
    }
}
