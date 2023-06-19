// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title TiketSell
 * @author huxixiLearning
 * @notice 这个合约是一个卖演出票的合约，每一张票都是一个NFT，合约创建者可以新增演出场次，用户可以选座位买票
 */

contract TiketSell is ERC721 {
    // 抽象演出
    struct Show {
        string showName; // 演出名
        string date; // 演出日期
        string time; // 演出时间
        string location; // 演出地点
        uint256 cost; // 票价
        uint256 tikets; // 剩余票量
        uint256 maxTikets; // 总票量
    }
    // 合约创始人
    address private immutable i_owner;
    // 演出场次
    uint256 private showNum;
    // 出售的票量
    uint256 private soldTickets;
    // 演出场次-》演出
    mapping(uint256 => Show) private shows;
    // 场次-》座位-》用户
    mapping(uint256 => mapping(uint256 => address)) private takenSeats;
    // 场次-》座位-》是否出售
    mapping(uint256 => mapping(uint256 => bool)) private hasBought;
    // 场次 -》 出售过的座位
    mapping(uint256 => uint256[]) private soldSeats;

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        i_owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == i_owner, "Not owner!");
        _;
    }

    // 合约的创始人可以添加待售的演出
    function listShow(
        string memory _showName,
        string memory _date,
        string memory _time,
        string memory _location,
        uint256 _cost,
        uint256 _tikets
    ) public onlyOwner {
        // 添加演出场次
        showNum += 1;
        shows[showNum] = Show(
            _showName,
            _date,
            _time,
            _location,
            _cost,
            _tikets,
            _tikets
        );
    }

    // 用户可以选座买票
    function buyTickets(uint256 _showNumber, uint256 _seat) public payable {
        // 选择的场次有效
        require(_showNumber != 0 && _showNumber <= showNum, "Invalid show!");
        // 选择场次的座位在售票范围内
        require(
            _seat != 0 && _seat <= shows[_showNumber].maxTikets,
            "Invalid seat!"
        );
        // 选择场次的座位还在
        require(
            takenSeats[_showNumber][_seat] == address(0),
            "Seat have been taken!"
        );
        // 支付的ETH大于票价
        require(msg.value >= shows[_showNumber].cost, "Not enough ETH!");

        // 出售座位
        takenSeats[_showNumber][_seat] = msg.sender;
        hasBought[_showNumber][_seat] = true;
        soldSeats[_showNumber].push(_seat);
        shows[_showNumber].tikets -= 1;
        soldTickets += 1;
        _safeMint(msg.sender, soldTickets);
    }

    // 合约创建者可以取出合约中的余额
    function withdraw() public payable onlyOwner {
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success, "call failed!");
    }

    function getShow(uint256 _id) public view returns (Show memory) {
        return shows[_id];
    }

    function getSoldSeats(uint _id) public view returns (uint[] memory) {
        return soldSeats[_id];
    }

    function getSeatUser(uint id, uint seat) public view returns (address) {
        return takenSeats[id][seat];
    }

    function getSeatBought(uint id, uint seat) public view returns (bool) {
        return hasBought[id][seat];
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getShowNum() public view returns (uint) {
        return showNum;
    }

    function getNumberOfSoldSeats() public view returns (uint256) {
        return soldTickets;
    }
}
