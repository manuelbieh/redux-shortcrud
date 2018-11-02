const mockClient = {
    get: (endpoint) => {
        const randomId = () => Math.round(Math.random() * 9999);
        // ends with a number/id, send single entity
        if (/\d$/.test(endpoint)) {
            return {
                id: Math.round(Math.random() * 9999),
            };
        }
        return [
            {
                id: randomId(),
                name: 'Alpha',
            },
            {
                id: randomId(),
                name: 'Beta',
            },
            {
                id: randomId(),
                name: 'Charlie',
            },
            {
                id: randomId(),
                name: 'Delta',
            },
        ];
    },

    post: (endpoint, data) => {
        return {
            ...data,
            createdAt: new Date(),
        };
    },

    put: (endpoint, data) => {
        return {
            ...data,
            updatedAt: new Date(),
        };
    },
};

export default mockClient;
