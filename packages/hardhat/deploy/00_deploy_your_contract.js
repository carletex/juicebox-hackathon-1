// deploy/00_deploy_your_contract.js
const { ethers } = require("hardhat");
// JuiceBox config
const config = require("../../react-app/src/config.json");

const localChainId = "31337";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  // ToDo. Check that config.json is filled

  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  let juiceBoxPayerAddress;
  if (chainId === localChainId) {
    await deploy("DummyPayer", {
      from: deployer,
      log: true,
      waitConfirmations: 5,
    });

    const dummyPayer = await ethers.getContract("DummyPayer", deployer);
    juiceBoxPayerAddress = dummyPayer.address;
  } else {
    juiceBoxPayerAddress = config.juiceboxPayersAddresses[chainId];
  }

  await deploy("JBNFT", {
    from: deployer,
    args: [
      config.nftName,
      config.nftSymbol,
      config.juiceBoxProjectId,
      juiceBoxPayerAddress,
    ],
    log: true,
    waitConfirmations: 5,
  });

  const jbnft = await ethers.getContract("JBNFT", deployer);

  let tx;
  let level;
  for (let i = 0; i < config.nfts.levels.length; i++) {
    level = config.nfts.levels[i];
    tx = await jbnft.addLevel(
      ethers.utils.parseEther(level.price),
      level.metadataHash
    );

    await tx.wait();
  }
};
module.exports.tags = ["JBNFT"];
