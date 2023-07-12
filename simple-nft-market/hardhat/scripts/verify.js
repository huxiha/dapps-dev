const hre = require("hardhat");

async function main() {
  await hre.run("verify:verify", {
    address: "0x66b36eeB62838E2Db8b8357f102cDDa728cC2529",
    constructorArguments: [],
    contract: "contracts/SimpleNft.sol:SimpleNft",
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
