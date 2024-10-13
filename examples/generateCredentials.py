from pycardano import Address, Network, PaymentSigningKey, PaymentVerificationKey

payment_signing_key = PaymentSigningKey.generate()
payment_signing_key.save("credentials/owner.py.sk")
payment_verification_key = PaymentVerificationKey.from_signing_key(payment_signing_key)


network = Network.TESTNET

address = Address(payment_part=payment_verification_key.hash(), network=network)

with open("credentials/owner.py.addr", "w") as text_file:
    text_file.write("%s" % address)

beneficiary = Address.decode("")