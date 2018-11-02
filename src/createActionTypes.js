const createActionTypes = ({ entity, config }) => {
    const { actions } = config;

    return Object.freeze(
        Object.entries(actions).reduce((acc, [action, value]) => {
            acc[`${action}_START`] = `${entity}/${value}/start`;
            acc[`${action}_SUCCESS`] = `${entity}/${value}/success`;
            acc[`${action}_FAILURE`] = `${entity}/${value}/failure`;
            return acc;
        }, {})
    );
};

export default createActionTypes;
