import { SubstrateEvent, DB } from '../generated/indexer';
import { Proposal } from '../generated/graphql-server/src/modules/proposal/proposal.model';
import { assert } from 'console';

// New proposal
export async function handleProposed(db: DB, event: SubstrateEvent) {
  const { ProposalIndex } = event.event_params;
  if (event.extrinsic) {
    const proposal = new Proposal();
    proposal.proposalIndex = ProposalIndex.toString();
    proposal.value = event.extrinsic?.args[0].toString();
    proposal.bond = event.extrinsic?.args[0].toString();
    proposal.beneficiary = event.extrinsic?.args[1].toString();
    proposal.proposer = event.extrinsic?.signer.toString();
    proposal.rejected = false;
    proposal.approved = false;

    await db.save<Proposal>(proposal);
  }
}

// A proposal was rejected
export async function handleRejected(db: DB, event: SubstrateEvent) {
  const { ProposalIndex } = event.event_params;
  const proposal = await db.get(Proposal, { where: { proposalIndex: ProposalIndex } });

  assert(proposal, 'Proposal not found! Invalid proposal id');

  if (proposal) {
    proposal.rejected = true;
    await db.save<Proposal>(proposal);
  }
}

// A proposal is approved! Some funds have been allocated.
export async function handleAwarded(db: DB, event: SubstrateEvent) {
  const { ProposalIndex } = event.event_params;
  const proposal = await db.get(Proposal, { where: { proposalIndex: ProposalIndex } });

  assert(proposal, 'Proposal not found! Invalid proposal id');

  if (proposal) {
    proposal.approved = true;
    await db.save<Proposal>(proposal);
  }
}
