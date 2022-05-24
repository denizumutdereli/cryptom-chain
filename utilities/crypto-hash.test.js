const cryptoHash = require('./crypto-hash');

describe('cryptoHash()', () => {

    //google: SHA-256 algorithm -> "cryptom"   -> with ""
    const hashedString = 'c5b51ed4d68a569c5085a682282db2e44390fe9851349c424af8f902f1d24d75'

    it('generates a SHA-256 hash', () => {
        expect(cryptoHash('cryptom')).toEqual(hashedString)
    });

    it('produces the same hash with the same input argument in any order', () => {
        expect(cryptoHash('one', 'two', 'three')).toEqual(cryptoHash('one', 'two', 'three'));
    });

    it('produces a unique hash when the propoerties have changed on an input', () => {
        const test = {}
        const originalHash = cryptoHash(test);
        test['deniz'] = 1;

        expect(cryptoHash(test)).not.toEqual(originalHash);
    });

});