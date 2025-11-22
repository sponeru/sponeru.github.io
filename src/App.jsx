import React, { useState, useEffect, useMemo } from 'react';
import { 
  Heart, Coins, Trophy, Backpack, Sword, Map as MapIcon, 
  ArrowRight, LogOut, Flame, ChevronsUp, Sparkles, Warehouse,
  Save, Upload, Hammer
} from 'lucide-react';

import {
  INITIAL_PLAYER,
  INITIAL_EQUIPMENT,
  MAX_INVENTORY,
  MAX_STONES,
  MAX_WAREHOUSE,
  RARITIES,
  RARITY_ORDER,
  getElementConfig,
  BASIC_OPTIONS,
  SPECIAL_OPTIONS,
} from './constants.jsx';

import {
  generateEnemy,
  generateLoot,
  generateMagicStone,
  generateOptions,
  generateEquipmentItem,
} from './utils/gameLogic';

import { ItemSlot } from './components/ItemSlot';
import { ItemIcon } from './components/ItemIcon';
import { SkillTree } from './components/SkillTree';
import { SKILL_TREE } from './constants.jsx';
import { GameHeader } from './components/GameHeader';
import { FloatingTexts } from './components/FloatingTexts';
import { TownView } from './components/views/TownView';
import { DungeonView } from './components/views/DungeonView';
import { InkModal } from './components/modals/InkModal';
import { PortalModal } from './components/modals/PortalModal';
import { getSlotLabel, getSlotType, EQUIPMENT_SLOTS, EQUIPMENT_TYPES, canStackEquipmentItem, addEquipmentItemToStack } from './utils/gameUtils';


// ==========================================
// Section 4: Main Component
// ==========================================

