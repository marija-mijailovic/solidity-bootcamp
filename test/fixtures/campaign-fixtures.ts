import { Wallet } from "ethers";
import { campaignAddSuccess } from "./test-cases/campaign-add-success";
import { campaignEndTimeInPast } from "./test-cases/campaign-end-time-must-be-in-future";
import { campaignMoneyGoalGraterThanZero } from "./test-cases/campaign-money-goal-must-be-greater-than-zero";

export interface ICampaign {
  campaignId: number,
  beneficiary: string;
  timeGoal: number;
  moneyGoal: number;
  name: string;
  description: string; 
  tokenURI: string;
}

export async function campaignEndTimeMustBeInFutureFixture([beneficiary]: Wallet[]): Promise<ICampaign> {
  return {
    campaignId: campaignEndTimeInPast.id,
    beneficiary: beneficiary.address,
    timeGoal: campaignEndTimeInPast.timeGoal,
    moneyGoal: campaignEndTimeInPast.moneyGoal,
    name: campaignEndTimeInPast.name,
    description: campaignEndTimeInPast.description,
    tokenURI: campaignEndTimeInPast.tokenURI,
  }
}

export async function campaignMoneyGoalMustBeGreaterThanZero([beneficiary]: Wallet[]): Promise<ICampaign> {
  return {
    campaignId: campaignMoneyGoalGraterThanZero.id,
    beneficiary: beneficiary.address,
    timeGoal: campaignMoneyGoalGraterThanZero.timeGoal,
    moneyGoal: campaignMoneyGoalGraterThanZero.moneyGoal,
    name: campaignMoneyGoalGraterThanZero.name,
    description: campaignMoneyGoalGraterThanZero.description,
    tokenURI: campaignMoneyGoalGraterThanZero.tokenURI,
  }
}

export async function campaignAddSuccessFixture([beneficiary]: Wallet[]): Promise<ICampaign> {
  return {
    campaignId: campaignAddSuccess.id,
    beneficiary: beneficiary.address,
    timeGoal: campaignAddSuccess.timeGoal,
    moneyGoal: campaignAddSuccess.moneyGoal,
    name: campaignAddSuccess.name,
    description: campaignAddSuccess.description,
    tokenURI: campaignAddSuccess.tokenURI,
  }
}