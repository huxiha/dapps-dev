const pinataSDK = require("@pinata/sdk");
require("dotenv").config();

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataApiSecrete = process.env.PINATA_API_SECRET;
const pinata = new pinataSDK(pinataApiKey, pinataApiSecrete);

async function storageTokenURIMetadata(tokenURIMetadata) {
  try {
    const response = await pinata.pinJSONToIPFS(tokenURIMetadata);
    return response.IpfsHash;
  } catch (error) {
    console.log(error);
  }
  return null;
}

module.exports = { storageTokenURIMetadata };
