require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()
require("hardhat-abi-exporter");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-interface-generator");
require('solidity-coverage');
require('hardhat-contract-sizer');
require('@openzeppelin/hardhat-upgrades');
require("@tenderly/hardhat-tenderly");

module.exports = {
    networks: {
        hardhat: {
            accounts: process.env.DEPLOYER_PRIVATE_KEY !== undefined ? [
                {
                    privateKey: process.env.DEPLOYER_PRIVATE_KEY,
                    balance: "10000000000000000000000"
                },
                {
                    privateKey: process.env.DAO_PRIVATE_KEY,
                    balance: "10000000000000000000000"
                },
                {
                    privateKey: process.env.DEV_PRIVATE_KEY,
                    balance: "10000000000000000000000"
                }] : [],
        },
        polygon: {
            url: "https://polygon-rpc.com/",
            accounts: process.env.DEPLOYER_PRIVATE_KEY !== undefined ? [process.env.DEPLOYER_PRIVATE_KEY, process.env.DAO_PRIVATE_KEY, process.env.DEV_PRIVATE_KEY] : [],
        },
        polygonMumbai: {
            url: "https://rpc-mumbai.maticvigil.com/",
            accounts: process.env.DEPLOYER_PRIVATE_KEY !== undefined ? [process.env.DEPLOYER_PRIVATE_KEY, process.env.DAO_PRIVATE_KEY, process.env.DEV_PRIVATE_KEY] : [],
        }
    },
    etherscan: {
        apiKey: process.env.SCAN_API_KEY
    },
    solidity: {
        compilers: [{
            version: "0.6.12",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                },
                outputSelection: {
                    "*": {
                        "*": ["storageLayout"]
                    }
                }
            }
        }, {
            version: "0.8.9",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                },
                outputSelection: {
                    "*": {
                        "*": ["storageLayout",
                            "metadata"]
                    }
                }
            }
        },  {
            version: "0.8.4",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
        }, {
            version: "0.8.7",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
        }
        ],
    },
    abiExporter: [
        {
            path: './abi/pretty',
            pretty: true,
        },
        {
            path: './abi/ugly',
            pretty: false,
        },
    ]
}