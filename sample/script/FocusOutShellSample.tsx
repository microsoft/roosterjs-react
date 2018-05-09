import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { registerIcons } from 'office-ui-fabric-react/lib/Styling';
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

    const focusOutShellAllowMouseDown = (element: HTMLElement): boolean =>
        leanRoosterContentDiv && leanRoosterContentDiv.contains(element);
    const focusOutShellOnFocus = (ev: React.FocusEvent<HTMLElement>) => {
        console.log(`FocusOutShell (${name}) gained focus (hasPlaceholder: ${leanRooster.hasPlaceholder()})`);
        commandBarPlugin.registerRoosterCommandBar(commandBar); // re-register command b/c we're changing mode on blur
    };
    const focusOutShellOnBlur = (ev: React.FocusEvent<HTMLElement>) => {
        console.log(`FocusOutShell (${name}) lost focus (hasPlaceholder: ${leanRooster.hasPlaceholder()})`);
        leanRooster.mode = LeanRoosterModes.View;
    };
    let emojiPlugin: EmojiPlugin = null;

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
                        buttonIconProps={{
                            [RoosterCommmandBarButtonKeys.FontColor]: { iconName: "RoosterSvg-Color" },
                            [RoosterCommmandBarButtonKeys.BulletedList]: { iconName: "RoosterSvg-Bullets" },
                            [RoosterCommmandBarButtonKeys.NumberedList]: { iconName: "RoosterSvg-Numbering" },
                            [RoosterCommmandBarButtonKeys.Highlight]: { iconName: "RoosterSvg-Highlight" },
                            [RoosterCommmandBarButtonKeys.Indent]: { iconName: "RoosterSvg-Indent" },
                            [RoosterCommmandBarButtonKeys.Outdent]: { iconName: "RoosterSvg-Outdent" },
                            [RoosterCommmandBarButtonKeys.Link]: { iconName: "RoosterSvg-Link" },
                            [RoosterCommmandBarButtonKeys.Unlink]: { iconName: "RoosterSvg-Unlink" },
                            [RoosterCommmandBarButtonKeys.ClearFormat]: { iconName: "RoosterSvg-ClearFormat" }
                        }}
                        additionalButtons={[
                            {
                                key: "vacation",
                                name: "Vacation",
                                iconProps: { className: "ms-Icon ms-Icon--Vacation" },
                                handleChange: () => alert("Hello")
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
