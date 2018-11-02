// @flow
import type { Dispatch } from 'redux';

type ActionT = {
    type: string,
    payload?: *,
};

type ApiRequestActionT = {
    deferDelay?: number,
    shouldFetch?: boolean | ((any) => boolean),
    request: (dispatch?: Dispatch<any>, getState?: () => any) => any,
    onRequest?: () => ActionT | any,
    onRequestEnd?: () => any,
    onError?: (err: any) => ActionT | any,
    onSuccess?: (value: any) => ActionT | any,
    throwOnError?: boolean,
};

type TimingT = {
    onRequestCalledAt: ?number,
    requestFinishedAt: ?number,
};

const isServer = () => typeof window === 'undefined';

export const getDelay = (timing: TimingT) => {
    const dontHideBeforeMs = 200;
    const { onRequestCalledAt, requestFinishedAt } = timing;

    if (
        onRequestCalledAt === null ||
        typeof onRequestCalledAt === 'undefined' ||
        isServer()
    ) {
        return 0;
    }

    const delta =
        dontHideBeforeMs - ((requestFinishedAt || 0) - onRequestCalledAt);
    if (delta < 0) {
        return 0;
    }

    return delta;
};

export const isDispatchableAction = (obj: ?{ type?: string } | *) => {
    if (
        obj &&
        typeof obj === 'object' &&
        typeof obj.type === 'string' &&
        obj.type !== ''
    ) {
        return true;
    }
    return false;
};

export const apiRequestAction = ({
    shouldFetch,
    request,
    // amount of time the function waits before triggering the onRequest handler
    deferDelay = 150,
    onRequest,
    // Can be used if your onError and/or onSuccess handler does not reset loading state
    onRequestEnd,
    onError,
    onSuccess,
    // usually all errors are handled by an onError handler. There might be cases where you still want to have
    // an error thrown though (e.g. when reacting to an error in local state).
    throwOnError,
}: ApiRequestActionT) => async (dispatch: *, getState: () => any) => {
    const timing: TimingT = {
        onRequestCalledAt: null,
        requestFinishedAt: null,
    };

    try {
        const state = getState();

        if (
            (typeof shouldFetch === 'function' && !shouldFetch(state)) ||
            shouldFetch === false
        ) {
            return false;
        }

        if (typeof onRequest === 'function') {
            setTimeout(() => {
                // only call if request has not already finished within 150ms
                if (!timing.requestFinishedAt) {
                    const requestHandler = onRequest();
                    if (isDispatchableAction(requestHandler)) {
                        dispatch(requestHandler);
                    }
                    timing.onRequestCalledAt = Number(new Date());
                }
            }, deferDelay);
        }

        const value = await request(dispatch, getState);
        timing.requestFinishedAt = Number(new Date());

        return new Promise((resolve) => {
            // add artificial delay of X ms if app has not been in loading state for X ms already
            setTimeout(() => {
                if (typeof onSuccess === 'function') {
                    const successHandler = onSuccess(value);
                    if (isDispatchableAction(successHandler)) {
                        dispatch(successHandler);
                    }
                }

                return resolve(value);
            }, getDelay(timing));
        });
    } catch (error) {
        timing.requestFinishedAt = Number(new Date());

        if (typeof onError === 'function') {
            const errorHandler = onError(error);
            if (isDispatchableAction(errorHandler)) {
                dispatch(errorHandler);
            }
        }

        if (throwOnError) {
            throw error;
        }
    } finally {
        setTimeout(() => {
            if (typeof onRequestEnd === 'function') {
                const requestEndHandler = onRequestEnd();
                if (isDispatchableAction(requestEndHandler)) {
                    dispatch(requestEndHandler);
                }
            }
        }, getDelay(timing));
    }
};

export default {
    apiRequestAction,
};
