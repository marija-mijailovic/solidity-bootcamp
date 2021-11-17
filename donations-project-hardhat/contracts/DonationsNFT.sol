// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/IDonationsNFT.sol";

contract DonationsNFT is IDonationsNFT, ERC721URIStorage, Ownable {
		using Counters for Counters.Counter;
		Counters.Counter private tokenId;
		address private donationsContract;

		/**
		* @notice Permission denied.
		*/
		error Unauthorized();

		/**
		* @notice The user is not allowed to receive nft. The user has gotten their gratitude token already.
		*/
		error UserAlreadyReceivedAward();

		constructor() ERC721("Donation gratitude NFT","DGNFT") {}

		function awardItem(address donor, string memory tokenURI) public override returns(uint256 itemTokenId){
			if(msg.sender != donationsContract) {
				revert Unauthorized();
			}
			
			if(balanceOf(donor) != 0) {
				revert UserAlreadyReceivedAward();
			}

			tokenId.increment();
			uint256 newTokenId = tokenId.current();
			_safeMint(donor, newTokenId);
			_setTokenURI(newTokenId, tokenURI);

			itemTokenId = newTokenId;
		}

		function setDonationsContract(address _donationsContract) public override onlyOwner {
			donationsContract = _donationsContract;
		}
}
