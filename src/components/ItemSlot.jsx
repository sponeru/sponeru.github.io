import React from 'react';
import { Sparkles } from 'lucide-react';
import { ItemIcon } from './ItemIcon';
import { RARITIES } from '../constants.jsx';

export const ItemSlot = React.memo(({ item, onClick, isEquipped = false, isSelected = false, iconSize }) => {
  if (!item) return (
      <div className="aspect-square bg-gray-800 rounded-lg border-2 border-gray-700 flex items-center justify-center opacity-50">
          <div className="w-3 h-3 rounded-full bg-gray-700" />
      </div>
  );

  const isStone = item.type === 'stone';
  const isSkill = item.type === 'skill';
  const isInk = item.type === 'ink';
  const rarity = RARITIES[item.rarity] || RARITIES.common;
  const hasSpecial = item.options?.some(o => o.isSpecial) || (isStone && item.rarity === 'legendary') || (isInk && item.mod.isRare);

  let label = `Lv.${Math.floor(item.power)}`;
  if (isStone) label = `Lv.${item.tier}`;
  if (isSkill) label = 'Scroll';
  if (isInk) label = 'Ink';

  // コンテナサイズに応じてアイコンサイズを調整（デフォルトは28）
  const defaultIconSize = 28;
  const calculatedIconSize = iconSize || defaultIconSize;

  return (
      <button 
          onClick={() => onClick(item)}
          className={`aspect-square relative rounded-lg p-2 flex flex-col items-center justify-center border-2 transition-all hover:scale-110 hover:shadow-lg active:scale-95 
            ${rarity.bg} ${isSelected ? 'border-white shadow-[0_0_15px_white] ring-2 ring-white' : rarity.border}`}
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
          <div className="text-[10px] text-gray-300 truncate w-full text-center mt-1.5 px-1 leading-tight font-medium">
            {label}
          </div>
      </button>
  );
});

