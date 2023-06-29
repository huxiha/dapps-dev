const hre = require("hardhat");

async function main() {
  // Verify the NFT Contract
  await hre.run("verify:verify", {
    address: "0x83598246B384b1A018c52bAE80fB3F9FaB120E2D",
    constructorArguments: [],
  });

  // Verify the Fake Marketplace Contract
  await hre.run("verify:verify", {
    address: "0x87dF9Df371cBbEBa43110905Ec5929Ca0415C50d",
    constructorArguments: [],
  });

  // Verify the DAO Contract
  await hre.run("verify:verify", {
    address: "0x679f50d2d8f13a1D4d88CCB91E7d98F3C7316ec9",
    constructorArguments: [
      "0x83598246B384b1A018c52bAE80fB3F9FaB120E2D",
      "0x87dF9Df371cBbEBa43110905Ec5929Ca0415C50d",
    ],
  });
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
