// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/VRFV2WrapperConsumerBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RandomWinnerGame is VRFV2WrapperConsumerBase, Ownable {
    address linkAddress = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;
    address wrapperAddress = 0x99aFAf084eBA697E584501b8Ed2c0B37Dd136693;
    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;

    bool public gameStarted;
    uint8 public maxPlayers;
    uint256 public entryFee;
    uint256 public gameId;
    address[] public players;

    constructor() VRFV2WrapperConsumerBase(linkAddress, wrapperAddress) {}

    event GameStarted(uint256 gameId, uint8 maxPlayers, uint256 entryFee);
    event PlayerJoined(uint256 gameId, address playerAddress);
    event GameEnded(uint256 gameId, address winner, uint256 requestId);

    error RandomWinnerGame__gameAlreadyStarted();
    error RandomWinnerGame__maxPlayersLessThanZero();
    error RandomeWinnerGame__gameNotStart();
    error RandomWinnerGame__valueNotEqualEntryFee();
    error RandomWinnerGame__gameFull();

    function startGame(
        uint8 _maxPlayers,
        uint256 _entryFee
    ) external onlyOwner {
        if (gameStarted) {
            revert RandomWinnerGame__gameAlreadyStarted();
        }
        if (_maxPlayers <= 0) {
            revert RandomWinnerGame__maxPlayersLessThanZero();
        }
        maxPlayers = _maxPlayers;
        entryFee = _entryFee;
        gameStarted = true;
        gameId += 1;
        delete players;

        emit GameStarted(gameId, maxPlayers, entryFee);
    }

    function joinGame() external payable {
        if (!gameStarted) {
            revert RandomeWinnerGame__gameNotStart();
        }
        if (msg.value != entryFee) {
            revert RandomWinnerGame__valueNotEqualEntryFee();
        }
        if (players.length >= maxPlayers) {
            revert RandomWinnerGame__gameFull();
        }

        players.push(msg.sender);
        emit PlayerJoined(gameId, msg.sender);
        if (players.length == maxPlayers) {
            getRandomWinner();
        }
    }

    function getRandomWinner() private returns (uint256 requestId) {
        requestId = requestRandomness(
            callbackGasLimit,
            requestConfirmations,
            numWords
        );
        return requestId;
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        uint256 winnerIndex = _randomWords[0] % players.length;
        address winner = players[winnerIndex];
        (bool success, ) = winner.call{value: address(this).balance}("");
        require(success, "Failed to send ether");
        emit GameEnded(gameId, winner, _requestId);
        gameStarted = false;
    }
}
