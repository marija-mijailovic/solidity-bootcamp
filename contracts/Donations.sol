// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IDonations.sol";
import "./DonationsNFT.sol";

contract Donations is IDonations, Ownable, ReentrancyGuard {
		DonationsNFT public donationsNFT;
		using Counters for Counters.Counter;
		Counters.Counter public campaignsTotal;
		mapping(uint => Campaign) public campaigns;
		mapping(address => bool) public donors;

		/**
		 * @notice Invalid campaign end time. The campaign end time must be in future.
		 */
		error InvalidCampaignEndTime();

		/**
		 * @notice Invalid campaign donation goal. The campaign money goal must be at least 1 wei.
		 */
		error InvalidCampaignDonationGoal();

		/**
		 * @notice Campaign is not found. The desired campaign does not exist.
		 */
		error NotFoundCampaign();

		/**
		 * @notice Invalid donation amount. The donation must be at least 1 wei.
		 */
		error InvalidDonationAmount();

		/**
		 * @notice Donation is not allowed. The campagin self donation is not allowed.
		 */
		error NotAllowedDonation();

		/**
		 * @notice Campaign is closed. The money goal reached or end time exceeded.
		 */
		error NotActiveCampaign();

		/**
		 * @notice Failed to send ether. The ether need to be refunded to the user.
		 */
		error FailedEtherSend();

		constructor(DonationsNFT _donationsNFT) {
				donationsNFT = _donationsNFT;
		}

		function addNewCampaign(address payable campaignAddress, uint256 timeGoal, uint256 moneyGoal, string memory name, string memory description, string memory tokenURI) public override onlyOwner {
			if(timeGoal <= block.timestamp){
					revert InvalidCampaignEndTime();
			}
			if(moneyGoal <= 0) {
					revert InvalidCampaignDonationGoal();
			}

			Campaign memory campaign = Campaign(campaignAddress, timeGoal, moneyGoal, 0, name, description, tokenURI);
			uint currentId = campaignsTotal.current();
			campaigns[currentId] = campaign;
			campaignsTotal.increment();
			emit CampaignCreation(currentId, campaign);
		}

		function donate(uint campaignId) public override payable nonReentrant {
			if(campaignId > campaignsTotal.current()) {
					revert NotFoundCampaign();
			}
			if(campaigns[campaignId].beneficiary == msg.sender) {
					revert NotAllowedDonation();
			}
			if(isCampaginClosed(campaignId)) {
					revert NotActiveCampaign();
			}
			if(msg.value < 1) {
					revert InvalidDonationAmount();
			}

			uint allowedAmount = donationAmountAllowed(campaignId);
			campaigns[campaignId].moneyReceived += allowedAmount;

			if(!donors[msg.sender]) {
					donors[msg.sender] = true;
					sendGratitudeNFTToken(campaigns[campaignId].tokenURI);
			}

			emit Donation(msg.sender, campaigns[campaignId].beneficiary, allowedAmount);

			if(msg.value > allowedAmount) {
				refundAmount(msg.value - allowedAmount);
			}
		}

		/**
		 * @dev Send the gratitude NFT to user.
		 * @param tokenURI The caampaign token uri of NFT.
		 */
		function sendGratitudeNFTToken(string memory tokenURI) private {
				uint tokenId = IDonationsNFT(donationsNFT).awardItem(msg.sender, tokenURI);

				emit MintNFT(msg.sender, tokenId);  
		}

		/**
		 * @dev Send the amount that excideed the money goal to user.
		 * @param amount The amount that excideed money goal of campaign.
		 */
		function refundAmount(uint amount) private {
			(bool sent, ) = msg.sender.call{value: amount}("");
			if(!sent) {
				revert FailedEtherSend();
			}

			emit RefundedAmount(msg.sender, amount);
		} 

		/**
		 * @dev Check the maximum allowed donation amount for the given campaign.
		 * @param campaignId The id of the campaign for a donation.
		 * @return The maximum allowed donation amount if the donation amount is above the money goal.
		 */
		function donationAmountAllowed(uint campaignId) private view returns (uint) {
				Campaign memory campaign = campaigns[campaignId];
				uint maximumAllowedAmount = campaign.moneyGoal - campaign.moneyReceived;
				if(msg.value < maximumAllowedAmount) {
					return msg.value;
				}
				return maximumAllowedAmount;
		}

		/**
		 * @dev Check if the given campaign is closed.
		 * @param campaignId The id of the campaign for a donation.
		 * @return closed The boolean value regarding if campaign is active.
		 */
		function isCampaginClosed(uint campaignId) private view returns (bool closed) {
				Campaign memory campaign = campaigns[campaignId];
				closed = (campaign.timeGoal <= block.timestamp || campaign.moneyGoal == campaign.moneyReceived);
		}
}
