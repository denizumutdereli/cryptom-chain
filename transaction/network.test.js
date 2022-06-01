const Network = require('./network');
const Transaction = require('./');
const Wallet = require('../wallet');
const Blockchain = require('../blockchain');

describe('Network', () => {
  let network, transaction, senderWallet;

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

      expect(network.transactionMap[transaction.id])
        .toBe(transaction);
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

  describe('validTransactions()', () => {
    let validTransactions, errorMock;

    beforeEach(() => {
      validTransactions = [];
      errorMock = jest.fn();
      global.console.error = errorMock;

      for (let i=0; i<10; i++) {
        transaction = new Transaction({
          senderWallet,
          recipient: 'any-recipient',
          amount: 30
        });

        if (i%3===0) {
          transaction.input.amount = 999999;
        } else if (i%3===1) {
          transaction.input.signature = new Wallet().sign('foo');
        } else {
          validTransactions.push(transaction);
        }

        network.setTransaction(transaction);
      }
    });

    it('returns valid transaction', () => {
      expect(network.validTransactions()).toEqual(validTransactions);
    });

    it('logs errors for the invalid transactions', () => {
      network.validTransactions();
      expect(errorMock).toHaveBeenCalled();
    });
  });

  describe('clear()', () => {
    it('clears the transactions', () => {
      network.clear();

      expect(network.transactionMap).toEqual({});
    });
  });

  describe('clearBlockchainTransactions()', () => {
    it('clears the pool of any existing blockchain transactions', () => {
      const blockchain = new Blockchain();
      const expectedTransactionMap = {};

      for (let i=0; i<6; i++) {
        const transaction = new Wallet().createTransaction({
          recipient: 'deniz', amount: 40
        });

        network.setTransaction(transaction);

        if (i%2===0) {
          blockchain.addBlock({ data: [transaction] })
        } else {
          expectedTransactionMap[transaction.id] = transaction;
        }
      }

      network.clearBlockchainTransactions({ chain: blockchain.chain });

      expect(network.transactionMap).toEqual(expectedTransactionMap);
    });
  });
});