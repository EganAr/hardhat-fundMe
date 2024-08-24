import { ethers, getNamedAccounts } from "hardhat";

async function main() {
  const { deployer: deployerAddress } = await getNamedAccounts();
  const fundMe = (await ethers.getContract("FundMe", deployerAddress)) as any;
  console.log("Withdrawing from contract...");

  const transactionResponse = await fundMe.withdraw();
  await transactionResponse.wait(1);
  console.log("Got it back!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
