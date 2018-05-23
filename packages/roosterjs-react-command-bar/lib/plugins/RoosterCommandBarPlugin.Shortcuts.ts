import { KeyCodes } from 'office-ui-fabric-react/lib/Utilities';
import { browserData } from 'roosterjs-editor-core';
import { PluginDomEvent, PluginEvent, PluginEventType } from 'roosterjs-editor-types';

export const enum RoosterCommandBarCommands {
    None = 0,
    Bold = 1,
    Italic = 2,
    Underline = 3,
    Undo = 4,
    Redo = 5,
    Bullet = 6,
    Numbering = 7,
    InsertLink = 8
}

interface ShortcutCommand {
    metaKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    which: number;
    command: RoosterCommandBarCommands;
}

const macCommands: ShortcutCommand[] = [
    // Bold for Mac: Command (Meta) + B
    {
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
        which: KeyCodes.b,
        command: RoosterCommandBarCommands.Bold
    },
    // Italic for Mac: Command (Meta) + I
    {
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
        which: KeyCodes.i,
        command: RoosterCommandBarCommands.Italic
    },
    // Underline for Mac: Command (Meta) + U
    {
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
        which: KeyCodes.u,
        command: RoosterCommandBarCommands.Underline
    },
    // Undo for Mac: Command (Meta) + Z
    {
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
        which: KeyCodes.z,
        command: RoosterCommandBarCommands.Undo
    },
    // Redo for Mac: Command (meta) + SHIFT + Z
    {
        metaKey: true,
        ctrlKey: false,
        shiftKey: true,
        which: KeyCodes.z,
        command: RoosterCommandBarCommands.Redo
    },
    // Bullet for Mac: Command (meta) + .
    {
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
        which: KeyCodes.period,
        command: RoosterCommandBarCommands.Bullet
    },
    // Numbering for Mac: Command (meta) + /
    {
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
        which: KeyCodes.forwardSlash,
        command: RoosterCommandBarCommands.Numbering
    },
    // Insert link for Mac: Command (meta) + k
    {
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
        which: KeyCodes.k,
        command: RoosterCommandBarCommands.InsertLink
    }
];

const winCommands: ShortcutCommand[] = [
    // Bold for Windows: Ctrl + B
    {
        metaKey: false,
        ctrlKey: true,
        shiftKey: false,
        which: KeyCodes.b,
        command: RoosterCommandBarCommands.Bold
    },
    // Italic for Windows: Ctrl + I
    {
        metaKey: false,
        ctrlKey: true,
        shiftKey: false,
        which: KeyCodes.i,
        command: RoosterCommandBarCommands.Italic
    },
    // Underline for Windows: Ctrl + U
    {
        metaKey: false,
        ctrlKey: true,
        shiftKey: false,
        which: KeyCodes.u,
        command: RoosterCommandBarCommands.Underline
    },
    // Undo for Windows: Ctrl + Z
    {
        metaKey: false,
        ctrlKey: true,
        shiftKey: false,
        which: KeyCodes.z,
        command: RoosterCommandBarCommands.Undo
    },
    // Redo for Windows: Ctrl + Y
    {
        metaKey: false,
        ctrlKey: true,
        shiftKey: false,
        which: KeyCodes.y,
        command: RoosterCommandBarCommands.Redo
    },
    // Bullet for Windows: Ctrl + .
    {
        metaKey: false,
        ctrlKey: true,
        shiftKey: false,
        which: KeyCodes.period,
        command: RoosterCommandBarCommands.Bullet
    },
    // Numbering for Windows: Ctrl + /
    {
        metaKey: false,
        ctrlKey: true,
        shiftKey: false,
        which: KeyCodes.forwardSlash,
        command: RoosterCommandBarCommands.Numbering
    },
    // Insert link for Windows: Ctrl + k
    {
        metaKey: false,
        ctrlKey: true,
        shiftKey: false,
        which: KeyCodes.k,
        command: RoosterCommandBarCommands.InsertLink
    }
];

export function getCommandFromEvent(event: PluginEvent): RoosterCommandBarCommands {
    if (event.eventType !== PluginEventType.KeyDown) {
        return RoosterCommandBarCommands.None;
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

    return RoosterCommandBarCommands.None;
}
