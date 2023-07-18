// const { hre } = require("hardhat");

// async function main() {
//   await hre.run("verify:verify", {
//     address: "0x1A40686e57815Ade68537e04c92F3a9f63D5e5d4",
//     constructorArguments: [],
//     contract: "contracts/YourToken.sol:YourToken",
//   });

//   await hre.run("verify:verify", {
//     address: "0x31037AD878Fb8CA614d168FcC85A578B13A52887",
//     constructorArguments: [yourToken.target],
//   });
// }

// main()
//   .then(() => {
//     process.exit(0);
//   })
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });
const hre = require("hardhat");

async function main() {
  await hre.run("verify:verify", {
    address: "0x1A40686e57815Ade68537e04c92F3a9f63D5e5d4",
    constructorArguments: [],
    contract: "contracts/YourToken.sol:YourToken",
  });

  await hre.run("verify:verify", {
    address: "0x31037AD878Fb8CA614d168FcC85A578B13A52887",
    constructorArguments: ["0x1A40686e57815Ade68537e04c92F3a9f63D5e5d4"],
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
