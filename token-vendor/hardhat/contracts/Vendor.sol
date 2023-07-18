pragma solidity 0.8.4; //Do not change the solidity version as it negativly impacts submission grading
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/Ownable.sol";
import "./YourToken.sol";

contract Vendor is Ownable {
    address public yourToken_owner;
    uint256 public constant tokensPerETH = 100;
    //event BuyTokens(address buyer, uint256 amountOfETH, uint256 amountOfTokens);
    event BuyTokens(address buyer, uint256 amountOfETH, uint256 amountOfTokens);

    YourToken public yourToken;

    constructor(address tokenAddress) {
        yourToken = YourToken(tokenAddress);
        yourToken_owner = msg.sender;
    }

    // ToDo: create a payable buyTokens() function:
    function buyTokens() public payable {
        // uint256 vendorTokenBalance = yourToken.balanceOf(address(this));
        uint256 amountOfTokens = msg.value * tokensPerETH;
        yourToken.transfer(msg.sender, amountOfTokens);
        emit BuyTokens(msg.sender, msg.value, amountOfTokens);
    }

    // ToDo: create a withdraw() function that lets the owner withdraw ETH
    function withdraw() public payable onlyOwner {
        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(success, "withdraw failed!");
    }

    // ToDo: create a sellTokens(uint256 _amount) function:
    function sellTokens(uint256 _amount) public payable {
        yourToken.transferFrom(msg.sender, address(this), _amount);
        uint256 price = _amount / tokensPerETH;
        (bool success, ) = payable(msg.sender).call{value: price}("");
        require(success, "send fail!");
    }
}
