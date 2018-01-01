import RibbonPluginInterface from './RibbonPluginInterface';
import RibbonButton from './RibbonButton';
import { Strings } from '../strings/ribbonButtonStrings';

interface RibbonProps {
    /**
     * Ribbon Plugin
     */
    ribbonPlugin: RibbonPluginInterface;

    /**
     * A customized renderer function.
     * Default behavior is to render the button name
     */
    buttonRenderer?: (buttonName: string, isRtl: boolean) => JSX.Element;

    /**
     * Minimum count of button to shown in ribbon.
     * Default value is 8
     */
    minVisibleButtonCount?: number;

    /**
     * Button names
     */
    buttonNames?: string[];

    /**
     * Additional buttons
     */
    additionalButtons?: { [key: string]: RibbonButton };

    /**
     * Whether current UI is RightToLeft
     */
    isRtl?: boolean;

    /**
     * Localized string set
     */
    strings?: Strings;

    /**
     * CSS class name to apply to the outer div
     */
    className?: string;
}

export default RibbonProps;
