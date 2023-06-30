const hre = require("hardhat");

async function main() {
  console.log("Deploying Token...");
  const tokenContract = await hre.ethers.deployContract("Token", []);
  await tokenContract.waitForDeployment();
  console.log(`Token constract deployed at: ${tokenContract.target}`);

  console.log("Deploying Exchange...");
  const exchange = await hre.ethers.deployContract("Exchange", [
    tokenContract.target,
  ]);
  await exchange.waitForDeployment();
  console.log(`Exchange deployed at: ${exchange.target}`);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
