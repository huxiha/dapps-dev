// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

interface ICryptoDevNft {
    function balanceOf(address _owner) external view returns (uint256);

    function tokenOfOwnerByIndex(
        address owner,
        uint256 index
    ) external view returns (uint256);
}
