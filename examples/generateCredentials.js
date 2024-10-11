
import fs from 'fs'

import {lucid, skLocation, addrLocation} from './common.js'

//fs.mkdirSync()
const ownerPrivateKey = lucid.utils.generateSeedPhrase();
fs.writeFileSync(skLocation, ownerPrivateKey)

 
const ownerAddress = await lucid
  .selectWalletFromSeed(ownerPrivateKey)
  .wallet.address();
fs.writeFileSync(addrLocation, ownerAddress)


console.log('Wallet generated on preprod, you should fund this address with the faucet:')
console.log(ownerAddress)