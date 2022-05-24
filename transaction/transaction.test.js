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

        it('outputs of the amount should be absoulte value or equal to 0', () => {
            expect(Math.ceil(transaction.outputMap[recipient])).toBeGreaterThanOrEqual(0)
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
    //..ends

    describe('validTransaction()', () => {

        let errorMock, logMock;

        beforeEach(() => {
            errorMock = jest.fn();
            //logMock = jest.fn();

            global.console.error = errorMock;
            //global.console.log = logMock;
        });

        describe('when the transaction is valid', () => {
            it('returns true', () => {
                expect(Transaction.validTransaction(transaction)).toBe(true);
            });
        });

        describe('when the transaction is NOT vvalid', () => {
            describe('and a transaction output is NOT valid', () => {
                it('returns false and logs an error', () => {
                    transaction.outputMap[senderWallet.publicKey] = 999999999000000000000000000;
                    expect(Transaction.validTransaction(transaction)).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('and the transaction input signature is NOT valid', () => {
                it('returns false and log an error', () => {
                    transaction.input.signature = new Wallet().sign('data');
                    expect(Transaction.validTransaction(transaction)).toBe(false)
                });
            });
        });
    });
    //..ends

    describe('update()', () => {

        let originalSignature, originalSenderOutput, nextRecipient, nextAmount, nextCurrency;


        describe('and the transaction is invalid', () => {
            it('throws an error', () => {
                expect(() => {
                    transaction.update({ senderWallet, recipient: 'deniz', amount: 9999990000, currency: 'DNZ' })
                }).toThrow('Amount exceeds the balance');
            });
        });

        describe('and the amount is valid', () => {

            beforeEach(() => {
                originalSignature = transaction.input.signature;
                originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
                nextRecipient = 'kuzey deniz dereli'
                nextAmount = 0.2016;
                nextCurrency = 'DNZ';

                transaction.update({ senderWallet, recipient: nextRecipient, amount: nextAmount, currency: nextCurrency });
            });

            it('outputs the amount to the next recipient', () => {
                expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount);
            });

            it('subtracts the amount from the the original sender output amount', () => {
                expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - nextAmount);
            });

            it('maintain a total output that matches the input amount', () => {
                expect(Object.values(transaction.outputMap).reduce((total, outputAmount) => total + outputAmount))
                    .toEqual(transaction.input.amount)
            });

            it('re-signs the transaction', () => {
                expect(transaction.input.signature).not.toEqual(originalSignature);
            });
            //.ends

            describe('and another update for the same recipient', () => {
                let addedAmount;

                beforeEach(() => {
                    addedAmount = 0.15;
                    transaction.update({
                        senderWallet, recipient: nextRecipient, amount: addedAmount, currency: nextCurrency
                    });
                });

                it('adds to the recipient amount', () => {
                    expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount + addedAmount);
                });

                it('subtracts the amount from the original sender output amount', () => {
                    expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - nextAmount - addedAmount)
                });

            });

        });
    });
});