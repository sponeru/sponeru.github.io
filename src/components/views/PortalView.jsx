import React, { useMemo, useState, useRef } from 'react';
import { Flame, Map as MapIcon, MapPin, Compass } from 'lucide-react';
import { RARITIES, MAX_STONES } from '../../constants.jsx';
import { ItemTooltip } from '../ItemTooltip';

export const PortalView = ({ stones, onSelectStone, onSelectPortal, onStartDungeon }) => {
  const [tooltipItem, setTooltipItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipPlacement, setTooltipPlacement] = useState('top');
  const tooltipTimeoutRef = useRef(null);
  const mapContainerRef = useRef(null);
  // 魔法石を円形に配置するための位置計算
  const stonePositions = useMemo(() => {
    const centerX = 50; // パーセンテージ
    const centerY = 50;
    const radius = 35; // 中心からの距離（パーセンテージ）
    
    return stones.map((stone, index) => {
      const angle = (index / stones.length) * 2 * Math.PI - Math.PI / 2; // 上から開始
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return { stone, x, y, angle };
    });
  }, [stones]);

  return (
    <div className="relative min-h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* 地図の背景パターン */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(100, 150, 200, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(150, 100, 200, 0.1) 0%, transparent 50%),
          linear-gradient(45deg, transparent 48%, rgba(200, 200, 200, 0.05) 49%, rgba(200, 200, 200, 0.05) 51%, transparent 52%),
          linear-gradient(-45deg, transparent 48%, rgba(200, 200, 200, 0.05) 49%, rgba(200, 200, 200, 0.05) 51%, transparent 52%)
        `,
        backgroundSize: '100px 100px, 150px 150px, 50px 50px, 50px 50px'
      }} />
      
      {/* グリッド線 */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }} />

      <div className="relative z-10 p-8">
        {/* ヘッダー */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Compass className="text-orange-500" size={28} /> 冒険の地図
          </h2>
          <div className="text-sm text-gray-400">
            魔法石: <span className="text-orange-400 font-bold">{stones.length}/{MAX_STONES}</span>
          </div>
        </div>

        {/* 地図コンテナ */}
        <div ref={mapContainerRef} className="relative w-full h-[calc(100vh-200px)] min-h-[600px] bg-slate-900/50 rounded-2xl border-2 border-slate-700 overflow-hidden">
          {/* 中心の始まりの平原 */}
          <div 
            onClick={() => onSelectPortal({ type: 'portal_basic' })} 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
          >
            <div className="relative">
              {/* パルスアニメーション */}
              <div className="absolute inset-0 rounded-full bg-orange-500/30 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-0 rounded-full bg-orange-500/20 animate-pulse" />
              
              {/* メインノード */}
              <div className="relative bg-gradient-to-br from-orange-600 to-orange-800 p-6 rounded-full border-4 border-orange-400 shadow-2xl transform transition-all group-hover:scale-110 group-hover:shadow-orange-500/50">
                <div className="flex flex-col items-center gap-2 min-w-[140px]">
                  <MapPin className="text-white" size={32} />
                  <div className="font-bold text-white text-lg text-center">始まりの平原</div>
                  <div className="text-xs text-orange-200 text-center">5階層</div>
                  <div className="text-xs text-orange-300 font-semibold">クリックで開始</div>
                </div>
              </div>
            </div>
          </div>

          {/* 魔法石ノード */}
          {stonePositions.map(({ stone, x, y }, index) => {
            const rarity = RARITIES[stone.rarity];
            const isHighTier = stone.tier >= 5;
            
            return (
              <React.Fragment key={stone.id}>
                {/* 中心から魔法石へのパス */}
                <svg 
                  className="absolute inset-0 z-0 pointer-events-none"
                  style={{ width: '100%', height: '100%' }}
                >
                  <line
                    x1="50%"
                    y1="50%"
                    x2={`${x}%`}
                    y2={`${y}%`}
                    stroke={rarity.border.replace('border-', '').includes('yellow') ? 'rgba(250, 204, 21, 0.2)' :
                           rarity.border.replace('border-', '').includes('purple') ? 'rgba(168, 85, 247, 0.2)' :
                           rarity.border.replace('border-', '').includes('blue') ? 'rgba(96, 165, 250, 0.2)' :
                           rarity.border.replace('border-', '').includes('green') ? 'rgba(74, 222, 128, 0.2)' :
                           'rgba(156, 163, 175, 0.2)'}
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                </svg>

                {/* 魔法石ノード */}
                <div
                  onClick={() => onSelectStone(stone)}
                  onDoubleClick={() => {
                    if (onStartDungeon) {
                      onStartDungeon(stone);
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (tooltipTimeoutRef.current) {
                      clearTimeout(tooltipTimeoutRef.current);
                    }
                    if (mapContainerRef.current) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const containerRect = mapContainerRef.current.getBoundingClientRect();
                      const viewportWidth = window.innerWidth;
                      const viewportHeight = window.innerHeight;
                      
                      // ツールチップの推定サイズ（約300-450px幅、高さは可変だが最大400px程度を想定）
                      const tooltipWidth = 400;
                      const tooltipHeight = 300;
                      
                      const nodeCenterX = rect.left + rect.width / 2;
                      const nodeCenterY = rect.top + rect.height / 2;
                      
                      // 画面端からの距離を計算
                      const spaceTop = nodeCenterY;
                      const spaceBottom = viewportHeight - nodeCenterY;
                      const spaceLeft = nodeCenterX;
                      const spaceRight = viewportWidth - nodeCenterX;
                      
                      // 最適な配置を決定
                      let placement = 'top';
                      if (spaceTop < tooltipHeight && spaceBottom > tooltipHeight) {
                        placement = 'bottom';
                      } else if (spaceTop < tooltipHeight && spaceBottom < tooltipHeight) {
                        // 上下にスペースがない場合は横に表示
                        if (spaceRight > tooltipWidth) {
                          placement = 'right';
                        } else if (spaceLeft > tooltipWidth) {
                          placement = 'left';
                        } else {
                          // 右側に少しでもスペースがあれば右に、なければ左に
                          placement = spaceRight > spaceLeft ? 'right' : 'left';
                        }
                      } else if (spaceRight < tooltipWidth && spaceLeft > tooltipWidth) {
                        placement = 'left';
                      } else if (spaceLeft < tooltipWidth && spaceRight > tooltipWidth) {
                        placement = 'right';
                      }
                      
                      setTooltipPlacement(placement);
                      setTooltipPosition({
                        x: rect.left + rect.width / 2 - containerRect.left,
                        y: rect.top + rect.height / 2 - containerRect.top
                      });
                    }
                    setTooltipItem(stone);
                  }}
                  onMouseLeave={() => {
                    tooltipTimeoutRef.current = setTimeout(() => {
                      setTooltipItem(null);
                    }, 100);
                  }}
                  className="absolute z-10 cursor-pointer group transform transition-all hover:scale-110"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className="relative">
                    {/* グロー効果 */}
                    {isHighTier && (
                      <div className={`absolute inset-0 rounded-full ${rarity.bg} blur-xl opacity-50 animate-pulse`} />
                    )}
                    
                    {/* ノード本体 */}
                    <div className={`relative bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-xl border-2 ${rarity.border} shadow-lg transform transition-all group-hover:shadow-2xl group-hover:brightness-110`}>
                      <div className="flex flex-col items-center gap-2 min-w-[120px]">
                        <div className={`${rarity.color} text-2xl mb-1`}>
                          <MapPin size={24} />
                        </div>
                        <div className={`${rarity.color} font-bold text-sm text-center leading-tight`}>
                          {stone.name}
                        </div>
                        <div className="text-xs text-gray-400 text-center">
                          Tier {stone.tier}
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                          {stone.maxFloor}F
                        </div>
                        <div className="text-[10px] text-gray-600 text-center mt-1">
                          ダブルクリックで開始
                        </div>
                      </div>
                    </div>

                    {/* レアリティインジケーター */}
                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${rarity.bg} border-2 border-slate-900`} />
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {/* 魔法石がない場合のメッセージ */}
          {stones.length === 0 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
              <div className="text-gray-500 text-lg mb-2">魔法石がありません</div>
              <div className="text-gray-600 text-sm">ダンジョンで魔法石を獲得しましょう</div>
            </div>
          )}

          {/* 凡例 */}
          <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm p-4 rounded-lg border border-slate-700 z-20">
            <div className="text-xs font-bold text-gray-400 mb-2">凡例</div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500 border border-orange-400" />
                <span className="text-gray-300">始まりの平原</span>
              </div>
              {Object.entries(RARITIES).map(([key, rarity]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${rarity.bg} border ${rarity.border}`} />
                  <span className={rarity.color}>{rarity.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ツールチップ */}
          {tooltipItem && mapContainerRef.current && (
            <ItemTooltip
              item={tooltipItem}
              position={tooltipPosition}
              isVisible={!!tooltipItem}
              placement={tooltipPlacement}
            />
          )}
        </div>
      </div>
    </div>
  );
};

