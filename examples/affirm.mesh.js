import fs from 'fs'

import {
  resolvePaymentKeyHash,
  resolvePlutusScriptAddress,
  BlockfrostProvider,
  MeshWallet,
  MeshTxBuilder ,
  Transaction,
} from '@meshsdk/core';
import cbor from 'cbor'
import {lucid, ownerWallet, skContent} from './common.js'

const prov = new BlockfrostProvider('preprod2g0G79mo7zZP2u41GlIVX6e2L19FLcAs');
console.log(skContent.split(' '))
const wallet = new MeshWallet({
  networkId: 0,
  fetcher: prov,
  submitter: prov,
  key: {
    type: 'mnemonic',
    words: skContent.split(' ')
  },
});
const txBuilder = new MeshTxBuilder({fetcher: prov, submitter: prov})
const blueprint = JSON.parse(fs.readFileSync('./plutus.json'));

const script = {
  code: blueprint.validators[0].compiledCode,
  version: "V3",
};

const ownerStakeKey = lucid.utils.getAddressDetails((await ownerWallet.address())).stakeCredential
  const stakeKey = (await ownerWallet.rewardAddress()).toString()
  const beneficiaryStakeKey = lucid.utils.getAddressDetails(
    "addr_test1qz0hzxlrw5lwspvc9gpqll3ujpxyjmd5uylwqe8xdlt5d82ktxgu9qsyjahc67r53404t42p44vxv8hwhpdscw9l58jqktkm74"
  ).stakeCredential
  const validatorAddress = lucid.utils.validatorToAddress({type:'PlutusV2', script: blueprint.validators[0].compiledCode },beneficiaryStakeKey)
  console.log(stakeKey)
  console.log(validatorAddress);
const owner = ownerStakeKey.hash
console.log(owner);
const utxos = await wallet.getUtxos();
const datum = {
  alternative: 0,
  fields: [owner],
};

const tx = new Transaction({ initiator: wallet, verbose: true });
tx.setTxInputs(utxos)

const assets = [
  {
    unit: blueprint.validators[0].hash+owner,
    quantity: "1",
  },
];
const asset = {
  assetName: owner,
  assetQuantity: '1',
  recipient: validatorAddress
  
};
const redeemer = {
  data: { alternative: 0, fields: [owner] },
};
//tx.mintAsset(script, asset, redeemer)

const unsignedTx = await txBuilder.mintPlutusScriptV3()
.mint(1, blueprint.validators[0].hash, owner)
.mintingScript(script.code)
.metadataValue("721", { })
.selectUtxosFrom(utxos)
.changeAddress(ownerWallet.address().toString()).complete();
tx.sendAssets(
  {
    address: validatorAddress,
    datum: {
      inline: true,
      value: owner,
    },
  },
  assets,
);
//tx.setRequiredSigners([])
//tx.setRequiredSigners([stakeKey])
//const unsignedTx = await tx.build();
const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx)

