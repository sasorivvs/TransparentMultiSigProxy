import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { ACCOUNT_DEPLOYER, API } from "./config";

const config: HardhatUserConfig = {
	solidity: "0.8.19",
	networks: {
		goerli: {
			accounts: [ACCOUNT_DEPLOYER],
			url: API,
		},
	},
};

export default config;
