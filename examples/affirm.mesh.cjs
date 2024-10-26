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

  const result = await contract.affirm(beneficiaryKey);
  const cardanoTx = await wallet.signTx(result,false,true);
  
  //await txBuilder.submitTx(cardanoTx)
  const submitResult = await wallet.submitTx(cardanoTx)
  console.log(submitResult);
  
}

// This just handles set up and submission of the transaction once it's been generated

go().then(()=> { 
  console.log("Done")
});
