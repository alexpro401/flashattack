const HDWalletProvider = require('@truffle/hdwallet-provider');
// const fs = require('fs');
// const mnemonic = fs.readFileSync(".secret").toString().trim();
const mnemonic='mystery ability drama member retire trial slab violin novel limit useless morning';
const test_key="fabb8d7c49f4275978a82042bf54009bd78299ae2c8ee8a4c593adecda4a0f25";
const main_key="e6eafdfc25a338e4d43f60e127d48ed50a088ad8f4e330930be74080383a7f90";

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard BSC port (default: none)
      network_id: "*",       // Any network (default: none)
    },
    testnet: {
      provider: () => new HDWalletProvider(test_key,"https://data-seed-prebsc-1-s1.binance.org:8545"),
      network_id: 97,
      confirmations: 2,
      timeoutBlocks: 200,
      timeoutBlocks: 50000,
      networkCheckTimeout: 1000000,
      gas: 5000000,
      skipDryRun: false
    },
    bsc: {
      provider: () => new HDWalletProvider(main_key,"https://bsc-dataseed1.binance.org"),
      network_id: 56,
      confirmations: 20,
      timeoutBlocks: 200,
      skipDryRun: true
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "^0.8.0", // A version or constraint - Ex. "^0.5.0"
    }
  }
}