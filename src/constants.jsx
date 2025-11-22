import React from 'react';
import { 
  Sword, Shield, Flame, Snowflake, Zap, Sun, Moon,
  Sparkles, Target, Heart, Zap as ZapIcon, Shield as ShieldIcon
} from 'lucide-react';

export const INITIAL_PLAYER = {
  level: 1,
  exp: 0,
  expToNext: 50,
  gold: 0,
  hp: 100,
  maxHp: 100,
  stats: { str: 5, vit: 5, dex: 5 },
  statPoints: 0,
  skillPoints: 0,
  learnedSkills: {}, // { skillId: level }
  buffs: [],
};

export const INITIAL_EQUIPMENT = {
  weapon: { id: 'init_w', name: "木の棒", type: "weapon", baseStats: { atk: 2 }, options: [], rarity: "common", power: 1 },
  armor: { id: 'init_a', name: "ボロボロの服", type: "armor", baseStats: { def: 1 }, options: [], rarity: "common", power: 1 },
  accessory: null,
  skill1: null, 
  skill2: null,
  skill3: null,
};

export const MAX_INVENTORY = 25;
export const MAX_STONES = 10;
export const ELEMENTS = ['fire', 'ice', 'thunder', 'light', 'dark'];

export const getElementConfig = (element) => {
  const configs = {
    fire: { label: '火', icon: <Flame size={18} />, color: 'text-red-500', bg: 'bg-red-900/30' },
    ice: { label: '氷', icon: <Snowflake size={18} />, color: 'text-cyan-400', bg: 'bg-cyan-900/30' },
    thunder: { label: '雷', icon: <Zap size={18} />, color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
    light: { label: '光', icon: <Sun size={18} />, color: 'text-orange-300', bg: 'bg-orange-900/30' },
    dark: { label: '闇', icon: <Moon size={18} />, color: 'text-purple-400', bg: 'bg-purple-900/30' },
    none: { label: '無', icon: <Sword size={18} />, color: 'text-gray-400', bg: 'bg-gray-800' }
  };
  return configs[element] || configs.none;
};

export const RARITIES = {
  common: { color: "text-gray-400", border: "border-gray-600", bg: "bg-gray-800", label: "コモン", mult: 1, optCount: 0, inkSlots: 1 },
  uncommon: { color: "text-green-400", border: "border-green-600", bg: "bg-green-900/30", label: "アンコモン", mult: 1.5, optCount: 2, inkSlots: 2 },
  rare: { color: "text-blue-400", border: "border-blue-600", bg: "bg-blue-900/30", label: "レア", mult: 2.5, optCount: 3, inkSlots: 3 },
  epic: { color: "text-purple-400", border: "border-purple-600", bg: "bg-purple-900/30", label: "エピック", mult: 4, optCount: 4, inkSlots: 4 },
  legendary: { color: "text-yellow-400", border: "border-yellow-600", bg: "bg-yellow-900/30", label: "レジェンダリー", mult: 7, optCount: 5, inkSlots: 5 },
};

export const SKILL_TEMPLATES = [
  { name: "ファイアボール", type: 'attack', element: 'fire', power: 2.5, cd: 3 },
  { name: "アイスニードル", type: 'attack', element: 'ice', power: 2.2, cd: 3 },
  { name: "サンダーボルト", type: 'attack', element: 'thunder', power: 2.8, cd: 4 },
  { name: "ホーリーレイ", type: 'attack', element: 'light', power: 3.0, cd: 5 },
  { name: "ダークマター", type: 'attack', element: 'dark', power: 3.5, cd: 6 },
  { name: "メテオストライク", type: 'attack', element: 'fire', power: 5.0, cd: 10, rarity: 'legendary' },
  { name: "ヒールライト", type: 'heal', element: 'light', power: 50, cd: 10, label: "HP回復" },
  { name: "バーサーク", type: 'buff', element: 'fire', buffType: 'atk', val: 0.5, duration: 10, cd: 20, label: "攻撃UP" },
  { name: "アイアンガード", type: 'buff', element: 'none', buffType: 'def', val: 20, duration: 15, cd: 20, label: "防御UP" },
  { name: "クイックステップ", type: 'buff', element: 'thunder', buffType: 'cdSpeed', val: 0.5, duration: 10, cd: 25, label: "CD加速" },
];

export const INK_MODS = [
  { type: 'power_up', label: '威力強化', stat: 'power', val: 0.2, unit: 'x' },
  { type: 'cd_down', label: 'CD短縮', stat: 'cd', val: -0.15, unit: '%' },
  { type: 'dur_up', label: '時間延長', stat: 'duration', val: 0.3, unit: '%' },
];

export const INK_RARE_MODS = [
  { type: 'auto_cast', label: '自動発動', isRare: true, penalty: { type: 'power_down', val: -0.3 } },
  { type: 'multi_cast', label: '2回発動', isRare: true, val: 1, penalty: { type: 'cd_up', val: 0.5 } },
];

export const BASIC_OPTIONS = [
  { type: 'str', label: '筋力', weight: 10 },
  { type: 'vit', label: '体力', weight: 10 },
  { type: 'dex', label: '幸運', weight: 10 },
  { type: 'atk', label: '攻撃力', weight: 5 },
  { type: 'def', label: '防御力', weight: 5 },
  { type: 'maxHp', label: '最大HP', weight: 8 },
  { type: 'res_fire', label: '火耐性', unit: '%', weight: 5, isRes: true },
  { type: 'res_ice', label: '氷耐性', unit: '%', weight: 5, isRes: true },
  { type: 'res_thunder', label: '雷耐性', unit: '%', weight: 5, isRes: true },
  { type: 'res_light', label: '光耐性', unit: '%', weight: 5, isRes: true },
  { type: 'res_dark', label: '闇耐性', unit: '%', weight: 5, isRes: true },
];

export const SPECIAL_OPTIONS = [
  { type: 'vamp', label: 'HP吸収', unit: '%', min: 1, max: 5 },
  { type: 'gold', label: 'G獲得', unit: '%', min: 10, max: 50 },
  { type: 'exp', label: 'EXP獲得', unit: '%', min: 10, max: 50 },
  { type: 'critDmg', label: '会心ダメ', unit: '%', min: 20, max: 100 },
];

export const STONE_MODS = [
  { type: 'risk_hp', label: '敵HP', valMin: 20, valMax: 100, unit: '%', isRisk: true },
  { type: 'risk_atk', label: '敵攻撃力', valMin: 20, valMax: 80, unit: '%', isRisk: true },
  { type: 'risk_dmg', label: '被ダメ', valMin: 10, valMax: 50, unit: '%', isRisk: true },
  { type: 'reward_exp', label: '獲得EXP', valMin: 20, valMax: 100, unit: '%', isReward: true },
  { type: 'reward_gold', label: '獲得Gold', valMin: 20, valMax: 100, unit: '%', isReward: true },
  { type: 'reward_drop', label: '装備数', valMin: 1, valMax: 3, unit: '個増', isReward: true },
  { type: 'qual_rarity', label: 'レア度', valMin: 10, valMax: 50, unit: '%向上', isReward: true },
  { type: 'mod_floor_add', label: '階層', valMin: 1, valMax: 5, unit: '階増', isRisk: true }, 
  { type: 'mod_floor_sub', label: '階層', valMin: 1, valMax: 3, unit: '階減', isReward: true }, 
];

export const MONSTER_NAMES = [
  { name: "スライム", icon: "💧", baseHp: 20, baseExp: 10, baseGold: 2 },
  { name: "コウモリ", icon: "🦇", baseHp: 35, baseExp: 15, baseGold: 5 },
  { name: "ゴブリン", icon: "👺", baseHp: 60, baseExp: 25, baseGold: 10 },
  { name: "スケルトン", icon: "💀", baseHp: 90, baseExp: 40, baseGold: 15 },
  { name: "オーク", icon: "👹", baseHp: 150, baseExp: 70, baseGold: 30 },
  { name: "ゴーレム", icon: "🗿", baseHp: 300, baseExp: 120, baseGold: 60 },
  { name: "ドラゴン", icon: "🐉", baseHp: 1000, baseExp: 500, baseGold: 300 },
];

export const ITEM_PREFIXES = ["錆びた", "普通の", "鋭い", "重厚な", "疾風の", "達人の", "勇者の", "魔王の", "神々の"];
export const WEAPON_NAMES = ["ダガー", "ソード", "アックス", "メイス", "カタナ", "グレートソード"];
export const ARMOR_NAMES = ["ローブ", "レザー", "メイル", "プレート", "フルプレート"];
export const ACC_NAMES = ["リング", "アミュレット", "タリスマン", "オーブ"];

// ==========================================
// 装備品用アイテム定義
// ==========================================

// レアリティの順序
export const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

// 強化石テンプレート
export const ENHANCEMENT_STONE_TEMPLATES = [
  { name: "小さな強化石", rarity: 'common', mult: 0.05 },
  { name: "強化石", rarity: 'uncommon', mult: 0.10 },
  { name: "大強化石", rarity: 'rare', mult: 0.15 },
  { name: "極強化石", rarity: 'epic', mult: 0.20 },
];

// エンチャントスクロールテンプレート
export const ENCHANT_SCROLL_TEMPLATES = [
  { name: "エンチャントスクロール", rarity: 'uncommon', powerMult: 1.0 },
  { name: "上級エンチャントスクロール", rarity: 'rare', powerMult: 1.2 },
  { name: "極エンチャントスクロール", rarity: 'epic', powerMult: 1.5 },
];

// 属性付与石テンプレート
export const ELEMENT_STONE_TEMPLATES = [
  { name: "火の石", element: 'fire', rarity: 'rare', value: 10 },
  { name: "氷の石", element: 'ice', rarity: 'rare', value: 10 },
  { name: "雷の石", element: 'thunder', rarity: 'rare', value: 10 },
  { name: "光の石", element: 'light', rarity: 'epic', value: 15 },
  { name: "闇の石", element: 'dark', rarity: 'epic', value: 15 },
];

// 特殊強化アイテムテンプレート
export const SPECIAL_STONE_TEMPLATES = [
  { name: "吸血の石", type: 'vamp', rarity: 'epic', value: 2 },
  { name: "黄金の石", type: 'gold', rarity: 'epic', value: 20 },
  { name: "経験の石", type: 'exp', rarity: 'epic', value: 20 },
  { name: "会心の石", type: 'critDmg', rarity: 'legendary', value: 30 },
];

// リロールスクロールテンプレート
export const REROLL_SCROLL_TEMPLATES = [
  { name: "リロールスクロール", rarity: 'uncommon', powerMult: 1.0 },
  { name: "上級リロールスクロール", rarity: 'rare', powerMult: 1.2 },
  { name: "極リロールスクロール", rarity: 'epic', powerMult: 1.5 },
];

// オプション枠拡張石テンプレート
export const OPTION_SLOT_STONE_TEMPLATES = [
  { name: "オプション枠拡張石", rarity: 'rare', slots: 1 },
  { name: "上級オプション枠拡張石", rarity: 'epic', slots: 1 },
  { name: "極オプション枠拡張石", rarity: 'legendary', slots: 1 },
];

// レアリティアップグレード石テンプレート
export const RARITY_UPGRADE_STONE_TEMPLATES = [
  { name: "レアリティアップグレード石", rarity: 'epic', upgrades: 1 },
  { name: "上級レアリティアップグレード石", rarity: 'legendary', upgrades: 1 },
];

// ==========================================
// スキルツリー定義
// ==========================================

// スキルタイプ
export const SKILL_TYPES = {
  PASSIVE: 'passive',
  ACTIVE: 'active',
};

// スキルカテゴリ
export const SKILL_CATEGORIES = {
  OFFENSE: 'offense',      // 攻撃系
  DEFENSE: 'defense',      // 防御系
  UTILITY: 'utility',      // ユーティリティ系
  ELEMENTAL: 'elemental',  // 属性系
};

// スキルツリーのグリッド定義
// 各スキルは { id, name, description, category, type, row, col, maxLevel: 1, requirements, levelData }
// row, col: グリッド上の位置 (0から始まる)
// requirements: 前提スキルIDの配列（前のレベルのスキルID）
// levelData: このレベルの効果 { effect, value, bonus?, penalty? }
// 各レベルは別々のノードとして配置される

// ヘルパー関数: スキルノードを生成
const createSkillNode = (baseId, baseName, baseDesc, category, icon, row, startCol, levels, baseRequirements = []) => {
  const nodes = [];
  levels.forEach((levelData, index) => {
    const level = index + 1;
    const requirements = level === 1 ? baseRequirements : [`${baseId}_${level - 1}`];
    nodes.push({
      id: `${baseId}_${level}`,
      name: `${baseName} Lv.${level}`,
      description: baseDesc,
      category,
      type: SKILL_TYPES.PASSIVE,
      row,
      col: startCol + index,
      maxLevel: 1,
      requirements,
      levelData,
      icon,
    });
  });
  return nodes;
};

export const SKILL_TREE = [
  // 第1行: 基本スキル（筋力強化 Lv1-5）
  ...createSkillNode('base_str', '筋力強化', '筋力が+1', SKILL_CATEGORIES.OFFENSE, <Sword size={20} />, 0, 0, [
    { effect: 'str', value: 1 },
    { effect: 'str', value: 1 },
    { effect: 'str', value: 1 },
    { effect: 'str', value: 1 },
    { effect: 'str', value: 1 },
  ]),
  
  // 第2行: 基本スキル（体力強化 Lv1-5）
  ...createSkillNode('base_vit', '体力強化', '体力が+1', SKILL_CATEGORIES.DEFENSE, <Shield size={20} />, 1, 0, [
    { effect: 'vit', value: 1 },
    { effect: 'vit', value: 1 },
    { effect: 'vit', value: 1 },
    { effect: 'vit', value: 1 },
    { effect: 'vit', value: 1 },
  ]),
  
  // 第3行: 基本スキル（幸運強化 Lv1-5）
  ...createSkillNode('base_dex', '幸運強化', '幸運が+1', SKILL_CATEGORIES.UTILITY, <Sparkles size={20} />, 2, 0, [
    { effect: 'dex', value: 1 },
    { effect: 'dex', value: 1 },
    { effect: 'dex', value: 1 },
    { effect: 'dex', value: 1 },
    { effect: 'dex', value: 1 },
  ]),
  
  // 第4行: 攻撃力強化 Lv1-3（前提: base_str_5）
  ...createSkillNode('atk_boost', '攻撃力強化', '攻撃力が+5%', SKILL_CATEGORIES.OFFENSE, <Sword size={20} />, 3, 0, [
    { effect: 'atk_mult', value: 0.05 },
    { effect: 'atk_mult', value: 0.05 },
    { effect: 'atk_mult', value: 0.05 },
  ], ['base_str_5']),
  
  // 第5行: 会心の極み Lv1-3（前提: base_dex_5）
  ...createSkillNode('crit_master', '会心の極み', '会心率が+5%', SKILL_CATEGORIES.OFFENSE, <Target size={20} />, 4, 0, [
    { effect: 'crit', value: 5 },
    { effect: 'crit', value: 5 },
    { effect: 'crit', value: 5 },
  ], ['base_dex_5']),
  
  // 第6行: 吸血 Lv1-3（前提: base_str_5）
  ...createSkillNode('vampiric', '吸血', 'HP吸収が+2%', SKILL_CATEGORIES.OFFENSE, <Heart size={20} />, 5, 0, [
    { effect: 'vamp', value: 2 },
    { effect: 'vamp', value: 2 },
    { effect: 'vamp', value: 2 },
  ], ['base_str_5']),
  
  // 第7行: 防御力強化 Lv1-3（前提: base_vit_5）
  ...createSkillNode('def_boost', '防御力強化', '防御力が+5%', SKILL_CATEGORIES.DEFENSE, <ShieldIcon size={20} />, 6, 0, [
    { effect: 'def_mult', value: 0.05 },
    { effect: 'def_mult', value: 0.05 },
    { effect: 'def_mult', value: 0.05 },
  ], ['base_vit_5']),
  
  // 第8行: 最大HP強化 Lv1-3（前提: base_vit_5）
  ...createSkillNode('hp_boost', '最大HP強化', '最大HPが+10%', SKILL_CATEGORIES.DEFENSE, <Heart size={20} />, 7, 0, [
    { effect: 'hp_mult', value: 0.10 },
    { effect: 'hp_mult', value: 0.10 },
    { effect: 'hp_mult', value: 0.10 },
  ], ['base_vit_5']),
  
  // 第9行: 全属性耐性 Lv1-3（前提: base_vit_5）
  ...createSkillNode('res_all', '全属性耐性', '全属性耐性が+5%', SKILL_CATEGORIES.DEFENSE, <ShieldIcon size={20} />, 8, 0, [
    { effect: 'res_all', value: 5 },
    { effect: 'res_all', value: 5 },
    { effect: 'res_all', value: 5 },
  ], ['base_vit_5']),
  
  // 第10行: クールダウン短縮 Lv1-3（前提: base_dex_5）
  ...createSkillNode('cd_reduction', 'クールダウン短縮', 'CD速度が+10%', SKILL_CATEGORIES.UTILITY, <ZapIcon size={20} />, 9, 0, [
    { effect: 'cdSpeed', value: 0.10 },
    { effect: 'cdSpeed', value: 0.10 },
    { effect: 'cdSpeed', value: 0.10 },
  ], ['base_dex_5']),
  
  // 第11行: ゴールドハンター Lv1-3（前提: base_dex_5）
  ...createSkillNode('gold_finder', 'ゴールドハンター', 'G獲得が+10%', SKILL_CATEGORIES.UTILITY, <Sparkles size={20} />, 10, 0, [
    { effect: 'goldMult', value: 10 },
    { effect: 'goldMult', value: 10 },
    { effect: 'goldMult', value: 10 },
  ], ['base_dex_5']),
  
  // 第12行: 経験値強化 Lv1-3（前提: base_dex_5）
  ...createSkillNode('exp_boost', '経験値強化', 'EXP獲得が+10%', SKILL_CATEGORIES.UTILITY, <Sparkles size={20} />, 11, 0, [
    { effect: 'expMult', value: 10 },
    { effect: 'expMult', value: 10 },
    { effect: 'expMult', value: 10 },
  ], ['base_dex_5']),
  
  // 第13行: バーサーカー（前提: atk_boost_3, vampiric_3）
  {
    id: 'berserker',
    name: 'バーサーカー',
    description: '攻撃力が+15%、防御力が-10%',
    category: SKILL_CATEGORIES.OFFENSE,
    type: SKILL_TYPES.PASSIVE,
    row: 12,
    col: 0,
    maxLevel: 1,
    requirements: ['atk_boost_3', 'vampiric_3'],
    levelData: { effect: 'atk_mult', value: 0.15, penalty: { effect: 'def_mult', value: -0.10 } },
    icon: <Sword size={20} />,
  },
  
  // 第14行: タンク（前提: def_boost_3, hp_boost_3）
  {
    id: 'tank',
    name: 'タンク',
    description: '防御力が+20%、最大HPが+25%',
    category: SKILL_CATEGORIES.DEFENSE,
    type: SKILL_TYPES.PASSIVE,
    row: 13,
    col: 0,
    maxLevel: 1,
    requirements: ['def_boost_3', 'hp_boost_3'],
    levelData: { effect: 'def_mult', value: 0.20, bonus: { effect: 'hp_mult', value: 0.25 } },
    icon: <ShieldIcon size={20} />,
  },
  
  // 第15行: 宝の達人（前提: gold_finder_3, exp_boost_3）
  {
    id: 'master_treasure',
    name: '宝の達人',
    description: 'G獲得が+30%、EXP獲得が+30%',
    category: SKILL_CATEGORIES.UTILITY,
    type: SKILL_TYPES.PASSIVE,
    row: 14,
    col: 0,
    maxLevel: 1,
    requirements: ['gold_finder_3', 'exp_boost_3'],
    levelData: { effect: 'goldMult', value: 30, bonus: { effect: 'expMult', value: 30 } },
    icon: <Sparkles size={20} />,
  },
  
  // 第16行: 火属性マスタリー（前提: atk_boost_3）
  {
    id: 'fire_mastery',
    name: '火属性マスタリー',
    description: '火属性ダメージが+20%、火耐性が+15%',
    category: SKILL_CATEGORIES.ELEMENTAL,
    type: SKILL_TYPES.PASSIVE,
    row: 15,
    col: 0,
    maxLevel: 1,
    requirements: ['atk_boost_3'],
    levelData: { effect: 'fire_dmg', value: 0.20, bonus: { effect: 'res_fire', value: 15 } },
    icon: <Flame size={20} />,
  },
  
  // 第17行: 氷属性マスタリー（前提: atk_boost_3）
  {
    id: 'ice_mastery',
    name: '氷属性マスタリー',
    description: '氷属性ダメージが+20%、氷耐性が+15%',
    category: SKILL_CATEGORIES.ELEMENTAL,
    type: SKILL_TYPES.PASSIVE,
    row: 16,
    col: 0,
    maxLevel: 1,
    requirements: ['atk_boost_3'],
    levelData: { effect: 'ice_dmg', value: 0.20, bonus: { effect: 'res_ice', value: 15 } },
    icon: <Snowflake size={20} />,
  },
  
  // 第18行: 雷属性マスタリー（前提: atk_boost_3）
  {
    id: 'thunder_mastery',
    name: '雷属性マスタリー',
    description: '雷属性ダメージが+20%、雷耐性が+15%',
    category: SKILL_CATEGORIES.ELEMENTAL,
    type: SKILL_TYPES.PASSIVE,
    row: 17,
    col: 0,
    maxLevel: 1,
    requirements: ['atk_boost_3'],
    levelData: { effect: 'thunder_dmg', value: 0.20, bonus: { effect: 'res_thunder', value: 15 } },
    icon: <Zap size={20} />,
  },
  
  // 第19行: 究極の戦士（前提: berserker, crit_master_3）
  {
    id: 'ultimate_warrior',
    name: '究極の戦士',
    description: '全ステータスが+10%、会心ダメージが+50%',
    category: SKILL_CATEGORIES.OFFENSE,
    type: SKILL_TYPES.PASSIVE,
    row: 18,
    col: 0,
    maxLevel: 1,
    requirements: ['berserker', 'crit_master_3'],
    levelData: { 
      effect: 'all_stats', value: 0.10, 
      bonus: { effect: 'critDmg', value: 50 } 
    },
    icon: <Sword size={20} />,
  },
  
  // 第20行: 不死身（前提: tank, res_all_3）
  {
    id: 'immortal',
    name: '不死身',
    description: '最大HPが+50%、全属性耐性が+25%',
    category: SKILL_CATEGORIES.DEFENSE,
    type: SKILL_TYPES.PASSIVE,
    row: 19,
    col: 0,
    maxLevel: 1,
    requirements: ['tank', 'res_all_3'],
    levelData: { 
      effect: 'hp_mult', value: 0.50, 
      bonus: { effect: 'res_all', value: 25 } 
    },
    icon: <ShieldIcon size={20} />,
  },
  
  // 第21行: 元素の支配者（前提: fire_mastery, ice_mastery, thunder_mastery）
  {
    id: 'elemental_lord',
    name: '元素の支配者',
    description: '全属性ダメージが+30%、全属性耐性が+20%',
    category: SKILL_CATEGORIES.ELEMENTAL,
    type: SKILL_TYPES.PASSIVE,
    row: 20,
    col: 0,
    maxLevel: 1,
    requirements: ['fire_mastery', 'ice_mastery', 'thunder_mastery'],
    levelData: { 
      effect: 'all_element_dmg', value: 0.30, 
      bonus: { effect: 'res_all', value: 20 } 
    },
    icon: <Sparkles size={20} />,
  },
];

// スキルツリーのグリッドサイズ（動的に計算）
const maxRow = Math.max(...SKILL_TREE.map(s => s.row));
const maxCol = Math.max(...SKILL_TREE.map(s => s.col));
export const SKILL_TREE_GRID = {
  rows: maxRow + 1,
  cols: maxCol + 1,
  cellSize: 90, // ピクセル
  spacing: 15,  // ピクセル
};

