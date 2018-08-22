import * as React from "react";
import * as ReactDom from "react-dom";
import { PluginEvent, PluginEventType } from "roosterjs-editor-types";
import {
    ContentChangedPlugin,
    createEditorViewState,
    DoubleClickImagePlugin,
    EmojiPlugin,
    EmojiPluginOptions,
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
    RoosterCommmandBarButtonKeys as ButtonKeys,
    RoosterShortcutCommands,
    TableResize,
    UndoWithImagePlugin,
    EmojiPaneProps
} from "roosterjs-react";
import { EmojiDescriptionStrings, EmojiKeywordStrings, EmojiFamilyStrings } from "roosterjs-react-emoji-resources";

import { initializeIcons } from "../fabric/src";

initializeIcons();

class ContentChangedLoggerPlugin extends ContentChangedPlugin {
    constructor() {
        super(_ => console.log("Content changed"));
    }

    public onPluginEvent(event: PluginEvent): void {
        if (event && event.eventType === PluginEventType.ContentChanged) {
            console.log(`Content changed from ${(event as any).source}`);
        }
    }
}

const placeholderImageClassName = "dblclick-bypass";
const excludePlaceholderSelector = `:not(.${placeholderImageClassName})`;
const emojiPaneProps: EmojiPaneProps = {
    navBarProps: {
        className: "nabvar-class-name .selected",
        buttonClassName: "nabvar-button-class-name",
        iconClassName: "navbar-icon-class-name"
    },
    statusBarProps: { className: "status-bar-class-name" }
};

function createEditor(name: string, loadEmojiStrings: boolean = false): JSX.Element {
    let leanRoosterContentDiv: HTMLDivElement;
    const leanRoosterContentDivOnRef = (ref: HTMLDivElement) => (leanRoosterContentDiv = ref);

    let leanRooster: LeanRooster;
    const leanRoosterOnRef = (ref: LeanRooster) => (leanRooster = ref);

    let commandBar: RoosterCommandBar;
    const commandBarOnRef = (ref: RoosterCommandBar) => (commandBar = ref);

    const imageManager = new ImageManager({
        uploadImage: (image: File) =>
            new Promise<string>((resolve, reject) => {
                const timeoutMs = Math.random() * 5000;
                console.log(`Imitating uploading... (${timeoutMs}ms)`);

                // fake upload failure if type isn't image
                if (image.type.indexOf("image/") !== 0) {
                    window.setTimeout(() => {
                        reject();
                        console.log(`Upload failed`);
                    }, timeoutMs);

                    return;
                }

                const reader = new FileReader();
                reader.onload = (event: ProgressEvent) => {
                    const dataURL: string = (event.target as FileReader).result as string;
                    window.setTimeout(() => resolve(dataURL), timeoutMs);
                };
                reader.readAsDataURL(image);
            }),
        placeholderImageClassName
    } as ImageManagerOptions);
    const leanRoosterViewState = createEditorViewState(`Hello LeanRooster! (${name})`);
    const commandBarPlugin = new RoosterCommandBarPlugin(
        {},
        (command: RoosterShortcutCommands) => console.log(command),
        true
    );
    const imagePlugin = new PasteImagePlugin(imageManager);
    const imageResizePlugin = new ImageResize(undefined, undefined, undefined, undefined, excludePlaceholderSelector);

    const focusOutShellAllowMouseDown = (element: HTMLElement): boolean =>
        leanRoosterContentDiv && leanRoosterContentDiv.contains(element);
    const focusOutShellOnFocus = (ev: React.FocusEvent<HTMLElement>) => {
        console.log(`FocusOutShell (${name}) gained focus (hasPlaceholder: ${leanRooster.hasPlaceholder()})`);
        commandBarPlugin.registerRoosterCommandBar(commandBar); // re-register command b/c we're changing mode on blur
        leanRooster.mode = LeanRoosterModes.Edit;
    };
    const focusOutShellOnBlur = (ev: React.FocusEvent<HTMLElement>) => {
        console.log(`FocusOutShell (${name}) lost focus (hasPlaceholder: ${leanRooster.hasPlaceholder()})`);
        leanRooster.mode = LeanRoosterModes.View;
        imageResizePlugin.hideResizeHandle();
    };
    const onEmojiKeyboardTriggered = () => {
        if (loadEmojiStrings) {
            emojiPlugin.setStrings({ ...EmojiDescriptionStrings, ...EmojiKeywordStrings, ...EmojiFamilyStrings });
        }
        console.log("Emoji started from keyboard");
    };
    let emojiPlugin: EmojiPlugin = null;

    return (
        <FocusOutShell
            allowMouseDown={focusOutShellAllowMouseDown}
            onBlur={focusOutShellOnBlur}
            onFocus={focusOutShellOnFocus}
            onRenderContent={(calloutClassName: string, calloutOnDismiss: FocusEventHandler) => {
                emojiPlugin =
                    emojiPlugin ||
                    new EmojiPlugin({
                        calloutClassName,
                        calloutOnDismiss,
                        onKeyboardTriggered: onEmojiKeyboardTriggered,
                        emojiPaneProps
                    } as EmojiPluginOptions);

                return [
                    <LeanRooster
                        key="rooster"
                        viewState={leanRoosterViewState}
                        placeholder={`${name} placeholder`}
                        plugins={[
                            commandBarPlugin,
                            imagePlugin,
                            emojiPlugin,
                            imageResizePlugin,
                            new TableResize(),
                            new ContentChangedLoggerPlugin(),
                            new DoubleClickImagePlugin(excludePlaceholderSelector)
                        ]}
                        undo={new UndoWithImagePlugin(imageManager)}
                        ref={leanRoosterOnRef}
                        contentDivRef={leanRoosterContentDivOnRef}
                        hyperlinkToolTipCallback={(url: string) => `CTRL+Click to follow link\n${url}`}
                        defaultFormat={{}}
                        data-foo="bar"
                    />,
                    <RoosterCommandBar
                        key="cmd"
                        className="lean-cmdbar"
                        buttonOverrides={[
                            { key: ButtonKeys.Strikethrough, exclude: true },
                            {
                                key: "vacation",
                                name: "Vacation",
                                iconProps: { iconName: "Vacation" },
                                handleChange: () => {
                                    console.log(leanRooster.getContent());
                                    alert("Hello");
                                    setTimeout(() => {
                                        leanRoosterViewState.content = "";
                                        leanRooster.reloadContent();
                                    }, 2000);
                                },
                                order: 0
                            }
                        ]}
                        roosterCommandBarPlugin={commandBarPlugin}
                        emojiPlugin={emojiPlugin}
                        calloutClassName={calloutClassName}
                        calloutOnDismiss={calloutOnDismiss}
                        imageManager={imageManager}
                        ref={commandBarOnRef}
                        onButtonClicked={buttonKey => console.log(buttonKey)}
                        overflowMenuProps={{ className: "custom-overflow" }}
                        disableListWorkaround={true}
                    />
                ];
            }}
        />
    );
}

const view = (
    <div className="root-container">
        <div className="editor-container">
            {createEditor("editor #1", true /* loadEmojiStrings */)}
            {createEditor("editor #2")}
        </div>
    </div>
);

ReactDom.render(view, document.getElementById("container"), null);
