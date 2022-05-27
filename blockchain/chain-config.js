const MINE_RATE = 3000; //2second
const INITIAL_DIFFICULTY = 4;
const MINING_REWARD = 50;

const GENESIS_DATA = {
    timestamp: 1,
    lastHash: '------',
    hash: 'hash-one',
    difficulty: INITIAL_DIFFICULTY,
    nonce: 0,
    data: []
};

const STARTING_BALANCE = 1000;

module.exports = { GENESIS_DATA, MINE_RATE, STARTING_BALANCE, MINING_REWARD };