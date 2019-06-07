import { CommandBarButton, IButton, IButtonProps } from "office-ui-fabric-react/lib/Button";
import { DirectionalHint } from "office-ui-fabric-react/lib/ContextualMenu";
import { Icon } from "office-ui-fabric-react/lib/Icon";
import { TooltipHost } from "office-ui-fabric-react/lib/Tooltip";
import { IRenderFunction } from "office-ui-fabric-react/lib/Utilities";
import * as React from "react";
import { css } from "roosterjs-react-common";

import { RoosterCommandBarButton } from "../schema/RoosterCommandBarSchema";

export interface IconOnRenderDelegateOptions {
    customCacheKey?: string;
    highContrastAssetName?: string;
    assets?: { name: string; className?: string }[];
    tooltipDirectionHint?: DirectionalHint;
}

export type ButtonOnRenderDelegate = (item: RoosterCommandBarButton) => JSX.Element;
const OnRenderDelegateCache: { [key: string]: ButtonOnRenderDelegate } = {};

export function getIconOnRenderDelegate(highContrastAssetName: string = null, ...assets: { name: string; className?: string }[]): ButtonOnRenderDelegate {
    return getIconButtonOnRenderDelegate({ highContrastAssetName, assets });
}

export function getIconOnRenderDelegateWithCustomCacheKey(
    customCacheKey: string,
    highContrastAssetName: string = null,
    ...assets: { name: string; className?: string }[]
): ButtonOnRenderDelegate {
    return getIconButtonOnRenderDelegate({ customCacheKey, highContrastAssetName, assets });
}

export function getIconButtonOnRenderDelegate(options?: IconOnRenderDelegateOptions): ButtonOnRenderDelegate {
    const { customCacheKey, assets, highContrastAssetName, tooltipDirectionHint } = options || ({} as IconOnRenderDelegateOptions);
    const cacheKey = customCacheKey != null ? customCacheKey : assets ? assets.map(a => a.name).join(".") : "";
    if (!OnRenderDelegateCache[cacheKey]) {
        const iconClassName = "stacked-icon";
        let onRenderIcon: IRenderFunction<IButtonProps> = undefined;
        if (assets && assets.length > 1) {
            onRenderIcon = () => (
                <div className="stacked-icon-container">
                    {assets.map((asset, i) => (
                        <Icon key={i} iconName={asset.name} className={css(iconClassName, asset.className || `${iconClassName}-${asset.name}`)} />
                    ))}
                    {highContrastAssetName && <Icon iconName={highContrastAssetName} className={css(iconClassName, "high-contrast-icon")} />}
                </div>
            );
        }

        let cmdButton: IButton = null;
        OnRenderDelegateCache[cacheKey] = (item: RoosterCommandBarButton): JSX.Element => (
            <TooltipHost hostClassName="command-button-tool-tip" content={item.name} key={item.key} directionalHint={tooltipDirectionHint}>
                <CommandBarButton
                    componentRef={ref => (cmdButton = ref)}
                    {...item as any}
                    ariaLabel={item.name}
                    menuProps={
                        item.subMenuProps && {
                            ...item.subMenuProps,
                            onDismiss: ev => {
                                item.subMenuProps.onDismiss(ev);
                                cmdButton.dismissMenu();
                            }
                        }
                    }
                    className={css("rooster-command-bar-button", item.buttonClassName)}
                    onRenderIcon={onRenderIcon}
                />
            </TooltipHost>
        );
    }

    return OnRenderDelegateCache[cacheKey];
}
