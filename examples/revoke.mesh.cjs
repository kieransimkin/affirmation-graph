const fs = require('fs')
const {
  BlockfrostProvider,
  hexToString,
  MeshWallet,
  MeshTxBuilder ,
  LANGUAGE_VERSIONS,
  Transaction,
  OgmiosProvider,
  applyCborEncoding,
  resolveScriptHash,
  serializePlutusScript,
  serializeAddressObj,pubKeyAddress
} =require ('@meshsdk/core');
const {Address} = require('@meshsdk/core-cst')
const {MeshAffirmationContract} =require( '@meshsdk/contracts')
console.log(MeshAffirmationContract);
//import { MeshMarketplaceContract } from "@meshsdk/contracts";
//import {resolveSlotNo } from '@meshsdk/common'
const common = require ('./common.js')
const skContent = common.skContent;
const blueprint = JSON.parse(fs.readFileSync('./plutus.json'));

// This just grabs the validator cbor and generates an address from it 
const getScript = (type, beneficiaryKeyHash, networkId ) => {
  const scriptCbor=applyCborEncoding(blueprint?.validators[type=='Mint'?0:1]?.compiledCode || '');
  const policyId = resolveScriptHash(scriptCbor, "V3");
  let script = serializePlutusScript(
    {code: scriptCbor, version: LANGUAGE_VERSIONS.V3},
    beneficiaryKeyHash,
    networkId
  );
  script.policyId = policyId;
  script.code = scriptCbor;
  script.version = "V3";
  return script;
};


const getWalletDappAddress = async (wallet) => {
  if (wallet) {
    const usedAddresses = await wallet.getUsedAddresses();
    if (usedAddresses.length > 0) {
      return usedAddresses[0];
    }
    const unusedAddresses = await wallet.getUnusedAddresses();
    if (unusedAddresses.length > 0) {
      return unusedAddresses[0];
    }
  }
  return "";
};

// This function generates the actual transaction - "beneficiary" is the person we are either affirming or revoking, 
const affirm = async (beneficiary, wallet) => {
    if (!wallet) throw new Error('Wallet is needed');
    const walletAddress = await getWalletDappAddress(wallet);
    const rewardAddress = (await wallet.getRewardAddresses())[0];
    const collateral = await wallet.getCollateral();
    
    if (!rewardAddress) throw new Error('Reward address is needed');;
    const stakeAddrBech = walletAddress || "";
    const stakeAddr = Address.fromBech32(stakeAddrBech);
    const rewardAddr = Address.fromBech32(rewardAddress);
    
    const stakeAddrProps = stakeAddr.getProps();
    const stakeHash = stakeAddrProps.delegationPart?.hash || "";
    const stakeHashBin = Buffer.from(stakeHash,'hex');
    const rewardAddrBase = serializeAddressObj(pubKeyAddress(stakeHash, null, false))
    
    const mintingScript = getScript("Mint", beneficiary.hash, wallet.getNetworkId());
    if (!mintingScript.code) return '';
    const targetAddress = mintingScript.address;
    
    
    

    const redeemer = {data: { alternative: 0, fields: [] }};
    const myDatum= { alternative: 0, fields: [stakeHash] };
    
    const asset = {
      assetName: stakeHashBin,
      assetQuantity: '1',
      recipient: {address: targetAddress, datum:{inline: true, value: myDatum}}
    };
      
    
    const tx = new Transaction({ initiator: wallet, verbose: false })
      .mintAsset(mintingScript, asset, redeemer)
      .setNetwork("preprod")
      .setRequiredSigners([stakeAddrBech,rewardAddrBase])
      .setCollateral(collateral)
//      .setTimeToStart(resolveSlotNo('preprod',Date.now()))
//      .setTimeToExpire(resolveSlotNo('preprod',Date.now()))
      .setChangeAddress(stakeAddrBech)

    const result = await tx.build();

    return tx.txBuilder.txHex;
} 
const go =async ()  => {

  const prov = new BlockfrostProvider('preprod2g0G79mo7zZP2u41GlIVX6e2L19FLcAs');
  //const submitter = new OgmiosProvider('http://192.168.1.178')
  const wallet = new MeshWallet({
    networkId: 0,
    
    fetcher: prov,
    submitter: prov,
    key: {
      type: 'mnemonic',
      words: skContent.split(' ')
    },
  });
  wallet.getNetworkId()
  
  
  const beneficiaryAddr = Address.fromBech32("addr_test1qz0hzxlrw5lwspvc9gpqll3ujpxyjmd5uylwqe8xdlt5d82ktxgu9qsyjahc67r53404t42p44vxv8hwhpdscw9l58jqktkm74");
  const beneficiaryAddrProps = beneficiaryAddr.getProps()
  const beneficiaryKey = beneficiaryAddrProps.delegationPart
  const mintingScript = getScript("Mint", beneficiaryKey.hash, wallet.getNetworkId());
  const utxos = await prov.fetchAddressUTxOs(mintingScript.address);
  console.log(utxos);
  const meshTxBuilder = new MeshTxBuilder({
    fetcher: prov,
    submitter: prov,
    version: 'V3'
  });
  
  meshTxBuilder.setNetwork("preprod")
  const contract = new MeshAffirmationContract({
    mesh: meshTxBuilder,
    fetcher: prov,
    wallet: wallet,
    networkId: 0,
    version:'V3'
  })
  const result = await contract.revoke(utxos[0]);
  console.log(meshTxBuilder.meshTxBuilderBody)
  //const result = await affirm(beneficiaryKey,wallet);
  //meshTxBuilder.si
  const cardanoTx = await wallet.signTx(result,false,true);
  
  
  //await txBuilder.submitTx(cardanoTx)
  const submitResult = await wallet.submitTx(cardanoTx)
  console.log(submitResult);
  
}

// This just handles set up and submission of the transaction once it's been generated

go().then((foo)=> { 
  console.log(foo)
});





// You can tell this has taken a lot of debugging:


/*
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

*/