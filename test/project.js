import { expect } from "chai";
import { ethers } from "hardhat";

describe("Donator", function () {
  beforeEach(async function () {
    const Donator = await ethers.getContractFactory("Donator");
    const donator = await Donator.deploy();
    await donator.deployed();
    const [accountOne, accountTwo, accountThree] = await ethers.getSigners();
    this.accountOne = accountOne;
    this.accountTwo = accountTwo;
    this.accountThree = accountThree;
    this.donator = donator;
  });

  it("Donation", async function () {
    expect(await this.donator.getBalance()).to.equal(0);

    await expect(
      this.accountOne.sendTransaction({
        to: this.donator.address,
        value: ethers.utils.parseEther("0"),
      })
    ).to.be.revertedWith("ERROR: Incorrect donation value.");

    await this.accountOne.sendTransaction({
      to: this.donator.address,
      value: ethers.utils.parseEther("1"),
    });
    await this.accountTwo.sendTransaction({
      to: this.donator.address,
      value: ethers.utils.parseEther("4"),
    });

    expect(
      parseFloat(ethers.utils.formatEther(await this.donator.getBalance()))
    ).to.equal(5);
    expect(
      parseFloat(
        ethers.utils.formatEther(
          await this.donator.connect(this.accountOne).getMyBalance()
        )
      )
    ).to.equal(1);
    expect(
      parseFloat(
        ethers.utils.formatEther(
          await this.donator.connect(this.accountTwo).getMyBalance()
        )
      )
    ).to.equal(4);
  });

  it("Withdrawal of ETH", async function () {
    await this.accountOne.sendTransaction({
      to: this.donator.address,
      value: ethers.utils.parseEther("1"),
    });
    await this.accountTwo.sendTransaction({
      to: this.donator.address,
      value: ethers.utils.parseEther("4"),
    });

    await expect(
      this.donator
        .connect(this.accountTwo)
        .withdraw(await this.accountThree.getAddress())
    ).to.be.revertedWith("ERROR: You are not the owner.");

    await this.donator.withdraw(await this.accountThree.getAddress());
    expect(
      parseFloat(ethers.utils.formatEther(await this.donator.getBalance()))
    ).to.equal(0);
    expect(
      parseFloat(ethers.utils.formatEther(await this.accountThree.getBalance()))
    ).to.equal(10005);
  });

  it("Get list of users", async function () {
    await this.accountOne.sendTransaction({
      to: this.donator.address,
      value: ethers.utils.parseEther("1"),
    });
    await this.accountTwo.sendTransaction({
      to: this.donator.address,
      value: ethers.utils.parseEther("4"),
    });
    await this.accountTwo.sendTransaction({
      to: this.donator.address,
      value: ethers.utils.parseEther("4"),
    });
    await this.accountThree.sendTransaction({
      to: this.donator.address,
      value: ethers.utils.parseEther("12"),
    });

    expect(await this.donator.getUsers()).to.deep.equal([
      await this.accountOne.getAddress(),
      await this.accountTwo.getAddress(),
      await this.accountThree.getAddress(),
    ]);
  });
});