import { CommandBarButton, IButton } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { registerIcons } from 'office-ui-fabric-react/lib/Styling';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import {
    createEditorViewState,
    EditorViewState,
    EmojiPlugin,
    FocusEventHandler,
    FocusOutShell,
    ImageManager,
    ImageManagerOptions,
    ImageResize,
    LeanRooster,
    LeanRoosterModes,
    PasteImagePlugin,
    RoosterCommandBar,
    RoosterCommandBarPlugin,
    RoosterCommmandBarButtonKeys,
    TableResize,
    UndoWithImagePlugin,
} from 'roosterjs-react';

function createLinkedSvg(name: string): JSX.Element {
    return (
        <svg height="40" width="20">
            <use xlinkHref={`script/sprites/command-bar-sprites.svg#rooster-svg-${name}`} />
        </svg>
    );
}

initializeIcons();
registerIcons({
    icons: {
        "RoosterSvg-Color": createLinkedSvg("color"),
        "RoosterSvg-Bullets": createLinkedSvg("bullets"),
        "RoosterSvg-Link": createLinkedSvg("link"),
        "RoosterSvg-Numbering": createLinkedSvg("numbering"),
        "RoosterSvg-Unlink": createLinkedSvg("unlink"),
        "RoosterSvg-Highlight": createLinkedSvg("highlight"),
        "RoosterSvg-Indent": createLinkedSvg("indent"),
        "RoosterSvg-Outdent": createLinkedSvg("outdent"),
        "RoosterSvg-ClearFormat": createLinkedSvg("clear-format")
    }
});

function createEditor(name: string, onRef?: (ref: LeanRooster, viewState: EditorViewState) => void): JSX.Element {
    let leanRoosterContentDiv: HTMLDivElement;
    const leanRoosterContentDivOnRef = (ref: HTMLDivElement) => (leanRoosterContentDiv = ref);

    let leanRooster: LeanRooster;
    const leanRoosterOnRef = (ref: LeanRooster) => {
        leanRooster = ref;
        if (onRef) {
            onRef(ref, leanRoosterViewState);
        }
    };

    let commandBar: RoosterCommandBar;
    const commandBarOnRef = (ref: RoosterCommandBar) => (commandBar = ref);

    const imageManager = new ImageManager({
        uploadImage: (image: File) =>
            new Promise<string>((resolve, reject) => {
                const timeoutMs = Math.random() * 5000;
                console.log(`Imitating uploading... (${timeoutMs}ms)`);

                const reader = new FileReader();
                reader.onload = (event: ProgressEvent) => {
                    const dataURL: string = (event.target as FileReader).result;
                    window.setTimeout(() => resolve(dataURL), timeoutMs);
                };
                reader.readAsDataURL(image);
            })
    } as ImageManagerOptions);
    const leanRoosterViewState = createEditorViewState(`Hello LeanRooster! (${name})`);
    const commandBarPlugin = new RoosterCommandBarPlugin();
    const imagePlugin = new PasteImagePlugin(imageManager);

    const focusOutShellAllowMouseDown = (element: HTMLElement): boolean => leanRoosterContentDiv && leanRoosterContentDiv.contains(element);
    const focusOutShellOnFocus = (ev: React.FocusEvent<HTMLElement>) => {
        console.log(`FocusOutShell (${name}) gained focus (hasPlaceholder: ${leanRooster.hasPlaceholder()})`);
        commandBarPlugin.registerRoosterCommandBar(commandBar); // re-register command b/c we're changing mode on blur
    };
    const focusOutShellOnBlur = (ev: React.FocusEvent<HTMLElement>) => {
        console.log(`FocusOutShell (${name}) lost focus (hasPlaceholder: ${leanRooster.hasPlaceholder()})`);
        leanRooster.mode = LeanRoosterModes.View;
    };
    let emojiPlugin: EmojiPlugin = null;
    let cmdButton: IButton;

    return (
        <FocusOutShell
            allowMouseDown={focusOutShellAllowMouseDown}
            onBlur={focusOutShellOnBlur}
            onFocus={focusOutShellOnFocus}
            onRenderContent={(calloutClassName: string, calloutOnDismiss: FocusEventHandler) => {
                emojiPlugin = emojiPlugin || new EmojiPlugin(null, calloutClassName, calloutOnDismiss);
                return [
                    <LeanRooster
                        key="rooster"
                        viewState={leanRoosterViewState}
                        placeholder={`${name} placeholder`}
                        plugins={[commandBarPlugin, imagePlugin, emojiPlugin, new ImageResize(), new TableResize()]}
                        undo={new UndoWithImagePlugin(imageManager)}
                        ref={leanRoosterOnRef}
                        contentDivRef={leanRoosterContentDivOnRef}
                    />,
                    <RoosterCommandBar
                        key="cmd"
                        className="lean-cmdbar"
                        buttonOverrides={[
                            {
                                key: RoosterCommmandBarButtonKeys.FontColor,
                                onRender: (item: IContextualMenuItem) => (
                                    <TooltipHost content={item.name}>
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
                                            onRenderIcon={() => createLinkedSvg("color")}
                                        />
                                    </TooltipHost>
                                )
                            },
                            { key: RoosterCommmandBarButtonKeys.BulletedList, iconProps: { iconName: "RoosterSvg-Bullets" } },
                            { key: RoosterCommmandBarButtonKeys.NumberedList, iconProps: { iconName: "RoosterSvg-Numbering" } },
                            { key: RoosterCommmandBarButtonKeys.Highlight, iconProps: { iconName: "RoosterSvg-Highlight" } },
                            { key: RoosterCommmandBarButtonKeys.Indent, iconProps: { iconName: "RoosterSvg-Indent" } },
                            { key: RoosterCommmandBarButtonKeys.Outdent, iconProps: { iconName: "RoosterSvg-Outdent" } },
                            { key: RoosterCommmandBarButtonKeys.Link, iconProps: { iconName: "RoosterSvg-Link" } },
                            { key: RoosterCommmandBarButtonKeys.Unlink, iconProps: { iconName: "RoosterSvg-Unlink" }, exclude: true },
                            { key: RoosterCommmandBarButtonKeys.ClearFormat, iconProps: { iconName: "RoosterSvg-ClearFormat" } },
                            { key: RoosterCommmandBarButtonKeys.Strikethrough, exclude: true },
                            {
                                key: "vacation",
                                name: "Vacation",
                                iconProps: { className: "ms-Icon ms-Icon--Vacation" },
                                handleChange: () => alert("Hello"),
                                order: 0
                            }
                        ]}
                        roosterCommandBarPlugin={commandBarPlugin}
                        emojiPlugin={emojiPlugin}
                        calloutClassName={calloutClassName}
                        calloutOnDismiss={calloutOnDismiss}
                        imageManager={imageManager}
                        ref={commandBarOnRef}
                    />
                ];
            }}
        />
    );
}

const view = (
    <div className="root-container">
        <div className="editor-container">
            {createEditor("editor #1")}
            {createEditor("editor #2")}
        </div>
    </div>
);

ReactDom.render(view, document.getElementById("container"), null);
