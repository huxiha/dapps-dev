// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const pinataSDK = require("@pinata/sdk");

export default async function handler(req, res) {
  const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const pinataApiSecrete = process.env.NEXT_PUBLIC_PINATA_API_SECRET;
  const pinata = new pinataSDK(pinataApiKey, pinataApiSecrete);
  let pinRespons = "";
  try {
    pinRespons = await pinata.pinJSONToIPFS(req.body);
  } catch (error) {
    console.log(error);
  }
  const response = await res
    .status(200)
    .json({ ipfsHash: pinRespons.IpfsHash });
}
