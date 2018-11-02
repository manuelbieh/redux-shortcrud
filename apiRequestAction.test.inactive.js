import {
    apiRequestAction,
    getDelay,
    isDispatchableAction,
} from './apiRequestAction';

describe('Store Utils', () => {
    describe('isDispatchableAction', () => {
        it('checks if an object is a dispatchable redux action', () => {
            expect(isDispatchableAction({ type: 'action' })).toBe(true);
            expect(isDispatchableAction({ type: 'action', payload: {} })).toBe(
                true
            );
            expect(isDispatchableAction({ type: 1 })).toBe(false);
            expect(isDispatchableAction(null)).toBe(false);
        });
    });

    describe('apiRequestAction', async () => {
        const thrownError = 'thrownError';
        const fetchReturnValue = 'fetchReturnValue';
        const thunkAction = jest.fn(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(fetchReturnValue);
                }, 200);
            });
        });
        const longRunningFetch = jest.fn(() => thunkAction);
        const immediateFetch = () => () =>
            new Promise((resolve) => resolve(fetchReturnValue));
        const failingFetch = jest.fn(() => {
            throw new Error(thrownError);
        });

        it('fails if request needsAuthentication but accessToken is missing', async () => {
            const getStateMock = jest.fn(() => ({
                auth: {},
                team: {},
            }));
            const errorHandler = jest.fn();

            await apiRequestAction({
                needsAuthentication: true,
                onError: errorHandler,
            })(jest.fn(), getStateMock);

            expect(errorHandler).toHaveBeenCalledWith(
                new Error('error.NOT_AUTHENTICATED')
            );
        });

        it('passes if request needsAuthentication and an accessToken exists', async () => {
            const getStateMock = jest.fn(() => ({
                auth: { accessToken: '1234' },
                team: {},
            }));
            const errorHandler = jest.fn();

            await apiRequestAction({
                needsAuthentication: true,
                onError: errorHandler,
                fetch: jest.fn(() => jest.fn()),
            })(jest.fn(), getStateMock);

            expect(errorHandler).toHaveBeenCalledTimes(0);
        });

        it('returns false if shouldFetch is explicitly set to false', async () => {
            const getStateMock = jest.fn(() => ({
                auth: {},
                team: {},
            }));
            const returnValue = await apiRequestAction({
                shouldFetch: false,
            })(jest.fn(), getStateMock);

            expect(returnValue).toBe(false);
        });

        it('passes current state to shouldFetch() and returns false if function returns falsy value', async () => {
            const stateMock = {
                auth: { accessToken: '1234' },
                team: {},
            };
            const getStateMock = jest.fn(() => stateMock);
            const shouldFetch = jest.fn(() => false);

            const returnValue = await apiRequestAction({
                shouldFetch: shouldFetch,
            })(jest.fn(), getStateMock);

            expect(shouldFetch).toHaveBeenCalledWith(stateMock);
            expect(returnValue).toBe(false);
        });

        it('does not call fetch() if shouldFetch returns false', async () => {
            const getStateMock = jest.fn(() => ({
                auth: {},
                team: {},
            }));
            const fetch = jest.fn();
            await apiRequestAction({
                shouldFetch: false,
                fetch: fetch,
            })(jest.fn(), getStateMock);

            expect(fetch).toHaveBeenCalledTimes(0);
        });

        it('does not call onRequest() if fetch() resolves within 150ms', async () => {
            const getStateMock = jest.fn(() => ({
                auth: {},
                team: {},
            }));
            const onRequest = jest.fn();

            await apiRequestAction({
                shouldFetch: true,
                onRequest: onRequest,
                fetch: () => () => Promise.resolve(),
            })(jest.fn(), getStateMock);

            expect(onRequest).toHaveBeenCalledTimes(0);
        });

        it('calls onRequest() if fetch() does not resolve within 150ms', async () => {
            const getStateMock = jest.fn(() => ({
                auth: {},
                team: {},
            }));
            const dispatchMock = jest.fn();
            const onRequest = jest.fn();

            await apiRequestAction({
                shouldFetch: true,
                onRequest: onRequest,
                fetch: longRunningFetch,
            })(dispatchMock, getStateMock);

            expect(onRequest).toHaveBeenCalled();
            expect(longRunningFetch).toHaveBeenCalledWith({
                accessToken: null,
                teamId: undefined,
            });
            expect(thunkAction).toHaveBeenCalledWith(
                dispatchMock,
                getStateMock
            );
        });

        it('calls onSuccess() with the return value of fetch()', async () => {
            const getStateMock = jest.fn(() => ({
                auth: {},
                team: {},
            }));
            const onSuccess = jest.fn();

            await apiRequestAction({
                shouldFetch: true,
                fetch: immediateFetch,
                onSuccess: onSuccess,
            })(jest.fn(), getStateMock);

            expect(onSuccess).toHaveBeenCalledWith(fetchReturnValue);
        });

        it('calls onError() if fetch() throws', async () => {
            const getStateMock = jest.fn(() => ({
                auth: {},
                team: {},
            }));
            const onError = jest.fn();

            await apiRequestAction({
                shouldFetch: true,
                fetch: failingFetch,
                onError: onError,
            })(jest.fn(), getStateMock);

            expect(onError).toHaveBeenCalledWith(new Error(thrownError));
        });

        it('calls onRequestEnd() regardless of whether fetch() has failed or succeded', async () => {
            const getStateMock = jest.fn(() => ({
                auth: {},
                team: {},
            }));
            const onError = jest.fn();
            const onRequestEnd = jest.fn();

            await apiRequestAction({
                shouldFetch: true,
                fetch: failingFetch,
                onError: onError,
                onRequestEnd: onRequestEnd,
            })(jest.fn(), getStateMock);

            expect(onError).toHaveBeenCalled();
            expect(onRequestEnd).toHaveBeenCalled();

            onRequestEnd.mockReset();

            await apiRequestAction({
                shouldFetch: true,
                fetch: immediateFetch,
                onRequestEnd: onRequestEnd,
            })(jest.fn(), jest.fn());

            expect(onRequestEnd).toHaveBeenCalled();
        });
    });

    describe('getDelay()', () => {
        it('returns 0 delay if onRequest has not been called yet', () => {
            expect(getDelay({ onRequestCalledAt: null })).toBe(0);
        });

        it('returns 0 delay if delta between onRequestCalledAt and requestFinishedAt is already bigger than dontHideBeforeMs', () => {
            expect(
                getDelay({ onRequestCalledAt: 200, requestFinishedAt: 450 })
            ).toBe(0);
        });

        it('returns the delta if time between onRequestCalledAt and requestFinishedAt is smaller than dontHideBeforeMs', () => {
            expect(
                getDelay({ onRequestCalledAt: 1000, requestFinishedAt: 1050 })
            ).toBe(150);
        });
    });
});
