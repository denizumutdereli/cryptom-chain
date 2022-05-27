const Network = require('./network');
const Transaction = require('./');
const Wallet = require('../wallet');

describe('Network', () => {
    let transactionPool, transaction, senderWallet;

  beforeEach(() => {
    network = new Network();
    senderWallet = new Wallet();
    transaction = new Transaction({
      senderWallet,
      recipient: 'fake-recipient',
      amount: 50
    });
  });

    describe('setTransaction()', () => {
        it('adds a transaction', () => {
            network.setTransaction(transaction);

            expect(network.transactionMap[transaction.id]).toBe(transaction)
        });

    });

    describe('existingTransaction()', () => {
        it('returns an existing transaction given an input address', () => {
            network.setTransaction(transaction);
    
          expect(
            network.existingTransaction({ inputAddress: senderWallet.publicKey })
          ).toBe(transaction);
        });
      });

});
