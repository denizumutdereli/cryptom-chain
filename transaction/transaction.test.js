const Transaction = require('./');
const Wallet = require('../wallet');
const { verifySignature } = require('../utilities/ec');


describe('Transaction', () => {
    let transaction, senderWallet, recipient, token, amount;

    beforeEach(() => {
        senderWallet = new Wallet();
        received = 'receipent-publicKey';
        amount = 100;
        currency = 'DNZ';

        transaction = new Transaction({ senderWallet, recipient, amount, currency });
    });

    it('has an `ID`', () => {
        expect(transaction).toHaveProperty('ID');
    });

    describe('outputMap', () => {
        it('has an `outputMap`', () => {
            expect(transaction).toHaveProperty('outputMap');
        });

        it('outputs the amount to the recipient', () => {
            expect(transaction.outputMap[recipient]).toEqual(amount);
        });

        it('outputs the remaining balance for the `senderWallet`', () => {
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount);
        });
    });

    describe('input', () => {
        it('has an `input`', () => {
            expect(transaction).toHaveProperty('input');
        });

        it('has a `timestamp`', () => {
            expect(transaction.input).toHaveProperty('timestamp');
        });

        it('sets the `amount` to the `senderWallet balance`', () => {
            expect(transaction.input.amount).toEqual(senderWallet.balance);
        });

        it('sets the `address` to the `senderWallet.publicKey`', () => {
            expect(transaction.input.address).toEqual(senderWallet.publicKey);
        });

        it('signs the input', () => {
            expect(verifySignature({
                publicKey: senderWallet.publicKey,
                data: transaction.outputMap,
                signature: transaction.input.signature
            })).toBe(true);            
        });

    });

});