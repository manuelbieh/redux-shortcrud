import { crudFor } from '.';

const allActionTypes = [
    'CREATE_START',
    'CREATE_SUCCESS',
    'CREATE_FAILURE',
    'FETCH_LIST_START',
    'FETCH_LIST_SUCCESS',
    'FETCH_LIST_FAILURE',
    'FETCH_ITEM_START',
    'FETCH_ITEM_SUCCESS',
    'FETCH_ITEM_FAILURE',
    'UPDATE_START',
    'UPDATE_SUCCESS',
    'UPDATE_FAILURE',
    'EDIT_START',
    'EDIT_SUCCESS',
    'EDIT_FAILURE',
    'DELETE_START',
    'DELETE_SUCCESS',
    'DELETE_FAILURE',
];

const allActionCreators = [
    'createStart',
    'createSuccess',
    'createFailure',
    'fetchListStart',
    'fetchListSuccess',
    'fetchListFailure',
    'fetchItemStart',
    'fetchItemSuccess',
    'fetchItemFailure',
    'updateStart',
    'updateSuccess',
    'updateFailure',
    'editStart',
    'editSuccess',
    'editFailure',
    'deleteStart',
    'deleteSuccess',
    'deleteFailure',
];

const error = Object.seal({ message: 'Error' });

describe('Minimal example', () => {
    const examples = crudFor('examples');

    describe('ActionTypes', () => {
        it('are getting generated', () => {
            expect(
                allActionTypes.every((type) =>
                    Object.keys(examples.actionTypes).includes(type)
                )
            ).toBe(true);
        });

        it('contains the actual model', () => {
            expect(examples.actionTypes.CREATE_START).toEqual(
                expect.stringMatching(/^examples/)
            );
        });
    });

    describe('ActionCreators', () => {
        it('are getting generated', () => {
            expect(
                allActionCreators.every((type) =>
                    Object.keys(examples.actionCreators).includes(type)
                )
            ).toBe(true);
        });

        it('return the correct FSA actions', () => {
            const {
                createStart,
                createSuccess,
                createFailure,
            } = examples.actionCreators;

            expect(createStart()).toEqual({ type: 'examples/create/start' });

            expect(createSuccess({ id: 1 })).toEqual(
                expect.objectContaining({
                    type: 'examples/create/success',
                    payload: { id: 1 },
                    meta: expect.anything(),
                })
            );
            expect(createFailure(error)).toEqual(
                expect.objectContaining({
                    type: 'examples/create/failure',
                    error: true,
                    payload: error,
                })
            );
        });
    });

    describe('Reducer', () => {
        it('is getting generated', () => {
            expect(typeof examples.reducer).toBe('function');
        });

        it('returns the initialState', () => {
            expect(examples.reducer()).toEqual({
                isCreating: false,
                isDeleting: false,
                isFetching: false,
                isUpdating: false,
                items: [],
            });
        });

        it('mutates state for CREATE_* actions', () => {
            const {
                createStart,
                createSuccess,
                createFailure,
            } = examples.actionCreators;

            let state = examples.reducer(null, createStart());
            expect(state.error).toBe(null);
            expect(state.isCreating).toBe(true);

            state = examples.reducer(state, createSuccess({ id: 1 }));
            expect(state.isCreating).toBe(false);
            expect(state.error).toBe(null);
            expect(state).toEqual(
                expect.objectContaining({
                    isCreating: false,
                    error: null,
                    items: [{ id: 1 }],
                })
            );

            state = examples.reducer(state, createFailure(error));
            console.log('NEW STATE', state);

            expect(state).toEqual(
                expect.objectContaining({
                    isCreating: false,
                    error: error,
                    items: [{ id: 1 }],
                })
            );
        });
    });
});
