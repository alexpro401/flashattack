var log4js = require('log4js');
const logger = log4js.getLogger('common.js');
const got = require('got');
const path = require('path');
const fs = require('fs');

logger.level = 'debug';
// 超时时间为10s
const timeouts = 20000;
var self = (module.exports = {
  /**
   * 休眠
   * @param {*} ms 毫秒
   */
  sleep: (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
  logger: (fileName) => {
    log4js.configure({
      appenders: {
        datafileout: {
          type: 'dateFile',
          filename: 'out.log',
          pattern: '.yyyy-MM-dd',
        },
        consoleout: { type: 'console' },
      },
      categories: {
        default: { appenders: ['datafileout', 'consoleout'], level: 'debug' },
        anything: { appenders: ['consoleout'], level: 'debug' },
      },
    });
    var logger = log4js.getLogger(fileName);
    logger.level = 'debug';
    return logger;
  },
  /**
   * 根据合约地址获取合约的ABI
   * @param {*} contractAddress
   * @param {*} chain
   */
  getAbi: (contractAddress, chain) => {
    return new Promise((resolve, reject) => {
      if (contractAddress) {
        const url = getAbiUrl(contractAddress, chain);
        let send = got(buildGETOptions(url));
        send
          .then((response) => {
            if (response.statusCode == 200) {
              const data = response.body;
              let real = '';
              // 判断是否为JSON对象
              if (isJsonObject(data)) {
                real = response.body;
              } else {
                real = JSON.parse(response.body);
              }

              if (real.status === '1') {
                const result = real.result;
                let contractABI = '';
                // 判断是否为JSON对象
                if (isJsonObject(result)) {
                  contractABI = result;
                } else {
                  contractABI = JSON.parse(result);
                }
                resolve(contractABI);
              } else if (real.status === '0') {
                reject(new Error('Contract source code not verified'));
              } else {
                reject(new Error('No Contract source code provide'));
              }
            } else {
              reject(response.statusMessage);
            }
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        reject(new Error('No Contract Address'));
      }
    });
  },

  /**
   * 获取默认ABI
   * @param {*} contractType
   * @returns
   */
  getDefaultAbi: (contractType) => {
    return new Promise((resolve, reject) => {
      if (contractType == 'ERC20') {
        const filepath = path.resolve(__dirname, '../abis/erc20.json');
        fs.readFile(filepath, 'utf-8', function (err, data) {
          if (err) {
            console.error(err);
            reject(error);
          } else {
            // logger.info(data);
            resolve(JSON.parse(data));
          }
        });
      }
    });
  },

  /**
   * 构建 GET 请求
   * @param {*} url
   * @returns
   */
  GETOptions: (url) => {
    return buildGETOptions(url);
  },

  /**
   * 构建 POST 请求
   * @param {*} url
   * @param {*} params
   * @returns
   */
  POSTOptions: (url, params) => {
    return buildPOSTOptions(url, params);
  },

  /**
   * 获取区块浏览器 host 和 apiKey
   * @param {*} chain
   * @param {*} callback
   */
  getScanInfo: (chain, callback) => {
    getScan(chain, callback);
  },

  /*
   * @Description: 生成不重复ID
   * @param: precision 精度 100 1000 10000
   * @return:
   */
  getNumberUid: (precision) => {
    const rawPre = (Date.now() - new Date(1624206802955).getTime()) / precision;
    const preNumber = Number(rawPre.toFixed()) * precision;
    const randam = Math.floor(Math.random() * precision);
    return preNumber + randam;
  },

  trim: (str) => {
    if (str == null || typeof str == 'undefined') {
      return '';
    }
    return str.replace(/(^\s*)|(\s*$)/g, '');
  },
  /**
   * 是否为空字符串，全空格也是空字符串
   * @param str
   * @returns {Boolean}
   */
  isBlank: (str) => {
    if (str == null || typeof str == 'undefined' || str == '' || self.trim(str) == '') {
      return true;
    }
    return false;
  },
  //判断字符是否为空的方法
  isEmpty: (obj) => {
    if (typeof obj == 'undefined' || obj == null || obj == '') {
      return true;
    } else {
      return false;
    }
  },
});

/**
 * 构建 GET 请求
 * @param {*} url
 * @returns
 */
function buildGETOptions(url) {
  let options = {
    url: url,
    method: 'GET',
    responseType: 'json',
    timeout: timeouts,
  };
  return options;
}

/**
 * 构建 POST 请求
 * @param {*} url
 * @param {*} params
 */
function buildPOSTOptions(url, params) {
  let options = {
    url: url,
    method: 'POST',
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
    responseType: 'json',
    timeout: timeouts,
    json: params,
  };
  return options;
}

/**
 * 获取不同链的api节点
 * @param {*} chain
 * @param {*} callback
 */
function getScan(chain, callback) {
  let server = '';
  let apiKeyToken = '';
  if (chain === 'BSC') {
    // 币安
    server = 'api.bscscan.com';
    // Binance Smart Chain 的 API KEY
    apiKeyToken = 'VBYEJPX3IB7M58JVNDDJZYB9N8NWK939HA';
  } else if (chain === 'BSCTestnet') {
    server = 'api-testnet.bscscan.com';
    apiKeyToken = 'VBYEJPX3IB7M58JVNDDJZYB9N8NWK939HA';
  } else if (chain === 'Ethereum') {
    server = 'api.etherscan.io';
    // Etherscan 的 API KEY
    apiKeyToken = 'X5RFYDCGE1H23YSKBEZE6GIVPXGBSXGGE1';
  } else if (chain === 'Polygon') {
    server = 'api.polygonscan.com';
    // Etherscan 的 API KEY
    apiKeyToken = 'ICJVDA8H871GADXRMGM78G8STB4CUE4V8K';
  }
  callback(server, apiKeyToken);
}

/**
 * 获取请求合约abi的地址
 * @param {*} contractAddress
 * @param {*} chain
 * @returns
 */
function getAbiUrl(contractAddress, chain) {
  let server = '';
  let apiKey = '';
  getScan(chain, function (data1, data2) {
    server = data1;
    apiKey = data2;
  });
  const url = 'https://' + server + '/api?module=contract&action=getabi&address=' + contractAddress + '&apikey=' + apiKey;
  return url;
}

/**
 * 是否为json对象
 * @param {*} data
 */
function isJsonObject(data) {
  const isjson = typeof data === 'object' && Object.prototype.toString.call(data).toLowerCase() == '[object object]' && !data.length;
  return isjson;
}
