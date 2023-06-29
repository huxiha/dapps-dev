// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

contract FakeNftMarketPlace {
    mapping(uint256 => address) public tokens;
    uint256 private nftPrice = 0.1 ether;

    function purchase(uint256 _tokenId) external payable {
        require(msg.value == nftPrice, "This NFT costs 0.1 ether");
        tokens[_tokenId] = msg.sender;
    }

    function getPrice() public view returns (uint256) {
        return nftPrice;
    }

    function available(uint256 _tokenId) external view returns (bool) {
        return tokens[_tokenId] == address(0) ? true : false;
    }
}
