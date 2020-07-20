import { DB, SubstrateEvent } from '../../generated/indexer';
import { Tip } from '../../generated/graphql-server/src/modules/tip/tip.model';
import { Tipper } from '../../generated/graphql-server/src/modules/tipper/tipper.model';
import { assert } from 'console';

export async function handleNewTip(db: DB, event: SubstrateEvent) {
  const { Hash } = event.event_params;
  const { extrinsic } = event;

  if (extrinsic) {
    const tip = new Tip();
    tip.reason = Hash.toString();
    tip.who = extrinsic.args[1].toString();
    tip.retracted = false;
    tip.finder = extrinsic?.signer.toString();
    tip.findersFee = extrinsic.meta.name.toString() === 'report_awesome';
    db.save<Tip>(tip);

    // NewTip event can be fired from different runtime functions
    if (extrinsic.meta.name.toString() !== 'report_awesome') {
      //Give a tip for something new; no finder's fee will be taken.
      const t = new Tipper();
      t.tipValue = extrinsic.args[2].toString();
      t.tipper = extrinsic?.signer.toString();
      t.tip = tip;
      db.save<Tipper>(t);
    }
  }
}

export async function handleTipRetracted(db: DB, event: SubstrateEvent) {
  const { Hash } = event.event_params;
  const tip = await db.get(Tip, { where: { reason: Hash.toString() } });

  assert(tip, 'Invalid reason hash!');
  if (tip) {
    tip.retracted = true;
    db.save<Tip>(tip);
  }
}

export async function handleTipClosing(db: DB, event: SubstrateEvent) {
  const { Hash } = event.event_params;
  const { extrinsic } = event;
  const tip = await db.get(Tip, { where: { reason: Hash.toString() } });

  assert(tip, 'Invalid reason hash!');
  if (tip && extrinsic) {
    const t = new Tipper();
    t.tipper = extrinsic.signer.toString();
    t.tipValue = extrinsic.args[1].toString();
    t.tip = tip;
    db.save<Tipper>(t);

    tip.closes = event.block_number.toString();
    db.save<Tip>(tip);
  }
}
