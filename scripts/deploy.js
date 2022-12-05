/* eslint-disable */
const hre = require("hardhat");
const {ethers} = require("hardhat");
const {BigNumber} = require("@ethersproject/bignumber");
const {smock} = require("@defi-wonderland/smock");
const readline = require("readline-sync");

// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
// });

async function main() {
    const [deployer, daofund, devfund] = await hre.ethers.getSigners();

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
    const oneTenth = BigNumber.from('100000000000000000');
    const oneHundredth = BigNumber.from('10000000000000000');
    const zero = BigNumber.from('0');
    const oneMillion = BigNumber.from('1000000000000000000000000');
    const oneBillion = BigNumber.from('1000000000000000000000000000');
    const pTokenPriceCeiling = BigNumber.from('1010000000000000000');
    const period = hours.mul(6);

    // const Tetrad = await hre.ethers.getContractFactory("Tetrad");
    // const tetrad = await Tetrad.deploy("0x0451A04c8d94c183273afdc368e0F794B1e81b15", "0x0451A04c8d94c183273afdc368e0F794B1e81b15", "0x8954AfA98594b838bda56FE4C12a09D7739D179b");
    // await tetrad.deployed();
    // console.log("- Tetrad deployed to:", tetrad.address);
    //
    // const poolAllocation = oneMillion;
    // const TetradRewardPool = await hre.ethers.getContractFactory("TetradRewardPool");
    // const tetradRewardPool = await TetradRewardPool.deploy(tetrad.address,
    //     Math.floor(Date.now() / 1000) + 60, years, poolAllocation);
    // await tetradRewardPool.deployed();
    // console.log("- TetradRewardPool deployed to:", tetradRewardPool.address);
    // await (await tetrad.transfer(tetradRewardPool.address, poolAllocation)).wait();
    // await (await tetradRewardPool.add(
    //     10000,
    //     await tetrad.uniswapV2Pair(),
    //     true,
    //     0
    //     )).wait();

    //await (await game.setFactory(factory.address)).wait();

    // const DummyToken = await hre.ethers.getContractFactory("DummyToken");
    // const dummyToken = await DummyToken.deploy();
    // await dummyToken.deployed();
    // console.log("- DummyToken deployed to:", dummyToken.address);

    const usdtAddress = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

    const TetradWallet = await hre.ethers.getContractFactory("TetradWallet");
    const tetradWallet = await TetradWallet.deploy(usdtAddress);
    await tetradWallet.deployed();
    console.log("- TetradWallet deployed to:", tetradWallet.address);
    await (await tetradWallet.adminChangeFeeWallet("0x15A9D96300602fe397eB404677cB5eDf04fFc15D")).wait();
    await (await tetradWallet.adminSettings(165, 1, 31)).wait();
    await (await tetradWallet.transferOwnership("0xBc74Fd37923E82e7c53D161856226CFDbe20FE38")).wait();
    console.log("- TetradWallet done.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});