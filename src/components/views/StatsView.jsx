import React from 'react';
import { Trophy } from 'lucide-react';

export const StatsView = ({ player, getStats }) => {
  return (
    <div className="p-8 bg-gray-900 min-h-full">
      <h2 className="text-2xl font-bold text-yellow-500 mb-8 flex items-center gap-3">
        <Trophy size={28}/> ステータス詳細
      </h2>
      
      {/* 基本ステータス */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-300 mb-4">基本ステータス</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {['str','dex','int'].map(k => (
            <div key={k} className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:bg-gray-750 transition-colors">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-300 uppercase font-bold text-lg">
                  {k === 'str' ? '筋力' : k === 'dex' ? '器用さ' : '知恵'}
                </span>
              </div>
              <div className="text-4xl font-mono text-white">{getStats[k] || 0}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 戦闘ステータス */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-300 mb-4">戦闘ステータス</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">攻撃力</div>
            <div className="text-3xl font-bold text-red-400">{getStats.atk}</div>
            <div className="text-xs text-gray-500 mt-1">
              装備からの攻撃力
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">防御力</div>
            <div className="text-3xl font-bold text-blue-400">{getStats.def}</div>
            <div className="text-xs text-gray-500 mt-1">
              装備からの防御力
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">最大HP</div>
            <div className="text-3xl font-bold text-green-400">{getStats.maxHp}</div>
            <div className="text-xs text-gray-500 mt-1">
              基本: 100 + 筋力×10 + 装備
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">回避率</div>
            <div className="text-3xl font-bold text-cyan-400">{(getStats.evade || 0).toFixed(1)}%</div>
            <div className="text-xs text-gray-500 mt-1">
              器用さ×1% (最大75%)
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">最大MP</div>
            <div className="text-3xl font-bold text-purple-400">{getStats.maxMp}</div>
            <div className="text-xs text-gray-500 mt-1">
              基本: 50 + 知恵×3 + 装備
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">会心率</div>
            <div className="text-3xl font-bold text-yellow-400">{getStats.crit.toFixed(1)}%</div>
            <div className="text-xs text-gray-500 mt-1">
              装備オプションのみ
            </div>
          </div>
        </div>
      </div>

      {/* 特殊オプション */}
      {(getStats.vamp > 0 || getStats.critDmg > 0 || getStats.cdSpeed > 0 || getStats.goldMult > 0 || getStats.expMult > 0) && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-300 mb-4">特殊オプション</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getStats.vamp > 0 && (
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">HP吸収</div>
                <div className="text-2xl font-bold text-red-400">{getStats.vamp}%</div>
              </div>
            )}
            {getStats.critDmg > 0 && (
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">会心ダメージ</div>
                <div className="text-2xl font-bold text-yellow-400">+{getStats.critDmg}%</div>
              </div>
            )}
            {getStats.cdSpeed > 0 && (
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">CD速度</div>
                <div className="text-2xl font-bold text-cyan-400">+{(getStats.cdSpeed * 100).toFixed(0)}%</div>
              </div>
            )}
            {getStats.goldMult > 0 && (
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">G獲得</div>
                <div className="text-2xl font-bold text-yellow-400">+{getStats.goldMult}%</div>
              </div>
            )}
            {getStats.expMult > 0 && (
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <div className="text-xs text-gray-400 mb-1">EXP獲得</div>
                <div className="text-2xl font-bold text-green-400">+{getStats.expMult}%</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 属性耐性 */}
      {(getStats.res_fire > 0 || getStats.res_ice > 0 || getStats.res_thunder > 0 || getStats.res_light > 0 || getStats.res_dark > 0) && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-300 mb-4">属性耐性</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {getStats.res_fire > 0 && (
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <div className="text-xs text-red-400 mb-1">火耐性</div>
                <div className="text-2xl font-bold text-white">{getStats.res_fire}%</div>
              </div>
            )}
            {getStats.res_ice > 0 && (
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <div className="text-xs text-cyan-400 mb-1">氷耐性</div>
                <div className="text-2xl font-bold text-white">{getStats.res_ice}%</div>
              </div>
            )}
            {getStats.res_thunder > 0 && (
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <div className="text-xs text-yellow-400 mb-1">雷耐性</div>
                <div className="text-2xl font-bold text-white">{getStats.res_thunder}%</div>
              </div>
            )}
            {getStats.res_light > 0 && (
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <div className="text-xs text-orange-300 mb-1">光耐性</div>
                <div className="text-2xl font-bold text-white">{getStats.res_light}%</div>
              </div>
            )}
            {getStats.res_dark > 0 && (
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <div className="text-xs text-purple-400 mb-1">闇耐性</div>
                <div className="text-2xl font-bold text-white">{getStats.res_dark}%</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

