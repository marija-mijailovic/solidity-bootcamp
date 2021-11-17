import { expect } from "chai";
import { Contract, Wallet } from "ethers";
import { ICampaign } from "./fixtures/campaign-fixtures";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import { IDonations } from "./fixtures/donations-fixtures";

export async function notOwner([address]: Wallet[], donations: Contract, fixture : ICampaign) {
  const {beneficiary, timeGoal, moneyGoal, name, description, tokenURI} = fixture;
  await expect(donations.connect(address).addNewCampaign(beneficiary, timeGoal, moneyGoal, name, description, tokenURI))
    .to.be.revertedWith("Ownable: caller is not the owner");
}

export async function notValidTimeEnd(donations: Contract, fixture: ICampaign) {
  await expect(getAddCampaignTx(donations, fixture))
    .to.be.revertedWith("InvalidCampaignEndTime");
}

export async function notValidMoneyGoal(donations: Contract, fixture: ICampaign) {
  await expect(getAddCampaignTx(donations, fixture))
    .to.be.revertedWith("InvalidCampaignDonationGoal");
}

export async function addCampaign(donations: Contract, fixture: ICampaign) {
  await expect(getAddCampaignTx(donations, fixture))
    .to.emit(donations, "CampaignCreation")
    .withArgs(fixture.campaignId, [fixture.beneficiary, fixture.timeGoal, fixture.moneyGoal, 0, fixture.name, fixture.description]);
}

export async function notExistCampaign(donations: Contract, fixture: IDonations) {
  await expect(getDonationTx(donations, fixture))
    .to.be.revertedWith("NotFoundCampaign");
}

export async function notValidAmount(donations: Contract, fixture: IDonations) {
  await expect(getDonationTx(donations, fixture))
    .to.be.revertedWith("InvalidDonationAmount");
}

export async function selfDonation(donations: Contract, fixture: IDonations) {
  const {campaign, id, amount} = fixture;
  await expect(donations.connect(campaign).donate(id, {value: amount}))
    .to.be.revertedWith("NotAllowedDonation");
}

export async function donateAmount(donations: Contract, fixture: IDonations) {
  await expect(getDonationTx(donations, fixture))
    .to.emit(donations, "Donation")
    .withArgs(fixture.donor.address, fixture.campaign.address, fixture.amount);
}

export async function donateAmountAndGetRefund(donations: Contract, fixture: IDonations, targetAmount: number) {
  await getDonationTx(donations, fixture);
  await expect(getDonationTx(donations, fixture))
    .to.emit(donations, "Donation")
    .withArgs(fixture.donor.address, fixture.campaign.address, targetAmount - fixture.amount)
    .to.emit(donations, "RefundedAmount")
    .withArgs(fixture.donor.address, fixture.amount - (targetAmount - fixture.amount));
}

export async function notValidDonation(donations: Contract, fixture: IDonations) {
  await getDonationTx(donations, fixture);
  await getDonationTx(donations, fixture);
  await expect(getDonationTx(donations, fixture))
    .to.be.revertedWith("NotActiveCampaign");
}

async function getAddCampaignTx(donations: Contract, fixture: ICampaign): Promise<TransactionResponse> {
  const {beneficiary, timeGoal, moneyGoal, name, description, tokenURI} = fixture;
  return donations.addNewCampaign(beneficiary, timeGoal, moneyGoal, name, description, tokenURI)
}

async function getDonationTx(donations: Contract, fixture: IDonations): Promise<TransactionResponse> {
  const {donor, id, amount} = fixture;
  return donations.connect(donor).donate(id, {value: amount});
}

