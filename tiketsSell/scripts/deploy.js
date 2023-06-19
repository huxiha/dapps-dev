const { ethers } = require("hardhat");

async function main() {
  const ticketsSellFactory = await ethers.getContractFactory("TiketSell");
  console.log("deploying...");
  const ticketSell = await ticketsSellFactory.deploy("TicketSell", "TS");

  console.log("ticketSell deployed at " + ticketSell.target);
}

main()
  .then(() => {
    console.log("deploy success");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
