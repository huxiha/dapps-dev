// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "hardhat/console.sol";
import "./ExampleExternalContract.sol";

contract Staker {
    ExampleExternalContract public exampleExternalContract;
    mapping(address => uint256) public balances;
    uint256 public constant threshold = 1 ether;
    uint256 public deadline = block.timestamp + 30 seconds;
    bool public openForWithdraw = false;
    bool public executed = false;

    event Stake(address staker, uint256 balance);

    constructor(address exampleExternalContractAddress) {
        exampleExternalContract = ExampleExternalContract(
            exampleExternalContractAddress
        );
    }

    error Staker__InvalidAddress();
    error Staker__InsufficientValue();
    error Staker__StillNeedWait();
    error Staker__NotOpenForWithdraw();
    error Staker__NotStaker();
    error Staker__DeadlineMeet();
    error Staker__AlreadyExecuted();

    // Collect funds in a payable `stake()` function and track individual `balances` with a mapping:
    // ( Make sure to add a `Stake(address,uint256)` event and emit it for the frontend <List/> display )

    function stake() public payable {
        if (block.timestamp >= deadline) {
            revert Staker__DeadlineMeet();
        }
        if (msg.sender == address(0)) {
            revert Staker__InvalidAddress();
        }
        if (msg.value <= 0) {
            revert Staker__InsufficientValue();
        }
        balances[msg.sender] = msg.value;
        emit Stake(msg.sender, msg.value);
    }

    // After some `deadline` allow anyone to call an `execute()` function
    function execute() public payable {
        if (block.timestamp < deadline) {
            revert Staker__StillNeedWait();
        }
        if (executed) {
            revert Staker__AlreadyExecuted();
        }
        executed = true;
        // If the deadline has passed and the threshold is met, it should call `exampleExternalContract.complete{value: address(this).balance}()`
        uint256 currentBalance = address(this).balance;
        if (currentBalance >= threshold) {
            exampleExternalContract.complete{value: currentBalance}();
        } else {
            // If the `threshold` was not met, allow everyone to call a `withdraw()` function to withdraw their balance
            openForWithdraw = true;
        }
    }

    function withdraw() public payable {
        if (!openForWithdraw) {
            revert Staker__NotOpenForWithdraw();
        }
        if (balances[msg.sender] <= 0) {
            revert Staker__NotStaker();
        }
        balances[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{
            value: balances[msg.sender]
        }("");
        require(success, "Withdraw fail!");
    }

    // Add a `timeLeft()` view function that returns the time left before the deadline for the frontend
    function timeLeft() public view returns (uint256) {
        return deadline > block.timestamp ? deadline - block.timestamp : 0;
    }

    // Add the `receive()` special function that receives eth and calls stake()
    receive() external payable {
        stake();
    }

    fallback() external payable {
        stake();
    }
}
