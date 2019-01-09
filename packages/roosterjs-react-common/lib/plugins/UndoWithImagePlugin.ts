import { Undo } from 'roosterjs-editor-core';
import { UndoSnapshotsService } from 'roosterjs-editor-core';

import { hasPlaceholder, ImageManagerInteface, UpdatePlaceholdersResult } from '../utils/ImageManager';

// Max stack size that cannot be exceeded. When exceeded, old undo history will be dropped
// to keep size under limit. This is kept at 10MB.
const MAXSIZELIMIT = 10000000;

interface Snapshot {
    value: string;
    hasPlaceholder: boolean;
}

class UndoSnapshotsWithImage implements UndoSnapshotsService {
    private snapshots: Snapshot[];
    private totalSize: number;
    private currentIndex: number;

    constructor(private imageManager: ImageManagerInteface, private maxSize: number) {
        this.snapshots = [];
        this.totalSize = 0;
        this.currentIndex = -1;
    }

    public canMove(delta: number): boolean {
        const newIndex = this.currentIndex + delta;
        return newIndex >= 0 && newIndex < this.snapshots.length;
    }

    public move(delta: number): string {
        if (!this.canMove(delta)) {
            return null;
        }

        const lastIndex = this.currentIndex;
        this.currentIndex += delta;
        const snapshot = this.snapshots[this.currentIndex];

        // There is a chance snapshots were saved with placeholders. To resolve that,
        // we optimistically ask Image Manager to replace the placeholders with images,
        // since the manager caches placeholder IDs to final image URLs (when they are resolved).
        // The manager returns the final HTML and also if all of the placeholders are resolved.
        if (snapshot.hasPlaceholder) {
            const originalValue = snapshot.value;
            const result: UpdatePlaceholdersResult = this.imageManager.updatePlaceholders(originalValue);
            snapshot.hasPlaceholder = !result.resolvedAll;
            snapshot.value = result.html;
            const sizeDelta = originalValue.length - result.html.length;

            // if we undo/redo and the content is the same after updating the placeholders, keep moving
            // (we get two snapshots when inserting an image, one for the placeholder, and another when the placeholder is resolved)
            const lastSnapshot = this.snapshots[lastIndex];
            if (lastSnapshot && lastSnapshot.value === snapshot.value && delta !== 0) {
                // since content is the same, remove the last "duplicated" snapshot
                this.totalSize -= snapshot.value.length;
                this.snapshots.splice(lastIndex);

                // then, move again by one unit at a time and until content is different after resolving placeholders
                return this.move(delta < 0 ? -1 : 1);
            } else {
                // it is possible total size is greater at this point (unlikely if default spinner is used)
                this.totalSize -= sizeDelta;
            }
        }

        return snapshot.value;
    }

    public addSnapshot(value: string): void {
        if (this.currentIndex > -1 && value === this.snapshots[this.currentIndex].value) {
            return;
        }

        this.clearRedo();
        this.snapshots.push({ value, hasPlaceholder: hasPlaceholder(value) });
        ++this.currentIndex;
        this.totalSize += value.length;

        let removeCount = 0;
        while (removeCount < this.snapshots.length && this.totalSize > this.maxSize) {
            this.totalSize -= this.snapshots[removeCount].value.length;
            removeCount++;
        }

        if (removeCount > 0) {
            this.snapshots.splice(0, removeCount);
            this.currentIndex -= removeCount;
        }
    }

    public clearRedo(): void {
        if (!this.canMove(1)) {
            return;
        }

        let removedSize = 0;
        for (let i = this.currentIndex + 1; i < this.snapshots.length; ++i) {
            removedSize += this.snapshots[i].value.length;
        }
        this.snapshots.splice(this.currentIndex + 1);
        this.totalSize -= removedSize;
    }
}

export default class UndoWithImagePlugin extends Undo {
    /**
     * Create an instance of Undo
     * @param preserveSnapshots True to preserve the snapshots after dispose, this allows
     * this object to be reused when editor is disposed and created again
     * @param bufferSize The buffer size for snapshots. Default value is 10MB, it is possible after
     * placeholder to image resolution that buffer size is greater.
     */
    constructor(private imageManager: ImageManagerInteface, preserveSnapshots?: boolean, private bufferSize: number = MAXSIZELIMIT) {
        super(preserveSnapshots, bufferSize);
    }

    protected getSnapshotsManager(): UndoSnapshotsService {
        if (!this.undoSnapshots) {
            this.undoSnapshots = new UndoSnapshotsWithImage(this.imageManager, this.bufferSize);
        }

        return this.undoSnapshots;
    }

    public reset(initialContent: string) : void {
        this.clear();
        this.getSnapshotsManager().addSnapshot(initialContent);
    }
}
