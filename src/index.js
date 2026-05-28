require('dotenv').config();
const { connectBot } = require('./bot/connection');
const { connectDB } = require('./config/database');

async function main() {
  await connectDB();
  await connectBot();
}

main();
