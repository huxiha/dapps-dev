const hre = require("hardhat");

async function main() {
  console.log("YourToken deploying...");
  const yourToken = await hre.ethers.deployContract("YourToken");

  await yourToken.waitForDeployment();

  console.log(`YourToken deployed to ${yourToken.target}`);

  console.log("Vendor deploying...");
  const vendor = await hre.ethers.deployContract("Vendor", [yourToken.target]);
  await vendor.waitForDeployment();
  console.log(`Vendor deployed at ${vendor.target}`);
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
