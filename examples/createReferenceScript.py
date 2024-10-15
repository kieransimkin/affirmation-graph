# Built for python 3.8.10
from opshin.prelude import *
from pycardano import BlockFrostChainContext
from pycardano import OgmiosV6ChainContext
import cbor2
import json
from pycardano import (
    Address,
    PaymentVerificationKey,
    PaymentSigningKey,
    AssetName,
    Asset,
    plutus_script_hash,
    Value,
    Transaction,
    TransactionBuilder,
    TransactionOutput,
    PlutusData,
    Redeemer,
    PlutusV1Script,
    PlutusV2Script,
    PlutusV3Script,
    RawCBOR,
    Network,
    datum_hash,
    MultiAsset
    
)

@dataclass()
class MyDatum(PlutusData):
    CONSTR_ID = 0
    owner: bytes

@dataclass
class MyRedeemer(PlutusData):
    CONSTR_ID = 0



context = BlockFrostChainContext("preprod2g0G79mo7zZP2u41GlIVX6e2L19FLcAs", base_url="https://cardano-preprod.blockfrost.io/api")
#context = OgmiosV6ChainContext('192.168.1.178');
network = Network.TESTNET

def key_to_hash_bytes(key):
    return bytes(key.hash().to_primitive().hex(),'utf-8')

def key_to_hash_str(key):
    return key.hash().to_primitive().hex(),'utf-8'

# This artifact was generated in step 2
with open("../plutus.json", "r") as f:
    with open("credentials/owner.py.addr", "r") as c:
        manifest = json.load(f)
        validators = manifest.get("validators")

        owner_address = c.read()
        owner_address = Address.decode(owner_address)
        owner_private_key = PaymentSigningKey.load("credentials/owner.py.sk")
        owner_public_key = PaymentVerificationKey.from_signing_key(owner_private_key)

        builder = TransactionBuilder(context)
        builder.add_input_address(owner_address)
        

        mint_script = PlutusV3Script(bytes.fromhex(validators[0].get("compiledCode")))
        mint_script_hash = plutus_script_hash(mint_script)
        script_address = Address(mint_script_hash, network=network)
        
        address_utxos = context.utxos(script_address)
        if (len(address_utxos)>1):
            print ("Found a UTXO at the script address already, not creating a new one")
            exit()
      
        
        new_output = TransactionOutput(script_address, Value(1392561), script=mint_script)
        builder.add_output(new_output)
        found_it = False
        
        while found_it==False:
            built_tx = builder.build(change_address=own_address);
            found_id = built_tx.id.to_cbor_hex()[:2]=='af'
        
        #signed_tx = builder.build_and_sign([owner_private_key], change_address=owner_address)
        
        #print (signed_tx.id)
        #context.submit_tx(signed_tx)
        with open("../referenceScriptUTXO", "w") as text_file:
            text_file.write("%s" % signed_tx.id)

        
        # Submit signed transaction to the network
        
        