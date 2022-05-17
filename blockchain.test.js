const Blockchain = require('./blockchain');
const Block = require('./block');

describe('Blockchain', () => {
    const blockchain = new Blockchain();

    it('contains a `chain` Array instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts with the genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis()); //first genesis block
    });

    it('add new block to chain', () => {
        const newBlock = 'cryptom';
        blockchain.addBlock({data: newBlock});

        expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newBlock); //last block added
    });

});