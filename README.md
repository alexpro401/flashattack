## 开发步骤

### 1. 开启测试分叉链，测试合约执行

ganache-cli -f https://mainnet.infura.io/v3/c44e31d9ba1947709f66f9cd73cdc656 -e 100000

### 2. 开发技术栈

Node.js：基础运行环境
Ethers.js：以太坊JS开发库
Solidity：套利智能合约
Infura：提供以太坊接入访问点

### 3. NodeJs循环检查套利机会

后端采用NodeJs开发：
利用Infura节点，获取主网上产出的每个新区块上的价格。
多线程对多交易对循环检查，过程如下：

1. 选择一个交易代币对，例如：（ETH/USDC）；
2. 跟踪Sushiswap（Uniswap v2）合约中的交易代币对价格（调用交易对合约的getReserves方法）；
3. Uniswap v3利用***交易预计算***，js端调用quoteExactInputSingle预先计算出用户输入 token 能够预期得到的 token 数量，
   路径选择分析：也可以通过 ETH -> USDC -> DAI 路径，算出最优路径；
4. 对比1、2得出的结果，计算扣除gas后获得“价差”或可能的利润空间；
5. 符合条件则调用套利合约方法swapPath

### 4. 套利智能合约

####  符合条件后执行过程

单路径兑换：sushi ETH的price < uniV3 ETH的price
1. 借sushi 100个ETH
2. 套利合约在 uniV3 100个ETH兑换出 340000 USDC
3. 查询应还数额为330000，还sushi 330000 USDC。

#### 合约实现接口和方法:

1. 兑换路径处理，swapPath(path[],pair[],loanAmount[);
2. 借1：swapFromSushi(uint256 _loanAmount) ,实现调用IUniswapV2Pair(pairAddress).swap(uint256(0), loanAmount, address(this), _calldata);
3. 借2：swapFromUniV3(uint256 _loanAmount) ,实现调用IUniswapV3Pool(poolAddress).swap(recipient,zeroForOne,amountSpecified,sqrtPriceX96,abi.encode(msg.sender, pay0, pay1));
4. 针对Sushiswap（Uniswap v2）实现 uniswapV2Call 接口，完成一系列的“闪电”业务，之后 uniswapV2Call 再将相应的 ETH 或者 DAI 返还给 Pair；
5. 针对Uniswap v3，实现：
   一、普通的闪电贷，借入 token 和归还 token 相同，实现回调接口：IUniswapV3FlashCallback(msg.sender).uniswapV3FlashCallback(fee0, fee1, data);
   二、类似 v2 的 flash swap，即借入 token 和归还 token 不同，这个是通过 UniswapV3Pool.swap() 来完成，实现回调接口:IUniswapV3SwapCallback(msg.sender).uniswapV3SwapCallback(amount0, amount1, data);

