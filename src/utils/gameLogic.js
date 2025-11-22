import {
  ELEMENTS,
  RARITIES,
  SKILL_TEMPLATES,
  INK_MODS,
  INK_RARE_MODS,
  BASIC_OPTIONS,
  SPECIAL_OPTIONS,
  STONE_MODS,
  MONSTER_NAMES,
  ITEM_PREFIXES,
  WEAPON_NAMES,
  ARMOR_NAMES,
  ACC_NAMES,
  ENHANCEMENT_STONE_TEMPLATES,
  ENCHANT_SCROLL_TEMPLATES,
  ELEMENT_STONE_TEMPLATES,
  SPECIAL_STONE_TEMPLATES,
  REROLL_SCROLL_TEMPLATES,
  OPTION_SLOT_STONE_TEMPLATES,
  RARITY_UPGRADE_STONE_TEMPLATES,
} from '../constants.jsx';

export const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateEnemy = (floor, dungeonMods = {}, isFinalBoss = false) => {
  const scaling = Math.pow(1.15, floor - 1);
  const typeIndex = Math.min(Math.floor((floor - 1) / 5), MONSTER_NAMES.length - 1);
  const type = MONSTER_NAMES[typeIndex];
  
  const isBoss = isFinalBoss || (floor % 10 === 0);
  const finalScaling = isBoss ? scaling * 3 : scaling;

  const hpMod = 1 + ((dungeonMods.risk_hp || 0) / 100);
  const atkMod = 1 + ((dungeonMods.risk_atk || 0) / 100);
  
  let element = 'none';
  if (isBoss || Math.random() < 0.4) {
      element = ELEMENTS[randomInt(0, ELEMENTS.length - 1)];
  }

  return {
    name: isBoss ? `BOSS: ${type.name}ロード` : type.name,
    icon: isBoss ? "👑" : type.icon,
    maxHp: Math.floor(type.baseHp * finalScaling * hpMod),
    hp: Math.floor(type.baseHp * finalScaling * hpMod),
    atk: Math.floor((floor * 2 + 5) * (isBoss ? 1.5 : 1) * atkMod),
    exp: Math.floor(type.baseExp * scaling), 
    gold: Math.floor(type.baseGold * scaling),
    element,
    isBoss,
    wait: 0,
    maxWait: Math.max(20, 100 - floor), 
  };
};

export const generateOptions = (rarityKey, power, dungeonMods = {}) => {
  const options = [];
  const config = RARITIES[rarityKey];
  let pool = [...BASIC_OPTIONS];
  let specialPool = [...SPECIAL_OPTIONS];

  for (let i = 0; i < config.optCount; i++) {
    const optType = pool[randomInt(0, pool.length - 1)];
    let val = Math.max(1, Math.floor(power * (randomInt(5, 15) / 100)));
    
    if (optType.type === 'maxHp') val *= 5;
    if (['str','vit','dex'].includes(optType.type)) val = Math.max(1, Math.floor(val / 2));
    if (optType.isRes) val = randomInt(5, 20); 

    options.push({ ...optType, val, isSpecial: false });
  }

  if (rarityKey === 'legendary') {
    const special = specialPool[randomInt(0, specialPool.length - 1)];
    const val = randomInt(special.min, special.max);
    options.push({ ...special, val, isSpecial: true });
  }
  return options;
};

export const generateInk = (floor) => {
  const rarityRoll = Math.random();
  let rarityKey = 'common';
  if (rarityRoll > 0.9) rarityKey = 'rare';
  
  const isRareMod = rarityKey === 'rare' || Math.random() > 0.8;
  let modTemplate;
  
  if (isRareMod) {
      modTemplate = INK_RARE_MODS[randomInt(0, INK_RARE_MODS.length - 1)];
      rarityKey = 'rare';
  } else {
      modTemplate = INK_MODS[randomInt(0, INK_MODS.length - 1)];
  }
  
  return {
      id: Date.now() + Math.random(),
      type: 'ink',
      name: `${modTemplate.label}インク`,
      mod: { ...modTemplate },
      rarity: rarityKey,
      isNew: true
  };
};

