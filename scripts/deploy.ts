import { ethers } from "hardhat";
import { OWNERS, required } from "./owners";

async function main() {
	const BoxV1 = await ethers.getContractFactory("FirstGeneration");
	const boxV1 = await BoxV1.deploy();
	await boxV1.waitForDeployment();

	const BoxV2 = await ethers.getContractFactory("SecondGeneration");
	const boxV2 = await BoxV2.deploy();
	await boxV2.waitForDeployment();

	const Proxy = await ethers.getContractFactory("Proxy");
	const proxy = await Proxy.deploy();
	await proxy.waitForDeployment();

	const ProxyAdmin = await ethers.getContractFactory("ProxyAdminMultisig");
	const proxyAdminMultisig = await ProxyAdmin.deploy(OWNERS, required);
	await proxyAdminMultisig.waitForDeployment();

	const addressProxyAdmin = proxyAdminMultisig.target;
	await proxy.setAdmin(addressProxyAdmin);

	console.log(`Implementation deployed to :${boxV1.target},
  Proxy deployed to :${proxy.target},
  ProxyAdmin deployed to :${proxyAdminMultisig.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
