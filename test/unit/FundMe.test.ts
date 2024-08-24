import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { developmentChains } from "../../helper-hardhat-config";

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe: Contract | any;
      let deployer: Signer;
      let mockV3Aggregator: Contract;
      const sendValue = ethers.parseEther("1");

      beforeEach(async function () {
        const { deployer: deployerAddress } = await getNamedAccounts();
        deployer = await ethers.getSigner(deployerAddress);
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });

      describe("constructor", async function () {
        it("Sets the aggregator address correctly", async function () {
          const response = await fundMe.s_priceFeed();

          expect(response).to.equal(await mockV3Aggregator.getAddress());
        });
      });

      describe("fund", async function () {
        it("Fails if you don't send enough ETH", async function () {
          await expect(fundMe.fund()).to.be.rejectedWith(
            "You need to spend more ETH!"
          );
        });

        it("Updates the amount funded data structure", async function () {
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.s_addressToAmountFunded(
            await deployer.getAddress()
          );

          expect(response.toString()).to.equal(sendValue.toString());
        });

        it("Adds funder to s_funders array", async function () {
          await fundMe.fund({ value: sendValue });
          const funder = await fundMe.s_funders(0);

          expect(funder).to.equal(await deployer.getAddress());
        });
      });

      describe("withdraw", async function () {
        beforeEach(async function () {
          await fundMe.fund({ value: sendValue });
        });

        it("withdraw ETH with single s_funders", async function () {
          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.getAddress()
          );
          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, gasPrice } = transactionReceipt;
          const gasCost = gasPrice * gasUsed;

          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.getAddress()
          );
          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          expect(BigInt(endingFundMeBalance)).to.equal(0n);
          expect(
            BigInt(startingFundMeBalance) + BigInt(startingDeployerBalance)
          ).to.equal(BigInt(endingDeployerBalance) + BigInt(gasCost));
        });

        it("allows us to withdraw with multiple s_funders", async function () {
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }

          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.getAddress()
          );
          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, gasPrice } = transactionReceipt;
          const gasCost = gasPrice * gasUsed;

          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.getAddress()
          );
          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          expect(BigInt(endingFundMeBalance)).to.equal(0n);
          expect(
            BigInt(startingFundMeBalance) + BigInt(startingDeployerBalance)
          ).to.equal(BigInt(endingDeployerBalance) + BigInt(gasCost));

          await expect(fundMe.s_funders(0)).to.be.rejected;

          for (let i = 1; i < 6; i++) {
            expect(
              await fundMe.s_addressToAmountFunded(accounts[i].address)
            ).to.equal(0n);
          }
        });

        it("Only allows the owner to withdraw", async function () {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          const attackerConnectedContract = await fundMe.connect(attacker);
          await expect(attackerConnectedContract.withdraw()).to.be.rejected;
        });

        it("cheaper withdraw...", async function () {
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }

          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.getAddress()
          );
          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, gasPrice } = transactionReceipt;
          const gasCost = gasPrice * gasUsed;

          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.getAddress()
          );
          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer
          );

          expect(BigInt(endingFundMeBalance)).to.equal(0n);
          expect(
            BigInt(startingFundMeBalance) + BigInt(startingDeployerBalance)
          ).to.equal(BigInt(endingDeployerBalance) + BigInt(gasCost));

          await expect(fundMe.s_funders(0)).to.be.rejected;

          for (let i = 1; i < 6; i++) {
            expect(
              await fundMe.s_addressToAmountFunded(accounts[i].address)
            ).to.equal(0n);
          }
        });
      });
    });
