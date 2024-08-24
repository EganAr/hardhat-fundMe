import { BaseContract } from "ethers";
import { ethers, getNamedAccounts } from "hardhat";

async function main() {
  const { deployer: deployerAddress } = await getNamedAccounts();
  const fundMe = (await ethers.getContract("FundMe", deployerAddress)) as any;
  const transactionResponse = await fundMe.fund({
    value: ethers.parseEther("0.1"),
  });
  await transactionResponse.wait(1);
  console.log("Funded contract");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
