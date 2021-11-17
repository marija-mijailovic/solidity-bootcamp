import brownie
from helper import event, set_custom_error

def test_donations_contract_set_right_owner(deploy_contracts, owner):
  assert deploy_contracts[1].owner() == owner

def test_add_campaign_success(deploy_contracts, owner, add_campaign_success):
  id, beneficiary, timeGoal, moneyGoal, name, description, tokenURI = add_campaign_success
  tx = __add_new_campaign(deploy_contracts[1], owner, add_campaign_success)
  tx.wait(1)
  result = event(tx, "CampaignCreation", {"campaignId" : id, "campaign": (beneficiary, timeGoal, moneyGoal, 0, name, description, tokenURI)})
  assert result is True, "Failed to add new campaign"

def test_add_campaign_fail_permission_denied(deploy_contracts, other_account, add_campaign_success):
  with brownie.reverts("Ownable: caller is not the owner"):
    __add_new_campaign(deploy_contracts[1], other_account, add_campaign_success)

def test_add_campaign_fail_end_time_in_past(deploy_contracts, owner, add_campaign_end_time_in_past):
  with brownie.reverts(set_custom_error("InvalidCampaignEndTime()")):
    __add_new_campaign(deploy_contracts[1], owner, add_campaign_end_time_in_past)

def test_add_campaign_fail_money_goal_is_zero(deploy_contracts, owner, add_campaign_money_goal_grater_zero):
  with brownie.reverts(set_custom_error("InvalidCampaignDonationGoal()")):
    __add_new_campaign(deploy_contracts[1], owner, add_campaign_money_goal_grater_zero)

def test_donate_success(deploy_contracts, owner, campaign, donor, add_campaign_success, donate_success):
  txCampaignCreation = __add_new_campaign(deploy_contracts[1], owner, add_campaign_success)
  txCampaignCreation.wait(1)
  txDonation = __donate(deploy_contracts[1], donate_success)
  txDonation.wait(1)
  result = event(txDonation, "Donation", {"fromAddress": donor, "campaignAddress": campaign, "donationAmount": donate_success[1]})
  assert result is True, "Failed to donate"

def test_donate_and_refund_excideed_amount_success(deploy_contracts, owner, campaign, donor, add_campaign_success, donate_success):
  txCampaignCreation = __add_new_campaign(deploy_contracts[1], owner, add_campaign_success)
  txCampaignCreation.wait(1)
  txFirstDonation = __donate(deploy_contracts[1], donate_success)
  txFirstDonation.wait(1)
  txSecondDonation = __donate(deploy_contracts[1], donate_success)
  txSecondDonation.wait(1)
  resultDonation = event(txSecondDonation, "Donation", {"fromAddress": donor, "campaignAddress": campaign, "donationAmount": add_campaign_success[3] - donate_success[1]})
  assert resultDonation is True, "Failed to donate"
  resultRefundation = event(txSecondDonation, "RefundedAmount", {"receiver": donor, "amount": donate_success[1] - (add_campaign_success[3] - donate_success[1])})
  assert resultRefundation is True, "Failed to refund amount"

def test_donate_fail_campaign_not_exists(deploy_contracts, owner, add_campaign_success, donate_campaign_not_exists):
  txCampaignCreation = __add_new_campaign(deploy_contracts[1], owner, add_campaign_success)
  txCampaignCreation.wait(1)
  with brownie.reverts(set_custom_error("NotFoundCampaign()")):
    __donate(deploy_contracts[1], donate_campaign_not_exists)

def test_donate_fail_self_donation_not_allowed(deploy_contracts, owner, add_campaign_success, self_donation):
  txCampaignCreation = __add_new_campaign(deploy_contracts[1], owner, add_campaign_success)
  txCampaignCreation.wait(1)
  with brownie.reverts(set_custom_error("NotAllowedDonation()")):
    __donate(deploy_contracts[1], self_donation)

def test_donate_fail_campaign_closed(deploy_contracts, owner, add_campaign_success, donate_success):
  txCampaignCreation = __add_new_campaign(deploy_contracts[1], owner, add_campaign_success)
  txCampaignCreation.wait(1)
  txFirstDonation = __donate(deploy_contracts[1], donate_success)
  txFirstDonation.wait(1)
  txSecondDonation = __donate(deploy_contracts[1], donate_success)
  txSecondDonation.wait(1)
  with brownie.reverts(set_custom_error("NotActiveCampaign()")):
    __donate(deploy_contracts[1], donate_success)

def test_donate_fail_donation_amount_is_zero(deploy_contracts, owner, add_campaign_success, donate_zero_amount):
  txCampaignCreation = __add_new_campaign(deploy_contracts[1], owner, add_campaign_success)
  txCampaignCreation.wait(1)
  with brownie.reverts(set_custom_error("InvalidDonationAmount()")):
    __donate(deploy_contracts[1], donate_zero_amount)

def __add_new_campaign(donation_constract, owner, campaign):
  _, beneficiary, timeGoal, moneyGoal, name, description, tokenURI = campaign
  tx = donation_constract.addNewCampaign(beneficiary, timeGoal, moneyGoal, name, description, tokenURI, {"from": owner})
  return tx

def __donate(donation_constract, donation):
  id, amount, donor = donation
  tx = donation_constract.donate(id, {"from": donor, "value": amount})
  return tx