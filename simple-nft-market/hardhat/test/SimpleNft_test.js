//testcase:
//01 can mint successfully
//02 can transfer successfully
const { expect } = require("chai");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");
const { storageTokenURIMetadata } = require("../utils/uploadMetadataToIpfs");

describe("SimpleNft", () => {
  async function deploySimpleNftFixture() {
    const simpleNft = await ethers.deployContract("SimpleNft");
    const [owner] = await ethers.getSigners();
    return { simpleNft, owner };
  }

  describe("Mint Nft success!", async () => {
    it("should mint a NFT", async () => {
      const { simpleNft, owner } = await loadFixture(deploySimpleNftFixture);
      expect(await simpleNft.balanceOf(owner.address)).to.equal(0);
      const buffalo = {
        description: "It's actually a bison?",
        external_url: "https://austingriffith.com/portfolio/paintings/", // <-- this can link to a page for the specific file too
        image: "https://austingriffith.com/images/paintings/buffalo.jpg",
        name: "Buffalo",
        attributes: [
          {
            trait_type: "BackgroundColor",
            value: "green",
          },
          {
            trait_type: "Eyes",
            value: "googly",
          },
          {
            trait_type: "Stamina",
            value: 42,
          },
        ],
      };
      const tokenURI = await storageTokenURIMetadata(buffalo);

      const mintTx = await simpleNft.mintItem(owner.address, tokenURI);
      await mintTx.wait(1);

      expect(await simpleNft.balanceOf(owner.address)).to.equal(1);
    });

    it("should trace the tokens by index", async () => {
      const { simpleNft, owner } = await loadFixture(deploySimpleNftFixture);
      const buffalo = {
        description: "It's actually a bison?",
        external_url: "https://austingriffith.com/portfolio/paintings/", // <-- this can link to a page for the specific file too
        image: "https://austingriffith.com/images/paintings/buffalo.jpg",
        name: "Buffalo",
        attributes: [
          {
            trait_type: "BackgroundColor",
            value: "green",
          },
          {
            trait_type: "Eyes",
            value: "googly",
          },
          {
            trait_type: "Stamina",
            value: 42,
          },
        ],
      };
      const tokenURI = await storageTokenURIMetadata(buffalo);

      const mintTx = await simpleNft.mintItem(owner.address, tokenURI);
      await mintTx.wait(1);

      expect(
        await simpleNft.tokenOfOwnerByIndex(owner.address, 0)
      ).to.greaterThan(0);
    });
  });
});
