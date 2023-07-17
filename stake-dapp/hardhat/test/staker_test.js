const {
  loadFixture,
  time,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const hre = require("hardhat");
const { expect } = require("chai");

describe("Staker", async () => {
  async function deployFixture() {
    const exampleExternalContract = await ethers.deployContract(
      "ExampleExternalContract"
    );
    const staker = await ethers.deployContract("Staker", [
      exampleExternalContract.target,
    ]);
    return { exampleExternalContract, staker };
  }

  describe("stake to the contract", async () => {
    it("should stake success before deadline", async () => {
      const { staker } = await loadFixture(deployFixture);
      const [owner] = await ethers.getSigners();
      const stakerBalance = await staker.balances(owner.address);
      const tx = await staker.stake({ value: ethers.parseEther("1") });
      tx.wait();
      const stakerBalanceAfer = await staker.balances(owner.address);
      expect(stakerBalance).to.equal(0);
      expect(stakerBalanceAfer).to.equal(ethers.parseEther("1"));
    });
    it("should emit the event after stake", async () => {
      const { staker } = await loadFixture(deployFixture);

      await expect(staker.stake({ value: ethers.parseEther("0.001") })).to.emit(
        staker,
        "Stake"
      );
    });
    it("should be reverted if no value", async () => {
      const { staker } = await loadFixture(deployFixture);
      await expect(staker.stake({ value: ethers.parseEther("0") })).to.be
        .reverted;
      await expect(staker.stake()).to.be.reverted;
    });
    it("should be reverted if deadline has been meet", async () => {
      const { staker } = await loadFixture(deployFixture);
      const deadline = (await time.latest()) + 30;
      await time.increaseTo(deadline);
      await expect(staker.stake({ value: ethers.parseEther("0.001") })).to.be
        .reverted;
    });
  });

  describe("execute", async () => {
    it("should be reverted if deadline not meet", async () => {
      const { staker } = await loadFixture(deployFixture);
      await expect(staker.execute()).to.be.reverted;
    });
    it("should complete if the balance of the contract greater than 1 ether", async () => {
      const { staker, exampleExternalContract } = await loadFixture(
        deployFixture
      );
      const beforeComplete = await exampleExternalContract.completed();
      const deadline = (await time.latest()) + 30;
      const tx = await staker.stake({ value: ethers.parseEther("1.1") });
      await tx.wait(1);
      await time.increaseTo(deadline);
      const tx2 = await staker.execute();
      await tx2.wait(1);
      const afterComplete = await exampleExternalContract.completed();
      expect(beforeComplete).to.equal(false);
      expect(afterComplete).to.equal(true);
    });
    it("should open withdraw if the contract balance less than 1 ether", async () => {
      const { staker } = await loadFixture(deployFixture);
      const deadline = (await time.latest()) + 30;
      const openWithdrawBefore = await staker.openForWithdraw();
      const tx = await staker.stake({ value: ethers.parseEther("0.001") });
      await tx.wait(1);
      await time.increaseTo(deadline);
      const tx2 = await staker.execute();
      await tx2.wait(1);
      const openWithdrawAfter = await staker.openForWithdraw();
      expect(openWithdrawBefore).to.equal(false);
      expect(openWithdrawAfter).to.equal(true);
    });
  });

  describe("withdraw", async () => {
    it("should be reverted if openWithdraw was false", async () => {
      const { staker } = await loadFixture(deployFixture);
      await expect(staker.withdraw()).to.be.reverted;
    });
    it("should be reverted if the sender was not the staker", async () => {
      const { staker } = await loadFixture(deployFixture);
      const deadline = (await time.latest()) + 30;
      await time.increaseTo(deadline);
      const tx2 = await staker.execute();
      await tx2.wait(1);
      await expect(staker.withdraw()).to.be.revertedWithCustomError(
        staker,
        "Staker__NotStaker"
      );
    });
    it("should withdraw the balance sucessfully!", async () => {
      const { staker } = await loadFixture(deployFixture);
      const deadline = (await time.latest()) + 30;
      const [owner] = await ethers.getSigners();
      const tx1 = await staker.stake({ value: ethers.parseEther("0.1") });
      await tx1.wait(1);
      await time.increaseTo(deadline);
      const tx2 = await staker.execute();
      await tx2.wait(1);
      const beforeBalance = await staker.balances(owner.address);
      const tx3 = await staker.withdraw();
      await tx3.wait(1);
      const afterBalance = await staker.balances(owner.address);
      expect(beforeBalance).to.equal(ethers.parseEther("0.1"));
      expect(afterBalance).to.equal(0);
    });
  });
});
