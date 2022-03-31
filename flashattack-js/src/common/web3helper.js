const Web3 = require('web3');

module.exports = {
  getWeb3HttpProvider: (providerUrl) => {
    return new Web3.providers.HttpProvider(providerUrl);
  },
};
