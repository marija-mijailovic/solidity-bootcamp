import { Wallet } from "ethers";
import { zeroAmount } from "./test-cases/donation-amount-zero";
import { campaignNotExists } from "./test-cases/donation-not-exists-campaign";
import { donationSuccess } from "./test-cases/donation-success";

export interface IDonations {
  donor: Wallet,
  campaign: Wallet,
  id: number,
  amount: number
}

export async function donationSuccessFixture([donor, campaign]: Wallet[]): Promise<IDonations> {
  return {
    donor: donor,
    campaign: campaign,
    id: donationSuccess.id,
    amount: donationSuccess.amount
  }
}

export async function donationsZeroAmountFixture([donor, campaign]: Wallet[]): Promise<IDonations> {
  return {
    donor: donor,
    campaign: campaign,
    id: zeroAmount.id,
    amount: zeroAmount.amount
  }
}

export async function donationsCampaignNotExistsFixture([donor, campaign]: Wallet[]): Promise<IDonations> {
  return {
    donor: donor,
    campaign: campaign,
    id: campaignNotExists.id,
    amount: campaignNotExists.amount
  }
}