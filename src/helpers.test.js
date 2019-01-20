import { toCamelCase } from './helpers';

describe('Helpers', () => {
    describe('toCamelCase', () => {
        it('converts a string to camelCase', () => {
            expect(toCamelCase('first SECOND third')).toEqual(
                'firstSecondThird'
            );
            expect(toCamelCase('first-SECOND-third')).toEqual(
                'firstSecondThird'
            );
            expect(toCamelCase('first_SECOND_third')).toEqual(
                'firstSecondThird'
            );
            expect(toCamelCase('first/SECOND/third')).toEqual(
                'firstSecondThird'
            );
            expect(toCamelCase('first-SECOND_third')).toEqual(
                'firstSecondThird'
            );
        });

        it('can be configured using a second argument', () => {
            expect(
                toCamelCase('first.SECOND.third', { splitChars: ['.'] })
            ).toEqual('firstSecondThird');
        });
    });
});
