import brownie
from helper import event, set_custom_error
import web3

def test_donations_nft_contract_set_right_owner(deploy_contracts, owner):
  assert deploy_contracts[0].owner() == owner

def test_set_donations_contract_fail_permission_denied(deploy_contracts, other_account):
  with brownie.reverts("Ownable: caller is not the owner"):
    deploy_contracts[0].setDonationsContract(deploy_contracts[1].address, {"from":other_account})

def test_award_item_success(deploy_contracts, nft_data):
  donationsNFT, donations = deploy_contracts
  tx = __award_item(donationsNFT, nft_data, donations)
  tx.wait(1)
  result = event(tx, "Transfer", {"from": web3.constants.ADDRESS_ZERO, "to": nft_data[0], "tokenId": "1"})
  assert result is True, "Failed to mint NFT"

def test_award_item_fail_permission_denied(deploy_contracts, nft_data, other_account):
  with brownie.reverts(set_custom_error("Unauthorized()")):
    __award_item(deploy_contracts[0], nft_data, other_account)

def test_award_item_fail_user_already_mint_token(deploy_contracts, nft_data):
  donationsNFT, donations = deploy_contracts
  assert donationsNFT.balanceOf(nft_data[0]) == 0, "Invalid balance of user NFT token"
  __award_item(donationsNFT, nft_data, donations)
  assert donationsNFT.balanceOf(nft_data[0]) == 1, "Invalid balance of user NFT token"
  with brownie.reverts(set_custom_error("UserAlreadyReceivedAward()")):
    __award_item(donationsNFT, nft_data, donations)

def __award_item(donationsNFT, nft_data, donations):
  donor, tokenURI = nft_data
  tx = donationsNFT.awardItem(donor, tokenURI, {"from": donations})
  return tx