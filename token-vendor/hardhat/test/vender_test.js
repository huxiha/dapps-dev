const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("vender", function () {
  async function deployFixture() {
    const [owner, anotherAccount] = await ethers.getSigners();
    const YourToken = await ethers.getContractFactory("YourToken");
    const tokenContract = await YourToken.deploy();

    const Vendor = await ethers.getContractFactory("Vendor");
    const vendor = await Vendor.deploy(tokenContract.target);

    // transfer some token to vendor
    const tx = await tokenContract.transfer(
      vendor.target,
      ethers.parseEther("1000")
    );

    return { tokenContract, vendor, owner, anotherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right token supply", async function () {
      const { tokenContract, vendor } = await loadFixture(deployFixture);
      const supply = await tokenContract.totalSupply();
      expect(supply).to.be.equal(ethers.parseEther("1000"));
    });
    it("should set correct token address!", async () => {
      const { tokenContract, vendor } = await loadFixture(deployFixture);
      const tokenAddress = await vendor.yourToken();
      expect(tokenAddress).to.be.equal(tokenContract.target);
    });
  });

  describe("functional", () => {
    it("should buy token successfully!", async () => {
      const { tokenContract, vendor, owner } = await loadFixture(deployFixture);
      const beforeBuy = await tokenContract.balanceOf(owner.address);
      const tx = await vendor.buyTokens({ value: ethers.parseEther("0.01") });
      await tx.wait(1);
      const afterBuy = await tokenContract.balanceOf(owner.address);
      expect(beforeBuy).to.be.equal(0);
      expect(afterBuy).to.be.equal(ethers.parseEther("1"));
      const venderBalance = await ethers.provider.getBalance(vendor.target);
      expect(venderBalance).to.be.equal(ethers.parseEther("0.01"));
    });

    it("should withdraw only by the owner", async () => {
      const { tokenContract, vendor, owner, anotherAccount } =
        await loadFixture(deployFixture);
      const tx = await vendor.buyTokens({ value: ethers.parseEther("0.01") });
      await tx.wait(1);
      const venderBalance = await ethers.provider.getBalance(vendor.target);
      expect(venderBalance).to.be.equal(ethers.parseEther("0.01"));

      await expect(vendor.connect(anotherAccount).withdraw()).to.be.reverted;
      const ownerBalance = await ethers.provider.getBalance(owner.address);
      const tx2 = await vendor.connect(owner).withdraw();
      await tx2.wait(1);
      const afterWithdrawBalance = await ethers.provider.getBalance(
        vendor.target
      );
      const afterOwnerBalance = await ethers.provider.getBalance(owner.address);
      expect(afterWithdrawBalance).to.be.equal(0);
      expect(ownerBalance).lt(afterOwnerBalance);
    });

    it("should sell token successfully", async () => {
      const [owner] = await ethers.getSigners();
      const YourToken = await ethers.getContractFactory("YourToken");
      const yourToken = await YourToken.deploy();

      const Vendor = await ethers.getContractFactory("Vendor");
      const vendor = await Vendor.deploy(yourToken.target);

      const tx = await yourToken.approve(
        vendor.target,
        ethers.parseEther("100")
      );

      await tx.wait(1);

      const transferToken = await yourToken.transfer(
        vendor.target,
        ethers.parseEther("300")
      );
      await transferToken.wait(1);

      const buyTokens = await vendor.buyTokens({
        value: ethers.parseEther("2"),
      });
      await buyTokens.wait(1);

      const venderBalanceBefore = await ethers.provider.getBalance(
        vendor.target
      );
      const ownerBalanceBefor = await ethers.provider.getBalance(owner.address);

      const tx2 = await vendor.sellTokens(ethers.parseEther("100"));
      await tx2.wait(1);

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      expect(ownerBalanceAfter).gt(ownerBalanceBefor);

      const vendorBalanceAfter = await ethers.provider.getBalance(
        vendor.target
      );
      expect(venderBalanceBefore).gt(vendorBalanceAfter);

      const vendorTokensAfter = await yourToken.balanceOf(vendor.target);
      expect(vendorTokensAfter).to.be.equal(ethers.parseEther("200"));

      const ownerTokensAfter = await yourToken.balanceOf(owner.address);
      expect(ownerTokensAfter).to.equal(ethers.parseEther("800"));
    });
  });
});
