const Blockchain = require('.');
const Block = require('./block');
const { cryptoHash } = require('../utilities/ec');

describe('Blockchain', () => {
    let blockchain, nodeChain, originalChain;

    beforeEach(() => {
        blockchain = new Blockchain();
        nodeChain = new Blockchain(); //sync blockchain

        originalChain = blockchain.chain;
    });

    it('contains a `chain` Array instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts with the genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis()); //first genesis block
    });

    it('add new block to chain', () => {
        const newBlock = 'cryptom';
        blockchain.addBlock({ data: newBlock });

        expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newBlock); //last block added
    });

    //block validation
    describe('isValidChain', () => {

        describe('when the chain doenst starts with the genesis block', () => {
            it('returns false', () => {
                blockchain.chain[0] = { data: 'invalid-genesis' }
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('when the chain starts with the genesis block and has multiple blocks', () => {

            beforeEach(() => {
                blockchain.addBlock({ data: 'deniz' });
                blockchain.addBlock({ data: 'umut' });
                blockchain.addBlock({ data: 'dereli' });
            });

            describe('and a lastHash reference has changed', () => {
                it('returns false', () => {
                    blockchain.chain[2].lastHash = { data: 'wrong-lastHash' }; //it should be 'dereli' instead
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains a block with an invalid field', () => {
                it('returns false', () => {
                    blockchain.chain[2].data = 'wrong-data'; //assume wrong fields of the data
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain does not contain any invalid blocks', () => {
                it('returns true', () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);

                });
            });

            describe('difficulty volatility jumps', () => {
                it('return false', () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length - 1];
                    const lastHash = lastBlock.hash;
                    const timestamp = Date.now();
                    const nonce = 0;
                    const data = [];
                    const difficulty = lastBlock.difficulty - 3;
                    const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);
                    const badBlock = new Block({timestamp, lastHash, hash, nonce, difficulty, data});

                    blockchain.chain.push(badBlock);

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });
        });

        describe('replaceChain()', () => { });
    });
    //..ends

    //Blockchain sync and replacements checks
    describe('replaceChain()', () => {

        let errorMock, logMock;

        beforeEach(() => {
            errorMock = jest.fn();
            logMock = jest.fn();

            global.console.error = errorMock;
            global.console.log = logMock;
        });

        describe('when the new chain is NOT LONGER', () => {

            beforeEach(() => {
                nodeChain.chain[0] = { new: 'chain' }
                blockchain.replaceChain(nodeChain.chain);
            });

            it('it does not replace the chain', () => {
                expect(blockchain.chain).toEqual(originalChain);
            });

            it('logs an error', () => {
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('when the new chain is LONGER', () => {

            beforeEach(() => {
                nodeChain.addBlock({ data: 'deniz' });
                nodeChain.addBlock({ data: 'umut' });
                nodeChain.addBlock({ data: 'dereli' });
            });

            describe('and the chain is INVALID', () => {

                beforeEach(() => {
                    nodeChain.chain[2].hash = 'different than dereli';
                    blockchain.replaceChain(nodeChain.chain);
                });

                it('does not replace the chain', () => {
                    expect(blockchain.chain).toEqual(originalChain);
                });

                it('logs an error', () => {
                    expect(errorMock).toHaveBeenCalled();
                });
            });
            describe('and the chain is VALID', () => {

                beforeEach(() => {
                    blockchain.replaceChain(nodeChain.chain);
                });

                it('replaces the chain', () => {
                    expect(blockchain.chain).toEqual(nodeChain.chain);
                });

                it('logs about the chain replacement', () => {
                    expect(logMock).toHaveBeenCalled();
                });
            });
        });

    });

});