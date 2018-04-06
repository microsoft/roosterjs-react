import * as React from "react";
import * as ReactDom from "react-dom";
import {
    createEditorViewState,
    FocusEventHandler,
    FocusOutShell,
    LeanRooster,
    LeanRoosterModes,
    RoosterCommandBar,
    RoosterCommandBarPlugin
} from "roosterjs-react";

function createEditor(name: string) {
    let leanRoosterContentDiv: HTMLDivElement;
    const leanRoosterContentDivOnRef = (ref: HTMLDivElement) => leanRoosterContentDiv = ref;

    let leanRooster: LeanRooster;
    const leanRoosterOnRef = (ref: LeanRooster) => leanRooster = ref;

    let commandBar: RoosterCommandBar;
    const commandBarOnRef = (ref: RoosterCommandBar) => commandBar = ref;

    const leanRoosterViewState = createEditorViewState(`Hello LeanRooster! (${name})`);
    const commandBarPlugin = new RoosterCommandBarPlugin();

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
                plugins={[commandBarPlugin]}
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

const view = <div className="root-container">
    <div className="editor-container">
        {createEditor("editor #1")}
        {createEditor("editor #2")}
    </div>
</div>;

ReactDom.render(view, document.getElementById("container"), null);
