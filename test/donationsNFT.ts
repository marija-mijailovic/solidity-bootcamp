import { expect } from "chai";
import { Contract, ethers, Wallet } from "ethers";
import { INFT } from "./fixtures/nft-fixtures";
import { TransactionResponse } from "@ethersproject/abstract-provider";

export async function notOwner([donations, address]: Wallet[], donationsNFT: Contract) {
  await expect(donationsNFT.connect(address).callStatic.setDonationsContract(donations.address))
    .to.be.revertedWith("Ownable: caller is not the owner");
}

export async function notAllowedToMintNFT(donationsNFT: Contract, fixture: INFT) {
  const {donor, tokenURI} = fixture;
  await expect(donationsNFT.awardItem(donor, tokenURI))
    .to.be.revertedWith("Unauthorized");
}

export async function awardNFT([donations]: Wallet[], donationsNFT: Contract, fixture: INFT) {
  const {donor, tokenURI} = fixture;
  await expect(getAwardItemTx(donations, donationsNFT, donor, tokenURI))
    .to.be.emit(donationsNFT, "Transfer")
    .withArgs(ethers.constants.AddressZero, donor, "1");
}

export async function userAlreadyReceivedNFT([donations]: Wallet[], donationsNFT: Contract, fixture: INFT) {
  const {donor, tokenURI} = fixture;
  expect(await donationsNFT.balanceOf(donor))
      .to.be.equal(0);
  await getAwardItemTx(donations, donationsNFT, donor, tokenURI);
  expect(await donationsNFT.balanceOf(donor))
      .to.be.equal(1);
  await expect(getAwardItemTx(donations, donationsNFT, donor, tokenURI))
    .to.be.revertedWith("UserAlreadyReceivedAward");
}

async function getAwardItemTx(donations: Wallet, donationsNFT: Contract, donor: String, tokenURI: String): Promise<TransactionResponse> {
  return donationsNFT.connect(donations).awardItem(donor, tokenURI);
}