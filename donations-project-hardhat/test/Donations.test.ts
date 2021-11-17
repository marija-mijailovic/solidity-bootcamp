import { expect } from "chai";
import { Contract } from "ethers";
import { waffle } from "hardhat";
import { deployContractsFixture } from "./fixtures/fixtures";
import { campaignAddSuccessFixture, campaignEndTimeMustBeInFutureFixture, campaignMoneyGoalMustBeGreaterThanZero } from "./fixtures/campaign-fixtures";
import { addCampaign, donateAmount, donateAmountAndGetRefund, notExistCampaign, notOwner, notValidAmount, notValidDonation, notValidMoneyGoal, notValidTimeEnd, selfDonation } from "./donations";
import { donationsCampaignNotExistsFixture, donationSuccessFixture, donationsZeroAmountFixture } from "./fixtures/donations-fixtures";

const { createFixtureLoader } = waffle;
const provider = waffle.provider;

describe("Donations contract", () => {
		const [owner, campaign, donor, address] = provider.getWallets();
		const loadContractFixture = createFixtureLoader([owner], provider);
		const loadCampaignFixture = createFixtureLoader([campaign], provider);
		const loadDonationFixture = createFixtureLoader([donor, campaign], provider);
		let donationsNFTContract: Contract;
		let donationsContract: Contract;

		beforeEach(async () => {
			const contractFixture = await loadContractFixture(deployContractsFixture);
			donationsNFTContract = contractFixture.donationsNFT;
			donationsContract = contractFixture.donations;
			await donationsNFTContract.setDonationsContract(donationsContract.address);
		});

		describe("Deployment", () => {
			it("Should set the right owner", async () => {
					const ownerAddress = await owner.getAddress();
					expect(await donationsContract.owner()).to.equal(ownerAddress);
			});
		});

		describe("Adding new campaign", () => {
			it("Should add new campaign.", async () => {
				const campaignFixture = await loadCampaignFixture(campaignAddSuccessFixture);
				await addCampaign(donationsContract, campaignFixture);
			});

			it("Should fail with reason: The campaign end time must be in future.", async () => {
				const campaignFixture = await loadCampaignFixture(campaignEndTimeMustBeInFutureFixture);
				await notValidTimeEnd(donationsContract, campaignFixture);
			});

			it("Should fail with reason: The campaign money goal must be at least 1 wei.", async () => {
				const campaignFixture = await loadCampaignFixture(campaignMoneyGoalMustBeGreaterThanZero);
				await notValidMoneyGoal(donationsContract, campaignFixture);
			});

			it("Shoud fail with reason: not owner.", async () => {
				const campaignFixture = await loadCampaignFixture(campaignAddSuccessFixture);
				await notOwner([address], donationsContract, campaignFixture);
			});
		});

		describe("User donations", () => {
			it("Should donate successfully", async () => {
				const campaignFixture = await loadCampaignFixture(campaignAddSuccessFixture);
				await addCampaign(donationsContract, campaignFixture);
				const donationsFixture = await loadDonationFixture(donationSuccessFixture);
				await donateAmount(donationsContract, donationsFixture);
			});

			it("Should donate successfully and return the value that exceeded the target", async () => {
				const campaignFixture = await loadCampaignFixture(campaignAddSuccessFixture);
				await addCampaign(donationsContract, campaignFixture);
				const donationsFixture = await loadDonationFixture(donationSuccessFixture);
				await donateAmountAndGetRefund(donationsContract, donationsFixture, campaignFixture.moneyGoal);
			});

			it("Should fail with reason: The desired campaign does not exist.", async () => {
				const donationsFixture = await loadDonationFixture(donationsCampaignNotExistsFixture);
				await notExistCampaign(donationsContract, donationsFixture);
			});

			it("Should fail with reason: The donation must be at least 1 wei.", async () => {
				const campaignFixture = await loadCampaignFixture(campaignAddSuccessFixture);
				await addCampaign(donationsContract, campaignFixture);
				const donationsFixture = await loadDonationFixture(donationsZeroAmountFixture);
				await notValidAmount(donationsContract, donationsFixture);
			});

			it("Should fail with reason: The campagin self donation is not allowed.", async () => {
				const campaignFixture = await loadCampaignFixture(campaignAddSuccessFixture);
				await addCampaign(donationsContract, campaignFixture);
				const donationsFixture = await loadDonationFixture(donationSuccessFixture);
				await selfDonation(donationsContract, donationsFixture);
			});

			it("Should fail with reason: The money goal reached or end time exceeded.", async () => {
				const campaignFixture = await loadCampaignFixture(campaignAddSuccessFixture);
				await addCampaign(donationsContract, campaignFixture);
				const donationsFixture = await loadDonationFixture(donationSuccessFixture);
				await notValidDonation(donationsContract, donationsFixture);
			});	
	  });
});

