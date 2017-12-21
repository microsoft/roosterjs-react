// Note: keep the dependencies for this generic component at a minimal (e.g. don't import OfficeFabric)
import * as React from 'react';

export interface IFocusOutShellProps {
    className?: string,
    onFocus?: (ev: React.FocusEvent<HTMLElement>) => void;
    onBlur?: (ev: React.FocusEvent<HTMLElement>) => void;
    allowMouseDown?: (target: HTMLElement) => boolean;
}

export interface IFocusOutShellChildContext {
    callOutClassName: string,
    callOutOnDismiss: (ev: React.FocusEvent<HTMLElement>) => void;
}

export const FocusOutShellChildContextTypes: React.ValidationMap<any> = {
    callOutClassName: React.PropTypes.string.isRequired,
    callOutOnDismiss: React.PropTypes.func.isRequired
}

export default class FocusOutShell extends React.PureComponent<IFocusOutShellProps, {}> {
    public static readonly childContextTypes = FocusOutShellChildContextTypes;

    private static readonly BaseClassName = "focus-out-shell";
    private static readonly CallOutClassName = `${FocusOutShell.BaseClassName}-callout`;

    private _containerDiv: HTMLDivElement;

    public render(): JSX.Element {
        const { children, onFocus, className } = this.props;

        let rootClassName = FocusOutShell.BaseClassName;
        if (className) {
            rootClassName = `${rootClassName} ${className}`;
        }

        return (
            <div className={rootClassName} ref={this._containerDivOnRef} onBlur={this._onBlur} onFocus={onFocus} onMouseDown={this._onMouseDown}>
                {children}
            </div>
        );
    }

    public getChildContext(): IFocusOutShellChildContext {
        return {
            callOutClassName: FocusOutShell.CallOutClassName,
            callOutOnDismiss: this._callOutOnDismiss
        };
    }

    private _callOutOnDismiss = (ev: React.FocusEvent<HTMLElement>): void => {
        // target is the event object from the document.body focus event (captured by the Callout component)
        const nextTarget = ev.target as HTMLElement;

        if (this._containerDiv && nextTarget && this._containerDiv.contains(nextTarget)) {
            return;
        }

        requestAnimationFrame(() => this.props.onBlur(ev));
    }

    private _onBlur = (ev: React.FocusEvent<HTMLElement>): void => {
        // relatedTarget is the event object from the blur event, so it is the next focused element
        const nextTarget = ev.relatedTarget as HTMLElement;

        // don't call blur if the next target is the call out
        if (nextTarget && nextTarget.classList && nextTarget.classList.contains(FocusOutShell.CallOutClassName)) {
            return;
        }

        // similarly, don't call blur if the next target is an element on this container
        if (nextTarget && this._containerDiv.contains(nextTarget)) {
            return;
        }

        if (this.props.onBlur) {
            this.props.onBlur(ev);
        }
    }

    private _onMouseDown = (ev: React.MouseEvent<HTMLElement>): void => {
        const { target } = ev;
        if (this.props.allowMouseDown && this.props.allowMouseDown(target as HTMLElement)) {
            return;
        }

        ev.preventDefault(); // prevents blur event from triggering
    }

    private _containerDivOnRef = (ref: HTMLDivElement): void => {
        this._containerDiv = ref;
    }
}
