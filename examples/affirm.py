# Built for python 3.8.10
from opshin.prelude import *
from blockfrost import ApiUrls
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



#context = BlockFrostChainContext("preprod2g0G79mo7zZP2u41GlIVX6e2L19FLcAs", base_url="https://cardano-preprod.blockfrost.io/api")
context = OgmiosV6ChainContext('192.168.1.178');
network = Network.TESTNET

def key_to_hash_bytes(key):
    return bytes(key.hash().to_primitive().hex(),'utf-8')

def key_to_hash_str(key):
    return key.hash().to_primitive().hex(),'utf-8'

# This artifact was generated in step 2
with open("../plutus.json", "r") as f:
    with open("credentials/owner.py.addr", "r") as c:
        owner_address = c.read()
        owner_address = Address.decode(owner_address)
        beneficiary_address = Address.decode('addr_test1qz0hzxlrw5lwspvc9gpqll3ujpxyjmd5uylwqe8xdlt5d82ktxgu9qsyjahc67r53404t42p44vxv8hwhpdscw9l58jqktkm74')
        
        beneficiary_stake_key = beneficiary_address.staking_part
        owner_private_key = PaymentSigningKey.load("credentials/owner.py.sk")
        owner_public_key = PaymentVerificationKey.from_signing_key(owner_private_key)
        builder = TransactionBuilder(context)
        builder.add_input_address(owner_address)
        datum = MyDatum(owner=owner_public_key.hash().to_primitive())
        
        datum_hash = datum.hash()
    
        manifest = json.load(f)
        validators = manifest.get("validators")

        mint_script = PlutusV3Script(bytes.fromhex(validators[0].get("compiledCode")))

        mint_script_hash = plutus_script_hash(mint_script)
        
        script_address = Address(mint_script_hash, beneficiary_stake_key, network=network)
        

        my_asset = Asset()
        nft1 = AssetName(owner_public_key.hash().to_primitive())
        my_asset[nft1] = 1
        
        my_nft = MultiAsset()
        my_nft[mint_script_hash] = my_asset
        new_output = TransactionOutput(script_address, Value(2500000,my_nft), False, datum)
        

        builder.add_output(new_output)
        builder.mint = my_nft
        builder.use_redeemer_map=True
        builder.add_minting_script(mint_script, Redeemer(data=MyRedeemer()))
        signed_tx = builder.build_and_sign([owner_private_key], change_address=owner_address)

        # Submit signed transaction to the network
        context.submit_tx(signed_tx)
        print ("Tx Hash: " + str(signed_tx.id))