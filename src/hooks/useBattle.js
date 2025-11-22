import { useEffect } from 'react';
import { generateEnemy } from '../utils/gameLogic';
import { getElementConfig } from '../constants.jsx';
import { MAX_INVENTORY, MAX_WAREHOUSE, MAX_STONES } from '../constants.jsx';
import { generateLoot, generateEquipmentItem, generateMagicStone } from '../utils/gameLogic';

export const useBattle = ({
  phase,
  setPhase,
  player,
  setPlayer,
  enemy,
  setEnemy,
  activeDungeon,
  setActiveDungeon,
  equipment,
  skillCds,
  setSkillCds,
  getStats,
  addLog,
  spawnFloatingText,
  inventory,
  setInventory,
  warehouse,
  setWarehouse,
  stones,
  setStones,
  setTab,
  canStackEquipmentItem,
  addEquipmentItemToStack,
}) => {
  
  const startDungeon = (stone = null) => {
    let floor = 1;
    let maxFloor = 5; 
    let mods = {};
    let stoneName = "始まりの平原";

    let stoneTier = floor; // 魔法石がない場合はfloorを使用
    if (stone) {
        floor = stone.tier; 
        stoneTier = stone.tier;
        maxFloor = stone.maxFloor;
        stoneName = stone.name;
        stone.mods.forEach(m => {
            mods[m.type] = (mods[m.type] || 0) + (m.val || 1);
        });
        setStones(prev => prev.filter(s => s.id !== stone.id));
    }

    setActiveDungeon({ floor, startFloor: floor, maxFloor, mods, stoneName, stoneTier });
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

  const distributeLoot = (floor, dMods, isBoss) => {
    const dropRate = isBoss ? 1.0 : 0.35;
    const dropCount = isBoss ? (1 + (dMods.reward_drop || 0)) : 1;

    for(let i=0; i<dropCount; i++) {
        if (Math.random() < dropRate) {
            const hasInventorySpace = inventory.length < MAX_INVENTORY;
            const hasWarehouseSpace = warehouse.length < MAX_WAREHOUSE;
            
            if (hasInventorySpace || hasWarehouseSpace) {
                const stoneTier = activeDungeon?.stoneTier || floor;
                const loot = generateLoot(floor, dMods, stoneTier);
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

  const applySkillEffects = (skillItem, idx, handleUseSkill) => {
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
      
      const base = skillItem.skillData;
      if (base && base.mpCost && base.type === 'attack') {
        if (player.mp < base.mpCost) {
          addLog(`MPが足りません（必要: ${base.mpCost}、現在: ${player.mp}）`, 'red');
          return;
        }
        setPlayer(p => ({ ...p, mp: Math.max(0, p.mp - base.mpCost) }));
      }

      applySkillEffects(skillItem, idx, handleUseSkill);
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

  const healPlayer = () => {
    const cost = player.level * 5;
    if (player.gold >= cost && player.hp < getStats.maxHp) {
      setPlayer(p => ({ ...p, gold: p.gold - cost, hp: getStats.maxHp }));
      spawnFloatingText("HEAL", "green");
    }
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
            // 回避率チェック（器用さによる回避）
            const evadeChance = getStats.evade || 0;
            const isEvaded = Math.random() * 100 < evadeChance;
            
            if (isEvaded) {
              addLog('回避!', 'cyan');
              spawnFloatingText('MISS', 'cyan');
              return { ...prev, wait: 0 };
            }
            
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

  return {
    startDungeon,
    returnToTown,
    handleAttack,
    handleUseSkill,
    healPlayer,
  };
};