export const generateLoot = (floor, dungeonMods = {}) => {
  const rand = Math.random();
  const rarityBoost = (dungeonMods.qual_rarity || 0) / 100;
  
  let rarityKey = "common";
  if (rand > (0.98 - rarityBoost * 0.1)) rarityKey = "legendary";
  else if (rand > (0.90 - rarityBoost * 0.2)) rarityKey = "epic";
  else if (rand > (0.75 - rarityBoost * 0.3)) rarityKey = "rare";
  else if (rand > (0.50 - rarityBoost * 0.3)) rarityKey = "uncommon";

  const rarity = RARITIES[rarityKey];
  
  const typeRoll = Math.random();
  let type = "weapon";
  let baseName = "";
  let baseStats = {};
  let skillData = null;
  let inks = [];
  let inkSlots = 0;

  const tierMult = floor * 1.5;
  const power = tierMult * rarity.mult;

  if (typeRoll < 0.3) {
    type = "weapon";
    baseName = WEAPON_NAMES[randomInt(0, WEAPON_NAMES.length - 1)];
    baseStats.atk = Math.floor(power * randomInt(8, 12) / 10) + 1;
  } else if (typeRoll < 0.55) {
    type = "armor";
    baseName = ARMOR_NAMES[randomInt(0, ARMOR_NAMES.length - 1)];
    baseStats.def = Math.floor(power * randomInt(8, 12) / 20) + 1;
    baseStats.hp = Math.floor(power * 2);
  } else if (typeRoll < 0.75) {
    type = "accessory";
    baseName = ACC_NAMES[randomInt(0, ACC_NAMES.length - 1)];
    baseStats.str = Math.floor(power / 15);
    baseStats.vit = Math.floor(power / 15);
  } else if (typeRoll < 0.90) {
    type = "skill";
    const templates = SKILL_TEMPLATES.filter(s => !s.rarity || s.rarity === rarityKey);
    const template = templates.length > 0 ? templates[randomInt(0, templates.length - 1)] : SKILL_TEMPLATES[0];
    baseName = `${template.name}の巻物`;
    skillData = { ...template };
    skillData.power = template.type === 'attack' ? template.power + (power * 0.01) : template.power + Math.floor(power/2);
    inkSlots = RARITIES[rarityKey].inkSlots;
  } else if (typeRoll < 0.95) {
    return generateInk(floor);
  } else {
    // 装備品用アイテムを生成
    const equipItem = generateEquipmentItem(floor);
    if (equipItem) return equipItem;
    return generateInk(floor);
  }

  const options = type === 'skill' ? [] : generateOptions(rarityKey, power, dungeonMods);
  const prefix = type === 'skill' ? '' : ITEM_PREFIXES[Math.min(Math.floor(floor / 10), ITEM_PREFIXES.length - 1)];
  
  return {
    id: Date.now() + Math.random().toString(36).substr(2, 9),
    name: `${prefix}${baseName}`,
    type,
    baseStats,
    options,
    skillData,
    inkSlots,
    inks,
    rarity: rarityKey,
    power: Math.floor(power),
    isNew: true
  };
};

export const generateMagicStone = (floor) => {
  const tier = Math.floor(floor);
  const rand = Math.random();
  let rarityKey = "common";
  if (rand > 0.95) rarityKey = "legendary";
  else if (rand > 0.85) rarityKey = "epic";
  else if (rand > 0.65) rarityKey = "rare";
  else if (rand > 0.40) rarityKey = "uncommon";
  
  const rarityConfig = RARITIES[rarityKey];
  const modCount = randomInt(1, rarityConfig.optCount);
  const mods = [];
  
  const risks = STONE_MODS.filter(m => m.isRisk);
  const rewards = STONE_MODS.filter(m => m.isReward);

  mods.push({ ...risks[randomInt(0, risks.length - 1)], val: randomInt(20, 50) }); 

  for(let i=0; i<modCount; i++) {
     const pool = Math.random() > 0.5 ? risks : rewards;
     const mod = pool[randomInt(0, pool.length - 1)];
     if (mod.valMin) mods.push({ ...mod, val: randomInt(mod.valMin, mod.valMax) });
     else mods.push({ ...mod }); 
  }

  let baseFloor = 5 + randomInt(0, 5);
  mods.forEach(m => {
      if(m.type === 'mod_floor_add') baseFloor += m.val;
      if(m.type === 'mod_floor_sub') baseFloor -= m.val;
  });
  const maxFloor = Math.max(3, baseFloor);

  return {
    id: 'stone_' + Date.now() + Math.random(),
    name: `魔法石 Lv.${tier}`,
    tier,
    mods,
    type: 'stone',
    rarity: rarityKey,
    maxFloor
  };
};

