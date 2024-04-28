const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

describe("FundMe", async function () {
  let fundMe;
  let deployer;
  let mockV3Aggregator;
  const sendValue = ethers.parseEther("0.001"); //1 ETH
  // const sendValue = 100000000000000000; //1 ETH
  beforeEach(async function () {
    const accounts = await ethers.getSigners();
    // console.info(accounts)
    deployer = accounts[0].address;

    await deployments.fixture(["all"]);

    const fundMeDeployment = await deployments.get("FundMe");
    // console.log(fundMeDeployment)
    let address = "0x5e6f0b6BE419589952fFfa8D0d2F5Fb4Cc07E15B";
    fundMe = await ethers.getContractAt(
      fundMeDeployment.abi,
      // fundMeDeployment.address,
      address
    );

    // const mockV3AggregatorDeployment = await deployments.get(
    //     "MockV3Aggregator"
    // )
    // mockV3Aggregator = await ethers.getContractAt(
    //     mockV3AggregatorDeployment.abi,
    //     mockV3AggregatorDeployment.address
    // )
  });

  describe("constructor", async function () {
      it("sets the aggregator address correctly", async function () {
          const response = await fundMe.getPriceFeed()
          assert.equal(response.address, fundMe.address)
      });
  })

  describe("fund", async function () {
    it("Fails if you don't send enough ETH", async function () {
        await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!")
    })
    it("updates the amount funded data structure", async function () {
        await fundMe.fund({ value: sendValue })
        console.log(deployer)
        const response = await fundMe.getAddressToAmountFunded(deployer);
        console.log(response.toString())
        console.log(sendValue.toString())
        assert.equal(response.toString(), sendValue.toString())
    })

    it("getAddressToAmountFunded", async function () {
      // await fundMe.fund({ value: sendValue })
      // console.log(deployer)
      const response = await fundMe.getAddressToAmountFunded(deployer);
      console.log(response.toString());
      // console.log(sendValue.toString())
      // assert.equal(response.toString(), sendValue.toString())
    });

    it("Adds funder to array of funders", async function () {
        await fundMe.fund({ value: sendValue });0x1E3cADdcb2b5116f1D379CFa1b9671EE8d77869D
        const funder = await fundMe.getFunder(0);
        assert.equal(funder, deployer);
    });

    it("Test Store Monkey", async function () {
        // await fundMe.storeMonkey(100);
        let monkey = await fundMe.getMonkey();
        console.log(monkey)
    })
  });

  describe("withdraw", async function () {
      beforeEach(async function () {
          await fundMe.fund({ value: sendValue });
      })

      it("withdraws ETH from a single founder", async function () {
          // arrange
          const startingFundMeBalance = await ethers.provider.getBalance(
              fundMe.getAddress()
          )
          const startingDeployerBalance = await ethers.provider.getBalance(
              deployer
          )

          // act
          const transactionResponse = await fundMe.withdraw()
          const transactionReceipt = await transactionResponse.wait(1)

          const { gasUsed, gasPrice } = transactionReceipt
          const gasCost = gasUsed * gasPrice

          const endingFundMeBalance = await ethers.provider.getBalance(
              fundMe.getAddress()
          )
          const endingDeployerBalance = await ethers.provider.getBalance(
              deployer
          )

          // assert
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
              startingFundMeBalance + startingDeployerBalance,
              endingDeployerBalance + gasCost
          )
      })

      it("allows us to withdraw with multiple funders", async function () {
          const accounts = await ethers.getSigners()
          for (i = 1; i < 6; i++) {
              const fundMeConnectedContract = await fundMe.connect(
                  accounts[i]
              )
              await fundMeConnectedContract.fund({ value: sendValue })
          }
          const startingFundMeBalance = await ethers.provider.getBalance(
              fundMe.getAddress()
          )
          const startingDeployerBalance = await ethers.provider.getBalance(deployer)

          const transactionResponse = await fundMe.withdraw()
          const transactionReceipt = await transactionResponse.wait(1)
          const { gasUsed, gasPrice } = transactionReceipt
          const gasCost = gasUsed * gasPrice
          // const gasCost = gasUsed.mul(gasPrice)

          const endingFundMeBalance = await ethers.provider.getBalance(
              fundMe.getAddress()
          )
          const endingDeployerBalance = await ethers.provider.getBalance(
              deployer
          )

          // assert
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
              startingFundMeBalance + startingDeployerBalance,
              endingDeployerBalance + gasCost
          )

          await expect(fundMe.getFunder(0)).to.be.reverted

          for (i = 1; i < 6; i++) {
              assert.equal(
                  await fundMe.getAddressToAmountFunded(accounts[i].address),
                  0
              )
          }

      })

      it("Only allows the owner to withdraw", async function () {
          const accounts = await ethers.getSigners()
          // const attacker = accounts[1]
          const fundMeConnectedContract = await fundMe.connect(accounts[1])

          await expect(fundMeConnectedContract.withdraw()).to.be.revertedWithCustomError(fundMeConnectedContract,"FundMe__NotOwner")
      })

      it("cheaperWithdraw testing...", async function () {
          const accounts = await ethers.getSigners()
          for (i = 1; i < 6; i++) {
              const fundMeConnectedContract = await fundMe.connect(
                  accounts[i]
              )
              await fundMeConnectedContract.fund({ value: sendValue })
          }
          const startingFundMeBalance = await ethers.provider.getBalance(
              fundMe.getAddress()
          )
          const startingDeployerBalance = await ethers.provider.getBalance(deployer)

          const transactionResponse = await fundMe.cheaperWithdraw()
          const transactionReceipt = await transactionResponse.wait(1)
          const { gasUsed, gasPrice } = transactionReceipt
          const gasCost = gasUsed * gasPrice
          // const gasCost = gasUsed.mul(gasPrice)

          const endingFundMeBalance = await ethers.provider.getBalance(
              fundMe.getAddress()
          )
          const endingDeployerBalance = await ethers.provider.getBalance(
              deployer
          )

          // assert
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
              startingFundMeBalance + startingDeployerBalance,
              endingDeployerBalance + gasCost
          )

          await expect(fundMe.getFunder(0)).to.be.reverted

          for (i = 1; i < 6; i++) {
              assert.equal(
                  await fundMe.getAddressToAmountFunded(accounts[i].address),
                  0
              )
          }

      })

  })
});
