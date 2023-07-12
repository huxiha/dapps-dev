const hre = require("hardhat");

async function main() {
  console.log("Deploying simpleNft...");

  const simpleNft = await hre.ethers.deployContract("SimpleNft");

  await simpleNft.waitForDeployment();

  console.log(`SimpleNft deployed at: ${simpleNft.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
