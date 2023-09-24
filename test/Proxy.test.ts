import { Proxy } from "../typechain-types";
import { loadFixture, ethers, expect } from "./setup";
const FIRST_ADDRESS = "0x0000000000000000000000000000000000000001";

describe("Proxy", function () {
	async function deploy() {
		const [user1, user2] = await ethers.getSigners();

		const BoxV1 = await ethers.getContractFactory("BoxV1");
		const boxV1 = await BoxV1.deploy();
		await boxV1.waitForDeployment();

		const BoxV2 = await ethers.getContractFactory("BoxV2");
		const boxV2 = await BoxV2.deploy();
		await boxV2.waitForDeployment();

		const Proxy = await ethers.getContractFactory("Proxy");
		const proxy = await Proxy.deploy();
		await proxy.waitForDeployment();

		return {
			user1,
			user2,
			boxV1,
			boxV2,
			proxy,
		};
	}

	it("should set implementation", async function () {
		const { user1, boxV1, proxy } = await loadFixture(deploy);

		await proxy.connect(user1).upgradeImplementation(boxV1.target);

		const implementationSlot = await proxy.IMPLEMENTATION_SLOT();
		const packedAddr = ethers.zeroPadValue(await boxV1.getAddress(), 32);
		expect(
			await ethers.provider.getStorage(proxy.target, implementationSlot)
		).to.be.eq(packedAddr);
	});

	it("should set admin", async function () {
		const { user1, user2, proxy } = await loadFixture(deploy);

		await proxy.connect(user1).setAdmin(user2.address);

		const adminSlot = await proxy.ADMIN_SLOT();
		const packedAddr = ethers.zeroPadValue(user2.address, 32);
		expect(
			await ethers.provider.getStorage(proxy.target, adminSlot)
		).to.be.eq(packedAddr);
	});

	it("should correctly delegate to implementation", async function () {
		const { user1, user2, proxy, boxV1 } = await loadFixture(deploy);
		await proxy.connect(user1).upgradeImplementation(boxV1.target);

		const msgMintData = await boxV1.mintSel();

		const txMint = await user2.sendTransaction({
			to: proxy.target,
			data: msgMintData,
		});

		const msgTransferData = await boxV1.transferSel(user1.address, 40);

		const txTransfer = await user2.sendTransaction({
			to: proxy.target,
			data: msgTransferData,
		});

		expect(await proxy.balances(user2.address)).to.be.eq(60);
		expect(await proxy.balances(user1.address)).to.be.eq(40);
	});
});
