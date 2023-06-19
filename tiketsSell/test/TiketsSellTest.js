const { expect } = require("chai");
const { ethers } = require("hardhat");

const NAME = "TicketSell";
const SYMBOL = "TS";
const SHOWNAME = "happy";
const SHOWDATE = "30 May";
const SHOWTIME = "19:00PM";
const SHOWLOCATION = "Tianjin";
const SHOWCOST = ethers.parseUnits("1", "ether");
const SHOWTICKETS = 500;

describe("TiketsSell", () => {
  // 每个测试用例开始之前要先部署下合约
  let ticketSell;
  let seller;
  let buyer;
  beforeEach(async () => {
    // 用户
    [seller, buyer] = await ethers.getSigners();

    // 部署合约
    const TicketSell = await ethers.getContractFactory("TiketSell", seller);
    ticketSell = await TicketSell.deploy(NAME, SYMBOL);

    // 添加show
    await ticketSell
      .connect(seller)
      .listShow(
        SHOWNAME,
        SHOWDATE,
        SHOWTIME,
        SHOWLOCATION,
        SHOWCOST,
        SHOWTICKETS
      );
  });

  describe("constructor", () => {
    it("should set the name", async () => {
      expect(await ticketSell.name()).to.equal(NAME);
    });

    it("should set the symbol", async () => {
      expect(await ticketSell.symbol()).to.equal(SYMBOL);
    });

    it("should set the owner", async () => {
      expect(await ticketSell.getOwner()).to.equal(seller.address);
    });
  });

  describe("add show", () => {
    // 只有合约创建者可以添加演出
    it("only the owner can list show", async () => {
      await expect(
        ticketSell
          .connect(buyer)
          .listShow(
            SHOWNAME,
            SHOWDATE,
            SHOWTIME,
            SHOWLOCATION,
            SHOWCOST,
            SHOWTICKETS
          )
      ).revertedWith("Not owner!");
    });

    // 添加成功
    it("add show and add success", async () => {
      // showNum++
      expect(await ticketSell.getShowNum()).to.equal(1);
      // show set successfully
      const show = await ticketSell.getShow(1);
      expect(show.showName).to.equal(SHOWNAME);
      expect(show.date).to.equal(SHOWDATE);
      expect(show.time).to.equal(SHOWTIME);
      expect(show.location).to.equal(SHOWLOCATION);
      expect(show.cost).to.equal(SHOWCOST);
      expect(show.tikets).to.equal(SHOWTICKETS);
      expect(show.maxTikets).to.equal(SHOWTICKETS);
    });
  });

  describe("buy tickets", () => {
    const COST = ethers.parseUnits("1", "ether");
    beforeEach(async () => {
      await ticketSell.connect(buyer).buyTickets(1, 30, { value: COST });
    });
    // 选择场次有效性
    it("should select the valid show number", async () => {
      await expect(ticketSell.buyTickets(2, 1, { value: COST })).revertedWith(
        "Invalid show!"
      );
      await expect(ticketSell.buyTickets(0, 1, { value: COST })).revertedWith(
        "Invalid show!"
      );
    });
    // 选择的座位在有效范围内
    it("should select the valid seat", async () => {
      await expect(ticketSell.buyTickets(1, 0)).revertedWith("Invalid seat!");
      await expect(
        ticketSell.buyTickets(1, SHOWTICKETS + 1, { value: COST })
      ).revertedWith("Invalid seat!");
    });

    // 座位被选过了
    it("should select the seat which is not selected", async () => {
      await expect(ticketSell.buyTickets(1, 30, { value: COST })).revertedWith(
        "Seat have been taken!"
      );
    });

    // 支付的金额要大于票价
    it("should pay enough money", async () => {
      await expect(
        ticketSell.buyTickets(1, 40, {
          value: ethers.parseUnits("0.1", "ether"),
        })
      ).revertedWith("Not enough ETH!");
    });

    // 买票成功后成功更新状态变量
    it("record who buy this seat", async () => {
      expect(await ticketSell.getSeatUser(1, 30)).to.equal(buyer.address);
    });
    it("record the seat status", async () => {
      expect(await ticketSell.getSeatBought(1, 30)).to.equal(true);
    });
    it("record the sold seat", async () => {
      const soldseats = await ticketSell.getSoldSeats(1);
      expect(soldseats.length).to.equal(1);
      expect(soldseats[0]).to.equal(30);
    });
    it("should update the show s information", async () => {
      const show = await ticketSell.getShow(1);
      expect(show.tikets).to.equal(SHOWTICKETS - 1);
    });
    it("should update the number of sold seats", async () => {
      expect(await ticketSell.getNumberOfSoldSeats()).to.equal(1);
    });
    it("should add the contract balance", async () => {
      const balance = await ethers.provider.getBalance(ticketSell.target);
      expect(balance).to.equal(ethers.parseUnits("1", "ether"));
    });
  });

  describe("withdraw", () => {
    const COST = ethers.parseUnits("1", "ether");
    beforeEach(async () => {
      await ticketSell.connect(buyer).buyTickets(1, 30, { value: COST });
    });

    it("only the owner can withdraw", async () => {
      await expect(ticketSell.connect(buyer).withdraw()).revertedWith(
        "Not owner!"
      );
    });

    it("can be withdrawed successfully", async () => {
      const balanceBefore = await ethers.provider.getBalance(seller.address);
      await ticketSell.connect(seller).withdraw();
      const balanceAfter = await ethers.provider.getBalance(seller.address);
      expect(balanceAfter).to.greaterThan(balanceBefore);
    });
  });
});
