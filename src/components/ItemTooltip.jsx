import React from 'react';
import { ItemIcon } from './ItemIcon';
import { RARITIES, getElementConfig, SPECIAL_OPTIONS } from '../constants.jsx';

export const ItemTooltip = ({ item, position = { x: 0, y: 0 }, isVisible = false, placement = 'top', positionType = 'absolute' }) => {
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
      return (
        <div className="text-yellow-300">
          <div className="mb-2 text-base">効果: 装備品の基本ステータスを{(item.mult * 100).toFixed(0)}%強化</div>
          <div className="text-sm text-gray-400">武器、防具、アクセサリに使用できます</div>
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
          <div className="mb-2 text-sm text-gray-400">
            Tier {item.tier} / 深度: {item.maxFloor}階層
          </div>
          {riskMods.length > 0 && (
            <div className="mb-3">
              <div className="text-red-400 font-bold text-sm mb-1">⚠ リスク</div>
              {riskMods.map((mod, idx) => (
                <div key={idx} className="text-red-300 text-sm mb-1">
                  {mod.label} +{mod.val}{mod.unit || ''}
                </div>
              ))}
            </div>
          )}
          {rewardMods.length > 0 && (
            <div>
              <div className="text-green-400 font-bold text-sm mb-1">✨ 報酬</div>
              {rewardMods.map((mod, idx) => (
                <div key={idx} className="text-green-300 text-sm mb-1">
                  {mod.label} +{mod.val}{mod.unit || ''}
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
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} className="text-base mb-1">
              <span className="text-gray-400 uppercase">{k}: </span>
              <span className="font-bold">{v}</span>
            </div>
          ))}
          {item.options && item.options.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="text-base text-gray-500 mb-2 font-bold">オプション:</div>
              {item.options.map((opt, idx) => (
                <div key={idx} className={`text-base mb-1 ${opt.isSpecial ? 'text-yellow-400' : 'text-gray-300'}`}>
                  {opt.isSpecial && <span className="text-yellow-400">★ </span>}
                  {opt.label} +{opt.val}{opt.unit || ''}
                </div>
              ))}
            </div>
          )}
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
          <div className="text-base font-bold">{item.name || '無名のアイテム'}</div>
        </div>
      </div>
      <div className="text-sm">
        {getTooltipContent()}
      </div>
    </div>
  );
};

