import { SubstrateEvent, DB } from '../generated/indexer';
import { Proposal } from '../generated/graphql-server/src/modules/proposal/proposal.model';

export async function handleProposed(db: DB, event: SubstrateEvent) {
  if (event.extrinsic) {
    const proposal = new Proposal();
    proposal.value = event.extrinsic?.args[0].toString();
    proposal.bond = event.extrinsic?.args[0].toString();
    proposal.beneficiary = event.extrinsic?.args[1].toString();
    proposal.proposer = event.extrinsic?.signer.toString();
    db.save<Proposal>(proposal);
  }
}
