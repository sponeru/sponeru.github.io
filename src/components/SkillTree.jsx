import React, { useState, useRef, useCallback, useMemo } from 'react';
import { SKILL_TREE, SKILL_CATEGORIES } from '../constants.jsx';

export const SkillTree = ({ learnedSkills, skillPoints, onLearnSkill, playerLevel }) => {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const getSkillLevel = (skillId) => learnedSkills[skillId] || 0;
  
  const canLearnSkill = (skill) => {
    if (skillPoints <= 0) return false;
    const currentLevel = getSkillLevel(skill.id);
    if (currentLevel >= 1) return false; // maxLevelは常に1
    
    // 前提条件チェック
    if (skill.requirements.length > 0) {
      for (const reqId of skill.requirements) {
        if (getSkillLevel(reqId) < 1) {
          return false;
        }
      }
    }
    
    return true;
  };
  
  const isSkillUnlocked = (skill) => {
    if (skill.requirements.length === 0) return true;
    for (const reqId of skill.requirements) {
      if (getSkillLevel(reqId) < 1) {
        return false;
      }
    }
    return true;
  };
  
  const getCategoryColor = (category) => {
    switch (category) {
      case SKILL_CATEGORIES.OFFENSE:
        return 'border-red-500 bg-red-900/20';
      case SKILL_CATEGORIES.DEFENSE:
        return 'border-blue-500 bg-blue-900/20';
      case SKILL_CATEGORIES.UTILITY:
        return 'border-yellow-500 bg-yellow-900/20';
      case SKILL_CATEGORIES.ELEMENTAL:
        return 'border-purple-500 bg-purple-900/20';
      default:
        return 'border-gray-500 bg-gray-900/20';
    }
  };
  
  
  // スキルノードの位置を計算（階層構造）
  const nodePositions = useMemo(() => {
    const positions = {};
    const nodeSize = 64; // アイコンサイズ
    const horizontalSpacing = 120;
    const verticalSpacing = 140;
    
    // 階層を計算
    const getDepth = (skillId, visited = new Set()) => {
      if (visited.has(skillId)) return 0;
      visited.add(skillId);
      
      const skill = SKILL_TREE.find(s => s.id === skillId);
      if (!skill || skill.requirements.length === 0) return 0;
      
      const maxDepth = Math.max(...skill.requirements.map(reqId => getDepth(reqId, visited)));
      return maxDepth + 1;
    };
    
    // 各スキルの階層を取得
    const depths = {};
    SKILL_TREE.forEach(skill => {
      depths[skill.id] = getDepth(skill.id);
    });
    
    // 階層ごとにグループ化
    const byDepth = {};
    SKILL_TREE.forEach(skill => {
      const depth = depths[skill.id];
      if (!byDepth[depth]) byDepth[depth] = [];
      byDepth[depth].push(skill);
    });
    
    // 各階層内でカテゴリごとにグループ化して配置
    let startX = 100;
    let startY = 100;
    
    Object.keys(byDepth).sort((a, b) => parseInt(a) - parseInt(b)).forEach(depth => {
      const skills = byDepth[depth];
      const byCategory = {};
      skills.forEach(skill => {
        if (!byCategory[skill.category]) byCategory[skill.category] = [];
        byCategory[skill.category].push(skill);
      });
      
      let x = startX;
      Object.entries(byCategory).forEach(([category, categorySkills]) => {
        categorySkills.forEach((skill, idx) => {
          positions[skill.id] = {
            x: x + idx * horizontalSpacing,
            y: startY + parseInt(depth) * verticalSpacing,
            size: nodeSize
          };
        });
        x += categorySkills.length * horizontalSpacing + 80;
      });
      
      startX = 100;
    });
    
    return positions;
  }, []);
  
  // ドラッグ開始
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return; // 左クリックのみ
    setIsDragging(true);
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    });
  }, [pan]);
  
  // ドラッグ中
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);
  
  // ドラッグ終了
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // マウスリーブ時もドラッグ終了
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  // ビューポートのサイズ
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight - 200 : 800;
  
  // 接続線を計算
  const connections = useMemo(() => {
    const lines = [];
    SKILL_TREE.forEach(skill => {
      if (skill.requirements.length === 0) return;
      skill.requirements.forEach(reqId => {
        const reqPos = nodePositions[reqId];
        const skillPos = nodePositions[skill.id];
        if (reqPos && skillPos) {
          lines.push({
            from: { x: reqPos.x + reqPos.size / 2, y: reqPos.y + reqPos.size },
            to: { x: skillPos.x + skillPos.size / 2, y: skillPos.y },
            fromId: reqId,
            toId: skill.id,
            learned: getSkillLevel(reqId) >= 1 && getSkillLevel(skill.id) >= 1
          });
        }
      });
    });
    return lines;
  }, [nodePositions, learnedSkills]);
  
  // ツールチップ用の状態
  const [tooltip, setTooltip] = useState({ show: false, skill: null, x: 0, y: 0 });
  
  return (
    <div className="p-6 bg-gray-900 min-h-full overflow-hidden flex flex-col">
      <div className="mb-4 flex-shrink-0">
        <h2 className="text-2xl font-bold text-white mb-2">スキルツリー</h2>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="bg-gray-800 px-4 py-2 rounded-lg">
            <span className="text-sm text-gray-400">スキルポイント: </span>
            <span className="text-xl font-bold text-yellow-400">{skillPoints}</span>
          </div>
          <div className="text-sm text-gray-400">
            レベルアップでスキルポイントを獲得できます
          </div>
          <div className="text-xs text-gray-500">
            💡 ドラッグで移動できます
          </div>
        </div>
      </div>
      
      {/* ドラッグ可能なツリービュー */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-gray-950 rounded-lg border border-gray-700"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          {/* 接続線 */}
          {connections.map((line, idx) => (
            <line
              key={`${line.fromId}-${line.toId}-${idx}`}
              x1={line.from.x + pan.x}
              y1={line.from.y + pan.y}
              x2={line.to.x + pan.x}
              y2={line.to.y + pan.y}
              stroke={line.learned ? '#10b981' : '#4b5563'}
              strokeWidth="2"
              strokeDasharray={line.learned ? '0' : '5,5'}
              markerEnd="url(#arrowhead)"
            />
          ))}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#4b5563" />
            </marker>
          </defs>
        </svg>
        
        {/* スキルノード */}
        <div
          className="absolute"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            willChange: 'transform'
          }}
        >
          {SKILL_TREE.map(skill => {
            const pos = nodePositions[skill.id];
            if (!pos) return null;
            
            const level = getSkillLevel(skill.id);
            const canLearn = canLearnSkill(skill);
            const isUnlocked = isSkillUnlocked(skill);
            const isLearned = level >= 1;
            
            // 前提条件のスキル名を取得
            const requirementNames = skill.requirements.map(reqId => {
              const reqSkill = SKILL_TREE.find(s => s.id === reqId);
              return reqSkill ? reqSkill.name : reqId;
            });
            
            return (
              <div
                key={skill.id}
                className={`absolute rounded-lg border-2 transition-all group ${
                  isLearned
                    ? 'bg-green-900/40 border-green-500 shadow-lg shadow-green-500/20'
                    : canLearn
                      ? `${getCategoryColor(skill.category)} hover:shadow-lg hover:scale-110 cursor-pointer`
                      : isUnlocked
                        ? 'bg-gray-800/40 border-gray-600 opacity-60'
                        : 'bg-gray-900/40 border-gray-700 opacity-30'
                }`}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  width: `${pos.size}px`,
                  height: `${pos.size}px`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (canLearn) onLearnSkill(skill.id);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({
                    show: true,
                    skill,
                    x: rect.left + rect.width / 2,
                    y: rect.top - 10
                  });
                }}
                onMouseLeave={() => {
                  setTooltip({ show: false, skill: null, x: 0, y: 0 });
                }}
              >
                <div className="w-full h-full rounded-lg flex items-center justify-center text-3xl relative">
                  {skill.icon}
                  {isLearned && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                  )}
                  {canLearn && !isLearned && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* ツールチップ */}
        {tooltip.show && tooltip.skill && (
          <div
            className="fixed z-50 bg-gray-800 border-2 border-gray-600 rounded-lg p-4 shadow-2xl pointer-events-none"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transform: 'translate(-50%, -100%)',
              marginTop: '-10px',
              minWidth: '280px',
              maxWidth: '320px'
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl">{tooltip.skill.icon}</div>
              <div>
                <h4 className={`text-lg font-bold ${
                  getSkillLevel(tooltip.skill.id) >= 1 ? 'text-green-400' : 'text-white'
                }`}>
                  {tooltip.skill.name}
                </h4>
                {getSkillLevel(tooltip.skill.id) >= 1 && (
                  <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded">習得済み</span>
                )}
                {canLearnSkill(tooltip.skill) && getSkillLevel(tooltip.skill.id) < 1 && (
                  <span className="px-2 py-0.5 bg-yellow-600 text-white text-xs rounded animate-pulse">習得可能</span>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-300 mb-3">{tooltip.skill.description}</p>
            
            {tooltip.skill.levelData && (
              <div className="mb-3 p-2 bg-gray-900/50 rounded">
                <div className="text-xs text-blue-300">
                  <span className="font-bold">効果: </span>
                  {tooltip.skill.levelData.effect} +{tooltip.skill.levelData.value}
                  {tooltip.skill.levelData.bonus && (
                    <span className="text-green-300 block mt-1">
                      ボーナス: {tooltip.skill.levelData.bonus.effect} +{tooltip.skill.levelData.bonus.value}
                    </span>
                  )}
                  {tooltip.skill.levelData.penalty && (
                    <span className="text-red-300 block mt-1">
                      ペナルティ: {tooltip.skill.levelData.penalty.effect} {tooltip.skill.levelData.penalty.value}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {tooltip.skill.requirements.length > 0 && (
              <div className="pt-3 border-t border-gray-700">
                <div className="text-xs text-gray-400 mb-2">前提条件:</div>
                <div className="flex flex-wrap gap-1">
                  {tooltip.skill.requirements.map((reqId, idx) => {
                    const reqSkill = SKILL_TREE.find(s => s.id === reqId);
                    const reqLearned = getSkillLevel(reqId) >= 1;
                    return (
                      <span
                        key={reqId}
                        className={`px-2 py-1 rounded text-xs ${
                          reqLearned
                            ? 'bg-green-900/50 text-green-300 border border-green-600'
                            : 'bg-gray-700 text-gray-400 border border-gray-600'
                        }`}
                      >
                        {reqSkill ? reqSkill.name : reqId}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* ツールチップの矢印 */}
            <div
              className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full"
              style={{
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid #374151'
              }}
            />
          </div>
        )}
      </div>
      
      {/* スキル詳細パネル */}
      <div className="mt-8 bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">習得済みスキル</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SKILL_TREE.filter(skill => getSkillLevel(skill.id) > 0).map(skill => {
            const level = getSkillLevel(skill.id);
            return (
              <div key={skill.id} className={`${getCategoryColor(skill.category)} border-2 rounded-lg p-4`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">{skill.icon}</div>
                  <div>
                    <div className="font-bold text-white">{skill.name}</div>
                    <div className="text-xs text-gray-400">習得済み</div>
                  </div>
                </div>
                <div className="text-sm text-gray-300 mb-2">{skill.description}</div>
                {skill.levelData && level > 0 && (
                  <div className="mt-2 text-xs text-blue-300">
                    効果: {skill.levelData.effect} +{skill.levelData.value}
                    {skill.levelData.bonus && ` (ボーナス: ${skill.levelData.bonus.effect} +${skill.levelData.bonus.value})`}
                    {skill.levelData.penalty && ` (ペナルティ: ${skill.levelData.penalty.effect} ${skill.levelData.penalty.value})`}
                  </div>
                )}
              </div>
            );
          })}
          {SKILL_TREE.filter(skill => getSkillLevel(skill.id) > 0).length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-8">
              習得済みスキルがありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

