const hre = require("hardhat");

async function main() {
  // deploy CryptoDevNft
  console.log("Deploying CryptoDevNft contract...");
  const cryptoDevNft = await hre.ethers.deployContract("CryptoDevNft", []);
  await cryptoDevNft.waitForDeployment();

  const cryptoDevNftAddress = cryptoDevNft.target;
  console.log(`CryptoDevNft contract deployed at: ${cryptoDevNftAddress}`);

  //deploy FakeNftMarketPlace
  console.log("Deploying FakeNftMarketPlace contract...");
  const fakeNftMarketPlace = await hre.ethers.deployContract(
    "FakeNftMarketPlace",
    []
  );
  await fakeNftMarketPlace.waitForDeployment();

  const fakeNftMarketPlaceAddress = fakeNftMarketPlace.target;
  console.log(
    `CryptoDevNft contract deployed at: ${fakeNftMarketPlaceAddress}`
  );

  // deploy CryptoDevDAO
  console.log("Deploying CryptoDevDAO contract...");
  const cryptoDevDAO = await hre.ethers.deployContract(
    "CryptoDevDao",
    [cryptoDevNftAddress, fakeNftMarketPlaceAddress],
    { value: hre.ethers.parseEther("0.05") }
  );
  await cryptoDevDAO.waitForDeployment();
  console.log("CryptoDevDAO deployed at: " + cryptoDevDAO.target);
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
