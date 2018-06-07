import { CommandBarButton, IButton } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { registerIcons } from 'office-ui-fabric-react/lib/Styling';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { PluginEvent, PluginEventType } from 'roosterjs-editor-types';
import {
    ContentChangedPlugin,
    createEditorViewState,
    EditorViewState,
    EmojiFamilyKeys,
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
    RoosterShortcutCommands,
    RoosterCommandBarPlugin,
    RoosterCommmandBarButtonKeys as ButtonKeys,
    TableResize,
    UndoWithImagePlugin
} from 'roosterjs-react';

function createLinkedSvg(name: string): JSX.Element {
    return (
        <svg height="40" width="16">
            <use xlinkHref={`script/sprites/command-bar-sprite.svg#rooster-svg-${name}`} />
        </svg>
    );
}

initializeIcons();
registerIcons({
    icons: {
        'RoosterSvg-Color': createLinkedSvg('color'),
        'RoosterSvg-Bullets': createLinkedSvg('bullets'),
        'RoosterSvg-Link': createLinkedSvg('link'),
        'RoosterSvg-Numbering': createLinkedSvg('numbering'),
        'RoosterSvg-Unlink': createLinkedSvg('unlink'),
        'RoosterSvg-Highlight': createLinkedSvg('highlight'),
        'RoosterSvg-Indent': createLinkedSvg('indent'),
        'RoosterSvg-Outdent': createLinkedSvg('outdent'),
        'RoosterSvg-ClearFormat': createLinkedSvg('clear-format'),
        'RoosterSvg-Photo': createLinkedSvg('photo')
    }
});

class ContentChangedLoggerPlugin extends ContentChangedPlugin {
    constructor() {
        super(_ => console.log('Content changed'));
    }

    public onPluginEvent(event: PluginEvent): void {
        if (event && event.eventType === PluginEventType.ContentChanged) {
            console.log(`Content changed from ${(event as any).source}`);
        }
    }
}

function createEditor(name: string, onRef?: (ref: LeanRooster, viewState: EditorViewState) => void): JSX.Element {
    let leanRoosterContentDiv: HTMLDivElement;
    const leanRoosterContentDivOnRef = (ref: HTMLDivElement) => (leanRoosterContentDiv = ref);

    let leanRooster: LeanRooster;
    const leanRoosterOnRef = (ref: LeanRooster) => {
        leanRooster = ref;
        onRef && onRef(ref, leanRoosterViewState);
    };

    let commandBar: RoosterCommandBar;
    const commandBarOnRef = (ref: RoosterCommandBar) => (commandBar = ref);

    const imageManager = new ImageManager({
        uploadImage: (image: File) =>
            new Promise<string>((resolve, reject) => {
                const timeoutMs = Math.random() * 5000;
                console.log(`Imitating uploading... (${timeoutMs}ms)`);

                // fake upload failure if type isn't image
                if (image.type.indexOf('image/') !== 0) {
                    window.setTimeout(() => {
                        reject();
                        console.log(`Upload failed`);
                    }, timeoutMs);

                    return;
                }

                const reader = new FileReader();
                reader.onload = (event: ProgressEvent) => {
                    const dataURL: string = (event.target as FileReader).result;
                    window.setTimeout(() => resolve(dataURL), timeoutMs);
                };
                reader.readAsDataURL(image);
            })
    } as ImageManagerOptions);
    const leanRoosterViewState = createEditorViewState(`Hello LeanRooster! (${name})`);
    const commandBarPlugin = new RoosterCommandBarPlugin({}, (command: RoosterShortcutCommands) => console.log(command));
    const imagePlugin = new PasteImagePlugin(imageManager);
    const imageResizePlugin = new ImageResize();

    const focusOutShellAllowMouseDown = (element: HTMLElement): boolean => leanRoosterContentDiv && leanRoosterContentDiv.contains(element);
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
    let emojiPlugin: EmojiPlugin = null;
    let cmdButton: IButton;

    return (
        <FocusOutShell
            allowMouseDown={focusOutShellAllowMouseDown}
            onBlur={focusOutShellOnBlur}
            onFocus={focusOutShellOnFocus}
            onRenderContent={(calloutClassName: string, calloutOnDismiss: FocusEventHandler) => {
                emojiPlugin = emojiPlugin || new EmojiPlugin({ calloutClassName, calloutOnDismiss } as EmojiPluginOptions);

                return [
                    <LeanRooster
                        key="rooster"
                        viewState={leanRoosterViewState}
                        placeholder={`${name} placeholder`}
                        plugins={[commandBarPlugin, imagePlugin, emojiPlugin, imageResizePlugin, new TableResize(), new ContentChangedLoggerPlugin()]}
                        undo={new UndoWithImagePlugin(imageManager)}
                        ref={leanRoosterOnRef}
                        contentDivRef={leanRoosterContentDivOnRef}
                        hyperlinkToolTipCallback={(url: string) => `CTRL+Click to follow link\n${url}`}
                    />,
                    <RoosterCommandBar
                        key="cmd"
                        className="lean-cmdbar"
                        buttonOverrides={[
                            {
                                key: ButtonKeys.FontColor,
                                onRender: (item: IContextualMenuItem) => (
                                    <TooltipHost content={item.name} key={item.key}>
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
                                            onRenderIcon={() => createLinkedSvg('color')}
                                        />
                                    </TooltipHost>
                                )
                            },
                            { key: ButtonKeys.BulletedList, iconProps: { iconName: 'RoosterSvg-Bullets' } },
                            { key: ButtonKeys.NumberedList, iconProps: { iconName: 'RoosterSvg-Numbering' } },
                            { key: ButtonKeys.Highlight, iconProps: { iconName: 'RoosterSvg-Highlight' } },
                            { key: ButtonKeys.Indent, iconProps: { iconName: 'RoosterSvg-Indent' } },
                            { key: ButtonKeys.Outdent, iconProps: { iconName: 'RoosterSvg-Outdent' } },
                            { key: ButtonKeys.Link, iconProps: { iconName: 'RoosterSvg-Link' } },
                            { key: ButtonKeys.Unlink, iconProps: { iconName: 'RoosterSvg-Unlink' } },
                            { key: ButtonKeys.ClearFormat, iconProps: { iconName: 'RoosterSvg-ClearFormat' } },
                            { key: ButtonKeys.InsertImage, iconProps: { iconName: 'RoosterSvg-Photo' } },
                            { key: ButtonKeys.Strikethrough, exclude: true },
                            {
                                key: 'vacation',
                                name: 'Vacation',
                                iconProps: { className: 'ms-Icon ms-Icon--Vacation' },
                                handleChange: () => {
                                    console.log(leanRooster.getContent());
                                    alert('Hello');
                                    setTimeout(() => {
                                        leanRoosterViewState.content = '';
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
                        overflowMenuProps={{ className: 'custom-overflow' }}
                    />
                ];
            }}
        />
    );
}

const view = (
    <div className="root-container">
        <div className="editor-container">
            {createEditor('editor #1')}
            {createEditor('editor #2')}
        </div>
    </div>
);

ReactDom.render(view, document.getElementById('container'), null);
