const Block = require('./block.js');
const { GENESIS_DATA } = require('./config.js');
const cryptoHash = require('./crypto-hash');

describe('Block', () => {
    const timestamp = 'a-data';
    const lastHash = 'foo-hash';
    const hash = 'bar-hash';
    const data = ['blockchain', 'data'];
    const nonce = 1;
    const difficulty = 1;
    const block = new Block({
        timestamp,
        lastHash,
        hash,
        data,
        nonce,
        difficulty
    });

    it('has a timestamp, lastHash, hash and data propoerty', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);
    });

    //genesis block
    describe('genesis()', () => {
        const genesisBlock = Block.genesis();

        //console.log('genesisBlock:', genesisBlock);

        it('returns a Block instance', () => {
            expect(genesisBlock instanceof Block).toBe(true);
        });

        it('returns a Block data', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });

    });
    //..ends

    //miner block
    describe('mineBlock()', () => {
        const lastBlock = Block.genesis();
        const data = 'mined data';
        const minedBlock = Block.mineBlock({ lastBlock, data });

        it('returns a Block instance', () => {
            expect(minedBlock instanceof Block).toBe(true); //not mineblock it minedBlock :)
        });

        it('sets the `lastHash` to be the `hash` of the block', () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash); //not mineblock it minedBlock :)
        });

        it('sets the `data`', () => {
            expect(minedBlock.data).toEqual(data);
        });

        it('sets the `timestamp`', () => {
            expect(minedBlock.timestamp).not.toEqual(undefined);
        });

        it('creates a SHA256 `hash` based on the proper inputs', () => {
            expect(minedBlock.hash).toEqual(
                cryptoHash(
                    minedBlock.timestamp,
                    lastBlock.hash,
                    minedBlock.nonce,
                    minedBlock.difficulty,
                    data
                )
            );
        });

        it('test if `hash` that matches the difficulty of the block', () => {
            expect(minedBlock.hash.substring(0, minedBlock.difficulty))
                .toEqual('0'.repeat(minedBlock.difficulty));
        });
    });
    //..ends

});