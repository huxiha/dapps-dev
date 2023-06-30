// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20("Token", "TKN") {
    constructor() {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}
