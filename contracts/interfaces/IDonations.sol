// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IDonations {

    struct Campaign {
        address payable beneficiary;
        uint256 timeGoal;
        uint256 moneyGoal;
        uint256 moneyReceived;
        string name;
        string description;
    }

    event CampaignCreation(uint campaignId, Campaign campaign);
    event Donation(address indexed fromAddress, address indexed campaignAddress, uint donationAmount);

    /**
    * @notice Create a new campaign, allowed to the contract owner.
    * @param campaignAddress The donation address of the new campaign.
    * @param timeGoal The end time of the new campaign.
    * @param moneyGoal The donation goal of a new campaign, in wei.
    * @param name The name of the new campaign.
    * @param descripton Brief description of the new campaign.
    */
    function addNewCampaign(address payable campaignAddress, uint256 timeGoal, uint256 moneyGoal, string memory name, string memory descripton) external;

    /**
    * @notice Place donation in ether for the given campaign id.
    * @param campaignId The id of the campaign for a donation.
    */
    function donate(uint campaignId) external payable;
}
