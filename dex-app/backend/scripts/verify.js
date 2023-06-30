const hre = require("hardhat");

async function main() {
  await hre.run("verify:verify", {
    address: "0x47120e1407CA6A816399F94804976c64E0493D1f",
    constructorArguments: [],
    contract: "contracts/Token.sol:Token",
  });

  await hre.run("verify:verify", {
    address: "0xc04E985cF4126436ee3a9D2Eca2dC8154Da1A3da",
    constructorArguments: ["0x47120e1407CA6A816399F94804976c64E0493D1f"],
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
