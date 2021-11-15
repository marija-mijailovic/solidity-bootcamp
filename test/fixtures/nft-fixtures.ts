import { Wallet } from "ethers";
import { tokenURI } from "./test-cases/mint-nft";

export interface INFT {
  donor: string,
  tokenURI: string
}

export async function nftFixture([donor]: Wallet[]): Promise<INFT> {
  return {
    donor: donor.address,
    tokenURI: tokenURI
  }
}