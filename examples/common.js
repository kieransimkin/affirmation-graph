//const {Lucid, Blockfrost } = require('lucid-cardano');
const fs = require("fs");
/*exports.lucid = await Lucid.new(
    new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", "preprod2g0G79mo7zZP2u41GlIVX6e2L19FLcAs"),
    "Preprod",
  );
  */
exports.skLocation = "examples/credentials/owner.sk";
exports.addrLocation = "examples/credentials/owner.addr";
exports.skContent = fs.readFileSync(exports.skLocation).toString();
/*
  exports.ownerWallet = lucid
  .selectWalletFromSeed(exports.skContent)
  .wallet;
  */
