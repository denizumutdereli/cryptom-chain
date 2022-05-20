const Producer = require('./Producer');
const Consumer = require('./Consumer');


const clientId = "kafka-client";
const brokers = ["localhost:9092"];
const groupId = "miner";
const channel = "TEST";

const producer = Producer(clientId, brokers, channel);
const consumer = Consumer(clientId, brokers, groupId, channel);