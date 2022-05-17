const cryptoHash = require('./crypto-hash');

describe('cryptoHash()', () => {

    //google: SHA-256 algorithm
    const hashedString = 'ec062b6c3ab9ca67d9bc6008d9df3b01f73a848bfbe91e9c9cb0ce995fc033b0'

    it('generates a SHA-256 hash', () => {
        expect(cryptoHash('cryptom')).toEqual(hashedString)
    });

    it('produces the same hash with the same input argument in any order', () => {
        expect(cryptoHash('one', 'two', 'three')).toEqual(cryptoHash('one', 'two', 'three'));
    })

});