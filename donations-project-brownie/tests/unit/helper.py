from web3 import Web3

def event(tx, name, data):
  if tx.events[name] is None:
    return False
  for key in data:
    if tx.events[name][key] != data[key]:
      return False
  return True

def set_custom_error(custom_error):
  error_message = Web3.keccak(text=custom_error)[:4].hex()
  return "typed error: " + error_message