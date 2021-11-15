import { expect } from "chai";
import { Contract } from "ethers";
import { waffle } from "hardhat";
import { awardNFT, notAllowedToMintNFT, notOwner, userAlreadyReceivedNFT } from "./donationsNFT";
import { deployContractsFixture } from "./fixtures/fixtures";
import { nftFixture } from "./fixtures/nft-fixtures";

const { createFixtureLoader } = waffle;
const provider = waffle.provider;

describe("DonationsNFT contract", () => {
    const [owner, donations, donor, address] = provider.getWallets();
    const loadContractFixture = createFixtureLoader([owner], provider);
    const loadNFTFixture = createFixtureLoader([donor], provider);
    let donationsNFTContract: Contract;
    
    beforeEach(async () => {
        const contractFixture = await loadContractFixture(deployContractsFixture);
        donationsNFTContract = contractFixture.donationsNFT;
        await donationsNFTContract.setDonationsContract(donations.address);
    });

    describe("Deployment", () => {
        it("Should set the right owner", async () => {
            const ownerAddress = await owner.getAddress();
            expect(await donationsNFTContract.owner()).to.equal(ownerAddress);
        });
    });

    describe("Set donation contract", () => {
        it("Should fail with reason: not owner.", async () => {
            await notOwner([donations, address], donationsNFTContract);
        });
    });

    describe("Award item", async () => {
        it("Should fail with reason: Permission denied.", async () => {
            const tokenFixture = await loadNFTFixture(nftFixture);
            await notAllowedToMintNFT(donationsNFTContract, tokenFixture);
        });

        it("Should fail with reason: The user has already minted their token.", async () => {
            const tokenFixture = await loadNFTFixture(nftFixture);
            await userAlreadyReceivedNFT([donations], donationsNFTContract, tokenFixture);
        });

        it("Should mint NFT token and return token ID.", async () => {
            const tokenFixture = await loadNFTFixture(nftFixture);
            await awardNFT([donations], donationsNFTContract, tokenFixture);
        })
    });
});