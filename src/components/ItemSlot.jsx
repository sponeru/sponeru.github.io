import React, { useState, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { ItemIcon } from './ItemIcon';
import { RARITIES } from '../constants.jsx';
import { ItemTooltip } from './ItemTooltip';

export const ItemSlot = React.memo(({ 
  item, 
  onClick, 
  isEquipped = false, 
  isSelected = false, 
  iconSize,
  onDragStart,
  onDragEnd,
  onDrop,
  onDragOver,
  isDropTarget = false,
  dragSource = null,
  optionDisplayMode = 'merged',
  equipmentType = null,
}) => {
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipPlacement, setTooltipPlacement] = useState('top');
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutRef = useRef(null);

  if (!item) return (
      <div 
        className={`aspect-square bg-gray-800 rounded-lg border-2 ${isDropTarget ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700'} flex items-center justify-center opacity-50 ${onDrop ? 'cursor-pointer' : ''}`}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
          <div className="w-3 h-3 rounded-full bg-gray-700" />
      </div>
  );

  const isStone = item.type === 'stone';
  const isSkill = item.type === 'skill';
  const isInk = item.type === 'ink';
  const rarity = RARITIES[item.rarity] || RARITIES.common;
  const hasSpecial = item.options?.some(o => o.isSpecial) || (isStone && item.rarity === 'legendary') || (isInk && item.mod.isRare);

  const equipmentItemTypes = ['enhancement_stone', 'enchant_scroll', 'element_stone', 'special_stone', 'reroll_scroll', 'option_slot_stone', 'rarity_upgrade_stone'];
  const isEquipmentItem = equipmentItemTypes.includes(item.type);
  
  let label = `Lv.${Math.floor(item.power)}`;
  if (isStone) label = `Lv.${item.tier}`;
  if (isSkill) label = 'Scroll';
  if (isInk) label = 'Ink';
  if (isEquipmentItem && item.count && item.count > 1) {
    label = `x${item.count}`;
  } else if (isEquipmentItem) {
    label = '';
  }

  // コンテナサイズに応じてアイコンサイズを調整（デフォルトは28）
  const defaultIconSize = 28;
  const calculatedIconSize = iconSize || defaultIconSize;

  const handleMouseEnter = (e) => {
    if (!item) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // ツールチップの推定サイズ
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
      x: nodeCenterX,
      y: nodeCenterY,
    });
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    setShowTooltip(false);
  };

  const handleMouseMove = (e) => {
    if (!item || !showTooltip) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // ツールチップの推定サイズ
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
      x: nodeCenterX,
      y: nodeCenterY,
    });
  };

  const handleDragStart = (e) => {
    if (!onDragStart || !item) return;
    onDragStart(e, item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({ itemId: item.id, item }));
  };

  const handleDragEnd = (e) => {
    if (onDragEnd) {
      onDragEnd(e, item);
    }
  };

  const isDragging = dragSource?.id === item.id;

  return (
      <>
      <button 
          draggable={!!onDragStart && !!item}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onClick={() => item && onClick(item)}
          onMouseEnter={item ? handleMouseEnter : undefined}
          onMouseLeave={item ? handleMouseLeave : undefined}
          onMouseMove={item ? handleMouseMove : undefined}
          className={`item-slot-button aspect-square relative rounded-lg p-2 flex flex-col items-center justify-center transition-all ${item ? 'hover:scale-110 hover:shadow-lg active:scale-95 cursor-pointer' : 'cursor-default'} ${item ? rarity.bg : 'bg-gray-800'} ${item ? rarity.border : 'border-gray-700'} ${isSelected ? 'shadow-[0_0_15px_currentColor] ring-2 ring-white' : ''} ${isDragging ? 'opacity-50' : ''} ${isDropTarget ? 'ring-4 ring-blue-500' : ''}`}
      >
          <div className={`${rarity.color} relative`}>
              <ItemIcon item={item} size={calculatedIconSize} />
              {hasSpecial && <Sparkles size={Math.max(12, calculatedIconSize * 0.5)} className="absolute -top-1 -right-2 text-yellow-200 animate-pulse" />}
              {isSkill && item.inks && item.inks.length > 0 && (
                 <div className="absolute -bottom-1 -right-2 flex gap-0.5">
                    {item.inks.map((_, i) => <div key={i} className="w-2 h-2 rounded-full bg-purple-500 border border-black" />)}
                 </div>
              )}
          </div>
          {item.isNew && !isEquipped && (
              <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-gray-900" />
          )}
          {isEquipped && (
              <div className="absolute -top-2 -left-2 bg-yellow-600 text-[10px] px-1.5 py-0.5 rounded text-white font-bold border-2 border-gray-900">E</div>
          )}
          {item.enhancementLevel && item.enhancementLevel > 0 && (
              <div className="absolute -top-2 -right-2 bg-orange-600 text-[10px] px-1.5 py-0.5 rounded text-white font-bold border-2 border-gray-900">
                +{item.enhancementLevel}
              </div>
          )}
          {isEquipmentItem && item.count && item.count > 1 && (
              <div className="absolute -bottom-1 -right-1 bg-blue-600 text-[10px] px-1.5 py-0.5 rounded text-white font-bold border-2 border-gray-900">
                {item.count}
              </div>
          )}
          {label && (
            <div className="text-[10px] text-gray-300 truncate w-full text-center mt-1.5 px-1 leading-tight font-medium">
              {label}
            </div>
          )}
      </button>
      {showTooltip && (
        <ItemTooltip
          item={item}
          position={tooltipPosition}
          isVisible={showTooltip}
          placement={tooltipPlacement}
          positionType="fixed"
          optionDisplayMode={optionDisplayMode}
          equipmentType={equipmentType || item?.type}
        />
      )}
      </>
  );
});

