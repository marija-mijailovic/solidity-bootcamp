// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IDonations.sol";

contract Donations is IDonations, Ownable {
    uint public campaignsTotal;
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
     * @notice Invalid donation amount. The donation must be at least 1 wei, and below campaign donation goal.
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

    function addNewCampaign(address payable campaignAddress, uint256 timeGoal, uint256 moneyGoal, string memory name, string memory descripton) public override onlyOwner {
      if(timeGoal <= block.timestamp){
          revert InvalidCampaignEndTime();
      }
      if(moneyGoal <= 0) {
          revert InvalidCampaignDonationGoal();
      }

      Campaign memory campaign = Campaign(campaignAddress, timeGoal, moneyGoal, 0, name, descripton);
      campaigns[campaignsTotal] = campaign;

      emit CampaignCreation(campaignsTotal++, campaign);
    }

    function donate(uint campaignId) public override payable {
      if(campaignId > campaignsTotal) {
          revert NotFoundCampaign();
      }
      if(msg.value <= 0 || !isDonationAmountAllowed(campaignId)) {
          revert InvalidDonationAmount();
      }
      if(campaigns[campaignId].beneficiary == msg.sender) {
          revert NotAllowedDonation();
      }
      if(isCampaginClosed(campaignId)) {
          revert NotActiveCampaign();
      }

      campaigns[campaignId].moneyReceived += msg.value;
      if(!donors[msg.sender]) {
          donors[msg.sender] = true;
      }

      emit Donation(msg.sender, campaigns[campaignId].beneficiary, msg.value);
    }

    /**
     * @dev Check the maximum allowed donation amount for the given campaign.
     * @param campaignId The id of the campaign for a donation.
     * @return allowed The boolean value depends on the maximum allowed donation.
     */
    function isDonationAmountAllowed(uint campaignId) private view returns (bool allowed) {
        Campaign memory campaign = campaigns[campaignId];
        uint maximumAllowedAmount = campaign.moneyGoal - campaign.moneyReceived;
        allowed = (msg.value <= maximumAllowedAmount ? true : false);
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
