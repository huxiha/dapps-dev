## Simple-Nft-Market

### Backend

In the hardhat directory, the main contract is SimpleNft.sol, is a simple ERC-721 token using openzeppelin contracts to complete.

You can mintNft, transfer Nft and qurey the tokenId by the token index of one user's all nfts and tokenURI throug tokenId.

The tokenURI storages in the blockchain is the IPFS hash.

### Frontend

In the next-app directory, and have been deployed on the surge, you can open with http://unruly-partner.surge.sh/.

Apply the mintItem button, you can mint a random nft. As you have minted a Nft, there would list the nft you had.  
In the Nft list, you can transfer you exact nft to the address you input.  
The transfers tag records the transfer log.  
You can also upload or download content to IPFS through the ipfs\*\* tags.

### What I have learned form this project

- openzeppelin contracts about ERC-721
- hardhat using(test/deploy/verify/hardhard config etc)
- frontend framework(wagmi/web3modal) how to interact with the blockchain
- upload content to the IPFS through pinata sdk
- download content from IPFS just fetch from the url
- dynamic import react packages in the next
- react-json-view package to display and modify or delete json
- deploy the static pages to the surge
