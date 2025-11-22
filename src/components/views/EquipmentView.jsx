import React from 'react';
import { Hammer, Backpack, Warehouse, Trash2, Coins } from 'lucide-react';
import { ItemSlot } from '../ItemSlot';
import { ItemIcon } from '../ItemIcon';
import { EQUIPMENT_SLOTS, EQUIPMENT_TYPES, getSlotLabel } from '../../utils/gameUtils';

export const EquipmentView = ({
  equipment,
  inventory,
  warehouse,
  selectedItem,
  setSelectedItem,
  equipmentItemMode,
  setEquipmentItemMode,
  draggedItem,
  dragOverTarget,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDrop,
  setDragOverTarget,
  useItemOnEquipment,
  optionDisplayMode = 'merged',
}) => {
  const equipmentItemTypes = ['enhancement_stone', 'enchant_scroll', 'element_stone', 'special_stone', 'reroll_scroll', 'option_slot_stone', 'rarity_upgrade_stone'];
  const equipmentItems = inventory.filter(i => equipmentItemTypes.includes(i.type));

  return (
    <div className="p-8 bg-gray-900 min-h-full">
      <h2 className="text-2xl font-bold text-green-500 mb-8 flex items-center gap-3">
        <Hammer size={28} /> 装備強化
      </h2>
      
      {/* 売却エリア */}
      <div className="mb-8">
        <div 
          className={`p-6 rounded-xl border-2 border-dashed transition-all ${
            dragOverTarget === 'sell' 
              ? 'border-red-500 bg-red-900/30' 
              : 'border-gray-600 bg-gray-800/50'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            handleDragOver(e, 'sell');
          }}
          onDrop={(e) => handleDrop(e, 'sell')}
          onDragLeave={() => {
            if (dragOverTarget === 'sell') {
              setDragOverTarget(null);
            }
          }}
        >
          <div className="flex items-center justify-center gap-3 text-gray-400">
            <Trash2 size={24} className={dragOverTarget === 'sell' ? 'text-red-500' : ''} />
            <span className={dragOverTarget === 'sell' ? 'text-red-400 font-bold' : ''}>
              {dragOverTarget === 'sell' ? 'ここにドロップして売却' : 'アイテムをここにドラッグして売却'}
            </span>
            <Coins size={20} className={dragOverTarget === 'sell' ? 'text-yellow-500' : ''} />
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-300 mb-4">装備中</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {EQUIPMENT_SLOTS.map(slot => {
            const item = equipment[slot];
            return (
              <div key={slot} className="flex flex-col items-center gap-2">
                <div className="w-20 h-20">
                  <ItemSlot 
                    item={item} 
                    onClick={() => {}} 
                    isEquipped={true} 
                    iconSize={40}
                    onDragStart={item ? (e) => handleDragStart(e, item, `equipment_${slot}`) : undefined}
                    onDragEnd={handleDragEnd}
                    dragSource={draggedItem}
                    optionDisplayMode={optionDisplayMode}
                    equipmentType={slot}
                  />
                </div>
                <span className="text-xs text-gray-400 text-center">{getSlotLabel(slot)}</span>
                {item && (
                  <div className="text-xs text-gray-500 text-center truncate w-full">
                    {item.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-300 mb-4">
          装備用アイテム ({equipmentItems.length})
        </h3>
        <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
          {equipmentItems.map(item => (
            <ItemSlot 
              key={item.id} 
              item={item} 
              onClick={() => {
                setEquipmentItemMode(item);
              }}
              isSelected={selectedItem?.id === item.id}
              onDragStart={(e) => handleDragStart(e, item, 'inventory')}
              onDragEnd={handleDragEnd}
              dragSource={draggedItem}
              optionDisplayMode={optionDisplayMode}
              equipmentType={item?.type}
            />
          ))}
          {equipmentItems.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-12">
              装備用アイテムがありません
            </div>
          )}
        </div>
      </div>

      {equipmentItemMode && (
        <div className="bg-gray-800 p-6 rounded-xl border-2 border-green-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center border-2 border-green-500 bg-gray-900">
              <ItemIcon item={equipmentItemMode} size={32} />
            </div>
            <div>
              <div className="text-lg font-bold text-green-400">{equipmentItemMode.name}</div>
              <div className="text-sm text-gray-400">使用する装備品を選択してください</div>
            </div>
            <button 
              onClick={() => setEquipmentItemMode(null)} 
              className="ml-auto px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              キャンセル
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3 mb-4 max-h-64 overflow-y-auto">
            {EQUIPMENT_SLOTS.map(slot => {
              const item = equipment[slot];
              if (!item) return null;
              return (
                <div key={slot} className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16">
                    <ItemSlot 
                      item={item} 
                      onClick={() => {
                        useItemOnEquipment(equipmentItemMode, item);
                        setEquipmentItemMode(null);
                      }}
                      iconSize={32}
                      optionDisplayMode={optionDisplayMode}
                      equipmentType={slot}
                    />
                  </div>
                  <span className="text-xs text-gray-400 text-center">{getSlotLabel(slot)}</span>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                <Backpack size={16} /> インベントリの装備品
              </h4>
              <div className="grid grid-cols-6 md:grid-cols-8 gap-3 max-h-48 overflow-y-auto p-2 bg-gray-900/50 rounded-lg">
                {inventory.filter(i => EQUIPMENT_TYPES.includes(i.type)).map(item => (
                  <ItemSlot 
                    key={item.id} 
                    item={item} 
                    onClick={() => {
                      useItemOnEquipment(equipmentItemMode, item);
                      setEquipmentItemMode(null);
                    }}
                    isSelected={selectedItem?.id === item.id}
                    optionDisplayMode={optionDisplayMode}
                    equipmentType={item?.type}
                  />
                ))}
                {inventory.filter(i => EQUIPMENT_TYPES.includes(i.type)).length === 0 && (
                  <div className="col-span-full text-center text-gray-500 py-4 text-sm">
                    なし
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                <Warehouse size={16} /> 倉庫の装備品
              </h4>
              <div className="grid grid-cols-6 md:grid-cols-8 gap-3 max-h-48 overflow-y-auto p-2 bg-gray-900/50 rounded-lg">
                {warehouse.filter(i => EQUIPMENT_TYPES.includes(i.type)).map(item => (
                  <ItemSlot 
                    key={item.id} 
                    item={item} 
                    onClick={() => {
                      useItemOnEquipment(equipmentItemMode, item, true);
                      setEquipmentItemMode(null);
                    }}
                    optionDisplayMode={optionDisplayMode}
                    equipmentType={item?.type}
                  />
                ))}
                {warehouse.filter(i => EQUIPMENT_TYPES.includes(i.type)).length === 0 && (
                  <div className="col-span-full text-center text-gray-500 py-4 text-sm">
                    なし
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

