export const campaignEndTimeInPast = {
  id: 0,
  timeGoal : Math.floor(Date.now()/1000) - 100000,
  moneyGoal : 1000,
  name : "Test",
  description : "Some test description",
  tokenURI : "ipfs://"
}