export default function HackSlashGame() {
  const [phase, setPhase] = useState('town'); 
  const [player, setPlayer] = useState(INITIAL_PLAYER);
  const [equipment, setEquipment] = useState(INITIAL_EQUIPMENT);
  const [inventory, setInventory] = useState([]);
  const [warehouse, setWarehouse] = useState([]); // 倉庫
  const [stones, setStones] = useState([]); 
  
  const [activeDungeon, setActiveDungeon] = useState(null); 
  const [enemy, setEnemy] = useState(null);
  const [skillCds, setSkillCds] = useState([0, 0, 0]);
  
  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState('portal');
  const [warehouseTab, setWarehouseTab] = useState(false); // 倉庫タブの表示状態
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [inkModeItem, setInkModeItem] = useState(null);
  const [equipmentItemMode, setEquipmentItemMode] = useState(null); // 装備品用アイテム使用モード（後方互換性のため残す）
  const [isInitialLoad, setIsInitialLoad] = useState(true); // 初期ロード完了フラグ
  const [draggedItem, setDraggedItem] = useState(null); // ドラッグ中のアイテム
  const [dragOverTarget, setDragOverTarget] = useState(null); // ドラッグオーバー中のターゲット
  
  // 初期ロード: 初回のみ実行
  useEffect(() => {
    const saved = localStorage.getItem('hackslash_save_v7');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setPlayer({
          ...INITIAL_PLAYER,
          ...data.player,
          skillPoints: data.player.skillPoints || 0,
          learnedSkills: data.player.learnedSkills || {},
          mp: data.player.mp !== undefined ? data.player.mp : (50 + ((data.player.level || 1) - 1) * 5),
          maxMp: data.player.maxMp !== undefined ? data.player.maxMp : (50 + ((data.player.level || 1) - 1) * 5),
        });
        setEquipment({...INITIAL_EQUIPMENT, ...data.equipment}); 
        setInventory(data.inventory || []);
        setWarehouse(data.warehouse || []);
        setStones(data.stones || []);
        setPhase('town');
        // 初期ロード後、addLogが利用可能になったらログを追加
        setTimeout(() => {
          setLogs(p => [{id: Date.now()+Math.random(), msg: "セーブデータをロードしました", color: 'green'}, ...p].slice(0, 10));
        }, 100);
      } catch (e) { 
        console.error("Save corrupted", e);
        setTimeout(() => {
          setLogs(p => [{id: Date.now()+Math.random(), msg: "セーブデータの読み込みに失敗しました", color: 'red'}, ...p].slice(0, 10));
        }, 100);
      }
    } else {
      setTimeout(() => {
        setLogs(p => [{id: Date.now()+Math.random(), msg: "新規ゲームを開始しました", color: 'blue'}, ...p].slice(0, 10));
      }, 100);
    }
    setIsInitialLoad(false);
  }, []);

  // 自動セーブ: 初期ロード完了後のみ実行
  useEffect(() => {
    if (isInitialLoad) return; // 初期ロード中は自動セーブしない
    
    try {
      const data = { player, equipment, inventory, warehouse, stones };
      localStorage.setItem('hackslash_save_v7', JSON.stringify(data));
    } catch (e) {
      console.error("Auto-save failed", e);
    }
  }, [player, equipment, inventory, warehouse, stones, isInitialLoad]);

  // --- Core Logic ---

  const getStats = useMemo(() => {
    let stats = {
      str: player.stats.str, vit: player.stats.vit, dex: player.stats.dex,
      atk: 0, def: 0, hp: 0,
      vamp: 0, goldMult: 0, expMult: 0, critDmg: 0, crit: 0,
      res_fire: 0, res_ice: 0, res_thunder: 0, res_light: 0, res_dark: 0,
      cdSpeed: 0
    };

    Object.values(equipment).forEach(item => {
      if (!item) return;
      const base = item.baseStats || item.stats || {};
      if (base.atk) stats.atk += base.atk;
      if (base.def) stats.def += base.def;
      if (base.hp) stats.hp += base.hp;
      if (base.str) stats.str += base.str;
      if (base.vit) stats.vit += base.vit;
      if (base.dex) stats.dex += base.dex;

      if (item.options) {
        item.options.forEach(opt => {
          if (stats[opt.type] !== undefined) stats[opt.type] += opt.val;
          else if (opt.type === 'maxHp') stats.hp += opt.val;
        });
      }
    });

    if (player.buffs) {
        player.buffs.forEach(b => {
            if (b.buffType === 'atk') stats.atk = Math.floor(stats.atk * (1 + b.val));
            if (b.buffType === 'def') stats.def += b.val;
            if (b.buffType === 'cdSpeed') stats.cdSpeed += b.val;
        });
    }

    // 習得済みスキルの効果を適用
    if (player.learnedSkills) {
      SKILL_TREE.forEach(skill => {
        const level = player.learnedSkills[skill.id] || 0;
        if (level > 0 && skill.levelData) {
          const levelData = skill.levelData;
          const effect = levelData.effect;
          const value = levelData.value;
          
          if (effect === 'str') stats.str += value;
          else if (effect === 'vit') stats.vit += value;
          else if (effect === 'dex') stats.dex += value;
          else if (effect === 'atk_mult') stats.atk = Math.floor(stats.atk * (1 + value));
          else if (effect === 'def_mult') stats.def = Math.floor(stats.def * (1 + value));
          else if (effect === 'hp_mult') stats.hp = Math.floor(stats.hp * (1 + value));
          else if (effect === 'crit') stats.crit = Math.min(100, (stats.crit || 0) + value);
          else if (effect === 'vamp') stats.vamp += value;
          else if (effect === 'cdSpeed') stats.cdSpeed += value;
          else if (effect === 'goldMult') stats.goldMult += value;
          else if (effect === 'expMult') stats.expMult += value;
          else if (effect === 'critDmg') stats.critDmg += value;
          else if (effect === 'res_fire') stats.res_fire += value;
          else if (effect === 'res_ice') stats.res_ice += value;
          else if (effect === 'res_thunder') stats.res_thunder += value;
          else if (effect === 'res_light') stats.res_light += value;
          else if (effect === 'res_dark') stats.res_dark += value;
          else if (effect === 'res_all') {
            stats.res_fire += value;
            stats.res_ice += value;
            stats.res_thunder += value;
            stats.res_light += value;
            stats.res_dark += value;
          }
          else if (effect === 'all_stats') {
            stats.str = Math.floor(stats.str * (1 + value));
            stats.vit = Math.floor(stats.vit * (1 + value));
            stats.dex = Math.floor(stats.dex * (1 + value));
          }
          
          // ボーナス効果
          if (levelData.bonus) {
            const bonusEffect = levelData.bonus.effect;
            const bonusValue = levelData.bonus.value;
            if (bonusEffect === 'res_fire') stats.res_fire += bonusValue;
            else if (bonusEffect === 'res_ice') stats.res_ice += bonusValue;
            else if (bonusEffect === 'res_thunder') stats.res_thunder += bonusValue;
            else if (bonusEffect === 'res_light') stats.res_light += bonusValue;
            else if (bonusEffect === 'res_dark') stats.res_dark += bonusValue;
            else if (bonusEffect === 'res_all') {
              stats.res_fire += bonusValue;
              stats.res_ice += bonusValue;
              stats.res_thunder += bonusValue;
              stats.res_light += bonusValue;
              stats.res_dark += bonusValue;
            }
            else if (bonusEffect === 'hp_mult') stats.hp = Math.floor(stats.hp * (1 + bonusValue));
            else if (bonusEffect === 'expMult') stats.expMult += bonusValue;
            else if (bonusEffect === 'critDmg') stats.critDmg += bonusValue;
          }
          
          // ペナルティ効果
          if (levelData.penalty) {
            const penaltyEffect = levelData.penalty.effect;
            const penaltyValue = levelData.penalty.value;
            if (penaltyEffect === 'def_mult') stats.def = Math.floor(stats.def * (1 + penaltyValue));
          }
        }
      });
    }

    const finalAtk = stats.atk + (stats.str * 2);
    const finalDef = stats.def + Math.floor(stats.vit / 2);
    const finalMaxHp = 100 + (stats.vit * 10) + stats.hp;
    const finalCrit = Math.min(75, stats.dex * 0.5);

    return { atk: finalAtk, def: finalDef, maxHp: finalMaxHp, crit: finalCrit, ...stats };
  }, [player.stats, equipment, player.buffs, player.learnedSkills]);

  // --- Dungeon Logic ---

  const startDungeon = (stone = null) => {
    let floor = 1;
    let maxFloor = 5; 
    let mods = {};
    let stoneName = "始まりの平原";

    if (stone) {
        floor = stone.tier; 
        maxFloor = stone.maxFloor;
        stoneName = stone.name;
        stone.mods.forEach(m => {
            mods[m.type] = (mods[m.type] || 0) + (m.val || 1);
        });
        setStones(prev => prev.filter(s => s.id !== stone.id));
    }

    setActiveDungeon({ floor, startFloor: floor, maxFloor, mods, stoneName });
    setEnemy(generateEnemy(floor, mods, floor === maxFloor));
    setPhase('dungeon');
    setTab('battle');
    setSkillCds([0,0,0]);
    setPlayer(p => {
      const maxMp = p.maxMp || 50 + (p.level - 1) * 5;
      return {...p, buffs: [], mp: maxMp, maxMp: maxMp};
    }); 
    addLog(`${stoneName} (F${floor}〜F${floor+maxFloor})に入場`, 'yellow');
  };

  const returnToTown = () => {
    setPhase('town');
    setTab('portal');
    setActiveDungeon(null);
    setEnemy(null);
    setPlayer(p => {
      const maxMp = p.maxMp || 50 + (p.level - 1) * 5;
      return {...p, hp: getStats.maxHp, mp: maxMp, buffs: []};
    }); 
    addLog("街に帰還しました", 'blue');
  };

  // Battle Loop
  useEffect(() => {
    if (phase !== 'dungeon' || !enemy) return;

    const timer = setInterval(() => {
      setPlayer(p => {
          if (p.buffs.length === 0) return p;
          const nextBuffs = p.buffs.map(b => ({...b, duration: b.duration - 0.05})).filter(b => b.duration > 0);
          return { ...p, buffs: nextBuffs };
      });

      setSkillCds(prev => prev.map(cd => Math.max(0, cd - 0.05 * (1 + getStats.cdSpeed))));

      [1, 2, 3].forEach((slotNum, idx) => {
          const slotKey = `skill${slotNum}`;
          const skillItem = equipment[slotKey];
          if (skillItem && skillCds[idx] <= 0) {
              const hasAutoCast = skillItem.inks?.some(ink => ink.mod.type === 'auto_cast');
              if (hasAutoCast) {
                  handleUseSkill(slotNum); 
              }
          }
      });

      if (enemy.hp > 0 && player.hp > 0) {
        setEnemy(prev => {
          if (prev.wait >= prev.maxWait) {
            const rawDmg = Math.max(1, Math.floor(prev.atk - getStats.def));
            let mitigation = 0;
            if (prev.element !== 'none') {
                mitigation = (getStats[`res_${prev.element}`] || 0) / 100;
                mitigation = Math.min(0.8, mitigation); 
            }
            const dmgMod = 1 + ((activeDungeon.mods.risk_dmg || 0) / 100);
            const finalDmg = Math.max(1, Math.floor(rawDmg * dmgMod * (1 - mitigation)));

            setPlayer(p => ({ ...p, hp: Math.max(0, p.hp - finalDmg) }));
            addLog(`被弾! ${finalDmg} dmg`, 'red');
            spawnFloatingText(finalDmg, 'red');
            
            if (player.hp - finalDmg <= 0) {
                addLog("力尽きた...", 'red');
                setTimeout(returnToTown, 2000);
            }
            return { ...prev, wait: 0 };
          }
          return { ...prev, wait: prev.wait + 1 };
        });
      }
    }, 50);
    return () => clearInterval(timer);
  }, [phase, enemy, getStats, activeDungeon, player.hp, skillCds, equipment]);

  const applySkillEffects = (skillItem, idx) => {
      const base = skillItem.skillData;
      const inks = skillItem.inks || [];
      
      let powerMult = 1;
      let durMult = 1;
      let cdMult = 1;
      let multiCast = 1;
      
      inks.forEach(ink => {
          if (ink.mod.stat === 'power') powerMult += ink.mod.val;
          if (ink.mod.stat === 'cd') cdMult += ink.mod.val;
          if (ink.mod.stat === 'duration') durMult += ink.mod.val;
          if (ink.mod.type === 'multi_cast') multiCast += ink.mod.val;
          
          if (ink.mod.penalty) {
              if (ink.mod.penalty.type === 'power_down') powerMult += ink.mod.penalty.val;
              if (ink.mod.penalty.type === 'cd_up') cdMult += ink.mod.penalty.val;
          }
      });

      const finalPower = base.power * powerMult;
      const finalDuration = (base.duration || 0) * durMult;
      const finalCd = base.cd * cdMult;

      for(let i=0; i<multiCast; i++) {
          if (base.type === 'attack') {
              let dmg = Math.floor(getStats.atk * finalPower);
              setEnemy(prev => {
                  const newHp = Math.max(0, prev.hp - dmg);
                  spawnFloatingText(dmg, getElementConfig(base.element).color.replace('text-',''), false);
                  if (newHp <= 0) winBattle(prev); 
                  return { ...prev, hp: newHp };
              });
          } else if (base.type === 'heal') {
              const heal = Math.floor(finalPower);
              setPlayer(p => ({ ...p, hp: Math.min(getStats.maxHp, p.hp + heal) }));
              spawnFloatingText(heal, 'green');
          } else if (base.type === 'buff') {
              const buffId = Date.now() + Math.random();
              setPlayer(p => ({
                  ...p,
                  buffs: [...p.buffs, { id: buffId, name: base.name, buffType: base.buffType, val: base.val * powerMult, duration: finalDuration }]
              }));
              addLog(`${base.name}!`, 'blue');
          }
      }
      
      setSkillCds(prev => {
          const next = [...prev];
          next[idx] = finalCd;
          return next;
      });
      
      if (base.type !== 'buff') addLog(`${base.name}!`, getElementConfig(base.element).color.split('-')[1]);
  };

  const handleUseSkill = (slotNum) => {
      if (player.hp <= 0 || (enemy && enemy.hp <= 0)) return;
      const idx = slotNum - 1;
      if (skillCds[idx] > 0) return;

      const skillItem = equipment[`skill${slotNum}`];
      if (!skillItem) return;
      
      // MPコストをチェック（攻撃スキルの場合）
      const base = skillItem.skillData;
      if (base && base.mpCost && base.type === 'attack') {
        if (player.mp < base.mpCost) {
          addLog(`MPが足りません（必要: ${base.mpCost}、現在: ${player.mp}）`, 'red');
          return;
        }
        // MPを消費
        setPlayer(p => ({ ...p, mp: Math.max(0, p.mp - base.mpCost) }));
      }

      applySkillEffects(skillItem, idx);
  };

  const handleAttack = () => {
    if (player.hp <= 0 || enemy.hp <= 0) return;

    const isCrit = Math.random() * 100 < getStats.crit;
    let dmg = Math.floor(getStats.atk * (Math.random() * 0.4 + 0.8));
    if (isCrit) dmg = Math.floor(dmg * (1.5 + (getStats.critDmg / 100)));

    spawnFloatingText(dmg, isCrit ? 'yellow' : 'white', isCrit);
    
    if (getStats.vamp > 0) {
      const heal = Math.ceil(dmg * (getStats.vamp / 100));
      if (heal > 0 && player.hp < getStats.maxHp) {
        setPlayer(p => ({ ...p, hp: Math.min(getStats.maxHp, p.hp + heal) }));
      }
    }

    const newEnemyHp = enemy.hp - dmg;
    if (newEnemyHp <= 0) {
      setEnemy(prev => ({ ...prev, hp: 0 }));
      winBattle(enemy); 
    } else {
      setEnemy(prev => ({ ...prev, hp: newEnemyHp }));
    }
  };

  const winBattle = (defeatedEnemy) => {
    const dMods = activeDungeon.mods;
    const expMult = 1 + (getStats.expMult / 100) + ((dMods.reward_exp || 0) / 100);
    const goldMult = 1 + (getStats.goldMult / 100) + ((dMods.reward_gold || 0) / 100);
    
    const expGain = Math.floor(defeatedEnemy.exp * expMult);
    const goldGain = Math.floor(defeatedEnemy.gold * goldMult);

    let newPlayer = { ...player, exp: player.exp + expGain, gold: player.gold + goldGain };
    addLog(`勝利! +${expGain}EXP`, 'green');

    if (newPlayer.exp >= newPlayer.expToNext) {
      newPlayer.level += 1;
      newPlayer.exp -= newPlayer.expToNext;
      newPlayer.expToNext = Math.floor(newPlayer.expToNext * 1.2);
      newPlayer.skillPoints = (newPlayer.skillPoints || 0) + 1;
      newPlayer.hp = getStats.maxHp;
      // MPも回復
      newPlayer.maxMp = 50 + (newPlayer.level - 1) * 5;
      newPlayer.mp = newPlayer.maxMp;
      addLog(`Level Up! ${newPlayer.level} (+1スキルポイント)`, 'yellow');
    }
    setPlayer(newPlayer);

    const relativeFloor = activeDungeon.floor - activeDungeon.startFloor + 1;
    
    if (relativeFloor >= activeDungeon.maxFloor && defeatedEnemy.isBoss) {
        addLog("ダンジョン制覇！", 'yellow');
        setTimeout(returnToTown, 2000);
        distributeLoot(activeDungeon.floor, dMods, true);
        return;
    }

    distributeLoot(activeDungeon.floor, dMods, false);

    const nextFloor = activeDungeon.floor + 1;
    const nextRelative = nextFloor - activeDungeon.startFloor + 1;
    setActiveDungeon(prev => ({ ...prev, floor: nextFloor }));
    
    setTimeout(() => {
        if(phase === 'dungeon') {
            const isNextBoss = (nextRelative === activeDungeon.maxFloor) || (nextFloor % 10 === 0);
            setEnemy(generateEnemy(nextFloor, activeDungeon.mods, isNextBoss));
        }
    }, 600);
  };

  // 装備品用アイテムがスタック可能かチェック
  const canStackEquipmentItem = (item1, item2) => {
    if (!item1 || !item2) return false;
    if (item1.type !== item2.type) return false;
    if (item1.rarity !== item2.rarity) return false;
    
    // タイプごとに効果値を比較
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
  const addEquipmentItemToStack = (itemList, newItem) => {
    const equipmentItemTypes = ['enhancement_stone', 'enchant_scroll', 'element_stone', 'special_stone', 'reroll_scroll', 'option_slot_stone', 'rarity_upgrade_stone'];
    
    // 装備品用アイテムでない場合はそのまま追加
    if (!equipmentItemTypes.includes(newItem.type)) {
      return [...itemList, newItem];
    }
    
    // スタック可能なアイテムを探す
    const stackIndex = itemList.findIndex(existingItem => canStackEquipmentItem(existingItem, newItem));
    
    if (stackIndex >= 0) {
      // スタックする
      const updatedList = [...itemList];
      updatedList[stackIndex] = {
        ...updatedList[stackIndex],
        count: (updatedList[stackIndex].count || 1) + 1,
        isNew: newItem.isNew || updatedList[stackIndex].isNew // 新しいアイテムが来た場合はisNewを維持
      };
      return updatedList;
    } else {
      // スタックできない場合は新規追加
      return [...itemList, { ...newItem, count: newItem.count || 1 }];
    }
  };

  const distributeLoot = (floor, dMods, isBoss) => {
      const dropRate = isBoss ? 1.0 : 0.35;
      const dropCount = isBoss ? (1 + (dMods.reward_drop || 0)) : 1;

      for(let i=0; i<dropCount; i++) {
          if (Math.random() < dropRate) {
              // インベントリまたは倉庫に空きがあるかチェック
              const hasInventorySpace = inventory.length < MAX_INVENTORY;
              const hasWarehouseSpace = warehouse.length < MAX_WAREHOUSE;
              
              if (hasInventorySpace || hasWarehouseSpace) {
                  const loot = generateLoot(floor, dMods);
                  if (hasInventorySpace) {
                      setInventory(prev => addEquipmentItemToStack(prev, loot));
                  } else {
                      setWarehouse(prev => addEquipmentItemToStack(prev, loot));
                  }
                  addLog(`${loot.name}を拾った`, 'blue');
              } else {
                  addLog('インベントリと倉庫が一杯です', 'red');
              }
          }
      }
      
      // 装備品用アイテムの追加ドロップ（ボス戦では確実に1つ、通常敵では低確率）
      const equipmentItemRate = isBoss ? 0.8 : 0.15;
      if (Math.random() < equipmentItemRate) {
          const hasInventorySpace = inventory.length < MAX_INVENTORY;
          const hasWarehouseSpace = warehouse.length < MAX_WAREHOUSE;
          
          if (hasInventorySpace || hasWarehouseSpace) {
              const equipItem = generateEquipmentItem(floor);
              if (equipItem) {
                  if (hasInventorySpace) {
                      setInventory(prev => addEquipmentItemToStack(prev, equipItem));
                  } else {
                      setWarehouse(prev => addEquipmentItemToStack(prev, equipItem));
                  }
                  addLog(`${equipItem.name}を拾った`, 'green');
              }
          }
      }
      
      const stoneRate = isBoss ? 0.4 : 0.05;
      if (Math.random() < stoneRate && stones.length < MAX_STONES) {
          const stone = generateMagicStone(floor + (isBoss ? 1 : 0));
          setStones(prev => [...prev, stone]);
          addLog(`魔法石: ${stone.name}`, 'purple');
      }
  };

  // --- Utility ---
  const healPlayer = () => {
    const cost = player.level * 5;
    if (player.gold >= cost && player.hp < getStats.maxHp) {
      setPlayer(p => ({ ...p, gold: p.gold - cost, hp: getStats.maxHp }));
      spawnFloatingText("HEAL", "green");
    }
  };
  
  const learnSkill = (skillId) => {
    const skill = SKILL_TREE.find(s => s.id === skillId);
    if (!skill) return;
    
    const currentLevel = player.learnedSkills[skillId] || 0;
    if (currentLevel >= 1) return; // maxLevelは常に1
    if ((player.skillPoints || 0) <= 0) return;
    
    // 前提条件チェック
    if (skill.requirements.length > 0) {
      for (const reqId of skill.requirements) {
        if ((player.learnedSkills[reqId] || 0) < 1) {
          addLog('前提スキルが未習得です', 'red');
          return;
        }
      }
    }
    
    setPlayer(p => ({
      ...p,
      skillPoints: (p.skillPoints || 0) - 1,
      learnedSkills: {
        ...p.learnedSkills,
        [skillId]: 1
      }
    }));
    addLog(`${skill.name} を習得しました`, 'green');
  };
  
  const equipItem = (item, slotIndex = null) => { 
    // 巻物の場合、必要能力値をチェック
    if (item.type === 'skill' && item.skillData && item.skillData.requiredStat) {
      const requiredStat = item.skillData.requiredStat;
      const totalStats = getStats.str + getStats.vit + getStats.dex;
      if (totalStats < requiredStat) {
        addLog(`装備できません。必要能力値: ${requiredStat}（現在: ${totalStats}）`, 'red');
        return;
      }
    }
    
    let slot = item.type;
    if (item.type === 'skill') {
        if (!slotIndex) {
            if (!equipment.skill1) slot = 'skill1';
            else if (!equipment.skill2) slot = 'skill2';
            else if (!equipment.skill3) slot = 'skill3';
            else slot = 'skill1'; 
        } else {
            slot = `skill${slotIndex}`;
        }
    }
    
    const oldItem = equipment[slot];
    setEquipment(prev => ({ ...prev, [slot]: item }));
    setInventory(prev => {
        const filtered = prev.filter(i => i.id !== item.id);
        return oldItem ? [...filtered, oldItem] : filtered;
    });
    setSelectedItem(null);
  };

  const unequipItem = (slot) => {
      const item = equipment[slot];
      if (!item) return;
      if (inventory.length >= MAX_INVENTORY) {
          alert("インベントリが一杯です");
          return;
      }
      setEquipment(prev => ({ ...prev, [slot]: null }));
      setInventory(prev => [...prev, item]);
      setSelectedItem(null);
  };

  const sellItem = (item) => {
    const equipmentItemTypes = ['enhancement_stone', 'enchant_scroll', 'element_stone', 'special_stone', 'reroll_scroll', 'option_slot_stone', 'rarity_upgrade_stone'];
    const isEquipmentItem = equipmentItemTypes.includes(item.type);
    
    const value = item.type === 'stone' ? item.tier * 10 : Math.floor((item.power || 1) * 2);
    const sellCount = item.count || 1;
    const totalValue = value * sellCount;
    
    setPlayer(p => ({ ...p, gold: p.gold + totalValue }));
    
    if (item.type === 'stone') {
      setStones(prev => prev.filter(i => i.id !== item.id));
    } else if (warehouseTab) {
      setWarehouse(prev => {
        const itemIndex = prev.findIndex(i => i.id === item.id);
        if (itemIndex >= 0 && isEquipmentItem && prev[itemIndex].count && prev[itemIndex].count > 1) {
          const newList = [...prev];
          newList[itemIndex] = { ...prev[itemIndex], count: prev[itemIndex].count - sellCount };
          if (newList[itemIndex].count <= 0) {
            return prev.filter(i => i.id !== item.id);
          }
          return newList;
        }
        return prev.filter(i => i.id !== item.id);
      });
    } else {
      setInventory(prev => {
        const itemIndex = prev.findIndex(i => i.id === item.id);
        if (itemIndex >= 0 && isEquipmentItem && prev[itemIndex].count && prev[itemIndex].count > 1) {
          const newList = [...prev];
          newList[itemIndex] = { ...prev[itemIndex], count: prev[itemIndex].count - sellCount };
          if (newList[itemIndex].count <= 0) {
            return prev.filter(i => i.id !== item.id);
          }
          return newList;
        }
        return prev.filter(i => i.id !== item.id);
      });
    }
    setSelectedItem(null);
    addLog(`売却 (+${totalValue}G${sellCount > 1 ? ` x${sellCount}` : ''})`, 'gray');
  };

  // 倉庫機能: インベントリから倉庫へ移動
  const moveToWarehouse = (item) => {
    const equipmentItemTypes = ['enhancement_stone', 'enchant_scroll', 'element_stone', 'special_stone', 'reroll_scroll', 'option_slot_stone', 'rarity_upgrade_stone'];
    const isEquipmentItem = equipmentItemTypes.includes(item.type);
    
    if (isEquipmentItem) {
      // 装備品用アイテムの場合はスタック処理
      // 現在のインベントリからアイテムを探す
      const itemIndex = inventory.findIndex(i => i.id === item.id);
      if (itemIndex >= 0) {
        const updatedItem = inventory[itemIndex];
        let itemToMove = null;
        let newInventory = null;
        
        if (updatedItem.count && updatedItem.count > 1) {
          // スタック数を減らす
          newInventory = [...inventory];
          newInventory[itemIndex] = { ...updatedItem, count: updatedItem.count - 1 };
          itemToMove = { ...item, count: 1 };
        } else {
          // スタックが1つだけの場合は移動
          newInventory = inventory.filter(i => i.id !== item.id);
          itemToMove = item;
        }
        
        // 両方の状態を更新
        setInventory(newInventory);
        setWarehouse(prevWarehouse => addEquipmentItemToStack(prevWarehouse, itemToMove));
      }
    } else {
      // 通常のアイテムはそのまま移動
      if (warehouse.length >= MAX_WAREHOUSE) {
        alert("倉庫が一杯です");
        return;
      }
      setInventory(prev => prev.filter(i => i.id !== item.id));
      setWarehouse(prev => [...prev, item]);
    }
    setSelectedItem(null);
    addLog(`${item.name}を倉庫に移動`, 'blue');
  };

  // 倉庫機能: 倉庫からインベントリへ移動
  const moveToInventory = (item) => {
    const equipmentItemTypes = ['enhancement_stone', 'enchant_scroll', 'element_stone', 'special_stone', 'reroll_scroll', 'option_slot_stone', 'rarity_upgrade_stone'];
    const isEquipmentItem = equipmentItemTypes.includes(item.type);
    
    if (isEquipmentItem) {
      // 装備品用アイテムの場合はスタック処理
      // 現在の倉庫からアイテムを探す
      const itemIndex = warehouse.findIndex(i => i.id === item.id);
      if (itemIndex >= 0) {
        const updatedItem = warehouse[itemIndex];
        let itemToMove = null;
        let newWarehouse = null;
        
        if (updatedItem.count && updatedItem.count > 1) {
          // スタック数を減らす
          newWarehouse = [...warehouse];
          newWarehouse[itemIndex] = { ...updatedItem, count: updatedItem.count - 1 };
          itemToMove = { ...item, count: 1 };
        } else {
          // スタックが1つだけの場合は移動
          newWarehouse = warehouse.filter(i => i.id !== item.id);
          itemToMove = item;
        }
        
        // 両方の状態を更新
        setWarehouse(newWarehouse);
        setInventory(prevInventory => addEquipmentItemToStack(prevInventory, itemToMove));
      }
    } else {
      // 通常のアイテムはそのまま移動
      if (inventory.length >= MAX_INVENTORY) {
        alert("インベントリが一杯です");
        return;
      }
      setWarehouse(prev => prev.filter(i => i.id !== item.id));
      setInventory(prev => [...prev, item]);
    }
    setSelectedItem(null);
    addLog(`${item.name}をインベントリに移動`, 'blue');
  };

  // ドラッグアンドドロップ: ドラッグ開始
  const handleDragStart = (e, item, source) => {
    setDraggedItem({ item, source }); // source: 'inventory' | 'warehouse' | 'equipment'
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({ itemId: item.id, source }));
  };

  // ドラッグアンドドロップ: ドラッグ終了
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverTarget(null);
  };

  // ドラッグアンドドロップ: ドラッグオーバー
  const handleDragOver = (e, target) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTarget(target);
  };

  // ドラッグアンドドロップ: ドロップ
  const handleDrop = (e, target) => {
    e.preventDefault();
    if (!draggedItem) return;

    const { item, source } = draggedItem;

    // 同じ場所へのドロップは無視
    if (source === target) {
      setDraggedItem(null);
      setDragOverTarget(null);
      return;
    }

    // 装備スロットへのドロップ
    if (target.startsWith('equipment_')) {
      const slot = target.replace('equipment_', '');
      let canEquip = false;
      
      if (slot === 'skill1' || slot === 'skill2' || slot === 'skill3') {
        if (item.type === 'skill') {
          canEquip = true;
          const slotNum = parseInt(slot.replace('skill', ''));
          
          // 倉庫からの場合はインベントリに移動
          if (source === 'warehouse') {
            if (inventory.length >= MAX_INVENTORY && !equipment[slot]) {
              addLog('インベントリが一杯です', 'red');
              setDraggedItem(null);
              setDragOverTarget(null);
              return;
            }
            setWarehouse(prev => prev.filter(i => i.id !== item.id));
          }
          
          // 装備処理
          const oldItem = equipment[slot];
          setEquipment(prev => ({ ...prev, [slot]: item }));
          
          // 古い装備をインベントリに戻す
          if (oldItem && oldItem.id !== item.id) {
            if (source === 'inventory') {
              setInventory(prev => {
                const filtered = prev.filter(i => i.id !== item.id);
                return [...filtered, oldItem];
              });
            } else {
              // 倉庫からの場合、古い装備をインベントリに追加
              if (inventory.length < MAX_INVENTORY) {
                setInventory(prev => [...prev, oldItem]);
              } else if (warehouse.length < MAX_WAREHOUSE) {
                setWarehouse(prev => [...prev, oldItem]);
              }
            }
          } else if (source === 'inventory') {
            setInventory(prev => prev.filter(i => i.id !== item.id));
          }
          
          addLog(`${item.name}を装備しました`, 'green');
        } else {
          addLog('スキルスロットにはスキルのみ装備できます', 'red');
        }
      } else if (EQUIPMENT_SLOTS.includes(slot)) {
        const expectedType = getSlotType(slot);
        if (item.type === expectedType) {
          canEquip = true;
          
          // 倉庫からの場合はインベントリに移動
          if (source === 'warehouse') {
            if (inventory.length >= MAX_INVENTORY && !equipment[slot]) {
              addLog('インベントリが一杯です', 'red');
              setDraggedItem(null);
              setDragOverTarget(null);
              return;
            }
            setWarehouse(prev => prev.filter(i => i.id !== item.id));
          }
          
          // 装備処理
          const oldItem = equipment[slot];
          setEquipment(prev => ({ ...prev, [slot]: item }));
          
          // 古い装備をインベントリに戻す
          if (oldItem && oldItem.id !== item.id) {
            if (source === 'inventory') {
              setInventory(prev => {
                const filtered = prev.filter(i => i.id !== item.id);
                return [...filtered, oldItem];
              });
            } else {
              // 倉庫からの場合、古い装備をインベントリに追加
              if (inventory.length < MAX_INVENTORY) {
                setInventory(prev => [...prev, oldItem]);
              } else if (warehouse.length < MAX_WAREHOUSE) {
                setWarehouse(prev => [...prev, oldItem]);
              }
            }
          } else if (source === 'inventory') {
            setInventory(prev => prev.filter(i => i.id !== item.id));
          }
          
          addLog(`${item.name}を装備しました`, 'green');
        } else {
          addLog(`このスロットには${getSlotLabel(slot)}のみ装備できます`, 'red');
        }
      }
      
      if (!canEquip) {
        setDraggedItem(null);
        setDragOverTarget(null);
        return;
      }
    }
    // インベントリ ↔ 倉庫
    else if ((source === 'inventory' && target === 'warehouse')) {
      moveToWarehouse(item);
    } else if (source === 'warehouse' && target === 'inventory') {
      moveToInventory(item);
    }
    // 装備スロットからのドロップ（インベントリへ）
    else if (source.startsWith('equipment_') && target === 'inventory') {
      const slot = source.replace('equipment_', '');
      unequipItem(slot);
    }
    // 装備スロットからのドロップ（倉庫へ）
    else if (source.startsWith('equipment_') && target === 'warehouse') {
      const slot = source.replace('equipment_', '');
      const eqItem = equipment[slot];
      if (eqItem) {
        unequipItem(slot);
        moveToWarehouse(eqItem);
      }
    }
    // 売却エリアへのドロップ
    else if (target === 'sell') {
      sellItem(item);
    }

    setDraggedItem(null);
    setDragOverTarget(null);
  };

  // 手動セーブ機能
  const manualSave = () => {
    try {
      const data = { 
        player, 
        equipment, 
        inventory, 
        warehouse, 
        stones,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('hackslash_save_v7', JSON.stringify(data));
      addLog("セーブしました", 'green');
      
      // トースト的な通知（視覚的フィードバック）
      const saveToast = document.createElement('div');
      saveToast.textContent = 'セーブ完了！';
      saveToast.style.cssText = 'position:fixed;top:20px;right:20px;background:green;color:white;padding:10px 20px;border-radius:5px;z-index:10000;';
      document.body.appendChild(saveToast);
      setTimeout(() => document.body.removeChild(saveToast), 2000);
    } catch (e) {
      console.error("Manual save failed", e);
      addLog("セーブに失敗しました: " + e.message, 'red');
    }
  };

  // 手動ロード機能
  const manualLoad = () => {
    const saved = localStorage.getItem('hackslash_save_v7');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        
        // ダンジョン中なら警告を表示
        if (phase === 'dungeon') {
          if (!confirm('ダンジョン中にロードすると、現在の進行状況が失われます。続行しますか？')) {
            return;
          }
        }
        
        setPlayer({
          ...INITIAL_PLAYER,
          ...data.player,
          skillPoints: data.player.skillPoints || 0,
          learnedSkills: data.player.learnedSkills || {},
          mp: data.player.mp !== undefined ? data.player.mp : (50 + ((data.player.level || 1) - 1) * 5),
          maxMp: data.player.maxMp !== undefined ? data.player.maxMp : (50 + ((data.player.level || 1) - 1) * 5),
          buffs: [], // ロード時はバフをリセット
        });
        setEquipment({...INITIAL_EQUIPMENT, ...data.equipment}); 
        setInventory(data.inventory || []);
        setWarehouse(data.warehouse || []);
        setStones(data.stones || []);
        setPhase('town');
        setActiveDungeon(null);
        setEnemy(null);
        addLog("ロードしました", 'green');
        
        // ロード通知
        const loadToast = document.createElement('div');
        loadToast.textContent = 'ロード完了！';
        loadToast.style.cssText = 'position:fixed;top:20px;right:20px;background:blue;color:white;padding:10px 20px;border-radius:5px;z-index:10000;';
        document.body.appendChild(loadToast);
        setTimeout(() => document.body.removeChild(loadToast), 2000);
      } catch (e) {
        console.error("Manual load failed", e);
        addLog("ロードに失敗しました: " + e.message, 'red');
      }
    } else {
      addLog("セーブデータが見つかりません", 'red');
    }
  };

  const attachInk = (scroll, ink) => {
      if (!scroll || !ink) return;
      if ((scroll.inks?.length || 0) >= scroll.inkSlots) return;
      
      const updatedScroll = { ...scroll, inks: [...(scroll.inks || []), ink] };
      setInventory(prev => prev.map(i => i.id === scroll.id ? updatedScroll : i).filter(i => i.id !== ink.id));
      
      setInkModeItem(updatedScroll);
      setSelectedItem(null);
  };

  // 装備品用アイテムを使用
  const useItemOnEquipment = (item, targetEquipment, isFromWarehouse = false) => {
    if (!item || !targetEquipment) return;
    
    // 装備品用アイテムでない場合はスキップ
    const equipmentItemTypes = ['enhancement_stone', 'enchant_scroll', 'element_stone', 'special_stone', 'reroll_scroll', 'option_slot_stone', 'rarity_upgrade_stone'];
    if (!equipmentItemTypes.includes(item.type)) return;

    // 倉庫からの装備品を使用する場合、一時的にインベントリに移動する必要がある
    if (isFromWarehouse) {
      const warehouseItem = warehouse.find(i => i.id === targetEquipment.id);
      if (warehouseItem) {
        // インベントリに空きがない場合はエラー
        if (inventory.length >= MAX_INVENTORY) {
          addLog('インベントリが一杯です。倉庫の装備品を使用するにはインベントリに空きが必要です', 'red');
          return;
        }
        // 倉庫からインベントリに一時的に移動
        setWarehouse(prev => prev.filter(i => i.id !== targetEquipment.id));
        setInventory(prev => [...prev, targetEquipment]);
      }
    }

    let updatedEquipment = { ...targetEquipment };
    let success = false;
    let message = '';

    if (item.type === 'enhancement_stone') {
      // 強化石: 基本ステータスを強化
      const mult = item.mult || 0.1;
      const newBaseStats = { ...updatedEquipment.baseStats };
      Object.keys(newBaseStats).forEach(key => {
        newBaseStats[key] = Math.floor(newBaseStats[key] * (1 + mult));
      });
      updatedEquipment.baseStats = newBaseStats;
      success = true;
      message = `基本ステータスが${(mult * 100).toFixed(0)}%強化されました`;
    }
    else if (item.type === 'enchant_scroll') {
      // エンチャントスクロール: オプションを追加
      const maxOptions = RARITIES[updatedEquipment.rarity].optCount;
      if ((updatedEquipment.options?.length || 0) >= maxOptions) {
        addLog('オプション枠が満杯です', 'red');
        return;
      }
      const power = updatedEquipment.power || 1;
      const powerMult = item.powerMult || 1.0;
      const pool = [...BASIC_OPTIONS];
      const optType = pool[Math.floor(Math.random() * pool.length)];
      let val = Math.max(1, Math.floor(power * (Math.random() * 10 + 5) / 100 * powerMult));
      
      if (optType.type === 'maxHp') val *= 5;
      if (['str','vit','dex'].includes(optType.type)) val = Math.max(1, Math.floor(val / 2));
      if (optType.isRes) val = Math.floor(5 + Math.random() * 15 * powerMult);
      
      updatedEquipment.options = [...(updatedEquipment.options || []), { ...optType, val, isSpecial: false }];
      success = true;
      message = `オプション「${optType.label} +${val}${optType.unit || ''}」が追加されました`;
    }
    else if (item.type === 'element_stone') {
      // 属性付与石: 属性耐性を付与
      const maxOptions = RARITIES[updatedEquipment.rarity].optCount;
      if ((updatedEquipment.options?.length || 0) >= maxOptions) {
        addLog('オプション枠が満杯です', 'red');
        return;
      }
      const resType = `res_${item.element}`;
      const resOption = BASIC_OPTIONS.find(o => o.type === resType);
      if (resOption) {
        updatedEquipment.options = [...(updatedEquipment.options || []), { ...resOption, val: item.value || 10, isSpecial: false }];
        success = true;
        message = `${getElementConfig(item.element).label}耐性 +${item.value}%が追加されました`;
      }
    }
    else if (item.type === 'special_stone') {
      // 特殊強化アイテム: 特殊オプションを付与
      const maxOptions = RARITIES[updatedEquipment.rarity].optCount;
      if ((updatedEquipment.options?.length || 0) >= maxOptions) {
        addLog('オプション枠が満杯です', 'red');
        return;
      }
      const specialOption = SPECIAL_OPTIONS.find(o => o.type === item.specialType);
      if (specialOption) {
        updatedEquipment.options = [...(updatedEquipment.options || []), { ...specialOption, val: item.value || 10, isSpecial: true }];
        success = true;
        message = `特殊オプション「${specialOption.label} +${item.value}${specialOption.unit || ''}」が追加されました`;
      }
    }
    else if (item.type === 'reroll_scroll') {
      // リロールスクロール: オプションを変更
      if (!updatedEquipment.options || updatedEquipment.options.length === 0) {
        addLog('変更できるオプションがありません', 'red');
        return;
      }
      const optionIndex = Math.floor(Math.random() * updatedEquipment.options.length);
      const power = updatedEquipment.power || 1;
      const powerMult = item.powerMult || 1.0;
      const pool = [...BASIC_OPTIONS, ...SPECIAL_OPTIONS];
      const optType = pool[Math.floor(Math.random() * pool.length)];
      let val = Math.max(1, Math.floor(power * (Math.random() * 10 + 5) / 100 * powerMult));
      
      if (optType.type === 'maxHp') val *= 5;
      if (['str','vit','dex'].includes(optType.type)) val = Math.max(1, Math.floor(val / 2));
      if (optType.isRes) val = Math.floor(5 + Math.random() * 15 * powerMult);
      if (optType.min && optType.max) val = Math.floor(optType.min + Math.random() * (optType.max - optType.min) * powerMult);
      
      const newOptions = [...updatedEquipment.options];
      newOptions[optionIndex] = { ...optType, val, isSpecial: optType.min !== undefined };
      updatedEquipment.options = newOptions;
      success = true;
      message = `オプションが「${optType.label} +${val}${optType.unit || ''}」に変更されました`;
    }
    else if (item.type === 'option_slot_stone') {
      // オプション枠拡張石: オプション枠を増やす
      const currentMax = RARITIES[updatedEquipment.rarity].optCount;
      const newMax = currentMax + (item.slots || 1);
      if (newMax > 5) {
        addLog('オプション枠は最大5までです', 'red');
        return;
      }
      // レアリティを上げる必要がある場合
      const currentRarityIndex = RARITY_ORDER.indexOf(updatedEquipment.rarity);
      let targetRarity = updatedEquipment.rarity;
      for (let i = currentRarityIndex + 1; i < RARITY_ORDER.length; i++) {
        if (RARITIES[RARITY_ORDER[i]].optCount >= newMax) {
          targetRarity = RARITY_ORDER[i];
          break;
        }
      }
      if (targetRarity !== updatedEquipment.rarity) {
        updatedEquipment.rarity = targetRarity;
      }
      success = true;
      message = `オプション枠が${item.slots || 1}つ増えました`;
    }
    else if (item.type === 'rarity_upgrade_stone') {
      // レアリティアップグレード石: レアリティを上げる
      const currentRarityIndex = RARITY_ORDER.indexOf(updatedEquipment.rarity);
      if (currentRarityIndex >= RARITY_ORDER.length - 1) {
        addLog('既に最高レアリティです', 'red');
        return;
      }
      const upgrades = item.upgrades || 1;
      const newIndex = Math.min(currentRarityIndex + upgrades, RARITY_ORDER.length - 1);
      const newRarity = RARITY_ORDER[newIndex];
      
      // レアリティが上がった場合、オプション枠が増える可能性がある
      const oldMaxOptions = RARITIES[updatedEquipment.rarity].optCount;
      const newMaxOptions = RARITIES[newRarity].optCount;
      
      updatedEquipment.rarity = newRarity;
      
      // オプション枠が増えた場合、新しいオプションを生成
      if (newMaxOptions > oldMaxOptions) {
        const currentOptions = updatedEquipment.options || [];
        const additionalSlots = newMaxOptions - oldMaxOptions;
        const power = updatedEquipment.power || 1;
        
        // 追加分のオプションを生成
        const pool = [...BASIC_OPTIONS];
        const newOptions = [];
        for (let i = 0; i < additionalSlots; i++) {
          const optType = pool[Math.floor(Math.random() * pool.length)];
          let val = Math.max(1, Math.floor(power * (Math.random() * 10 + 5) / 100));
          
          if (optType.type === 'maxHp') val *= 5;
          if (['str','vit','dex'].includes(optType.type)) val = Math.max(1, Math.floor(val / 2));
          if (optType.isRes) val = Math.floor(5 + Math.random() * 15);
          
          newOptions.push({ ...optType, val, isSpecial: false });
        }
        
        updatedEquipment.options = [...currentOptions, ...newOptions];
      }
      
      success = true;
      message = `レアリティが${RARITIES[newRarity].label}に上がりました`;
    }

    if (success) {
      // 装備中のアイテムを更新
      const slotKey = Object.keys(equipment).find(key => equipment[key]?.id === targetEquipment.id);
      if (slotKey) {
        setEquipment(prev => ({ ...prev, [slotKey]: updatedEquipment }));
      } else {
        // インベントリ内のアイテムを更新（倉庫から移動した場合も含む）
        // 倉庫から移動した場合は既にインベントリに追加されているので、そのまま更新
        setInventory(prev => prev.map(i => i.id === targetEquipment.id ? updatedEquipment : i));
      }
      
      // 使用したアイテムを削除またはスタック数を減らす
      setInventory(prev => {
        const itemIndex = prev.findIndex(i => i.id === item.id);
        if (itemIndex >= 0) {
          const updatedItem = prev[itemIndex];
          if (updatedItem.count && updatedItem.count > 1) {
            // スタック数を減らす
            const newList = [...prev];
            newList[itemIndex] = { ...updatedItem, count: updatedItem.count - 1 };
            return newList;
          } else {
            // スタックが1つだけの場合は削除
            return prev.filter(i => i.id !== item.id);
          }
        }
        return prev;
      });
      
      // 倉庫から使用した場合も同様に処理
      setWarehouse(prev => {
        const itemIndex = prev.findIndex(i => i.id === item.id);
        if (itemIndex >= 0) {
          const updatedItem = prev[itemIndex];
          if (updatedItem.count && updatedItem.count > 1) {
            const newList = [...prev];
            newList[itemIndex] = { ...updatedItem, count: updatedItem.count - 1 };
            return newList;
          } else {
            return prev.filter(i => i.id !== item.id);
          }
        }
        return prev;
      });
      
      setEquipmentItemMode(null);
      setSelectedItem(null);
      addLog(message, 'green');
    }
  };

  const addLog = (msg, color) => setLogs(p => [{id: Date.now()+Math.random(), msg, color}, ...p].slice(0, 10));
  const spawnFloatingText = (text, color, isCrit = false) => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, text, color, isCrit, x: 50 + (Math.random() * 40 - 20), y: 40 }]);
    setTimeout(() => setFloatingTexts(prev => prev.filter(ft => ft.id !== id)), 800);
  };

  const renderMergedOptions = (options) => {
    if (!options || options.length === 0) return null;
    const merged = options.reduce((acc, opt) => {
        if (!acc[opt.label]) acc[opt.label] = { ...opt, val: 0 };
        acc[opt.label].val += opt.val;
        if (opt.isSpecial) acc[opt.label].isSpecial = true;
        return acc;
    }, {});
    return Object.values(merged).map((opt, idx) => (
        <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0 last:mb-0">
            <span className={`text-sm ${opt.isSpecial ? 'text-yellow-400 font-bold' : 'text-blue-200'}`}>{opt.label}</span>
            <span className={`text-base font-bold ${opt.isSpecial ? 'text-yellow-400' : 'text-blue-200'}`}>+{opt.val}{opt.unit || ''}</span>
        </div>
    ));
  };

  return (
    <div className="h-screen w-screen bg-gray-950 text-white font-sans select-none overflow-hidden flex flex-col relative">
      <GameHeader
        phase={phase}
        player={player}
        activeDungeon={activeDungeon}
        getStats={getStats}
        tab={tab}
        setTab={setTab}
        inventory={inventory}
        warehouse={warehouse}
        manualSave={manualSave}
        manualLoad={manualLoad}
        returnToTown={returnToTown}
      />

      <main className="flex-1 relative flex overflow-hidden">
        <FloatingTexts floatingTexts={floatingTexts} />

        {phase === 'town' && (
            <TownView
              tab={tab}
              player={player}
              getStats={getStats}
              equipment={equipment}
              inventory={inventory}
              warehouse={warehouse}
              stones={stones}
              warehouseTab={warehouseTab}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              inkModeItem={inkModeItem}
              attachInk={attachInk}
              equipmentItemMode={equipmentItemMode}
              setEquipmentItemMode={setEquipmentItemMode}
              draggedItem={draggedItem}
              dragOverTarget={dragOverTarget}
              handleDragStart={handleDragStart}
              handleDragEnd={handleDragEnd}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              setDragOverTarget={setDragOverTarget}
              learnSkill={learnSkill}
              useItemOnEquipment={useItemOnEquipment}
              startDungeon={startDungeon}
            />
        )}

        {phase === 'dungeon' && (
            <DungeonView
              player={player}
              enemy={enemy}
              getStats={getStats}
              equipment={equipment}
              skillCds={skillCds}
              logs={logs}
              handleUseSkill={handleUseSkill}
              handleAttack={handleAttack}
              healPlayer={healPlayer}
            />
        )}

        {/* --- Modals --- */}

        <InkModal
          inkModeItem={inkModeItem}
          inventory={inventory}
          onAttachInk={attachInk}
          onClose={() => setInkModeItem(null)}
        />

        {selectedItem?.type === 'portal_basic' && (
          <PortalModal
            onClose={() => setSelectedItem(null)}
            onStartDungeon={(stone) => { startDungeon(stone); setSelectedItem(null); }}
          />
        )}

        
        <style>{`
            @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
            .mask-linear-fade { mask-image: linear-gradient(to bottom, transparent, black 20%); }
        `}</style>
      </main>
    </div>
  );
}