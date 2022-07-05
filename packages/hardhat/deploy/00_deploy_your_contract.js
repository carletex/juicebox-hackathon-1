// deploy/00_deploy_your_contract.js
const { ethers } = require("hardhat");

const localChainId = "31337";

// JuiceBox config
const juiceBoxProjectId = "4283";
// ToDo. Maybe this should go the global config.json we are going to create?
// We have deployed these Payers from the JB UI
const juiceboxPayers = {
  1: "",
  4: "0x7c89c6a1686109D7514aD009BAD27140EC94fc80",
};

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
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
    juiceBoxPayerAddress = juiceboxPayers.chainId;
  }

  await deploy("JBNFT", {
    from: deployer,
    args: [juiceBoxProjectId, juiceBoxPayerAddress],
    log: true,
    waitConfirmations: 5,
  });

  const jbnft = await ethers.getContract("JBNFT", deployer);

  const result = await jbnft.addLevel(
    ethers.utils.parseEther("0.01"),
    "QmfVMAmNM1kDEBYrC2TPzQDoCRFH6F5tE1e9Mr4FkkR5Xr"
  );
};
module.exports.tags = ["JBNFT"];
