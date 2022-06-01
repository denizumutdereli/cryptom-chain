const Wallet = require('./');
const { verifySignature } = require('../utilities/ec');
const Transaction = require('../transaction');
const Blockchain = require('../blockchain');
const { STARTING_BALANCE } = require('../blockchain/chain-config');

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

    //createTransaction
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
                transaction = wallet.createTransaction({ amount, recipient, currency })
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

        describe('and a chain is passed in', () => {
            it('calls  `Wallet.calculateBalance`', () => {
                const calculateBalanceMock = jest.fn();

                const originalCalculateBalance = Wallet.calculateBalance;

                Wallet.calculateBalance = calculateBalanceMock;

                wallet.createTransaction({
                    chain: new Blockchain().chain
                });

                expect(calculateBalanceMock).toHaveBeenCalled();

                Wallet.calculateBalance = originalCalculateBalance;

            });
        });

    });
    //..ends

    //calculateBalance
    describe('calculateBalance()', () => {
        let blockchain;

        beforeEach(() => {
            blockchain = new Blockchain();
        });

        describe('and there are no outputs fro the wallet', () => {
            it('returns the `STARTING_BALANCE`', () => {
                expect(Wallet.calculateBalance({
                    chain: blockchain.chain,
                    address: wallet.publicKey
                })).toEqual(STARTING_BALANCE);
            });
        });

        describe('and there outputs for the wallet', () => {
            let transactionOne, transactionTwo;

            beforeEach(() => {
                transactionOne = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount: 50
                });

                transactionTwo = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount: 60
                });

                blockchain.addBlock({ data: [transactionOne, transactionTwo] });
            });

            it('adds the sum of all outputs to the wallet balance', () => {
                expect(
                  Wallet.calculateBalance({
                    chain: blockchain.chain,
                    address: wallet.publicKey
                  })
                ).toEqual(
                  STARTING_BALANCE +
                  transactionOne.outputMap[wallet.publicKey] +
                  transactionTwo.outputMap[wallet.publicKey]
                );
              });

            describe('and the wallet has made a transaction', () => {
                let recentTransaction;

                beforeEach(() => {
                    recentTransaction = wallet.createTransaction({
                        recipient: 'deniz',
                        amount: 45
                    });
                    blockchain.addBlock({ data: [recentTransaction] });
                });

                it('return the output amount of the recent transaction', () => {
                    expect(
                        Wallet.calculateBalance({
                            chain: blockchain.chain,
                            address: wallet.publicKey
                        })
                    ).toEqual(recentTransaction.outputMap[wallet.publicKey]);
                });

                describe('and there are outputs next to and after the recent transaction', () => {
                    let sameBlockTransaction, nextBlockTransaction;

                    beforeEach(() => {
                        recentTransaction = wallet.createTransaction({
                            recipient: 'kuzey',
                            amount: 50
                        });

                        sameBlockTransaction = Transaction.rewardTransaction({
                            minerWallet: wallet
                        });

                        blockchain.addBlock({ data: [recentTransaction, sameBlockTransaction] })


                        nextBlockTransaction = new Wallet().createTransaction({
                            recipient: wallet.publicKey,
                            amount: 200
                        });

                        blockchain.addBlock({ data: [nextBlockTransaction] })

                    });

                    it('includes the output amount amount in the returned balance', () => {
                        expect(Wallet.calculateBalance({
                            chain: blockchain.chain,
                            address: wallet.publicKey
                        })).toEqual(
                            recentTransaction.outputMap[wallet.publicKey] +
                            sameBlockTransaction.outputMap[wallet.publicKey] +
                            nextBlockTransaction.outputMap[wallet.publicKey]
                        );
                    });

                });


            });
        });

    });
    //..ends



});