// 装備品用アイテム生成関数
export const generateEnhancementStone = (floor) => {
  const templates = ENHANCEMENT_STONE_TEMPLATES.filter(t => {
    const floorReq = t.rarity === 'common' ? 1 : t.rarity === 'uncommon' ? 5 : t.rarity === 'rare' ? 10 : 15;
    return floor >= floorReq;
  });
  if (templates.length === 0) return null;
  const template = templates[randomInt(0, templates.length - 1)];
  
  return {
    id: 'enhance_' + Date.now() + Math.random(),
    name: template.name,
    type: 'enhancement_stone',
    rarity: template.rarity,
    mult: template.mult,
    isNew: true
  };
};

export const generateEnchantScroll = (floor) => {
  const templates = ENCHANT_SCROLL_TEMPLATES.filter(t => {
    const floorReq = t.rarity === 'uncommon' ? 5 : t.rarity === 'rare' ? 10 : 15;
    return floor >= floorReq;
  });
  if (templates.length === 0) return null;
  const template = templates[randomInt(0, templates.length - 1)];
  
  return {
    id: 'enchant_' + Date.now() + Math.random(),
    name: template.name,
    type: 'enchant_scroll',
    rarity: template.rarity,
    powerMult: template.powerMult,
    isNew: true
  };
};

export const generateElementStone = (floor) => {
  const templates = ELEMENT_STONE_TEMPLATES.filter(t => {
    const floorReq = t.rarity === 'rare' ? 10 : 15;
    return floor >= floorReq;
  });
  if (templates.length === 0) return null;
  const template = templates[randomInt(0, templates.length - 1)];
  
  return {
    id: 'element_' + Date.now() + Math.random(),
    name: template.name,
    type: 'element_stone',
    rarity: template.rarity,
    element: template.element,
    value: template.value,
    isNew: true
  };
};

export const generateSpecialStone = (floor) => {
  const templates = SPECIAL_STONE_TEMPLATES.filter(t => {
    const floorReq = t.rarity === 'epic' ? 15 : 20;
    return floor >= floorReq;
  });
  if (templates.length === 0) return null;
  const template = templates[randomInt(0, templates.length - 1)];
  
  return {
    id: 'special_' + Date.now() + Math.random(),
    name: template.name,
    type: 'special_stone',
    rarity: template.rarity,
    specialType: template.type,
    value: template.value,
    isNew: true
  };
};

export const generateRerollScroll = (floor) => {
  const templates = REROLL_SCROLL_TEMPLATES.filter(t => {
    const floorReq = t.rarity === 'uncommon' ? 5 : t.rarity === 'rare' ? 10 : 15;
    return floor >= floorReq;
  });
  if (templates.length === 0) return null;
  const template = templates[randomInt(0, templates.length - 1)];
  
  return {
    id: 'reroll_' + Date.now() + Math.random(),
    name: template.name,
    type: 'reroll_scroll',
    rarity: template.rarity,
    powerMult: template.powerMult,
    isNew: true
  };
};

export const generateOptionSlotStone = (floor) => {
  const templates = OPTION_SLOT_STONE_TEMPLATES.filter(t => {
    const floorReq = t.rarity === 'rare' ? 10 : t.rarity === 'epic' ? 15 : 20;
    return floor >= floorReq;
  });
  if (templates.length === 0) return null;
  const template = templates[randomInt(0, templates.length - 1)];
  
  return {
    id: 'slot_' + Date.now() + Math.random(),
    name: template.name,
    type: 'option_slot_stone',
    rarity: template.rarity,
    slots: template.slots,
    isNew: true
  };
};

export const generateRarityUpgradeStone = (floor) => {
  const templates = RARITY_UPGRADE_STONE_TEMPLATES.filter(t => {
    const floorReq = t.rarity === 'epic' ? 15 : 20;
    return floor >= floorReq;
  });
  if (templates.length === 0) return null;
  const template = templates[randomInt(0, templates.length - 1)];
  
  return {
    id: 'rarity_' + Date.now() + Math.random(),
    name: template.name,
    type: 'rarity_upgrade_stone',
    rarity: template.rarity,
    upgrades: template.upgrades,
    isNew: true
  };
};

// 装備品用アイテムをランダムに生成
export const generateEquipmentItem = (floor) => {
  const rand = Math.random();
  if (rand < 0.15) return generateEnhancementStone(floor);
  if (rand < 0.25) return generateEnchantScroll(floor);
  if (rand < 0.30) return generateRerollScroll(floor);
  if (rand < 0.35) return generateElementStone(floor);
  if (rand < 0.38) return generateSpecialStone(floor);
  if (rand < 0.40) return generateOptionSlotStone(floor);
  if (rand < 0.42) return generateRarityUpgradeStone(floor);
  return null;
};

