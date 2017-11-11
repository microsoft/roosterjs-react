import RibbonPluginInterface from './RibbonPluginInterface';
import RibbonButton from './RibbonButton';

interface RibbonProps {
    /**
     * Ribbon Plugin
     */
    ribbonPlugin: RibbonPluginInterface;

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
     * A map of localized strings
     */
    stringMap?: { [key: string]: string };

    /**
     * CSS class name to apply to the outer div
     */
    className?: string;
}

export default RibbonProps;
