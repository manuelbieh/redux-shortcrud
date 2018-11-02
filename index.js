// @flow
// import axios from 'axios';

// import mockClient from './mockClient';
import createActionCreators from './src/createActionCreators';
import createActionTypes from './src/createActionTypes';
import createReducer from './src/createReducer';

type ConfigT = {
    actions?: {|
        CREATE?: string,
        FETCH_LIST?: string,
        FETCH_ITEM?: string,
        UPDATE?: string,
        EDIT?: string,
        DELETE?: string,
    |},
    endpoint?: string,
    initialState?: {
        isCreating: boolean,
        isDeleting: boolean,
        isFetching: boolean,
        isUpdating: boolean,
        items: { [string]: any } | Array<{ [string]: any }>,
    },
    key: string,
    mode?: 'list' | 'map',
};

export const crudFor = (entity: string, config: ConfigT = { key: 'id' }) => {
    const defaults: ConfigT = {
        endpoint: `/${entity}`,
        mode: 'list',
        key: 'id',
        actions: {
            // POST
            CREATE: 'create',
            // GET (all entities)
            FETCH_LIST: 'fetch-list',
            // GET (one specific item)
            FETCH_ITEM: 'fetch-item',
            // PUT
            UPDATE: 'update',
            // PATCH (not yet implemented)
            EDIT: 'edit',
            // DELETE
            DELETE: 'delete',
        },
    };

    config = { ...defaults, ...config };

    const actionTypes = createActionTypes({ entity, config });

    const reducer = createReducer({ actionTypes, config });

    const actionCreators = createActionCreators({ actionTypes, config });

    return {
        actionCreators,
        actionTypes,
        reducer,
    };
};

const cowsCrud = crudFor('cows', {
    // client: Client,
    key: 'id',
    mode: 'map',
    // initialState: {
    //     items: [
    //         { id: 25, name: 'foo' },
    //         { id: 26, name: 'bar' },
    //         { id: 29, name: 'bla' },
    //     ],
    //     details: {
    //         77: 'foo',
    //         78: 'bar',
    //     },
    // },
});

// console.log(cowsCrud.actionCreators.updateSuccess({ id: 28, name: 'Hubert' }));
//
// let state = cowsCrud.reducer();
//
// console.log(state);
//
// state = cowsCrud.reducer(
//     state,
//     cowsCrud.actionCreators.fetchListSuccess([
//         { id: 25, name: 'foo' },
//         { id: 26, name: 'barrrrr' },
//         { id: 29, name: 'bla' },
//     ])
// );
//
// state = cowsCrud.reducer(
//     state,
//     cowsCrud.actionCreators.fetchItemSuccess({ id: 30, name: 'manuel' })
// );
//
// state = cowsCrud.reducer(
//     state,
//     cowsCrud.actionCreators.updateSuccess({ id: 28, name: 'Hubert' })
// );
//
// console.log(state);
//
// state = cowsCrud.reducer(
//     state,
//     cowsCrud.actionCreators.updateSuccess({ id: 29, name: 'dörthe' })
// );
//
// state = cowsCrud.reducer(state, cowsCrud.actionCreators.deleteSuccess(28));
//
// console.log(state);

export default crudFor;

// console.log(
//     // cowsCrud.reducer(null, {
//     //     type: 'cows/create/success',
//     //     payload: { id: 27, name: 'dörthe' },
//     // })
//     cowsCrud.reducer(
//         null,
//         cowsCrud.actionCreators.updateSuccess({ id: 28, name: 'Hubert' })
//     )
// );

// const Actions = {
//     create: (data) => {
//         client.post(config.endpoint, data);
//     },
//     fetchAll: () => {
//         client.get(config.endpoint);
//     },
//     fetchById: (id) => {
//         client.get(`${config.endpoint}/${id}`);
//     },
//     update: (id, data) => {
//         client.put(`${config.endpoint}/${id}`, data);
//     },
//     delete: (id) => {
//         client.delete(`${config.endpoint}/${id}`);
//     },
// };

// GET /cows
// POST /cows ({})
// PUT /cows/:id (id, {})
// PATCH /cows/:id (id, {})
// DELETE /cows/:id (id)

// fetchById('id');
// fetchAll();

// const reducer = {
//     items: [],
//     details: {
//         12345: {
//             updatedAt: 123131231321,
//             data: {},
//         },
//         34545: {
//             updatedAt: 34534,
//             data: {},
//         },
//     },
// };
