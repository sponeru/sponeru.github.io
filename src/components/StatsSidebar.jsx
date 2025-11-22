import React from 'react';
import { Trophy } from 'lucide-react';
import { ItemSlot } from './ItemSlot';
import { EQUIPMENT_SLOTS, getSlotLabel } from '../utils/gameUtils';

export const StatsSidebar = ({ player, getStats, equipment, optionDisplayMode, setOptionDisplayMode }) => {
  const getModeLabel = () => {
    if (optionDisplayMode === 'merged') return '統合';
    if (optionDisplayMode === 'composite') return '複合表示';
    return '個別';
  };

  return (
    <aside className="w-80 bg-gray-900 border-r border-gray-800 overflow-y-auto flex-shrink-0">
      <div className="p-6">
        <h3 className="text-lg font-bold text-yellow-500 mb-4 flex items-center gap-2">
          <Trophy size={20}/> ステータス
        </h3>
        
        {/* オプション表示モード切り替え */}
        <div className="mb-6 pb-6 border-b border-gray-700">
          <div className="text-xs text-gray-400 mb-2 font-bold">オプション表示モード</div>
          <div className="flex gap-1">
            <button
              onClick={() => setOptionDisplayMode('merged')}
              className={`flex-1 px-2 py-2 text-xs rounded transition-colors ${
                optionDisplayMode === 'merged' 
                  ? 'bg-blue-600 text-white font-bold' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              統合
            </button>
            <button
              onClick={() => setOptionDisplayMode('composite')}
              className={`flex-1 px-2 py-2 text-xs rounded transition-colors ${
                optionDisplayMode === 'composite' 
                  ? 'bg-blue-600 text-white font-bold' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              複合
            </button>
            <button
              onClick={() => setOptionDisplayMode('split')}
              className={`flex-1 px-2 py-2 text-xs rounded transition-colors ${
                optionDisplayMode === 'split' 
                  ? 'bg-blue-600 text-white font-bold' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              個別
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">
            現在: {getModeLabel()}
          </div>
        </div>
        {['str','vit','dex'].map(k => (
          <div key={k} className="flex justify-between items-center bg-gray-800 p-4 rounded-lg mb-2 hover:bg-gray-750 transition-colors">
            <span className="text-gray-300 uppercase font-bold text-sm">{k === 'str' ? '筋力' : k === 'vit' ? '体力' : '幸運'}</span>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-mono">{player.stats[k]}</span>
            </div>
          </div>
        ))}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-sm font-bold text-gray-400 mb-3">戦闘ステータス</h4>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center bg-gray-800 p-2 rounded text-xs">
              <span className="text-gray-400">攻撃力</span>
              <span className="text-red-400 font-bold">{getStats.atk}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800 p-2 rounded text-xs">
              <span className="text-gray-400">防御力</span>
              <span className="text-blue-400 font-bold">{getStats.def}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800 p-2 rounded text-xs">
              <span className="text-gray-400">最大HP</span>
              <span className="text-green-400 font-bold">{getStats.maxHp}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800 p-2 rounded text-xs">
              <span className="text-gray-400">最大MP</span>
              <span className="text-cyan-400 font-bold">{player.maxMp || 50}</span>
            </div>
            <div className="flex justify-between items-center bg-gray-800 p-2 rounded text-xs">
              <span className="text-gray-400">会心率</span>
              <span className="text-yellow-400 font-bold">{getStats.crit.toFixed(1)}%</span>
            </div>
            {getStats.critDmg > 0 && (
              <div className="flex justify-between items-center bg-gray-800 p-2 rounded text-xs">
                <span className="text-gray-400">会心ダメージ</span>
                <span className="text-yellow-400 font-bold">+{getStats.critDmg}%</span>
              </div>
            )}
            {getStats.vamp > 0 && (
              <div className="flex justify-between items-center bg-gray-800 p-2 rounded text-xs">
                <span className="text-gray-400">HP吸収</span>
                <span className="text-red-400 font-bold">{getStats.vamp}%</span>
              </div>
            )}
            {getStats.cdSpeed > 0 && (
              <div className="flex justify-between items-center bg-gray-800 p-2 rounded text-xs">
                <span className="text-gray-400">CD速度</span>
                <span className="text-cyan-400 font-bold">+{getStats.cdSpeed * 100}%</span>
              </div>
            )}
            {(getStats.goldMult > 0 || getStats.expMult > 0) && (
              <>
                {getStats.goldMult > 0 && (
                  <div className="flex justify-between items-center bg-gray-800 p-2 rounded text-xs">
                    <span className="text-gray-400">G獲得</span>
                    <span className="text-yellow-400 font-bold">+{getStats.goldMult}%</span>
                  </div>
                )}
                {getStats.expMult > 0 && (
                  <div className="flex justify-between items-center bg-gray-800 p-2 rounded text-xs">
                    <span className="text-gray-400">EXP獲得</span>
                    <span className="text-green-400 font-bold">+{getStats.expMult}%</span>
                  </div>
                )}
              </>
            )}
          </div>
          {(getStats.res_fire > 0 || getStats.res_ice > 0 || getStats.res_thunder > 0 || getStats.res_light > 0 || getStats.res_dark > 0) && (
            <div className="mb-4">
              <h5 className="text-xs font-bold text-gray-500 mb-2">属性耐性</h5>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {getStats.res_fire > 0 && (
                  <div className="flex justify-between items-center bg-gray-800 p-1.5 rounded">
                    <span className="text-red-400">火</span>
                    <span className="text-white font-bold">{getStats.res_fire}%</span>
                  </div>
                )}
                {getStats.res_ice > 0 && (
                  <div className="flex justify-between items-center bg-gray-800 p-1.5 rounded">
                    <span className="text-cyan-400">氷</span>
                    <span className="text-white font-bold">{getStats.res_ice}%</span>
                  </div>
                )}
                {getStats.res_thunder > 0 && (
                  <div className="flex justify-between items-center bg-gray-800 p-1.5 rounded">
                    <span className="text-yellow-400">雷</span>
                    <span className="text-white font-bold">{getStats.res_thunder}%</span>
                  </div>
                )}
                {getStats.res_light > 0 && (
                  <div className="flex justify-between items-center bg-gray-800 p-1.5 rounded">
                    <span className="text-orange-300">光</span>
                    <span className="text-white font-bold">{getStats.res_light}%</span>
                  </div>
                )}
                {getStats.res_dark > 0 && (
                  <div className="flex justify-between items-center bg-gray-800 p-1.5 rounded">
                    <span className="text-purple-400">闇</span>
                    <span className="text-white font-bold">{getStats.res_dark}%</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-sm font-bold text-gray-400 mb-3">装備中</h4>
          <div className="space-y-3">
            {EQUIPMENT_SLOTS.map(slot => (
              <div key={slot} className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg border border-gray-700">
                <div className="w-16 h-16 flex-shrink-0">
                  <ItemSlot 
                    item={equipment[slot]} 
                    onClick={() => {}} 
                    isEquipped={true} 
                    iconSize={32}
                    optionDisplayMode={optionDisplayMode}
                    equipmentType={slot}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 uppercase mb-1">{getSlotLabel(slot)}</div>
                  <div className="text-sm font-bold text-white truncate">
                    {equipment[slot]?.name || '未装備'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <h4 className="text-sm font-bold text-gray-400 mb-3">スキル</h4>
            <div className="space-y-2">
              {[1, 2, 3].map(num => (
                <div key={`skill${num}`} className="flex items-center gap-3 bg-gray-800 p-2 rounded-lg border border-gray-700">
                  <div className="w-14 h-14 flex-shrink-0">
                    <ItemSlot 
                      item={equipment[`skill${num}`]} 
                      onClick={() => {}} 
                      isEquipped={true} 
                      iconSize={28}
                      optionDisplayMode={optionDisplayMode}
                      equipmentType="skill"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-1">スキル {num}</div>
                    <div className="text-sm font-bold text-white truncate">
                      {equipment[`skill${num}`]?.name || '未装備'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

