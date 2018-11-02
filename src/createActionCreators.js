import { toCamelCase } from './helpers';

const createActionCreators = ({ actionTypes, config: { actions } }) => {
    const ActionCreators = {};

    Object.entries(actions).forEach(([action]) => {
        ActionCreators[toCamelCase(`${action}_START`)] = () => ({
            type: actionTypes[`${action}_START`],
        });

        ActionCreators[toCamelCase(`${action}_SUCCESS`)] = (
            payload,
            meta = {}
        ) => ({
            type: actionTypes[`${action}_SUCCESS`],
            payload: payload,
            meta: {
                updatedAt: new Date(),
                ...meta,
            },
        });

        ActionCreators[toCamelCase(`${action}_FAILURE`)] = (error) => ({
            type: actionTypes[`${action}_FAILURE`],
            error: true,
            payload: error,
        });
    });

    return ActionCreators;
};

export default createActionCreators;
