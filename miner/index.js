class Miner {

    constructor({blockchain, network, wallet, wmnode}){
        this.blockchain = blockchain;
        this.network = network;
        this.wallet = wallet;
        this.wmnode = wmnode;

    }

    mineTransactions() {
        //get the network pool's valid transactions

        //generate the miner's reward

        //add a block consisting of these transactions to thhe blockchain

        //broadcast the updated blockchain

        //clear the network pool

    }
}

module.exports = Miner;