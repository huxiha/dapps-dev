// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICryptoDevNft.sol";
import "./IFakeNftMarketPlace.sol";

/**
 * @title DAO
 * @author
 * @notice
 * CryptoDevNft holders can create a proposal;
 * holders can also vote for the proposal;
 * holders can execute the proposal if it passed after deadline;
 */

contract CryptoDevDao is Ownable {
    struct Proposal {
        uint256 tokenId;
        uint256 yayVotes;
        uint256 nayVotes;
        uint256 deadline;
        bool executed;
        mapping(uint256 => bool) isVoted;
    }

    mapping(uint256 => Proposal) public proposals;
    uint256 public numProposals;

    ICryptoDevNft private immutable cryptoDevNft;
    IFakeNftMarketPlace private immutable fakeNftMarketPlace;

    enum Vote {
        YAY,
        NAY
    }

    constructor(
        address cryptoDevNftAddress,
        address fakeNftMarketPlaceAddress
    ) payable {
        cryptoDevNft = ICryptoDevNft(cryptoDevNftAddress);
        fakeNftMarketPlace = IFakeNftMarketPlace(fakeNftMarketPlaceAddress);
    }

    modifier nftHolderOnly() {
        require(cryptoDevNft.balanceOf(msg.sender) > 0, "Not a DAO member!");
        _;
    }

    modifier activeProposalOnly(uint256 proposalIndex) {
        require(
            proposals[proposalIndex].deadline > block.timestamp,
            "Proposal deadline exceeded!"
        );
        _;
    }

    modifier inactiveProposalOnly(uint256 proposalIndex) {
        require(
            proposals[proposalIndex].deadline <= block.timestamp,
            "Deadline not exceeed!"
        );
        require(!proposals[proposalIndex].executed, "Already executed!");
        _;
    }

    function createProposal(
        uint256 _tokenId
    ) external nftHolderOnly returns (uint256) {
        Proposal storage proposal = proposals[numProposals];
        proposal.deadline = block.timestamp + 5 minutes;
        proposal.tokenId = _tokenId;
        numProposals++;
        return numProposals - 1;
    }

    function voteOnProposal(
        uint256 proposalIndex,
        Vote vote
    ) external nftHolderOnly activeProposalOnly(proposalIndex) {
        Proposal storage proposal = proposals[proposalIndex];
        uint256 numVotes = 0;

        uint256 voterBalance = cryptoDevNft.balanceOf(msg.sender);

        for (uint i = 0; i < voterBalance; i++) {
            uint256 tokenId = cryptoDevNft.tokenOfOwnerByIndex(msg.sender, i);
            if (!proposal.isVoted[tokenId]) {
                numVotes++;
                proposal.isVoted[tokenId] = true;
            }
        }

        require(numVotes > 0, "Already voted!");
        if (vote == Vote.YAY) {
            proposal.yayVotes += numVotes;
        } else if (vote == Vote.NAY) {
            proposal.nayVotes += numVotes;
        }
    }

    function executeProposal(
        uint256 proposalIndex
    ) external nftHolderOnly inactiveProposalOnly(proposalIndex) {
        Proposal storage proposal = proposals[proposalIndex];
        if (proposal.yayVotes > proposal.nayVotes) {
            uint256 nftPrice = fakeNftMarketPlace.getPrice();
            require(address(this).balance >= nftPrice, "Not enough money!");

            fakeNftMarketPlace.purchase{value: nftPrice}(proposal.tokenId);
            proposal.executed = true;
        }
    }

    function withdraw() external onlyOwner {
        uint amount = address(this).balance;
        require(amount > 0, "No ether to withdraw!");

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "withdraw failed!");
    }

    receive() external payable {}

    fallback() external payable {}
}
