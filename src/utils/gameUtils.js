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

// レアリティの順序
export const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

// 強化石が装備品に使用可能かチェック
// 強化石のレアリティ以下の装備に使用可能
export const canUseEnhancementStone = (stone, equipment) => {
  if (!stone || !equipment || stone.type !== 'enhancement_stone') return false;
  if (!equipment.rarity || !stone.rarity) return false;
  
  const stoneRarityIndex = RARITY_ORDER.indexOf(stone.rarity);
  const equipmentRarityIndex = RARITY_ORDER.indexOf(equipment.rarity);
  
  // インデックスが見つからない場合はfalse
  if (stoneRarityIndex === -1 || equipmentRarityIndex === -1) return false;
  
  // 強化石のレアリティ以下の装備に使用可能
  return equipmentRarityIndex <= stoneRarityIndex;
};

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

// ==========================================
// キャラクター管理ユーティリティ
// ==========================================

const CHARACTERS_KEY = 'hackslash_characters';
const CURRENT_CHARACTER_KEY = 'hackslash_current_character';

// キャラクターリストを取得
export const getCharacterList = () => {
  try {
    const saved = localStorage.getItem(CHARACTERS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load character list", e);
  }
  return [];
};

// キャラクターリストを保存
export const saveCharacterList = (characters) => {
  try {
    localStorage.setItem(CHARACTERS_KEY, JSON.stringify(characters));
  } catch (e) {
    console.error("Failed to save character list", e);
  }
};

// 現在のキャラクターIDを取得
export const getCurrentCharacterId = () => {
  return localStorage.getItem(CURRENT_CHARACTER_KEY) || null;
};

// 現在のキャラクターIDを設定
export const setCurrentCharacterId = (characterId) => {
  if (characterId) {
    localStorage.setItem(CURRENT_CHARACTER_KEY, characterId);
  } else {
    localStorage.removeItem(CURRENT_CHARACTER_KEY);
  }
};

// キャラクターを作成
export const createCharacter = (name) => {
  const characters = getCharacterList();
  const newId = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const newCharacter = {
    id: newId,
    name: name || `キャラクター${characters.length + 1}`,
    createdAt: new Date().toISOString(),
    lastPlayed: new Date().toISOString(),
  };
  characters.push(newCharacter);
  saveCharacterList(characters);
  return newCharacter;
};

// キャラクターを削除
export const deleteCharacter = (characterId) => {
  const characters = getCharacterList();
  const filtered = characters.filter(c => c.id !== characterId);
  saveCharacterList(filtered);
  
  // セーブデータも削除
  const saveKey = `hackslash_save_v7_${characterId}`;
  localStorage.removeItem(saveKey);
  
  // 削除したキャラクターが現在選択中の場合は、選択を解除
  if (getCurrentCharacterId() === characterId) {
    if (filtered.length > 0) {
      setCurrentCharacterId(filtered[0].id);
    } else {
      setCurrentCharacterId(null);
    }
  }
  
  return filtered;
};

// キャラクター情報を更新（最終プレイ日時など）
export const updateCharacter = (characterId, updates) => {
  const characters = getCharacterList();
  const updated = characters.map(c => {
    if (c.id === characterId) {
      return { ...c, ...updates };
    }
    return c;
  });
  saveCharacterList(updated);
  return updated.find(c => c.id === characterId);
};

// キャラクターのセーブデータを取得
export const getCharacterSaveData = (characterId) => {
  const saveKey = `hackslash_save_v7_${characterId}`;
  try {
    const saved = localStorage.getItem(saveKey);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load character save data", e);
  }
  return null;
};

// キャラクターのセーブデータを保存
export const saveCharacterData = (characterId, data) => {
  const saveKey = `hackslash_save_v7_${characterId}`;
  try {
    const saveData = {
      ...data,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(saveKey, JSON.stringify(saveData));
    
    // 最終プレイ日時を更新
    updateCharacter(characterId, { lastPlayed: new Date().toISOString() });
  } catch (e) {
    console.error("Failed to save character data", e);
  }
};

