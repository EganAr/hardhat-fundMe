import { network } from "hardhat";
import { developmentChains } from "../helper-hardhat-config";
import { networkConfig } from "../helper-hardhat-config";
import { getNamedAccounts, deployments } from "hardhat";
import { verify } from "../utils/verify";
export default async function deployFundMe() {
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    const usdEthAggregator = await get("MockV3Aggregator");
    ethUsdPriceFeedAddress = usdEthAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId as number]?.ethUsdPriceFeed;
    if (!ethUsdPriceFeedAddress) {
      throw new Error(`No ethUsdPriceFeed address found for chain ${chainId}`);
    }
  }
  console.log("ethUsdPriceFeedAddress", ethUsdPriceFeedAddress);

  const args = [ethUsdPriceFeedAddress];
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args,
    log: true,
  });

  if (!developmentChains.includes(network.name)) {
    await verify(fundMe.address, args);
  }
}

deployFundMe.tags = ["all", "fundMe"];
