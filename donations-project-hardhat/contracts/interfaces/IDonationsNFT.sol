// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IDonationsNFT {

		/**
		* @notice Mint NFT token, and set the token URI.
		* @dev Allowed only to contract owner to call. Use _safeMint
		* @param donor The donor address who will mint the NFT Donations token.
		* @param tokenURI The URI of the NFT token.
		* @return itemTokenId Donations NFT token id.
		*/
		function awardItem(address donor,  string memory tokenURI) external returns (uint256 itemTokenId);

		/**
		* @dev Set the donations contract address
		* @param _donationsContract The donations contract address.
		*/
		function setDonationsContract(address _donationsContract) external;
}
