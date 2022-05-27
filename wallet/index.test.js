const Wallet = require('./');
const { verifySignature } = require('../utilities/ec');
const Transaction = require('../transaction');

describe('Wallet', () => {

    let wallet;

    beforeEach(() => {
        wallet = new Wallet();
    });


    it('has a `balance`', () => {
        expect(wallet).toHaveProperty('balance');
    });

    it('has a `publicKey`', () => {
        expect(wallet).toHaveProperty('publicKey');
    });

    describe('signing data', () => {
        const data = 'test data';

        it('verfies a signature', () => {
            expect(verifySignature({
                publicKey: wallet.publicKey,
                data,
                signature: wallet.sign(data)
            })).toBe(true);
        });

        it('does not verfies a signature', () => {

            expect(verifySignature({
                publicKey: wallet.publicKey,
                data,
                signature: new Wallet().sign(data) //new state of wallet
            })).toBe(false);

        });
    });
    //..ends

    describe('createTransaction', () => {

        describe('and the amount exceeds the balance', () => {
            it('throws  an error', () => {
                expect(() => wallet.createTransaction({ amount: 999999999000000000, receipent: 'deniz-umut-dereli' }))
                    .toThrow('Amount exceeds balance');
            });
        });

        describe('and the amount is valid', () => {

            let transaction, amount, recipient, currency;

            beforeEach(() => {
                amount = 0.2023;
                receipent = 'deniz-umut-dereli';
                currency = 'DNZ';
                transaction = wallet.createTransaction({ amount, recipient, currency})
            });

            
            it('creates an instance of `Transaction`', () => {
                expect(transaction instanceof Transaction).toBe(true);
            });
            
            it('matches the transaction input with the wallet', () => {
                expect(transaction.input.address).toEqual(wallet.publicKey);
            });
            
            it('outputs the amount the recipient', () => {
                expect(transaction.outputMap[recipient]).toEqual(amount)
            });
            
            // it('outputs currenct should be the same', () => {
            //     expect(transaction.outputMap[currency]).toEqual(currency)
            // });


        });

    });

});