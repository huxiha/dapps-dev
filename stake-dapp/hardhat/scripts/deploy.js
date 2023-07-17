const hre = require("hardhat");

async function main() {
  // deploy ExampleExternalContract
  console.log("Deploying example contract...");
  const exampleContract = await hre.ethers.deployContract(
    "ExampleExternalContract"
  );
  await exampleContract.waitForDeployment();

  console.log(`ExampleExternalContract deployed at: ${exampleContract.target}`);

  const exampleAddress = exampleContract.target;
  // deploy Staker
  console.log("Deploy staker...");

  const staker = await hre.ethers.deployContract("Staker", [exampleAddress]);

  await staker.waitForDeployment();

  console.log(`Staker deployed at: ${staker.target}`);
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
