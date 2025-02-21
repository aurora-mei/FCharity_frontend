import hardhat from "hardhat";
const { ethers } = hardhat;

async function main() {
    await network.provider.send("hardhat_reset");
    const CharityFund = await ethers.getContractFactory("CharityFund");
    const charity = await CharityFund.deploy(); // Deploy hợp đồng
    await charity.waitForDeployment(); // Chờ triển khai hoàn tất

    const contractAddress = await charity.getAddress(); // Lấy địa chỉ hợp đồng

    console.log("Contract deployed at:", contractAddress);
    console.log(await ethers.provider.getNetwork().then(net => net.chainId));


}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
