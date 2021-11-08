// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/IDonationsNFT.sol";
import "./Donations.sol";

contract DonationsNFT is IDonationsNFT, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private tokenId;
    Donations public donations;

    /**
    * @notice User donations not found. The user has not donated yet.
    */
    error NotFoundUserDonation();

    /**
    * @notice User is not allowed to mint token. The user has alerady minted their token.
    */
    error NotAllowedUserToMintToken();

    constructor(Donations _donations) ERC721("Donation gratitude NFT","DGNFT") {
        donations = _donations;
    }

    function awardItem(address donor, string memory tokenURI) public override onlyOwner returns(uint256 itemTokenId){
        if(!donations.donors(donor)) {
          revert NotFoundUserDonation();
        }
        if(balanceOf(donor) != 0) {
          revert NotAllowedUserToMintToken();
        }

        tokenId.increment();
        uint256 newTokenId = tokenId.current();
        _safeMint(donor, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        itemTokenId = newTokenId;
    }
}
