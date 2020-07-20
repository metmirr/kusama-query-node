import { DB, SubstrateEvent } from '../../generated/indexer';
import { Tip } from '../../generated/graphql-server/src/modules/tip/tip.model';

export async function handleNewTip(db: DB, event: SubstrateEvent) {
  const { Hash } = event.event_params;
  const { extrinsic } = event;

  if (extrinsic) {
    const tip = new Tip();
    tip.reason = Hash.toString();
    tip.who = extrinsic.args[1].toString();
    tip.finder = extrinsic?.signer.toString();
    tip.findersFee = true;

    db.save<Tip>(tip);
  }
}
