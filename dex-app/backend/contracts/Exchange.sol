// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20("LP Token", "LPT") {
    // exchange token
    address public tokenAddress;

    constructor(address token) {
        require(token != address(0), "Invalid address!");
        tokenAddress = token;
    }

    // the reserve token now in the exchange pool
    function getReserve() public view returns (uint256) {
        return ERC20(tokenAddress).balanceOf(address(this));
    }

    // add liquidity to the exchange pool
    function addLiquidity(
        uint256 amountOfToken
    ) public payable returns (uint256) {
        uint256 lpTokensToMint;
        uint256 ethReservedBalance = address(this).balance;
        uint256 tokenReservedBalance = getReserve();

        ERC20 token = ERC20(tokenAddress);
        if (tokenReservedBalance == 0) {
            token.transferFrom(msg.sender, address(this), amountOfToken);
            lpTokensToMint = ethReservedBalance;
            _mint(msg.sender, lpTokensToMint);
            return lpTokensToMint;
        }

        uint256 etherReservePriorToFunctionCall = ethReservedBalance -
            msg.value;
        uint256 tokenAmountRequired = (msg.value * tokenReservedBalance) /
            etherReservePriorToFunctionCall;

        require(
            amountOfToken >= tokenAmountRequired,
            "Insuffcient amount of token!"
        );
        token.transferFrom(msg.sender, address(this), tokenAmountRequired);
        lpTokensToMint =
            (totalSupply() * msg.value) /
            etherReservePriorToFunctionCall;
        _mint(msg.sender, lpTokensToMint);
        return lpTokensToMint;
    }

    function removeLiquidity(
        uint256 amountOfLpToken
    ) public returns (uint256, uint256) {
        require(
            amountOfLpToken > 0,
            "Amount of tokens to remove must greater than 0!"
        );
        uint256 etherReservedBalance = address(this).balance;
        uint256 lptokenTotalSupply = totalSupply();

        uint256 ethToReturn = (etherReservedBalance * amountOfLpToken) /
            lptokenTotalSupply;
        uint256 tokenToReturn = (getReserve() * amountOfLpToken) /
            lptokenTotalSupply;

        _burn(msg.sender, amountOfLpToken);
        (bool success, ) = payable(msg.sender).call{value: ethToReturn}("");
        ERC20(tokenAddress).transfer(msg.sender, tokenToReturn);
        require(success, "Withdraw ether failed");
        return (ethToReturn, tokenToReturn);
    }

    function getOutputAmountFromSwap(
        uint256 inputAmount,
        uint256 inputReserve,
        uint256 outputReserve
    ) public pure returns (uint256) {
        require(
            inputReserve > 0 && outputReserve > 0,
            "Reserve must be greater than 0"
        );

        uint256 inputAmountWithFee = inputAmount * 99; //1% fee
        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = inputReserve * 100 + inputAmountWithFee;

        return numerator / denominator;
    }

    function ethToTokenSwap(uint256 minTokensToReceive) public payable {
        uint256 tokenReservedBalance = getReserve();
        uint256 tokensReceive = getOutputAmountFromSwap(
            msg.value,
            address(this).balance - msg.value,
            tokenReservedBalance
        );
        require(
            tokensReceive >= minTokensToReceive,
            "Token received by the ethers are less than expected!"
        );
        ERC20(tokenAddress).transfer(msg.sender, tokensReceive);
    }

    function tokenToEthSwap(
        uint256 tokensToSwap,
        uint256 minEthToReceive
    ) public {
        uint256 tokenReservedBalance = getReserve();
        uint ethToReceive = getOutputAmountFromSwap(
            tokensToSwap,
            tokenReservedBalance,
            address(this).balance
        );

        require(
            ethToReceive >= minEthToReceive,
            "ETH received is less than expected!"
        );
        ERC20(tokenAddress).transferFrom(
            msg.sender,
            address(this),
            tokensToSwap
        );
        (bool success, ) = payable(msg.sender).call{value: ethToReceive}("");
        require(success, "Receive ether failed!");
    }
}
