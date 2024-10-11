import {Lucid, Blockfrost } from 'lucid-cardano'
import fs from 'fs'
export const lucid = await Lucid.new(
    new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", "preprod2g0G79mo7zZP2u41GlIVX6e2L19FLcAs"),
    "Preprod",
  );
  export const skLocation = "examples/credentials/owner.sk"
  export const addrLocation = "examples/credentials/owner.addr"
  export const skContent = fs.readFileSync(skLocation).toString();
  
  export const ownerWallet = lucid
  .selectWalletFromSeed(skContent)
  .wallet;