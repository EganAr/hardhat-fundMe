import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { developmentChains } from "../../helper-hardhat-config";

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe: Contract | any;
      let deployer: Signer;
      const sendValue = ethers.parseEther("1");

      beforeEach(async function () {
        const { deployer: deployerAddress } = await getNamedAccounts();
        deployer = await ethers.getSigner(deployerAddress);
        fundMe = await ethers.getContract("FundMe", deployer);
      });

      it("allows people to fund and withdraw", async function () {
        await fundMe.fund({ value: sendValue });
        await fundMe.withdraw();
        const endingBalance = await ethers.provider.getBalance(
          fundMe.getAddress()
        );

        expect(endingBalance.toString()).to.be("0");
      });
    });
