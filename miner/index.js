const Transaction = require('../transaction');

class Miner {

    constructor({ blockchain, network, wallet, wmnode }) {
        this.blockchain = blockchain;
        this.network = network;
        this.wallet = wallet;
        this.wmnode = wmnode;
    }

    mineTransactions() {
        //get the network pool's valid transactions
        const validTransactions = this.network.validTransactions();

        //generate the miner's reward
        validTransactions.push(Transaction.rewardTransaction({ minerWallet: this.wallet }));

        //add a block consisting of these transactions to thhe blockchain
        this.blockchain.addBlock({ data: validTransactions });

        //broadcast the updated blockchain
        this.wmnode.broadcastChain();

        //clear the network pool
        this.network.clear();

    }
}

module.exports = Miner;