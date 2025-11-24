import React from 'react';
import { ItemIcon } from './ItemIcon';
import { RARITIES, getElementConfig, SPECIAL_OPTIONS, BASIC_OPTIONS, EQUIPMENT_TYPE_OPTIONS, STAT_LABELS } from '../constants.jsx';
import { RARITY_ORDER } from '../utils/gameUtils';

export const ItemTooltip = ({ item, position = { x: 0, y: 0 }, isVisible = false, placement = 'top', positionType = 'absolute', optionDisplayMode = 'merged', equipmentType = null }) => {
  if (!item || !isVisible) return null;

  const rarity = RARITIES[item.rarity] || RARITIES.common;

  // 配置に応じたtransformスタイルを計算
  const getTransformStyle = () => {
    switch (placement) {
      case 'bottom':
        return 'translate(-50%, 0) translateY(8px)';
      case 'right':
        return 'translate(0, -50%) translateX(8px)';
      case 'left':
        return 'translate(-100%, -50%) translateX(-8px)';
      case 'top':
      default:
        return 'translate(-50%, -100%) translateY(-8px)';
    }
  };

  const getTooltipContent = () => {
    if (item.type === 'ink') {
      return (
        <div>
          <div className="text-purple-300 mb-2 text-base">効果: {item.mod.label} {item.mod.val > 0 ? '+' : ''}{item.mod.val}{item.mod.unit || ''}</div>
          {item.mod.penalty && (
            <div className="text-red-400 text-sm">
              デメリット: {item.mod.penalty.type === 'power_down' ? '威力低下' : 'CD増加'} {item.mod.penalty.val * 100}%
            </div>
          )}
        </div>
      );
    }

    if (item.type === 'enhancement_stone') {
      const stoneRarityIndex = RARITY_ORDER.indexOf(item.rarity);
      const usableRarities = stoneRarityIndex >= 0 
        ? RARITY_ORDER.slice(0, stoneRarityIndex + 1).map(r => RARITIES[r]?.label || r).join('、')
        : '不明';
      
      return (
        <div className="text-yellow-300">
          <div className="mb-2 text-base">効果: 装備品の基本ステータスを{(item.mult * 100).toFixed(0)}%強化</div>
          <div className="text-sm text-gray-400 mb-1">武器、防具に使用できます</div>
          <div className="text-sm text-blue-300">使用可能なレアリティ: {usableRarities}</div>
        </div>
      );
    }

    if (item.type === 'enchant_scroll') {
      return (
        <div className="text-blue-300">
          <div className="mb-2 text-base">効果: 装備品にランダムオプションを1つ追加</div>
          <div className="text-sm text-gray-400">オプション枠に空きがある装備品に使用できます</div>
        </div>
      );
    }

    if (item.type === 'element_stone') {
      return (
        <div className="text-cyan-300">
          <div className="mb-2 text-base">効果: {getElementConfig(item.element).label}耐性 +{item.value}%を付与</div>
          <div className="text-sm text-gray-400">オプション枠に空きがある装備品に使用できます</div>
        </div>
      );
    }

    if (item.type === 'special_stone') {
      return (
        <div className="text-purple-300">
          <div className="mb-2 text-base">効果: 特殊オプション「{SPECIAL_OPTIONS.find(o => o.type === item.specialType)?.label || ''} +{item.value}{SPECIAL_OPTIONS.find(o => o.type === item.specialType)?.unit || ''}」を付与</div>
          <div className="text-sm text-gray-400">オプション枠に空きがある装備品に使用できます</div>
        </div>
      );
    }

    if (item.type === 'reroll_scroll') {
      return (
        <div className="text-green-300">
          <div className="mb-2 text-base">効果: 装備品のランダムなオプションを1つ変更</div>
          <div className="text-sm text-gray-400">オプションが存在する装備品に使用できます</div>
        </div>
      );
    }

    if (item.type === 'option_slot_stone') {
      return (
        <div className="text-cyan-300">
          <div className="mb-2 text-base">効果: 装備品のオプション枠を{item.slots || 1}つ増やす</div>
          <div className="text-sm text-gray-400">最大5枠まで増やすことができます</div>
        </div>
      );
    }

    if (item.type === 'rarity_upgrade_stone') {
      return (
        <div className="text-orange-300">
          <div className="mb-2 text-base">効果: 装備品のレアリティを{item.upgrades || 1}段階上げる</div>
          <div className="text-sm text-gray-400">レジェンダリーまで上げることができます</div>
        </div>
      );
    }

    if (item.type === 'stone' && item.mods) {
      const riskMods = item.mods.filter(m => m.isRisk);
      const rewardMods = item.mods.filter(m => m.isReward);
      
      return (
        <div>
          <div className="mb-3 pb-2 border-b border-gray-700">
            <div className="text-base mb-1">
              <span className="text-gray-400">Tier: </span>
              <span className="font-bold">{item.tier}</span>
            </div>
            <div className="text-base">
              <span className="text-gray-400">深度: </span>
              <span className="font-bold">{item.maxFloor}階層</span>
            </div>
          </div>
          {riskMods.length > 0 && (
            <div className="mb-3">
              <div className="text-red-400 font-bold text-base mb-2">⚠ リスク</div>
              {riskMods.map((mod, idx) => (
                <div key={idx} className="flex justify-between items-center py-1 border-b border-gray-800 last:border-0">
                  <span className="text-sm text-red-300">{mod.label}</span>
                  <span className="text-base font-bold text-red-300">+{mod.val}{mod.unit || ''}</span>
                </div>
              ))}
            </div>
          )}
          {rewardMods.length > 0 && (
            <div>
              <div className="text-green-400 font-bold text-base mb-2">✨ 報酬</div>
              {rewardMods.map((mod, idx) => (
                <div key={idx} className="flex justify-between items-center py-1 border-b border-gray-800 last:border-0">
                  <span className="text-sm text-green-300">{mod.label}</span>
                  <span className="text-base font-bold text-green-300">+{mod.val}{mod.unit || ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (item.type === 'skill' && item.skillData) {
      return (
        <div>
          {item.skillData.level && (
            <div className="text-yellow-400 font-bold mb-2 text-base">Lv.{item.skillData.level}</div>
          )}
          {(item.requiredStats || item.skillData.requiredStat) && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-2 mb-3">
              <div className="text-red-400 text-sm font-bold mb-1">必要能力値:</div>
              {item.requiredStats ? (
                <>
                  {item.requiredStats.str && (
                    <div className="text-xs text-gray-300">筋力: {item.requiredStats.str}</div>
                  )}
                  {item.requiredStats.dex && (
                    <div className="text-xs text-gray-300">器用さ: {item.requiredStats.dex}</div>
                  )}
                  {item.requiredStats.int && (
                    <div className="text-xs text-gray-300">知恵: {item.requiredStats.int}</div>
                  )}
                </>
              ) : (
                <div className="text-xs text-gray-300">合計: {item.skillData.requiredStat}</div>
              )}
            </div>
          )}
          <div className="text-base mb-2">
            <span className="text-gray-400">タイプ: </span>
            <span className="font-bold">{item.skillData.type === 'buff' ? 'BUFF' : item.skillData.type === 'heal' ? 'HEAL' : 'ATTACK'}</span>
          </div>
          {item.skillData.power !== undefined && (
            <div className="text-base mb-1">
              <span className="text-gray-400">威力: </span>
              <span className="font-bold">x{typeof item.skillData.power === 'number' ? item.skillData.power.toFixed(1) : item.skillData.power}</span>
            </div>
          )}
          {item.skillData.cd !== undefined && (
            <div className="text-base">
              <span className="text-gray-400">CD: </span>
              <span className="font-bold">{item.skillData.cd}s</span>
            </div>
          )}
        </div>
      );
    }

    if (item.baseStats || item.stats) {
      const stats = item.baseStats || item.stats || {};
      return (
        <div>
          {item.enhancementLevel && item.enhancementLevel > 0 && (
            <div className="bg-orange-900/30 border border-orange-700 rounded-lg p-2 mb-3">
              <div className="text-orange-400 text-sm font-bold mb-1">強化レベル: +{item.enhancementLevel}</div>
              <div className="text-xs text-gray-300">強化石を使用して強化されています</div>
            </div>
          )}
          {item.requiredStats && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-2 mb-3">
              <div className="text-red-400 text-sm font-bold mb-1">必要能力値:</div>
              {item.requiredStats.str && (
                <div className="text-xs text-gray-300">筋力: {item.requiredStats.str}</div>
              )}
              {item.requiredStats.dex && (
                <div className="text-xs text-gray-300">器用さ: {item.requiredStats.dex}</div>
              )}
              {item.requiredStats.int && (
                <div className="text-xs text-gray-300">知恵: {item.requiredStats.int}</div>
              )}
            </div>
          )}
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} className="text-base mb-1">
              <span className="text-gray-400 uppercase">{k}: </span>
              <span className="font-bold">{v}</span>
            </div>
          ))}
          {item.options && item.options.length > 0 && (() => {
            // オプション表示ロジック（renderMergedOptionsと同じ）
            if (optionDisplayMode === 'split') {
              // スロットごとに分けて表示
              return (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-base text-gray-500 mb-2 font-bold">オプション:</div>
                  {item.options.map((opt, idx) => {
                    if (opt.isComposite && opt.compositeVals) {
                      // 複合オプションの場合
                      return (
                        <div key={idx} className="py-2 border-b border-gray-800 last:border-0">
                          <div className="text-sm text-purple-300 font-bold mb-1">[{idx + 1}] {opt.label} (複合)</div>
                          {opt.compositeVals.map((compVal, compIdx) => {
                            const compOpt = BASIC_OPTIONS.find(o => o.type === compVal.type) || 
                                           (equipmentType && EQUIPMENT_TYPE_OPTIONS[equipmentType]?.find(o => o.type === compVal.type));
                            return (
                              <div key={compIdx} className="flex justify-between items-center pl-4 text-xs text-gray-300">
                                <span>{compOpt?.label || compVal.type}</span>
                                <span>+{compVal.val}{compOpt?.unit || ''}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    } else {
                      // 通常のオプション
                      return (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                          <span className={`text-sm ${opt.isSpecial ? 'text-yellow-400 font-bold' : 'text-blue-200'}`}>
                            [{idx + 1}] {opt.label}
                          </span>
                          <span className={`text-base font-bold ${opt.isSpecial ? 'text-yellow-400' : 'text-blue-200'}`}>
                            +{opt.val}{opt.unit || ''}
                          </span>
                        </div>
                      );
                    }
                  })}
                </div>
              );
            } else if (optionDisplayMode === 'composite') {
              // 複合オプションは複合として表示、通常オプションは統合表示
              const merged = item.options.reduce((acc, opt) => {
                if (opt.isComposite && opt.compositeVals) {
                  // 複合オプションは複合として表示
                  const compositeKey = opt.label || opt.type;
                  if (!acc[compositeKey]) {
                    acc[compositeKey] = { 
                      label: opt.label, 
                      isComposite: true,
                      compositeVals: [],
                      isSpecial: opt.isSpecial 
                    };
                  }
                  opt.compositeVals.forEach(compVal => {
                    const existing = acc[compositeKey].compositeVals.find(cv => cv.type === compVal.type);
                    if (existing) {
                      existing.val += compVal.val;
                    } else {
                      acc[compositeKey].compositeVals.push({ ...compVal });
                    }
                  });
                } else {
                  // 通常オプションは統合表示
                  if (!acc[opt.label]) acc[opt.label] = { ...opt, val: 0 };
                  acc[opt.label].val += opt.val;
                  if (opt.isSpecial) acc[opt.label].isSpecial = true;
                }
                return acc;
              }, {});
              
              return (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-base text-gray-500 mb-2 font-bold">オプション:</div>
                  {Object.values(merged).map((opt, idx) => {
                    if (opt.isComposite && opt.compositeVals) {
                      // 複合オプションの表示
                      return (
                        <div key={idx} className="py-2 border-b border-gray-800 last:border-0">
                          <div className={`text-sm text-purple-300 font-bold mb-1 ${opt.isSpecial ? 'text-yellow-400' : ''}`}>
                            {opt.isSpecial && <span className="text-yellow-400">★ </span>}
                            {opt.label} (複合)
                          </div>
                          {opt.compositeVals.map((compVal, compIdx) => {
                            const compOpt = BASIC_OPTIONS.find(o => o.type === compVal.type) || 
                                           (equipmentType && EQUIPMENT_TYPE_OPTIONS[equipmentType]?.find(o => o.type === compVal.type));
                            return (
                              <div key={compIdx} className="flex justify-between items-center pl-4 text-xs text-gray-300">
                                <span>{compOpt?.label || compVal.type}</span>
                                <span>+{compVal.val}{compOpt?.unit || ''}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    } else {
                      // 通常オプションの表示
                      return (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0 last:mb-0">
                          <span className={`text-sm ${opt.isSpecial ? 'text-yellow-400 font-bold' : 'text-blue-200'}`}>{opt.label}</span>
                          <span className={`text-base font-bold ${opt.isSpecial ? 'text-yellow-400' : 'text-blue-200'}`}>+{opt.val}{opt.unit || ''}</span>
                        </div>
                      );
                    }
                  })}
                </div>
              );
            } else {
              // merged: すべて統合表示（複合オプションも個別に展開）
              const merged = item.options.reduce((acc, opt) => {
                if (opt.isComposite && opt.compositeVals) {
                  // 複合オプションは個別に処理
                  opt.compositeVals.forEach(compVal => {
                    const compOpt = BASIC_OPTIONS.find(o => o.type === compVal.type) || 
                                   (equipmentType && EQUIPMENT_TYPE_OPTIONS[equipmentType]?.find(o => o.type === compVal.type));
                    const label = compOpt?.label || compVal.type;
                    if (!acc[label]) acc[label] = { label, val: 0, unit: compOpt?.unit || '', isSpecial: opt.isSpecial };
                    acc[label].val += compVal.val;
                  });
                } else {
                  if (!acc[opt.label]) acc[opt.label] = { ...opt, val: 0 };
                  acc[opt.label].val += opt.val;
                  if (opt.isSpecial) acc[opt.label].isSpecial = true;
                }
                return acc;
              }, {});
              
              return (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-base text-gray-500 mb-2 font-bold">オプション:</div>
                  {Object.values(merged).map((opt, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0 last:mb-0">
                      <span className={`text-sm ${opt.isSpecial ? 'text-yellow-400 font-bold' : 'text-blue-200'}`}>{opt.label}</span>
                      <span className={`text-base font-bold ${opt.isSpecial ? 'text-yellow-400' : 'text-blue-200'}`}>+{opt.val}{opt.unit || ''}</span>
                    </div>
                  ))}
                </div>
              );
            }
          })()}
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={`${positionType === 'fixed' ? 'fixed' : 'absolute'} z-[9999] pointer-events-none bg-gray-900 border-2 border-gray-700 rounded-lg p-[18px] shadow-2xl min-w-[300px] max-w-[450px]`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: getTransformStyle(),
      }}
    >
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-700">
        <div className={`w-12 h-12 rounded flex items-center justify-center border ${rarity.bg} ${rarity.border}`}>
          <div className={rarity.color}>
            <ItemIcon item={item} size={30} />
          </div>
        </div>
        <div className="flex-1">
          <div className={`text-sm font-bold uppercase ${rarity.color}`}>
            {rarity.label}
          </div>
          <div className="text-base font-bold flex items-center gap-2">
            {item.name || '無名のアイテム'}
            {item.enhancementLevel && item.enhancementLevel > 0 && (
              <span className="text-orange-400 text-sm font-bold">+{item.enhancementLevel}</span>
            )}
          </div>
        </div>
      </div>
      <div className="text-sm">
        {getTooltipContent()}
      </div>
    </div>
  );
};

