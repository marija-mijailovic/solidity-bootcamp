import pytest
import time
from brownie import accounts
from scripts.deploy import deploy

@pytest.fixture
def owner():
  yield accounts[0]

@pytest.fixture
def campaign():
  yield accounts[1]

@pytest.fixture
def donor():
  yield accounts[2]

@pytest.fixture
def other_account():
  yield accounts[3]

@pytest.fixture(autouse=True)
def deploy_contracts():
  contracts = deploy()
  yield contracts

@pytest.fixture
def add_campaign_success(campaign):
  id = 0
  beneficiary = campaign.address
  timeGoal = int(time.time()) + 100000
  moneyGoal = 10000
  name = "Test"
  description = "Some test description"
  tokenURI = "ipfs://"
  yield (id, beneficiary, timeGoal, moneyGoal, name, description, tokenURI)

@pytest.fixture
def add_campaign_end_time_in_past(campaign):
  id = 0
  beneficiary = campaign
  timeGoal = time.time() - 100000
  moneyGoal = 10000
  name = "Test"
  description = "Some test description"
  tokenURI = "ipfs://"
  yield (id, beneficiary, timeGoal, moneyGoal, name, description, tokenURI)

@pytest.fixture
def add_campaign_money_goal_grater_zero(campaign):
  id = 0
  beneficiary = campaign
  timeGoal = time.time() + 100000
  moneyGoal = 0
  name = "Test"
  description = "Some test description"
  tokenURI = "ipfs://"
  yield (id, beneficiary, timeGoal, moneyGoal, name, description, tokenURI)
 
@pytest.fixture
def donate_success(donor):
  id = 0
  amount = 8000
  donor = donor
  yield (id, amount, donor)

@pytest.fixture
def self_donation(campaign):
  id = 0
  amount = 8000
  donor = campaign
  yield (id, amount, donor)

@pytest.fixture
def donate_campaign_not_exists(donor):
  id = 100
  amount = 8000
  donor = donor
  yield (id, amount, donor)

@pytest.fixture
def donate_zero_amount(donor):
  id = 0
  amount = 0
  donor = donor
  yield (id, amount, donor)

@pytest.fixture
def nft_data(donor):
  donor = donor
  tokenURI = "ipfs://"
  yield (donor, tokenURI)