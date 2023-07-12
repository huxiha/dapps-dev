const IPFS = require("ipfs-core");
const makeIpfsFetch = require("ipfs-fetch");

export default async function handler(req, res) {
  const ipfsHash = res.body.ipfsHash;
  const ipfs = await IPFS.create();
  const fetch = await makeIpfsFetch({ ipfs });

  const response = await fetch("ipfs://" + ipfsHash);
  const text = await response.text();

  console.log(text);

  // .json({ ipfsHash: pinRespons.IpfsHash });
}
