import { Contract, Wallet } from "ethers";
import { waffle } from "hardhat";
import DonationsNFT from "../../artifacts/contracts/DonationsNFT.sol/DonationsNFT.json";
import Donations from "../../artifacts/contracts/Donations.sol/Donations.json";

const { deployContract } = waffle;

export interface IDonationsFixture {
  donationsNFT: Contract
  donations: Contract,
}

export async function deployContractsFixture([owner]: Wallet[]): Promise<IDonationsFixture> {
  const donationsNFT = await deployContract(owner, DonationsNFT);
  const donations = await deployContract(owner, Donations, [donationsNFT.address]);
  return {donationsNFT, donations};
}