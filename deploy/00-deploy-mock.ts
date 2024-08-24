import { network } from "hardhat";
import {
  developmentChains,
  DECIMALS,
  INITIAL_PRICE,
} from "../helper-hardhat-config";
import { getNamedAccounts, deployments } from "hardhat";

export default async function deployMocks() {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  if (developmentChains.includes(network.name)) {
    log("Local network detected! Deploying mocks...");
    await deploy("MockV3Aggregator", { 
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_PRICE],
    });
  }
}

deployMocks.tags = ["all", "mocks"];
