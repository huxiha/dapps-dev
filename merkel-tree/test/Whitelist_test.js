const { expect } = require("chai");
const { ethers } = require("hardhat");
const keccak256 = require("keccak256");
const { default: MerkleTree } = require("merkletreejs");

function encodeLeaf(address, spots) {
  return ethers.AbiCoder.defaultAbiCoder().encode(
    ["address", "uint64"],
    [address, spots]
  );
}

describe("Merkle Trees", function () {
  it("should be able to verify if address is in whitelist or not!", async () => {
    const testAddress = await ethers.getSigners();

    const whiteList = [
      encodeLeaf(testAddress[0].address, 2),
      encodeLeaf(testAddress[1].address, 2),
      encodeLeaf(testAddress[2].address, 2),
      encodeLeaf(testAddress[3].address, 2),
      encodeLeaf(testAddress[4].address, 2),
      encodeLeaf(testAddress[5].address, 2),
    ];

    const merkleTree = new MerkleTree(whiteList, keccak256, {
      hashLeaves: true,
      sortPairs: true,
      sortLeaves: true,
    });

    const root = merkleTree.getHexRoot();

    const whitelist = await ethers.getContractFactory("Whitelist");
    const Whitelist = await whitelist.deploy(root);
    await Whitelist.waitForDeployment();

    for (let i = 0; i < 6; i++) {
      const leaf = keccak256(whiteList[i]);
      const proof = merkleTree.getHexProof(leaf);
      const connectedWhiteList = await Whitelist.connect(testAddress[i]);
      const verified = await connectedWhiteList.checkInWhitelist(proof, 2);
      expect(verified).to.be.equal(true);
    }

    const verifiedInvalid = await Whitelist.checkInWhitelist([], 2);
    expect(verifiedInvalid).to.be.equal(false);
  });
});
