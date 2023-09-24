import { ProxyAdminMultisig } from "../typechain-types";
import { loadFixture, ethers, expect } from "./setup";

describe("ProxyAdmin", function () {
	async function deploy() {
		const [user1, user2, user3, user4] = await ethers.getSigners();

		const BoxV1 = await ethers.getContractFactory("FirstGeneration");
		const boxV1 = await BoxV1.deploy();
		await boxV1.waitForDeployment();

		const BoxV2 = await ethers.getContractFactory("SecondGeneration");
		const boxV2 = await BoxV2.deploy();
		await boxV2.waitForDeployment();

		const Proxy = await ethers.getContractFactory("Proxy");
		const proxy = await Proxy.deploy();
		await proxy.waitForDeployment();

		const ProxyAdmin = await ethers.getContractFactory(
			"ProxyAdminMultisig"
		);
		const proxyAdminMultisig = await ProxyAdmin.deploy(
			[user2.address, user3.address, user4.address],
			2
		);
		await proxyAdminMultisig.waitForDeployment();

		const addressProxyAdmin = proxyAdminMultisig.target;
		await proxy.setAdmin(addressProxyAdmin);

		return {
			user1,
			user2,
			user3,
			user4,
			boxV1,
			boxV2,
			proxy,
			proxyAdminMultisig,
		};
	}

	it("should have correct Admin", async function () {
		const { boxV1, boxV2, proxy, proxyAdminMultisig } = await loadFixture(
			deploy
		);

		expect(boxV1.target).to.be.properAddress;
		expect(proxy.target).to.be.properAddress;
		expect(boxV2.target).to.be.properAddress;
		expect(proxyAdminMultisig.target).to.be.properAddress;
		const adminSlot = await proxy.ADMIN_SLOT();

		const packedAddr = ethers.zeroPadValue(
			await proxyAdminMultisig.getAddress(),
			32
		);
		expect(
			await ethers.provider.getStorage(proxy.target, adminSlot)
		).to.be.eq(packedAddr);
	});

	it("should upgrade Implementation", async function () {
		const { user2, user3, user4, boxV1, proxy, proxyAdminMultisig } =
			await loadFixture(deploy);

		const submitTx = await proxyAdminMultisig
			.connect(user2)
			.submitTransaction(1, 100);

		await submitTx.wait();

		const confirmTx = await proxyAdminMultisig
			.connect(user3)
			.confirm(0, proxy.target, boxV1.target);

		await confirmTx.wait();

		const implementationSlot = await proxy.IMPLEMENTATION_SLOT();

		const packedAddr = ethers.zeroPadValue(await boxV1.getAddress(), 32);
		expect(
			await ethers.provider.getStorage(proxy.target, implementationSlot)
		).to.be.eq(packedAddr);
	});

	it("should set Admin", async function () {
		const { user2, user3, user4, proxy, proxyAdminMultisig } =
			await loadFixture(deploy);

		const submitTx = await proxyAdminMultisig
			.connect(user2)
			.submitTransaction(0, 100);

		await submitTx.wait();

		const confirmTx = await proxyAdminMultisig
			.connect(user3)
			.confirm(0, proxy.target, user4.address);

		await confirmTx.wait();

		const adminSlot = await proxy.ADMIN_SLOT();

		const packedAddr = ethers.zeroPadValue(await user4.address, 32);
		expect(
			await ethers.provider.getStorage(proxy.target, adminSlot)
		).to.be.eq(packedAddr);
	});

	it("should return Admin value", async function () {
		const { user2, proxy, proxyAdminMultisig } = await loadFixture(deploy);

		const adminValue = await proxyAdminMultisig
			.connect(user2)
			.getProxyAdmin(proxy.getAddress());

		expect(adminValue).to.be.eq(proxyAdminMultisig.target);
	});

	it("should return Implementation value", async function () {
		const { user2, user3, proxy, boxV1, proxyAdminMultisig } =
			await loadFixture(deploy);

		const submitTx = await proxyAdminMultisig
			.connect(user2)
			.submitTransaction(1, 100);

		await submitTx.wait();

		const confirmTx = await proxyAdminMultisig
			.connect(user3)
			.confirm(0, proxy.target, boxV1.target);

		await confirmTx.wait();

		const implementationValue = await proxyAdminMultisig
			.connect(user2)
			.getProxyImplementation(proxy.getAddress());

		expect(implementationValue).to.be.eq(boxV1.target);
	});

	it("should revert submitTransaction if not an owner", async function () {
		const { user1, proxy, boxV1, proxyAdminMultisig } = await loadFixture(
			deploy
		);

		await expect(
			proxyAdminMultisig.connect(user1).submitTransaction(1, 100)
		).to.be.revertedWith("Not An Owner");
	});

	it("should revert confirm Transaction if not an owner", async function () {
		const { user1, user2, proxy, boxV1, proxyAdminMultisig } =
			await loadFixture(deploy);

		const submitTx = await proxyAdminMultisig
			.connect(user2)
			.submitTransaction(1, 100);

		await expect(
			proxyAdminMultisig
				.connect(user1)
				.confirm(0, proxy.target, boxV1.target)
		).to.be.revertedWith("Not An Owner");
	});

	it("should revert getAdmin&getImplementation if not an owner", async function () {
		const { user1, proxy, boxV1, proxyAdminMultisig } = await loadFixture(
			deploy
		);

		await expect(
			proxyAdminMultisig
				.connect(user1)
				.getProxyImplementation(proxy.getAddress())
		).to.be.revertedWith("Not An Owner");

		await expect(
			proxyAdminMultisig.connect(user1).getProxyAdmin(proxy.getAddress())
		).to.be.revertedWith("Not An Owner");
	});
});
