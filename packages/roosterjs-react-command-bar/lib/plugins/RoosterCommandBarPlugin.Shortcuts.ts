import { KeyCodes } from 'office-ui-fabric-react/lib/Utilities';
import { browserData } from 'roosterjs-editor-core';
import { PluginDomEvent, PluginEvent, PluginEventType } from 'roosterjs-editor-types';

export const enum RoosterShortcutCommands {
    None = 'None',
    Bold = 'Bold',
    Italic = 'Italic',
    Underline = 'Underline',
    Undo = 'Undo',
    Redo = 'Redo',
    Bullet = 'Bullet',
    Numbering = 'Numbering',
    InsertLink = 'InsertLink'
}

interface ShortcutCommand {
    metaKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    which: number;
    command: RoosterShortcutCommands;
}

const macCommands: ShortcutCommand[] = [
    // Bold for Mac: Command (Meta) + B
    {
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
        which: KeyCodes.b,
        command: RoosterShortcutCommands.Bold
    },
    // Italic for Mac: Command (Meta) + I
    {
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
        which: KeyCodes.i,
        command: RoosterShortcutCommands.Italic
    },
    // Underline for Mac: Command (Meta) + U
    {
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
        which: KeyCodes.u,
        command: RoosterShortcutCommands.Underline
    },
    // Undo for Mac: Command (Meta) + Z
    {
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
        which: KeyCodes.z,
        command: RoosterShortcutCommands.Undo
    },
    // Redo for Mac: Command (meta) + SHIFT + Z
    {
        metaKey: true,
        ctrlKey: false,
        shiftKey: true,
        which: KeyCodes.z,
        command: RoosterShortcutCommands.Redo
    },
    // Bullet for Mac: Command (meta) + .
    {
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
        which: KeyCodes.period,
        command: RoosterShortcutCommands.Bullet
    },
    // Numbering for Mac: Command (meta) + /
    {
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
        which: KeyCodes.forwardSlash,
        command: RoosterShortcutCommands.Numbering
    },
    // Insert link for Mac: Command (meta) + k
    {
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
        which: KeyCodes.k,
        command: RoosterShortcutCommands.InsertLink
    }
];

const winCommands: ShortcutCommand[] = [
    // Bold for Windows: Ctrl + B
    {
        metaKey: false,
        ctrlKey: true,
        shiftKey: false,
        which: KeyCodes.b,
        command: RoosterShortcutCommands.Bold
    },
    // Italic for Windows: Ctrl + I
    {
        metaKey: false,
        ctrlKey: true,
        shiftKey: false,
        which: KeyCodes.i,
        command: RoosterShortcutCommands.Italic
    },
    // Underline for Windows: Ctrl + U
    {
        metaKey: false,
        ctrlKey: true,
        shiftKey: false,
        which: KeyCodes.u,
        command: RoosterShortcutCommands.Underline
    },
    // Undo for Windows: Ctrl + Z
    {
        metaKey: false,
        ctrlKey: true,
        shiftKey: false,
        which: KeyCodes.z,
        command: RoosterShortcutCommands.Undo
    },
    // Redo for Windows: Ctrl + Y
    {
        metaKey: false,
        ctrlKey: true,
        shiftKey: false,
        which: KeyCodes.y,
        command: RoosterShortcutCommands.Redo
    },
    // Bullet for Windows: Ctrl + .
    {
        metaKey: false,
        ctrlKey: true,
        shiftKey: false,
        which: KeyCodes.period,
        command: RoosterShortcutCommands.Bullet
    },
    // Numbering for Windows: Ctrl + /
    {
        metaKey: false,
        ctrlKey: true,
        shiftKey: false,
        which: KeyCodes.forwardSlash,
        command: RoosterShortcutCommands.Numbering
    },
    // Insert link for Windows: Ctrl + k
    {
        metaKey: false,
        ctrlKey: true,
        shiftKey: false,
        which: KeyCodes.k,
        command: RoosterShortcutCommands.InsertLink
    }
];

export function getCommandFromEvent(event: PluginEvent): RoosterShortcutCommands {
    if (event.eventType !== PluginEventType.KeyDown) {
        return RoosterShortcutCommands.None;
    }

    const commands = browserData.isMac ? macCommands : winCommands;
    const keyboardEvent = (event as PluginDomEvent).rawEvent as KeyboardEvent;
    for (const cmd of commands) {
        if (
            !keyboardEvent.altKey &&
            cmd.ctrlKey === keyboardEvent.ctrlKey &&
            cmd.metaKey === keyboardEvent.metaKey &&
            cmd.shiftKey === keyboardEvent.shiftKey &&
            cmd.which === keyboardEvent.which
        ) {
            return cmd.command;
        }
    }

    return RoosterShortcutCommands.None;
}
