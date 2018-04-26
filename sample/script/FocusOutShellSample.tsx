import * as React from "react";
import * as ReactDom from "react-dom";
import {
    createEditorViewState,
    EditorViewState,
    FocusEventHandler,
    FocusOutShell,
    LeanRooster,
    LeanRoosterModes,
    RoosterCommandBar,
    RoosterCommandBarPlugin,
    PasteImagePlugin
} from "roosterjs-react";

import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
initializeIcons();

function createEditor(name: string, onRef?: (ref: LeanRooster, viewState: EditorViewState) => void): JSX.Element {
    let leanRoosterContentDiv: HTMLDivElement;
    const leanRoosterContentDivOnRef = (ref: HTMLDivElement) => leanRoosterContentDiv = ref;

    let leanRooster: LeanRooster;
    const leanRoosterOnRef = (ref: LeanRooster) => {
        leanRooster = ref;
        if (onRef) {
            onRef(ref, leanRoosterViewState);
        }
    }

    let commandBar: RoosterCommandBar;
    const commandBarOnRef = (ref: RoosterCommandBar) => commandBar = ref;

    const leanRoosterViewState = createEditorViewState(`Hello LeanRooster! (${name})`);
    const commandBarPlugin = new RoosterCommandBarPlugin();

    const imagePlugin = new PasteImagePlugin({
        uploadImage: (dataUrl: string) => {
            return new Promise<string>((resolve, reject) => {
                const timeoutMs = Math.random() * 5000;
                console.log(`Imitating uploading... (${timeoutMs}ms)`);
                window.setTimeout(() => resolve(dataUrl), timeoutMs);
            });
        }
    });

    const focusOutShellAllowMouseDown = (element: HTMLElement): boolean => leanRoosterContentDiv && leanRoosterContentDiv.contains(element);
    const focusOutShellOnFocus = (ev: React.FocusEvent<HTMLElement>) => {
        console.log(`FocusOutShell (${name}) gained focus`);
        commandBarPlugin.registerRoosterCommandBar(commandBar); // re-register command b/c we're changing mode on blur
    };
    const focusOutShellOnBlur = (ev: React.FocusEvent<HTMLElement>) => {
        console.log(`FocusOutShell (${name}) lost focus`);
        leanRooster.mode = LeanRoosterModes.View;
    };

    return <FocusOutShell
        allowMouseDown={focusOutShellAllowMouseDown}
        onBlur={focusOutShellOnBlur}
        onFocus={focusOutShellOnFocus}
        onRenderContent={(calloutClassName: string, calloutOnDismiss: FocusEventHandler) => [
            <LeanRooster
                key="rooster"
                viewState={leanRoosterViewState}
                plugins={[commandBarPlugin, imagePlugin]}
                ref={leanRoosterOnRef}
                contentDivRef={leanRoosterContentDivOnRef} />,
            <RoosterCommandBar
                key="cmd"
                roosterCommandBarPlugin={commandBarPlugin}
                calloutClassName={calloutClassName}
                calloutOnDismiss={calloutOnDismiss}
                ref={commandBarOnRef} />
        ]}
    />;
}

const secondEditorOnRef = (ref: LeanRooster, state: EditorViewState) => {
    setTimeout(() => {
        state.content += " changed via reloadContent()";
        ref.reloadContent();
    }, 2000);

    setTimeout(() => {
        state.content += " changed via reloadContent() again";
        ref.reloadContent();
    }, 4000);
}
const view = <div className="root-container">
    <div className="editor-container">
        {createEditor("editor #1")}
        {createEditor("editor #2", secondEditorOnRef)}
    </div>
</div>;

ReactDom.render(view, document.getElementById("container"), null);
