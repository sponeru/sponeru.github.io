import {
  ELEMENTS,
  RARITIES,
  SKILL_TEMPLATES,
  INK_MODS,
  INK_RARE_MODS,
  BASIC_OPTIONS,
  SPECIAL_OPTIONS,
  EQUIPMENT_TYPE_OPTIONS,
  COMPOSITE_OPTIONS,
  STONE_MODS,
  RISK_REWARD_MAPPING,
  MONSTER_NAMES,
  ITEM_PREFIXES,
  WEAPON_NAMES,
  ARMOR_NAMES,
  AMULET_NAMES,
  STAT_LABELS,
  RING_NAMES,
  BELT_NAMES,
  FEET_NAMES,
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

export const generateOptions = (rarityKey, power, equipmentType = null, dungeonMods = {}) => {
  const options = [];
  const config = RARITIES[rarityKey];
  
  // 装備タイプに応じたオプションプールを取得
  let pool = [];
  if (equipmentType && EQUIPMENT_TYPE_OPTIONS[equipmentType]) {
    pool = [...EQUIPMENT_TYPE_OPTIONS[equipmentType]];
  } else {
    // 装備タイプが指定されていない場合は従来通りBASIC_OPTIONSを使用
    pool = [...BASIC_OPTIONS];
  }
  
  // 複合オプションをプールに追加（装備タイプに応じてフィルタリング）
  const availableCompositeOptions = COMPOSITE_OPTIONS.filter(composite => {
    // 複合オプションの各タイプが装備タイプのプールに含まれているかチェック
    return composite.compositeTypes.every(compType => {
      return pool.some(opt => opt.type === compType) || 
             BASIC_OPTIONS.some(opt => opt.type === compType);
    });
  });
  pool = [...pool, ...availableCompositeOptions];
  
  let specialPool = [...SPECIAL_OPTIONS];

  for (let i = 0; i < config.optCount; i++) {
    if (pool.length === 0) break;
    
    // 既に追加したオプションタイプをプールから除外
    // 複合オプションの場合は、含まれるタイプもチェック
    const existingTypes = options.flatMap(opt => {
      if (opt.isComposite && opt.compositeTypes) {
        return [opt.type, ...opt.compositeTypes];
      }
      return [opt.type];
    });
    
    const availablePool = pool.filter(opt => {
      if (opt.isComposite && opt.compositeTypes) {
        // 複合オプションの場合、含まれるタイプが既存オプションと重複しないかチェック
        return !opt.compositeTypes.some(compType => existingTypes.includes(compType));
      }
      return !existingTypes.includes(opt.type);
    });
    
    if (availablePool.length === 0) break;
    
    const optType = availablePool[randomInt(0, availablePool.length - 1)];
    
    // 複合オプションの場合
    if (optType.isComposite && optType.compositeTypes) {
      const compositeVals = optType.compositeTypes.map(compType => {
        let val = Math.max(1, Math.floor(power * (randomInt(5, 15) / 100)));
        const baseOpt = pool.find(o => o.type === compType) || BASIC_OPTIONS.find(o => o.type === compType);
        if (!baseOpt) return { type: compType, val: 0 };
        
        if (compType === 'maxHp') val *= 5;
        if (compType === 'maxMp') val = Math.max(1, Math.floor(power * (randomInt(3, 8) / 100)));
        if (['str','dex','int'].includes(compType)) val = Math.max(1, Math.floor(val / 2));
        if (baseOpt.isRes) val = randomInt(5, 20);
        if (baseOpt.isPercent) val = randomInt(1, 10);
        if (baseOpt.isSkillLevel) val = randomInt(1, 5);
        if (compType === 'hp_regen') val = randomInt(1, 5);
        
        return { type: compType, val };
      });
      
      options.push({ 
        ...optType, 
        compositeVals,
        val: 0, // 複合オプションの場合はvalは使用しない
        isSpecial: false,
        isComposite: true 
      });
    } else {
      // 通常のオプション
      let val = Math.max(1, Math.floor(power * (randomInt(5, 15) / 100)));
      
      // オプションタイプに応じた値の計算
      if (optType.type === 'maxHp') val *= 5;
      if (optType.type === 'maxMp') val = Math.max(1, Math.floor(power * (randomInt(3, 8) / 100)));
      if (['str','dex','int'].includes(optType.type)) val = Math.max(1, Math.floor(val / 2));
      if (optType.isRes) val = randomInt(5, 20);
      if (optType.isPercent) {
        // 割合オプションは1-10%の範囲
        val = randomInt(1, 10);
      }
      if (optType.isSkillLevel) {
        // スキルレベルは1-5の範囲
        val = randomInt(1, 5);
      }
      if (optType.type === 'hp_regen') {
        // HP自動回復は1-5/秒の範囲
        val = randomInt(1, 5);
      }

      options.push({ ...optType, val, isSpecial: false });
    }
  }

  if (rarityKey === 'legendary') {
    // 既に追加したオプションタイプをプールから除外
    const existingTypes = options.map(opt => opt.type);
    const availableSpecialPool = specialPool.filter(opt => !existingTypes.includes(opt.type));
    
    if (availableSpecialPool.length > 0) {
      const special = availableSpecialPool[randomInt(0, availableSpecialPool.length - 1)];
      const val = randomInt(special.min, special.max);
      options.push({ ...special, val, isSpecial: true });
    }
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

export const generateLoot = (floor, dungeonMods = {}, stoneTier = null) => {
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

  let requiredStats = {}; // 装備に必要な能力値
  
  if (typeRoll < 0.3) {
    type = "weapon";
    baseName = WEAPON_NAMES[randomInt(0, WEAPON_NAMES.length - 1)];
    baseStats.atk = Math.floor(power * randomInt(8, 12) / 10) + 1;
    // 武器は筋力を必要とする
    requiredStats.str = Math.floor(power / 3) + randomInt(5, 15);
  } else if (typeRoll < 0.55) {
    type = "armor";
    baseName = ARMOR_NAMES[randomInt(0, ARMOR_NAMES.length - 1)];
    baseStats.def = Math.floor(power * randomInt(8, 12) / 20) + 1;
    baseStats.hp = Math.floor(power * 2);
    // 防具は筋力を必要とする
    requiredStats.str = Math.floor(power / 3) + randomInt(5, 15);
  } else if (typeRoll < 0.60) {
    type = "amulet";
    // 能力値の種類をランダムに選ぶ
    const statTypes = ['str', 'dex', 'int'];
    const selectedStat = statTypes[randomInt(0, statTypes.length - 1)];
    // 選んだ能力値のみに値を設定
    baseStats[selectedStat] = Math.floor(power / 8);
    // 能力値の種類に応じて名前を変更
    const baseAmuletName = AMULET_NAMES[randomInt(0, AMULET_NAMES.length - 1)];
    baseName = `${STAT_LABELS[selectedStat]}の${baseAmuletName}`;
    // アミュレットは知恵を必要とする
    requiredStats.int = Math.floor(power / 3) + randomInt(5, 15);
  } else if (typeRoll < 0.63) {
    type = "ring";
    baseName = RING_NAMES[randomInt(0, RING_NAMES.length - 1)];
    baseStats.dex = Math.floor(power / 12);
    baseStats.int = Math.floor(power / 12);
    // リングは器用さを必要とする
    requiredStats.dex = Math.floor(power / 3) + randomInt(5, 15);
  } else if (typeRoll < 0.66) {
    type = "belt";
    baseName = BELT_NAMES[randomInt(0, BELT_NAMES.length - 1)];
    baseStats.str = Math.floor(power / 10);
    baseStats.hp = Math.floor(power * 1.5);
    // ベルトは筋力を必要とする
    requiredStats.str = Math.floor(power / 3) + randomInt(5, 15);
  } else if (typeRoll < 0.69) {
    type = "feet";
    baseName = FEET_NAMES[randomInt(0, FEET_NAMES.length - 1)];
    baseStats.def = Math.floor(power * randomInt(5, 8) / 20) + 1;
    baseStats.dex = Math.floor(power / 12);
    // 靴は器用さを必要とする
    requiredStats.dex = Math.floor(power / 3) + randomInt(5, 15);
  } else if (typeRoll < 0.80) {
    type = "skill";
    const templates = SKILL_TEMPLATES.filter(s => !s.rarity || s.rarity === rarityKey);
    const template = templates.length > 0 ? templates[randomInt(0, templates.length - 1)] : SKILL_TEMPLATES[0];
    baseName = `${template.name}の巻物`;
    
    // スキルレベルを魔法石のレベルに応じて変動
    // stoneTierが指定されている場合は、stoneTierを基準に-2～+8の範囲でランダム
    // stoneTierが指定されていない場合は、Lv1固定
    const skillLevel = stoneTier !== null 
      ? Math.max(1, Math.min(50, stoneTier + randomInt(-2, 8))) // 魔法石レベルを基準に-2～+8の範囲
      : 1; // 魔法石がない場合はLv1固定
    
    // スキルは知恵を必要とする（レベル×3）
    requiredStats.int = skillLevel * 3;
    
    skillData = { ...template };
    skillData.level = skillLevel;
    skillData.requiredStats = requiredStats; // 装備に必要な能力値（後方互換性のためrequiredStatも残す）
    skillData.requiredStat = skillLevel * 5; // 既存のチェック処理との互換性のため
    skillData.power = template.type === 'attack' ? template.power * (1 + (skillLevel - 1) * 0.05) + (power * 0.01) : template.power + Math.floor(power/2) * skillLevel;
    
    // MPコストもレベルに応じて増加（攻撃スキルの場合）
    if (template.type === 'attack' && template.mpCost) {
      skillData.mpCost = Math.floor(template.mpCost * (1 + (skillLevel - 1) * 0.1));
    } else if (template.mpCost) {
      skillData.mpCost = template.mpCost;
    }
    
    inkSlots = RARITIES[rarityKey].inkSlots;
  } else if (typeRoll < 0.85) {
    return generateInk(floor);
  } else {
    // 装備品用アイテムを生成（15%の確率）
    const equipItem = generateEquipmentItem(floor);
    if (equipItem) return equipItem;
    // 装備品用アイテムが生成できなかった場合はインクを生成
    return generateInk(floor);
  }

  const options = type === 'skill' ? [] : generateOptions(rarityKey, power, type, dungeonMods);
  const prefix = type === 'skill' ? '' : ITEM_PREFIXES[Math.min(Math.floor(floor / 10), ITEM_PREFIXES.length - 1)];
  
  const item = {
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
    requiredStats, // 装備に必要な能力値
    isNew: true
  };
  
  // 巻物の場合、名前にレベルを追加
  if (type === 'skill' && skillData && skillData.level) {
    item.name = `${baseName} Lv.${skillData.level}`;
  }
  
  return item;
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
  const usedTypes = new Set(); // 使用済みのタイプを追跡
  
  const risks = STONE_MODS.filter(m => m.isRisk);
  const allRewards = STONE_MODS.filter(m => m.isReward);

  // リスクを選ぶ（同じタイプは追加しない）
  let attempts = 0;
  const maxAttempts = 100; // 無限ループ防止
  while (mods.length < modCount && attempts < maxAttempts) {
    attempts++;
    const availableRisks = risks.filter(m => !usedTypes.has(m.type));
    
    if (availableRisks.length === 0) break; // 利用可能なリスクがなくなったら終了
    
    const risk = availableRisks[randomInt(0, availableRisks.length - 1)];
    const riskVal = risk.valMin ? randomInt(risk.valMin, risk.valMax) : randomInt(20, 50);
    mods.push({ ...risk, val: riskVal });
    usedTypes.add(risk.type);
    
    // リスクに対応する報酬を自動的に追加
    const rewardTypes = RISK_REWARD_MAPPING[risk.type] || [];
    if (rewardTypes.length > 0) {
      // 対応する報酬からランダムに1つ選ぶ
      const availableRewardTypes = rewardTypes.filter(rt => !usedTypes.has(rt));
      if (availableRewardTypes.length > 0) {
        const selectedRewardType = availableRewardTypes[randomInt(0, availableRewardTypes.length - 1)];
        const reward = allRewards.find(r => r.type === selectedRewardType);
        if (reward) {
          const rewardVal = reward.valMin ? randomInt(reward.valMin, reward.valMax) : 1;
          mods.push({ ...reward, val: rewardVal });
          usedTypes.add(reward.type);
        }
      }
    }
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
    count: 1,
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
    count: 1,
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
    count: 1,
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
    count: 1,
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
    count: 1,
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
    count: 1,
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
    count: 1,
    isNew: true
  };
};

// 装備品用アイテムをランダムに生成
export const generateEquipmentItem = (floor) => {
  const rand = Math.random();
  
  // フロアに応じて確率を調整
  // 低フロアでは基本的なアイテム（強化石、エンチャントスクロール）が多く出る
  // 高フロアでは高級アイテム（レアリティアップグレード石など）も出る
  
  if (rand < 0.30) {
    // 強化石（30%）
    const stone = generateEnhancementStone(floor);
    if (stone) return stone;
  }
  if (rand < 0.50) {
    // エンチャントスクロール（20%）
    const scroll = generateEnchantScroll(floor);
    if (scroll) return scroll;
  }
  if (rand < 0.60) {
    // リロールスクロール（10%）
    const reroll = generateRerollScroll(floor);
    if (reroll) return reroll;
  }
  if (rand < 0.70) {
    // 属性付与石（10%）
    const element = generateElementStone(floor);
    if (element) return element;
  }
  if (rand < 0.80) {
    // 特殊強化アイテム（10%）
    const special = generateSpecialStone(floor);
    if (special) return special;
  }
  if (rand < 0.90) {
    // オプション枠拡張石（10%）
    const slot = generateOptionSlotStone(floor);
    if (slot) return slot;
  }
  if (rand < 1.0) {
    // レアリティアップグレード石（10%）
    const rarity = generateRarityUpgradeStone(floor);
    if (rarity) return rarity;
  }
  
  // どのアイテムも生成できなかった場合、フロアに応じた最低限のアイテムを生成
  if (floor >= 1) {
    // 最低でも強化石を生成（フロア1以上）
    return {
      id: 'enhance_' + Date.now() + Math.random(),
      name: "小さな強化石",
      type: 'enhancement_stone',
      rarity: 'common',
      mult: 0.05,
      count: 1,
      isNew: true
    };
  }
  
  return null;
};

