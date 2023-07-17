const hre = require("hardhat");

async function main() {
  console.log("Verifying example contract...");
  await hre.run("verify:verify", {
    address: "0x905fea335e17bf7c4F9Bc6d275b48b1A5eF4CA7A",
    constructorArguments: [],
    contract: "contracts/ExampleExternalContract.sol:ExampleExternalContract",
  });

  console.log("Verifying Staker...");
  await hre.run("verify:verify", {
    address: "0xaB7106e737E73eb082f8d7c1291Ef051Ba86A085",
    constructorArguments: ["0x905fea335e17bf7c4F9Bc6d275b48b1A5eF4CA7A"],
  });
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
