from  brownie import DonationsNFT, Donations, accounts, config, network

def deploy():
  account = get_account()
  print(account)
  donationsNFT = DonationsNFT.deploy({"from": account})
  donations = Donations.deploy(donationsNFT.address, {"from": account})
  tx = donationsNFT.setDonationsContract(donations.address, {"from": account})
  tx.wait(1)
  return (donationsNFT, donations)

def get_account():
    if network.show_active() == "development":
        return accounts[0]
    else:
        return accounts.add(config["wallets"]["from_key"])

def main():
  deploy()