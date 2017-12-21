// Note: keep the dependencies for this generic component at a minimal (e.g. don't import OfficeFabric)
import * as React from 'react';
import { closest } from '../../utils/ElementUtil';

export interface FocusOutShellProps {
    className?: string,
    onFocus?: (ev: React.FocusEvent<HTMLElement>) => void;
    onBlur?: (ev: React.FocusEvent<HTMLElement>) => void;
    allowMouseDown?: (target: HTMLElement) => boolean;
}

export interface FocusOutShellChildContext {
    callOutClassName: string,
    callOutOnDismiss: (ev: React.FocusEvent<HTMLElement>) => void;
}

export const FocusOutShellChildContextTypes: React.ValidationMap<any> = {
    callOutClassName: React.PropTypes.string,
    callOutOnDismiss: React.PropTypes.func
}

export default class FocusOutShell extends React.PureComponent<FocusOutShellProps, {}> {
    public static readonly childContextTypes = FocusOutShellChildContextTypes;

    private static readonly BaseClassName = "focus-out-shell";
    private static readonly CallOutClassName = `${FocusOutShell.BaseClassName}-callout`;
    private static Id = 0;

    private _containerDiv: HTMLDivElement;
    private _callOutClassName = `${FocusOutShell.CallOutClassName}-${FocusOutShell.Id++}`;
    private _hasFocus: boolean;

    public render(): JSX.Element {
        const { children, className } = this.props;

        let rootClassName = FocusOutShell.BaseClassName;
        if (className) {
            rootClassName = `${rootClassName} ${className}`;
        }

        return (
            <div className={rootClassName} ref={this._containerDivOnRef} onBlur={this._onBlur} onFocus={this._onFocus} onMouseDown={this._onMouseDown}>
                {children}
            </div>
        );
    }

    public getChildContext(): FocusOutShellChildContext {
        return {
            callOutClassName: this._callOutClassName,
            callOutOnDismiss: this._callOutOnDismiss
        };
    }

    private _callOutOnDismiss = (ev: React.FocusEvent<HTMLElement>): void => {
        // target is the event object from the document.body focus event (captured by the Callout component)
        const nextTarget = ev && ev.target as HTMLElement;

        if (this._shouldCallBlur(nextTarget)) {
             // delay so call out dismiss can complete
            requestAnimationFrame(() => {
                if (this.props.onBlur) {
                    this.props.onBlur(ev);
                }

                this._hasFocus = false;
            });
        }
    }

    private _onBlur = (ev: React.FocusEvent<HTMLElement>): void => {
        // relatedTarget is the event object from the blur event, so it is the next focused element
        const nextTarget = ev.relatedTarget as HTMLElement;

        if (this._shouldCallBlur(nextTarget)) {
            if (this.props.onBlur) {
                this.props.onBlur(ev);
            }
            
            this._hasFocus = false;
        }
    }

    private _shouldCallBlur(nextTarget?: HTMLElement): boolean {
        // don't call blur if the next target is an element on this container
        if (nextTarget && this._containerDiv.contains(nextTarget)) {
            return false;
        }

        // similarly, don't call blur if the next target is the call out or its children
        if (nextTarget && closest(nextTarget, `.${this._callOutClassName}`)) {
            return false;
        }

        return true;
    }

    private _onFocus = (ev: React.FocusEvent<HTMLElement>): void => {
        if (!this._hasFocus) {
            this._hasFocus = true;

            if (this.props.onFocus) {
                this.props.onFocus(ev);
            }
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
