const { ethers } = require('hardhat');
const { expect, assert, should, eventually } = require('chai');
const { smockit } = require('@defi-wonderland/smock');
const { intToBuffer } = require('ethjs-util');
const { BigNumber } = require('@ethersproject/bignumber');
const { smock } = require('@defi-wonderland/smock');
const chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
const { solidity } = require("ethereum-waffle");
chai.use(solidity);
const hre = require("hardhat");
const {setTime, advanceTime} = require("./shared/utilities");
const {getCurrentTimestamp} = require("hardhat/internal/hardhat-network/provider/utils/getCurrentTimestamp");

chai.use(chaiAsPromised);

async function latestBlocktime(provider) {
    const { timestamp } = await provider.getBlock('latest');
    return timestamp;
}
async function latestBlockNumber(provider) {
    const { number } = await provider.getBlock('latest');
    return number;
}

describe('v2', function () {
    var tetradWallet;
    var dummyToken;
    var deployer;
    var daofund;
    var devfund;
    var today;
    const seconds = BigNumber.from(1);
    const minutes = seconds.mul(60);
    const hours = minutes.mul(60);
    const days = hours.mul(24);
    const weeks = days.mul(7);
    const years = days.mul(365);

    const onePointTen = BigNumber.from('1100000000000000000');
    const one = BigNumber.from('1000000000000000000');
    const half = BigNumber.from('500000000000000000');
    const ten = BigNumber.from('10000000000000000000');
    const oneHundred = BigNumber.from('100000000000000000000');
    const oneThousand = BigNumber.from('1000000000000000000000');
    const oneTenth = BigNumber.from('100000000000000000');
    const oneHundredth = BigNumber.from('10000000000000000');
    const oneThousandth = BigNumber.from('1000000000000000');
    const oneTenThousandth = BigNumber.from('100000000000000');
    const zero = BigNumber.from('0');
    const oneBillion = BigNumber.from('1000000000000000000000000000');
    const pTokenPriceCeiling = BigNumber.from('1010000000000000000');
    const period = hours.mul(6);

    beforeEach('test', async () => {
        [deployer, daofund, devfund] = await ethers.getSigners();
        await network.provider.request({
            method: "hardhat_reset",
            params: [
                {
                    forking: {
                        jsonRpcUrl: "https://thrilling-light-shadow.matic-testnet.discover.quiknode.pro/760e2b4433ff69856f97b6f3f0629dab010d4b3b/",
                        //gasPrice: 25000000000,
                        blockNumber: 29045000
                    }
                }
            ]
        });
        dummyToken = await hre.ethers.getContractAt("DummyToken", "0x55915FD5433193a082434A280e7A460A3d529d2f");
        tetradWallet = await hre.ethers.getContractAt("TetradWallet", "0xfC309C4C742943060a55FB275B96E32ef13C885e");
        const TetradWallet = await hre.ethers.getContractFactory("TetradWallet");
        const tetradWalletMock = await TetradWallet.deploy(dummyToken.address);
        await tetradWalletMock.deployed();
        const code = await hre.network.provider.send("eth_getCode", [
            tetradWalletMock.address,
        ]);
        await hre.network.provider.send("hardhat_setCode", [
            tetradWallet.address,
            code,
        ]);
        today = new Date().getUTCDate();
        await ethers.provider.send('evm_mine', []);
        await setTime(ethers.provider, Math.floor(Date.now() / 1000));
        await ethers.provider.send('evm_mine', []);
    });

    describe('TetradWallet', () => {
        it("isLocked SUCCESS", async () => {
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            expect(await tetradWallet.isLocked()).to.equal(false);
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today+1, today+1);
            expect(await tetradWallet.isLocked()).to.equal(true);
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today-1, today-1);
            expect(await tetradWallet.isLocked()).to.equal(true);
        });

        it("Unlocked: deposit and withdraw SUCCESS", async () => {
            //Set unlock time to today
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            const nonce = await tetradWallet.nonce();
            //await tetradWallet.adminSettings(0, today, today);
            await dummyToken.approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.deposit(oneHundred);
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.balanceToCollect(deployer.address)).to.equal(zero);
            expect(await tetradWallet.pendingShare(nonce, deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(oneHundred);
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred);
            await dummyToken.transfer(devfund.address, oneHundred);
            await dummyToken.connect(devfund).approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.connect(devfund).deposit(oneHundred.div(2));
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.availableToWithdraw(devfund.address)).to.equal(oneHundred.div(2));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(2));
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred.add(oneHundred.div(2)));
            await tetradWallet.connect(devfund).withdraw(oneHundred.div(4));
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.availableToWithdraw(devfund.address)).to.equal(oneHundred.div(4));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(4));
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred.add(oneHundred.div(4)));
            await tetradWallet.connect(devfund).withdraw(oneHundred.div(4));
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.availableToWithdraw(devfund.address)).to.equal(zero);
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(zero);
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred);
            expect(await dummyToken.balanceOf(devfund.address)).to.equal(oneHundred);
            console.log(ethers.utils.formatEther(await dummyToken.balanceOf(devfund.address)));
        });

        it("Unlocked: deposit and withdraw including fee SUCCESS", async () => {
            //Set unlock time to today
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            const nonce = await tetradWallet.nonce();
            await dummyToken.approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.deposit(oneHundred);
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred);
            await dummyToken.transfer(devfund.address, oneHundred);
            await dummyToken.connect(devfund).approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.connect(devfund).deposit(oneHundred.div(2));
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.availableToWithdraw(devfund.address)).to.equal(oneHundred.div(2));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(2));
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred.add(oneHundred.div(2)));
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today-1, today-1);
            await tetradWallet.adminDeposit(0);
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            await tetradWallet.connect(devfund).withdraw(oneHundred.div(4));
            // expect(await tetradWallet.balanceToCollect(deployer.address)).to.equal(oneHundred);
            // expect(await tetradWallet.balanceToCollect(devfund.address)).to.equal(oneHundred.div(4));
            // expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(4));
            // expect(await tetradWallet.totalDeposited()).to.equal(oneHundred.add(oneHundred.div(4)));
            await tetradWallet.connect(devfund).withdraw(oneHundred.div(4));
            // expect(await tetradWallet.balanceToCollect(deployer.address)).to.equal(oneHundred);
            // expect(await tetradWallet.balanceToCollect(devfund.address)).to.equal(zero);
            // expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(zero);
            // expect(await tetradWallet.totalDeposited()).to.equal(oneHundred);
            expect(await dummyToken.balanceOf(devfund.address)).to.equal(oneHundred.sub(one).add(oneTenth.mul(2)).sub(oneTenth.div(4)));
            console.log(ethers.utils.formatEther(await dummyToken.balanceOf(devfund.address)));
        });

        it("Unlocked: deposit and withdraw partial lock SUCCESS", async () => {
            //Set unlock time to today
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            await dummyToken.approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.deposit(oneHundred);
            await dummyToken.transfer(devfund.address, oneHundred);
            await dummyToken.connect(devfund).approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            //Some old
            await tetradWallet.connect(devfund).deposit(oneHundred.div(4));
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today-1, today-1);
            await tetradWallet.adminDeposit(0);
            const nonce = await tetradWallet.nonce();
            //Some pending
            await tetradWallet.connect(devfund).deposit(oneHundred.div(4));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(oneHundred.div(4));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(4));
            //Some new
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            await tetradWallet.connect(devfund).deposit(oneHundred.div(4));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(oneHundred.div(2));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(2));
            //Some in wallet
            //await tetradWallet.connect(devfund).deposit(oneHundred.div(4));
            await tetradWallet.connect(devfund).withdraw(oneHundred.div(10));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(oneHundred.div(2).sub(oneHundred.div(10)));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(2).sub(oneHundred.div(10)));
            await tetradWallet.connect(devfund).withdraw(oneHundred.div(2).sub(oneHundred.div(10)));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(zero);
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(zero);
            await tetradWallet.connect(devfund).withdraw(oneHundred.div(4));
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(oneHundred)
            expect(await tetradWallet.availableToWithdraw(devfund.address)).to.equal(zero);
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred);
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(zero);
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(zero);
            expect(await dummyToken.balanceOf(devfund.address)).to.equal(ethers.utils.parseEther("99.5875"));
            console.log(ethers.utils.formatEther(await dummyToken.balanceOf(devfund.address)));
        });

        it("Locked: deposit and withdraw partial lock SUCCESS", async () => {
            //Set unlock time to today
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            await dummyToken.approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.deposit(oneHundred);
            await dummyToken.transfer(devfund.address, oneHundred);
            await dummyToken.connect(devfund).approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            //Some old
            await tetradWallet.connect(devfund).deposit(oneHundred.div(4));
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today-1, today-1);
            await tetradWallet.adminDeposit(0);
            const nonce = await tetradWallet.nonce();
            //Some pending
            await tetradWallet.connect(devfund).deposit(oneHundred.div(4));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(oneHundred.div(4));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(4));
            await tetradWallet.connect(devfund).deposit(oneHundred.div(4));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(oneHundred.div(2));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(2));
            //Some in wallet
            //await tetradWallet.connect(devfund).deposit(oneHundred.div(4));
            await tetradWallet.connect(devfund).withdraw(oneHundred.div(10));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(oneHundred.div(2).sub(oneHundred.div(10)));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(2).sub(oneHundred.div(10)));
            await tetradWallet.connect(devfund).withdraw(oneHundred.div(2).sub(oneHundred.div(10)));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(zero);
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(zero);
            //await tetradWallet.connect(devfund).withdraw(oneHundred.div(4));
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(zero);
            expect(await tetradWallet.unavailableToWithdraw(deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.availableToWithdraw(devfund.address)).to.equal(zero);
            expect(await tetradWallet.unavailableToWithdraw(devfund.address)).to.equal(oneHundred.div(4));
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred.add(oneHundred.div(4)));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(zero);
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(zero);
            expect(await dummyToken.balanceOf(devfund.address)).to.equal(ethers.utils.parseEther("75"));
            await expect(tetradWallet.connect(devfund).withdraw(oneHundred.div(4))).to.be.revertedWith("Insufficient total balance.");
            console.log(ethers.utils.formatEther(await dummyToken.balanceOf(devfund.address)));
        });

        it("Unlocked: deposit and collect SUCCESS", async () => {
            //Set unlock time to today
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            const nonce = await tetradWallet.nonce();
            //await tetradWallet.adminSettings(0, today, today);
            await dummyToken.approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.deposit(oneHundred);
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.balanceToCollect(deployer.address)).to.equal(zero);
            expect(await tetradWallet.pendingShare(nonce, deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(oneHundred);
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred);
            await dummyToken.transfer(devfund.address, oneHundred);
            await dummyToken.connect(devfund).approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.connect(devfund).deposit(oneHundred.div(2));
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.availableToWithdraw(devfund.address)).to.equal(oneHundred.div(2));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(2));
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred.add(oneHundred.div(2)));

            await tetradWallet.connect(devfund).collect();

            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.availableToWithdraw(devfund.address)).to.equal(zero);
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(zero);
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred);
            expect(await dummyToken.balanceOf(devfund.address)).to.equal(oneHundred);
            console.log(ethers.utils.formatEther(await dummyToken.balanceOf(devfund.address)));
        });

        it("Unlocked: deposit and collect including fee SUCCESS", async () => {
            //Set unlock time to today
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            const nonce = await tetradWallet.nonce();
            await dummyToken.approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.deposit(oneHundred);
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred);
            await dummyToken.transfer(devfund.address, oneHundred);
            await dummyToken.connect(devfund).approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.connect(devfund).deposit(oneHundred.div(2));
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.availableToWithdraw(devfund.address)).to.equal(oneHundred.div(2));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(2));
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred.add(oneHundred.div(2)));
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today-1, today-1);
            await tetradWallet.adminDeposit(0);
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);

            await tetradWallet.connect(devfund).collect();

            expect(await dummyToken.balanceOf(devfund.address)).to.equal(oneHundred.sub(one).add(oneTenth.mul(2)).sub(oneTenth.div(4)));
            console.log(ethers.utils.formatEther(await dummyToken.balanceOf(devfund.address)));
        });

        it("Unlocked: deposit and collect partial lock SUCCESS", async () => {
            //Set unlock time to today
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            await dummyToken.approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.deposit(oneHundred);
            await dummyToken.transfer(devfund.address, oneHundred);
            await dummyToken.connect(devfund).approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            //Some old
            await tetradWallet.connect(devfund).deposit(oneHundred.div(4));
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today-1, today-1);
            await tetradWallet.adminDeposit(0);
            const nonce = await tetradWallet.nonce();
            //Some pending
            await tetradWallet.connect(devfund).deposit(oneHundred.div(4));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(oneHundred.div(4));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(4));
            //Some new
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            await tetradWallet.connect(devfund).deposit(oneHundred.div(4));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(oneHundred.div(2));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(2));
            //Some in wallet
            //await tetradWallet.connect(devfund).deposit(oneHundred.div(4));

            await tetradWallet.connect(devfund).collect();

            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(oneHundred)
            expect(await tetradWallet.availableToWithdraw(devfund.address)).to.equal(zero);
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred);
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(zero);
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(zero);
            expect(await dummyToken.balanceOf(devfund.address)).to.equal(ethers.utils.parseEther("99.5875"));
            console.log(ethers.utils.formatEther(await dummyToken.balanceOf(devfund.address)));
        });

        it("Locked: deposit and collect partial lock SUCCESS", async () => {
            //Set unlock time to today
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            await dummyToken.approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.deposit(oneHundred);
            await dummyToken.transfer(devfund.address, oneHundred);
            await dummyToken.connect(devfund).approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            //Some old
            await tetradWallet.connect(devfund).deposit(oneHundred.div(4));
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today-1, today-1);
            await tetradWallet.adminDeposit(0);
            const nonce = await tetradWallet.nonce();
            //Some pending
            await tetradWallet.connect(devfund).deposit(oneHundred.div(4));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(oneHundred.div(4));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(4));
            await tetradWallet.connect(devfund).deposit(oneHundred.div(4));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(oneHundred.div(2));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(2));
            //Some in wallet
            //await tetradWallet.connect(devfund).deposit(oneHundred.div(4));

            await tetradWallet.connect(devfund).collect();

            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(zero);
            expect(await tetradWallet.unavailableToWithdraw(deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.availableToWithdraw(devfund.address)).to.equal(zero);
            expect(await tetradWallet.unavailableToWithdraw(devfund.address)).to.equal(oneHundred.div(4));
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred.add(oneHundred.div(4)));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(zero);
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(zero);
            expect(await dummyToken.balanceOf(devfund.address)).to.equal(ethers.utils.parseEther("75"));
            await expect(tetradWallet.connect(devfund).withdraw(oneHundred.div(4))).to.be.revertedWith("Insufficient total balance.");
            console.log(ethers.utils.formatEther(await dummyToken.balanceOf(devfund.address)));
        });

        it("Unlocked: depositOnBehalfOf and withdrawOnBehalfOf SUCCESS", async () => {
            //Set unlock time to today
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            const nonce = await tetradWallet.nonce();
            //await tetradWallet.adminSettings(0, today, today);
            await dummyToken.approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.deposit(oneHundred);
            await tetradWallet.connect(devfund).approve(deployer.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.balanceToCollect(deployer.address)).to.equal(zero);
            expect(await tetradWallet.pendingShare(nonce, deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(oneHundred);
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred);
            await dummyToken.transfer(devfund.address, oneHundred.div(2));
            await dummyToken.connect(devfund).approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.depositOnBehalfOf(devfund.address, oneHundred.div(2));
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.availableToWithdraw(devfund.address)).to.equal(oneHundred.div(2));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(2));
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred.add(oneHundred.div(2)));
            await tetradWallet.withdrawOnBehalfOf(devfund.address, oneHundred.div(4));
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.availableToWithdraw(devfund.address)).to.equal(oneHundred.div(4));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(4));
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred.add(oneHundred.div(4)));
            await tetradWallet.withdrawOnBehalfOf(devfund.address, oneHundred.div(4));
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.availableToWithdraw(devfund.address)).to.equal(zero);
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(zero);
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred);
            expect(await dummyToken.balanceOf(devfund.address)).to.equal(oneHundred);
            console.log(ethers.utils.formatEther(await dummyToken.balanceOf(devfund.address)));
        });

        it("Unlocked: depositOnBehalfOf and withdrawOnBehalfOf including fee SUCCESS", async () => {
            //Set unlock time to today
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            const nonce = await tetradWallet.nonce();
            await dummyToken.approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.deposit(oneHundred);
            await tetradWallet.connect(devfund).approve(deployer.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred);
            await dummyToken.transfer(devfund.address, oneHundred.div(2));
            await dummyToken.connect(devfund).approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.depositOnBehalfOf(devfund.address, oneHundred.div(2));
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.availableToWithdraw(devfund.address)).to.equal(oneHundred.div(2));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(2));
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred.add(oneHundred.div(2)));
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today-1, today-1);
            await tetradWallet.adminDeposit(0);
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            await tetradWallet.withdrawOnBehalfOf(devfund.address, oneHundred.div(4));
            // expect(await tetradWallet.balanceToCollect(deployer.address)).to.equal(oneHundred);
            // expect(await tetradWallet.balanceToCollect(devfund.address)).to.equal(oneHundred.div(4));
            // expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(4));
            // expect(await tetradWallet.totalDeposited()).to.equal(oneHundred.add(oneHundred.div(4)));
            await tetradWallet.withdrawOnBehalfOf(devfund.address, oneHundred.div(4));
            // expect(await tetradWallet.balanceToCollect(deployer.address)).to.equal(oneHundred);
            // expect(await tetradWallet.balanceToCollect(devfund.address)).to.equal(zero);
            // expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(zero);
            // expect(await tetradWallet.totalDeposited()).to.equal(oneHundred);
            expect(await dummyToken.balanceOf(devfund.address)).to.equal(oneHundred.sub(one).add(oneTenth.mul(2)).sub(oneTenth.div(4)));
            console.log(ethers.utils.formatEther(await dummyToken.balanceOf(devfund.address)));
        });

        it("Unlocked: depositOnBehalfOf and withdrawOnBehalfOf partial lock SUCCESS", async () => {
            //Set unlock time to today
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            await dummyToken.approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.deposit(oneHundred);
            await tetradWallet.connect(devfund).approve(deployer.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await dummyToken.transfer(devfund.address, oneHundred.div(4));
            await dummyToken.connect(devfund).approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            //Some old
            await tetradWallet.depositOnBehalfOf(devfund.address, oneHundred.div(4));
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today-1, today-1);
            await tetradWallet.adminDeposit(0);
            const nonce = await tetradWallet.nonce();
            //Some pending
            await tetradWallet.depositOnBehalfOf(devfund.address, oneHundred.div(4));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(oneHundred.div(4));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(4));
            //Some new
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            await tetradWallet.depositOnBehalfOf(devfund.address, oneHundred.div(4));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(oneHundred.div(2));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(2));
            //Some in wallet
            //await tetradWallet.depositOnBehalfOf(devfund.address, oneHundred.div(4));
            await tetradWallet.withdrawOnBehalfOf(devfund.address, oneHundred.div(10));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(oneHundred.div(2).sub(oneHundred.div(10)));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(2).sub(oneHundred.div(10)));
            await tetradWallet.withdrawOnBehalfOf(devfund.address, oneHundred.div(2).sub(oneHundred.div(10)));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(zero);
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(zero);
            await tetradWallet.withdrawOnBehalfOf(devfund.address, oneHundred.div(4));
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(oneHundred)
            expect(await tetradWallet.availableToWithdraw(devfund.address)).to.equal(zero);
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred);
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(zero);
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(zero);
            expect(await dummyToken.balanceOf(devfund.address)).to.equal(ethers.utils.parseEther("99.5875"));
            console.log(ethers.utils.formatEther(await dummyToken.balanceOf(devfund.address)));
        });

        it("Locked: depositOnBehalfOf and withdrawOnBehalfOf partial lock SUCCESS", async () => {
            //Set unlock time to today
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            await dummyToken.approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.deposit(oneHundred);
            await tetradWallet.connect(devfund).approve(deployer.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await dummyToken.transfer(devfund.address, oneHundred.div(4));
            await dummyToken.connect(devfund).approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            //Some old
            await tetradWallet.depositOnBehalfOf(devfund.address, oneHundred.div(4));
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today-1, today-1);
            await tetradWallet.adminDeposit(0);
            const nonce = await tetradWallet.nonce();
            //Some pending
            await tetradWallet.depositOnBehalfOf(devfund.address, oneHundred.div(4));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(oneHundred.div(4));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(4));
            await tetradWallet.depositOnBehalfOf(devfund.address, oneHundred.div(4));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(oneHundred.div(2));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(2));
            //Some in wallet
            //await tetradWallet.depositOnBehalfOf(devfund.address, oneHundred.div(4));
            await tetradWallet.withdrawOnBehalfOf(devfund.address, oneHundred.div(10));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(oneHundred.div(2).sub(oneHundred.div(10)));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(2).sub(oneHundred.div(10)));
            await tetradWallet.withdrawOnBehalfOf(devfund.address, oneHundred.div(2).sub(oneHundred.div(10)));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(zero);
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(zero);
            //await tetradWallet.withdrawOnBehalfOf(devfund.address, oneHundred.div(4));
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(zero);
            expect(await tetradWallet.unavailableToWithdraw(deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.availableToWithdraw(devfund.address)).to.equal(zero);
            expect(await tetradWallet.unavailableToWithdraw(devfund.address)).to.equal(oneHundred.div(4));
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred.add(oneHundred.div(4)));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(zero);
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(zero);
            expect(await dummyToken.balanceOf(devfund.address)).to.equal(ethers.utils.parseEther("75"));
            await expect(tetradWallet.withdrawOnBehalfOf(devfund.address, oneHundred.div(4))).to.be.revertedWith("Insufficient total balance.");
            console.log(ethers.utils.formatEther(await dummyToken.balanceOf(devfund.address)));
        });

        it("Unlocked: depositOnBehalfOf and collectOnBehalfOf SUCCESS", async () => {
            //Set unlock time to today
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            const nonce = await tetradWallet.nonce();
            //await tetradWallet.adminSettings(0, today, today);
            await dummyToken.approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.deposit(oneHundred);
            await tetradWallet.connect(devfund).approve(deployer.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.balanceToCollect(deployer.address)).to.equal(zero);
            expect(await tetradWallet.pendingShare(nonce, deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(oneHundred);
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred);
            await dummyToken.transfer(devfund.address, oneHundred.div(2));
            await dummyToken.connect(devfund).approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.depositOnBehalfOf(devfund.address, oneHundred.div(2));
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.availableToWithdraw(devfund.address)).to.equal(oneHundred.div(2));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(2));
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred.add(oneHundred.div(2)));

            await tetradWallet.collectOnBehalfOf(devfund.address);

            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.availableToWithdraw(devfund.address)).to.equal(zero);
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(zero);
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred);
            expect(await dummyToken.balanceOf(devfund.address)).to.equal(oneHundred);
            console.log(ethers.utils.formatEther(await dummyToken.balanceOf(devfund.address)));
        });

        it("Unlocked: depositOnBehalfOf and collectOnBehalfOf including fee SUCCESS", async () => {
            //Set unlock time to today
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            const nonce = await tetradWallet.nonce();
            await dummyToken.approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.deposit(oneHundred);
            await tetradWallet.connect(devfund).approve(deployer.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred);
            await dummyToken.transfer(devfund.address, oneHundred.div(2));
            await dummyToken.connect(devfund).approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.depositOnBehalfOf(devfund.address, oneHundred.div(2));
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.availableToWithdraw(devfund.address)).to.equal(oneHundred.div(2));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(2));
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred.add(oneHundred.div(2)));
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today-1, today-1);
            await tetradWallet.adminDeposit(0);
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);

            await tetradWallet.collectOnBehalfOf(devfund.address);

            expect(await dummyToken.balanceOf(devfund.address)).to.equal(oneHundred.sub(one).add(oneTenth.mul(2)).sub(oneTenth.div(4)));
            console.log(ethers.utils.formatEther(await dummyToken.balanceOf(devfund.address)));
        });

        it("Unlocked: depositOnBehalfOf and collectOnBehalfOf partial lock SUCCESS", async () => {
            //Set unlock time to today
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            await dummyToken.approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.deposit(oneHundred);
            await tetradWallet.connect(devfund).approve(deployer.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await dummyToken.transfer(devfund.address, oneHundred.div(4));
            await dummyToken.connect(devfund).approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            //Some old
            await tetradWallet.depositOnBehalfOf(devfund.address, oneHundred.div(4));
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today-1, today-1);
            await tetradWallet.adminDeposit(0);
            const nonce = await tetradWallet.nonce();
            //Some pending
            await tetradWallet.depositOnBehalfOf(devfund.address, oneHundred.div(4));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(oneHundred.div(4));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(4));
            //Some new
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            await tetradWallet.depositOnBehalfOf(devfund.address, oneHundred.div(4));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(oneHundred.div(2));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(2));
            //Some in wallet
            //await tetradWallet.depositOnBehalfOf(devfund.address, oneHundred.div(4));

            await tetradWallet.collectOnBehalfOf(devfund.address);

            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(oneHundred)
            expect(await tetradWallet.availableToWithdraw(devfund.address)).to.equal(zero);
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred);
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(zero);
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(zero);
            expect(await dummyToken.balanceOf(devfund.address)).to.equal(ethers.utils.parseEther("99.5875"));
            console.log(ethers.utils.formatEther(await dummyToken.balanceOf(devfund.address)));
        });

        it("Locked: depositOnBehalfOf and collectOnBehalfOf partial lock SUCCESS", async () => {
            //Set unlock time to today
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            await dummyToken.approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.deposit(oneHundred);
            await tetradWallet.connect(devfund).approve(deployer.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await dummyToken.transfer(devfund.address, oneHundred.div(4));
            await dummyToken.connect(devfund).approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            //Some old
            await tetradWallet.depositOnBehalfOf(devfund.address, oneHundred.div(4));
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today-1, today-1);
            await tetradWallet.adminDeposit(0);
            const nonce = await tetradWallet.nonce();
            //Some pending
            await tetradWallet.depositOnBehalfOf(devfund.address, oneHundred.div(4));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(oneHundred.div(4));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(4));
            await tetradWallet.depositOnBehalfOf(devfund.address, oneHundred.div(4));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(oneHundred.div(2));
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(oneHundred.div(2));
            //Some in wallet
            //await tetradWallet.depositOnBehalfOf(devfund.address, oneHundred.div(4));

            await tetradWallet.collectOnBehalfOf(devfund.address);

            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(zero);
            expect(await tetradWallet.unavailableToWithdraw(deployer.address)).to.equal(oneHundred);
            expect(await tetradWallet.availableToWithdraw(devfund.address)).to.equal(zero);
            expect(await tetradWallet.unavailableToWithdraw(devfund.address)).to.equal(oneHundred.div(4));
            expect(await tetradWallet.totalDeposited()).to.equal(oneHundred.add(oneHundred.div(4)));
            expect(await tetradWallet.pendingDeposited(nonce)).to.equal(zero);
            expect(await tetradWallet.pendingShare(nonce, devfund.address)).to.equal(zero);
            expect(await dummyToken.balanceOf(devfund.address)).to.equal(ethers.utils.parseEther("75"));
            await expect(tetradWallet.withdrawOnBehalfOf(devfund.address, oneHundred.div(4))).to.be.revertedWith("Insufficient total balance.");
            console.log(ethers.utils.formatEther(await dummyToken.balanceOf(devfund.address)));
        });

        it("collect initial and gains SUCCESS", async () => {
            //Set unlock time to today
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            await dummyToken.approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.deposit(oneHundred);
            await dummyToken.transfer(devfund.address, oneHundred);
            await dummyToken.connect(devfund).approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            //Some old
            await tetradWallet.connect(devfund).deposit(oneHundred);
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today-1, today-1);
            await tetradWallet.adminDeposit(ethers.utils.parseEther("100").mul(2));
            const nonce = await tetradWallet.nonce();
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(ethers.utils.parseEther("200"));
            expect(await tetradWallet.availableToWithdraw(devfund.address)).to.equal(ethers.utils.parseEther("200"));
            await tetradWallet.connect(devfund).collect();

            expect(await dummyToken.balanceOf(devfund.address)).to.equal(ethers.utils.parseEther("196.7"));
            console.log(ethers.utils.formatEther(await dummyToken.balanceOf(devfund.address)));
        });

        it("collect initial and gains solo SUCCESS", async () => {
            //Set unlock time to today
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            await dummyToken.approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await dummyToken.transfer(devfund.address, oneHundred);
            await dummyToken.connect(devfund).approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            //Some old
            await tetradWallet.connect(devfund).deposit(oneHundred);
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today-1, today-1);
            await tetradWallet.adminDeposit(ethers.utils.parseEther("100"));
            await tetradWallet.deposit(oneHundred);
            const nonce = await tetradWallet.nonce();
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);

            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(ethers.utils.parseEther("100"));
            expect(await tetradWallet.availableToWithdraw(devfund.address)).to.equal(ethers.utils.parseEther("200"));
            await tetradWallet.connect(devfund).collect();

            expect(await dummyToken.balanceOf(devfund.address)).to.equal(ethers.utils.parseEther("196.7"));
            console.log(ethers.utils.formatEther(await dummyToken.balanceOf(devfund.address)));
        });

        it("takeProfit SUCCESS", async () => {
            //Set unlock time to today
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            await dummyToken.approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.deposit(oneHundred);
            await dummyToken.transfer(devfund.address, oneHundred);
            await dummyToken.connect(devfund).approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            //Some old
            await tetradWallet.connect(devfund).deposit(oneHundred);
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today-1, today-1);
            await tetradWallet.adminDeposit(ethers.utils.parseEther("50").mul(2));
            const nonce = await tetradWallet.nonce();
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(ethers.utils.parseEther("150"));
            expect(await tetradWallet.availableToWithdraw(devfund.address)).to.equal(ethers.utils.parseEther("150"));
            await tetradWallet.connect(devfund).takeProfit();

            expect(await dummyToken.balanceOf(devfund.address)).to.equal(ethers.utils.parseEther("49.175"));
            console.log(ethers.utils.formatEther(await dummyToken.balanceOf(devfund.address)));
        });

        it("withdrawInitialMinusFee SUCCESS", async () => {
            //Set unlock time to today
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            await dummyToken.approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.deposit(oneHundred);
            await dummyToken.transfer(devfund.address, oneHundred);
            await dummyToken.connect(devfund).approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            //Some old
            await tetradWallet.connect(devfund).deposit(oneHundred);
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today-1, today-1);
            await tetradWallet.adminDeposit(ethers.utils.parseEther("50").mul(2));
            const nonce = await tetradWallet.nonce();
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(ethers.utils.parseEther("150"));
            expect(await tetradWallet.availableToWithdraw(devfund.address)).to.equal(ethers.utils.parseEther("150"));
            await tetradWallet.connect(devfund).withdrawInitialMinusFee();

            expect(await dummyToken.balanceOf(devfund.address)).to.equal(ethers.utils.parseEther("98.35"));
            console.log(ethers.utils.formatEther(await dummyToken.balanceOf(devfund.address)));
        });

        it.only("withdrawIgnoreLosses SUCCESS", async () => {
            //Set unlock time to today
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            await dummyToken.approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            await tetradWallet.deposit(oneHundred);
            await dummyToken.transfer(devfund.address, oneHundred);
            await dummyToken.connect(devfund).approve(tetradWallet.address, BigNumber.from("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
            //Some old
            await tetradWallet.connect(devfund).deposit(oneHundred);
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today-1, today-1);
            await tetradWallet.adminWithdraw(ethers.utils.parseEther("50").mul(2));
            const nonce = await tetradWallet.nonce();
            await tetradWallet.adminSettings(await tetradWallet.withdrawFee(), today, today);
            expect(await tetradWallet.availableToWithdraw(deployer.address)).to.equal(ethers.utils.parseEther("50"));
            expect(await tetradWallet.availableToWithdraw(devfund.address)).to.equal(ethers.utils.parseEther("50"));
            await tetradWallet.connect(devfund).withdrawIgnoreLosses(oneHundred);

            expect(await dummyToken.balanceOf(devfund.address)).to.equal(ethers.utils.parseEther("49.175"));
            console.log(ethers.utils.formatEther(await dummyToken.balanceOf(devfund.address)));
        });

        //TODO: Failure cases
        //TODO: Stretch goal (after test deployment, before mainnet deployment): OnBehalfOf versions of the three above, admin functionality

    });
});