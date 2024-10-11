use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address, Script}
use cardano/assets.{PolicyId, quantity_of}
use cardano/transaction.{
  InlineDatum, Input, Output, OutputReference, Transaction,
}

pub type Datum {
  owner: VerificationKeyHash,
}

validator v1 {
  mint(_redeemer: Void, own_policy: PolicyId, tx: Transaction) {
    let Transaction { extra_signatories, outputs, mint, .. } = tx
    expect [mint_triplet] =
      mint
        |> assets.flatten

    let (mint_policy, mint_name, mint_quantity) = mint_triplet
    expect (mint_policy == own_policy)?
    if mint_quantity == 1 {
      expect [Output { datum: InlineDatum(output_datum), .. }] =
        list.filter(
          outputs,
          fn(output) { output.address.payment_credential == Script(own_policy) },
        )
      expect check_datum: Datum = output_datum
      expect list.has(extra_signatories, check_datum.owner) == True
      expect mint_name == check_datum.owner
    } else {
      let affirmer: VerificationKeyHash = mint_name
      expect list.has(extra_signatories, affirmer) == True
    }

    when mint_quantity is {
      1 -> True
      -1 -> True
      _ -> False
    }
  }

  spend(
    datum: Option<Datum>,
    _redeemer: Void,
    own_ref: OutputReference,
    tx: Transaction,
  ) {
    let Transaction { extra_signatories, inputs, mint, .. } = tx
    expect [mint_triplet] =
      mint
        |> assets.flatten

    let (mint_policy, mint_name, mint_quantity) = mint_triplet
    expect mint_quantity == -1
    expect Some(Datum { owner }) = datum
    expect owner == mint_name
    expect Some(own_input) =
      list.find(inputs, fn(input) { input.output_reference == own_ref })
    expect quantity_of(own_input.output.value, mint_policy, owner) == 1
    list.has(extra_signatories, owner) == True
  }

  else(_) {
    fail
  }
}
