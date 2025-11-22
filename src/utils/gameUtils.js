// ゲーム関連のユーティリティ関数

export const getSlotLabel = (slot) => {
  const labels = {
    weapon: '武器',
    armor: '防具',
    amulet: 'アミュレット',
    ring1: 'リング1',
    ring2: 'リング2',
    belt: 'ベルト',
    feet: '足',
  };
  return labels[slot] || slot;
};

export const getSlotType = (slot) => {
  if (slot === 'ring1' || slot === 'ring2') return 'ring';
  return slot;
};

export const EQUIPMENT_SLOTS = ['weapon', 'armor', 'amulet', 'ring1', 'ring2', 'belt', 'feet'];
export const EQUIPMENT_TYPES = ['weapon', 'armor', 'amulet', 'ring', 'belt', 'feet'];

// 装備品用アイテムがスタック可能かチェック
export const canStackEquipmentItem = (item1, item2) => {
  if (!item1 || !item2) return false;
  if (item1.type !== item2.type) return false;
  if (item1.rarity !== item2.rarity) return false;
  
  if (item1.type === 'enhancement_stone') {
    return item1.mult === item2.mult;
  } else if (item1.type === 'enchant_scroll' || item1.type === 'reroll_scroll') {
    return item1.powerMult === item2.powerMult;
  } else if (item1.type === 'element_stone') {
    return item1.element === item2.element && item1.value === item2.value;
  } else if (item1.type === 'special_stone') {
    return item1.specialType === item2.specialType && item1.value === item2.value;
  } else if (item1.type === 'option_slot_stone') {
    return item1.slots === item2.slots;
  } else if (item1.type === 'rarity_upgrade_stone') {
    return item1.upgrades === item2.upgrades;
  }
  
  return false;
};

// 装備品用アイテムをスタック可能なアイテムに追加
export const addEquipmentItemToStack = (itemList, newItem) => {
  const equipmentItemTypes = ['enhancement_stone', 'enchant_scroll', 'element_stone', 'special_stone', 'reroll_scroll', 'option_slot_stone', 'rarity_upgrade_stone'];
  
  if (!equipmentItemTypes.includes(newItem.type)) {
    return [...itemList, newItem];
  }
  
  const stackIndex = itemList.findIndex(existingItem => canStackEquipmentItem(existingItem, newItem));
  
  if (stackIndex >= 0) {
    const updatedList = [...itemList];
    updatedList[stackIndex] = {
      ...updatedList[stackIndex],
      count: (updatedList[stackIndex].count || 1) + 1,
      isNew: newItem.isNew || updatedList[stackIndex].isNew
    };
    return updatedList;
  } else {
    return [...itemList, { ...newItem, count: newItem.count || 1 }];
  }
};

