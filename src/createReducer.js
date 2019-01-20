// @flow
type ItemT = { [string]: any };
type ItemsMapT = { [string]: ?ItemT };
type ItemsListT = ItemT[];

type StateT = {
    isCreating?: boolean,
    isDeleting?: boolean,
    isFetching?: boolean,
    isUpdating?: boolean,
    items: ItemsListT | ItemsMapT,
    selectedItem?: string | number,
};

type FluxStandardActionT = {
    type: string,
    payload?: any,
    error?: boolean,
    meta?: { updatedAt?: Date },
};

type ReducerT = (state: StateT, action: FluxStandardActionT) => StateT;

type ReducerParamsT = {
    actionTypes: {
        [string]: string,
    },
    config: {
        initialState?: {},
        key: string,
        mode?: 'list' | 'map',
    },
};

const createReducer = ({
    actionTypes,
    config = { key: '' },
}: ReducerParamsT): ReducerT => {
    const { key, mode } = config;

    const initialState = Object.freeze(
        Object.assign(
            {},
            {
                isCreating: false,
                isDeleting: false,
                isFetching: false,
                isUpdating: false,
                items: mode === 'map' ? {} : [],
            },
            config.initialState || {}
        )
    );

    const isMode = (m: 'list' | 'map') => mode === m;

    type ActionT = FluxStandardActionT & { type: $Values<typeof actionTypes> };

    return (
        state: StateT = initialState,
        action: FluxStandardActionT | ActionT = { type: 'UNKOWN' }
    ): StateT => {
        const { error, meta } = action;
        state = state ? state : initialState;

        if (error === true) {
            return {
                ...state,
                error: action.payload,
                isCreating: false,
                isDeleting: false,
                isFetching: false,
                isUpdating: false,
            };
        }

        switch (action.type) {
            case actionTypes.CREATE_START: {
                return {
                    ...state,
                    error: null,
                    isCreating: true,
                };
            }

            case actionTypes.CREATE_SUCCESS: {
                let items;

                // if payload contains a new item, add it!
                if (action.payload) {
                    if (isMode('map')) {
                        items = {
                            ...state.items,
                            [action.payload[key]]: action.payload,
                        };
                    } else {
                        items = [].concat([...state.items], action.payload);
                    }
                }

                return {
                    ...state,
                    error: null,
                    isCreating: false,
                    items,
                    updatedAt: (meta || {}).updatedAt,
                };
            }

            case actionTypes.CREATE_FAILURE: {
                return {
                    ...state,
                    error: true,
                };
            }

            case actionTypes.UPDATE_START: {
                return {
                    ...state,
                    error: null,
                    isUpdating: true,
                };
            }

            case actionTypes.UPDATE_SUCCESS: {
                let items = state.items;

                // if payload contains a new item, add it!
                if (action.payload) {
                    if (isMode('map')) {
                        items = {
                            ...state.items,
                            [action.payload[key]]: action.payload,
                        };
                    } else {
                        items = [...state.items];
                        const itemIndexToUpdate = items.findIndex(
                            (item) => item[key] === action.payload[key]
                        );
                        if (itemIndexToUpdate === -1) {
                            items = items.concat(action.payload);
                        } else {
                            items.splice(itemIndexToUpdate, 1, action.payload);
                        }
                    }
                }

                return {
                    ...state,
                    error: null,
                    isUpdating: false,
                    items,
                    updatedAt: (meta || {}).updatedAt,
                };
            }

            case actionTypes.FETCH_LIST_START:
            case actionTypes.FETCH_ITEM_START: {
                return {
                    ...state,
                    error: null,
                    isFetching: true,
                };
            }

            case actionTypes.FETCH_LIST_SUCCESS: {
                let items;
                if (isMode('map')) {
                    if (Array.isArray(action.payload)) {
                        // transform an array of items into a map, use `key` as identifier
                        items = {};
                        action.payload.forEach((item) => {
                            items[item[key]] = item;
                        });
                    } else {
                        // we expect the action.payload to be in the correct {[key]: object} form already
                        items = action.payload;
                    }
                } else {
                    if (Array.isArray(action.payload)) {
                        items = action.payload;
                    } else {
                        items = Object.values(items);
                    }
                }

                return {
                    ...state,
                    error: null,
                    items,
                    isFetching: false,
                    updatedAt: (meta || {}).updatedAt,
                };
            }

            case actionTypes.FETCH_ITEM_SUCCESS: {
                let items;

                // if payload contains a new item, add it!
                if (action.payload) {
                    if (isMode('map')) {
                        items = {
                            ...(state.items || {}),
                            [action.payload[key]]: action.payload,
                        };
                    } else {
                        items = [...state.items];
                        const itemIndexToUpdate = items.findIndex(
                            (item) => item[key] === action.payload[key]
                        );
                        if (itemIndexToUpdate === -1) {
                            items = items.concat(action.payload);
                        } else {
                            items.splice(itemIndexToUpdate, 1, action.payload);
                        }
                    }
                }

                return {
                    ...state,
                    error: null,
                    isUpdating: false,
                    items,
                    updatedAt: (meta || {}).updatedAt,
                };
            }

            case actionTypes.DELETE_START: {
                return {
                    ...state,
                    error: null,
                    isDeleting: true,
                };
            }

            case actionTypes.DELETE_SUCCESS: {
                // payload = entity id

                let items;

                if (isMode('map') && !Array.isArray(state.items)) {
                    items = { ...state.items };
                    delete items[action.payload];
                } else {
                    items = []
                        .concat(state.items)
                        .filter((item) => item && item[key] !== action.payload);
                }

                return {
                    ...state,
                    isDeleting: false,
                    items,
                    updatedAt: (meta || {}).updatedAt,
                };
            }

            default: {
                return state;
            }
        }
    };
};

export default createReducer;
