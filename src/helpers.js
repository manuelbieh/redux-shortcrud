const splitChars = [' ', '-', '_', '/'];

export const toCamelCase = (str) => {
    return str
        .split(new RegExp(`(${splitChars.join('|')})`))
        .filter((word) => !splitChars.includes(word))
        .map((word, index) => {
            return index === 0
                ? word.toLowerCase()
                : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join('');
};

export default {
    toCamelCase,
};
