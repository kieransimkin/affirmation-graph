import fs from 'fs'
import {toHex, fromHex, Data , Constr, valueToAssets, C, applyDoubleCborEncoding} from 'lucid-cardano'
import cbor from 'cbor'
import {lucid, ownerWallet} from './common.js'
import { utils } from '@stricahq/typhonjs';
const { Redeemer, RedeemerTag, BigNum, Int, ExUnits, Redeemers, PlutusData, PlutusList, ConstrPlutusData, new_constr_plutus_data } = C;
async function readValidator() {
    const validator = JSON.parse(fs.readFileSync("plutus.json")).validators[0];
    
    let ret = {
      type: "PlutusV3",
      script:  validator.compiledCode
      
    };
    ret.policyID = lucid.utils.validatorToScriptHash(ret);
    return ret;
  }

const validator = await readValidator();
const policyID = validator.policyID;
delete validator.policyID;

const beneficiaryStakeKey = lucid.utils.getAddressDetails(
    "addr_test1qz0hzxlrw5lwspvc9gpqll3ujpxyjmd5uylwqe8xdlt5d82ktxgu9qsyjahc67r53404t42p44vxv8hwhpdscw9l58jqktkm74"
  ).stakeCredential
  const beneficiaryStakeKeyHash = beneficiaryStakeKey.hash
  const ownerStakeKey = lucid.utils.getAddressDetails((await ownerWallet.address())).stakeCredential
  
  const ownerStakeKeyHash = ownerStakeKey.hash
  const utxos = await ownerWallet.getUtxos();
  const validatorAddress = lucid.utils.validatorToAddress(validator,beneficiaryStakeKey);
  
  //const redeemer =  Redeemer.new(RedeemerTag.new_spend(),BigInt(0),null,BigInt(1))
  const datum = Data.to(
    new Constr(0, [new Constr(0, [ownerStakeKeyHash])]),

  );
  const datum2 = utils.createPlutusDataCbor({
    constructor: 0,
    fields: [],
    
  });
  const tempData = BigInt(1);
  console.log(tempData)
  //const redeemer = Redeemer.new(RedeemerTag.new_mint(),BigNum.from_str("0"),PlutusData., ExUnits.new(BigNum.from_str("1000"), BigNum.from_str("100000000")))
  const redeemer = () => Data.void();
  //console.log(redeemer)
  console.log('Validator address:')
  console.log(validatorAddress)
  console.log(policyID)
  let tx = await lucid
  .newTx()
  .attachMintingPolicy(validator)
  .addSignerKey(ownerStakeKeyHash)
  .addSigner(await ownerWallet.address())
  .collectFrom(utxos)
  // use the gift_card validator
  
.mintAssets({[policyID+ownerStakeKeyHash]: BigInt(1)}, Data.to(new Constr(0, []))).complete;
//.complete()
console.log(tx.txBuilder.outputs);
  // mint 1 of the asset
  
  /*
  .payToContract(
    validatorAddress,
    {
      // On unlock this gets passed to the redeem
      // validator as datum. Our redeem validator
      // doesn't use it so we can just pass in anything.
      inline: datum,
    },
    { lovelace: BigInt(1000000), [policyID+ownerStakeKeyHash]:BigInt(1) }
  )
    //*/
  //.complete();
  
  
  console.log('Built transation');
  const signedTx = await tx
    .sign()
    .complete();
 
const txHash = await signedTx.submit();
console.log('submitted, txhash: ')
console.log(txHash)
//const txSigned = await tx.sign().complete();