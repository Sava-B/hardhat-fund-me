// import
// X main function
// X calling main

// function deployFunc() {
//     console.log("hi");
// }

// module.exports.default = deployFunc;

const {
    networkconfig,
    developmentChains,
    networkConfig,
} = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async (hre) => {
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log, get } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    // const ethUsdPriceFeedAddress = networkconfig[chainId]["ethUsdPriceFeed"];
    let ethUsdPriceFeedAddress;
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }

    // if contract doesn't exist, we deploy a minimal version for local testing

    // when going for localhost or hardhat network we want to use a mock
    const verifyArgs = [ethUsdPriceFeedAddress];
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: verifyArgs, // put pricefeed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, verifyArgs);
    }
    log("-----------------------------------------");
};

module.exports.tags = ["all", "fundme"];
