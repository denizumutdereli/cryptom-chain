const Block = require('./block');
const { cryptoHash } = require('../utilities/ec');

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock({ data }) {
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length - 1],
            data
        });

        this.chain.push(newBlock);


        //console.log(this.chain)
    }

    static isValidChain(chain) {
        //TBC for the other checks
        //info: javascript objs can not be equal

        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) { return false; }

        for (let i = 1; i < chain.length; i++) {
            const { timestamp, lastHash, hash, data, nonce, difficulty } = chain[i];

            const actualLastHash = chain[i - 1].hash;

            const lastDifficulty = chain[i - 1].difficulty

            if (lastHash !== actualLastHash) { return false; }

            const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);

            if (hash !== validatedHash) { return false; }

            if ((Math.abs(lastDifficulty - difficulty)) > 2) { return false; } //max difficulty change fixed to 2 zeros
        }

        return true;
    }

    replaceChain(chain) {

        //chain = JSON.parse(chain);

        //console.log(chain[0])

        if (chain.length <= this.chain.length) {
            console.error('The incoming chain must be longer');
            return;
        }

        if (!Blockchain.isValidChain(chain)) {
            console.error('The incoming chain must be valid');
            return;
        }

        console.log('replacing chain with', chain);
        this.chain = chain;
    }
}

module.exports = Blockchain;