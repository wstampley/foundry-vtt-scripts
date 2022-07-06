const searchCompendiumForBuff = async (collectionName, buffName) => {
	let compendiumCollection = game.packs.get(collectionName);
  if (compendiumCollection) {
    const index = await compendiumCollection.getIndex();
    const buffIndex = await index.find(entry => entry.name === buffName);
    if (!buffIndex) {
      return null;
    }
    const buffItem = await compendiumCollection.getDocument(buffIndex._id);
    return buffItem;
  }
  else {
    console.log(`compendium pack ${collectionName} was not found for search.`);
    return null;
  }
}

const applyOrActivateBuffOnTarget = async (buff, targetActor) => {
  const existingBuff = targetActor.items.find(o => {return o.data.type == 'buff' && o.name == buff.name});
  if (existingBuff)
    targetActor.deleteEmbeddedDocuments('Item', [existingBuff.id])

  targetActor.createEmbeddedDocuments('Item', [buff]);
}

const main = async () => {
  debugger;

  const macroId = this.id;
  const compendiumCollectionsToSearch = ["world.custom-buffs"]; // "pf1.commonbuffs", "pf-content.pf-buffs"
  const buffName = "Phaedra's Stare";

  const searchPromises = compendiumCollectionsToSearch.map((collectionName) => {
    return searchCompendiumForBuff(collectionName, buffName);
  });
  const searchResults = await Promise.all(searchPromises);
  const buffEntry = searchResults.find(result => result !== null);

  if (!buffEntry) {
    console.log("No matching buff found in a compendium.");
    return;
  }
  const buff = buffEntry.toObject();
  buff.data.active = true;

  if (game.user.targets.size === 0) {
    console.log("No one targeted");
    return;
  }
  const targetActors = [...game.user.targets].map(o => o.actor);

  const applyPromises = targetActors.map((actor) => {
    return applyOrActivateBuffOnTarget(buff, actor);
  });
  await Promise.all(applyPromises);
}

main().then(() => {console.log('Macro Complete')})
