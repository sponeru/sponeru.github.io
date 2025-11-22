import React from 'react';
import { Sword, Heart, ChevronsUp } from 'lucide-react';
import { getElementConfig } from '../../constants.jsx';

export const DungeonView = ({
  player,
  enemy,
  getStats,
  equipment,
  skillCds,
  logs,
  handleUseSkill,
  handleAttack,
  healPlayer,
}) => {
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* 左サイドバー: ステータスとログ */}
      <aside className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-blue-400 font-bold">Lv.{player.level}</div>
              <div className="text-lg font-bold text-green-400">{player.hp} <span className="text-sm text-gray-600">/ {getStats.maxHp}</span></div>
            </div>
            <div className="h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
              <div className="h-full bg-green-500 transition-all" style={{ width: `${(player.hp / getStats.maxHp) * 100}%` }} />
            </div>
          </div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-cyan-400 font-bold">MP</div>
              <div className="text-sm text-cyan-400 font-bold">{player.mp} / {player.maxMp || 50}</div>
            </div>
            <div className="h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
              <div className="h-full bg-cyan-500 transition-all" style={{ width: `${((player.mp || 0) / (player.maxMp || 50)) * 100}%` }} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs text-gray-400 mb-2">バフ</div>
            {player.buffs.length > 0 ? (
              player.buffs.map(buff => (
                <div key={buff.id} className="flex items-center gap-2 bg-black/50 px-3 py-2 rounded-lg text-sm text-cyan-300 border border-cyan-900">
                  <ChevronsUp size={14} />
                  <span className="flex-1">{buff.name}</span>
                  <span className="text-xs">({buff.duration.toFixed(0)}s)</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-600 text-center py-2">バフなし</div>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="text-sm font-bold text-gray-400 mb-3">バトルログ</div>
          <div className="space-y-1 flex flex-col-reverse">
            {logs.slice(0, 20).map(l => (
              <div key={l.id} style={{color:l.color}} className="text-sm font-mono py-1 px-2 rounded hover:bg-gray-800 transition-colors">
                {l.msg}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* 中央: バトル画面 */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950">
        {enemy && (
          <>
            <div className={`text-9xl mb-6 transition-transform ${enemy.wait > enemy.maxWait - 5 ? 'scale-110' : 'scale-100'} ${enemy.hp===0 ? 'opacity-0' : ''}`}>
              {enemy.icon}
            </div>
            <div className="w-full max-w-md text-center">
              <h2 className={`text-2xl font-bold flex items-center justify-center gap-2 mb-4 ${enemy.isBoss ? 'text-red-400' : 'text-gray-300'}`}>
                {enemy.element !== 'none' && getElementConfig(enemy.element).icon}
                {enemy.name}
              </h2>
              <div className="h-4 bg-gray-800 rounded-full overflow-hidden border-2 border-gray-700 mb-2">
                <div className="h-full bg-red-600 transition-all" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
              </div>
              <div className="text-sm text-gray-400 font-mono">{enemy.hp.toLocaleString()} / {enemy.maxHp.toLocaleString()}</div>
            </div>
          </>
        )}
      </div>

      {/* 右サイドバー: スキルとアクション */}
      <aside className="w-80 bg-gray-900 border-l border-gray-800 p-6 flex flex-col gap-4">
        <div>
          <div className="text-sm font-bold text-gray-400 mb-3">スキル</div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1, 2, 3].map(num => {
              const skill = equipment[`skill${num}`];
              const cd = skillCds[num-1];
              return (
                <button 
                  key={num} 
                  onClick={() => handleUseSkill(num)} 
                  disabled={player.hp <= 0 || cd > 0 || !skill || (skill.skillData?.mpCost && player.mp < skill.skillData.mpCost)} 
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center relative overflow-hidden border-2 transition-all
                    ${skill ? 'bg-slate-800 border-gray-700' : 'bg-gray-900 border-gray-800 opacity-50'} 
                    ${cd > 0 ? 'grayscale cursor-not-allowed' : skill ? 'hover:border-white hover:scale-105 active:scale-95' : ''}
                  `}
                >
                  {skill ? (
                    <>
                      <div className="text-2xl mb-1">{getElementConfig(skill.skillData.element).icon}</div>
                      <span className="text-xs leading-none text-center px-1">{skill.skillData.name}</span>
                      {cd > 0 && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">{Math.ceil(cd)}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-gray-600">Empty</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col justify-end gap-3">
          <button 
            onClick={handleAttack} 
            disabled={player.hp <= 0} 
            className="w-full py-4 bg-gradient-to-b from-red-700 to-red-900 rounded-lg flex items-center justify-center gap-2 text-white font-bold text-lg shadow-lg hover:from-red-600 hover:to-red-800 active:scale-[0.98] transition-all"
          >
            <Sword size={24}/> 攻撃
          </button>
          <button 
            onClick={healPlayer} 
            className="w-full py-3 bg-gray-800 rounded-lg flex items-center justify-center gap-2 text-green-400 hover:bg-gray-700 active:scale-95 transition-all border border-gray-700"
          >
            <Heart size={18} /> 回復 (-{player.level*5}G)
          </button>
        </div>
      </aside>
    </div>
  );
};

