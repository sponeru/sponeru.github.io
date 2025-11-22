import React from 'react';
import { Backpack, Warehouse, Trash2, Coins } from 'lucide-react';
import { ItemSlot } from '../ItemSlot';
import { EQUIPMENT_SLOTS, getSlotLabel } from '../../utils/gameUtils';
import { MAX_INVENTORY, MAX_WAREHOUSE } from '../../constants.jsx';

export const InventoryView = ({
  equipment,
  inventory,
  warehouse,
  warehouseTab,
  selectedItem,
  setSelectedItem,
  inkModeItem,
  attachInk,
  draggedItem,
  dragOverTarget,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDrop,
  setDragOverTarget,
  optionDisplayMode = 'merged',
}) => {
  return (
    <div className="p-8 bg-gray-900 min-h-full">
      {/* 装備スロット */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 mb-6">
        <div className="text-sm text-gray-400 mb-4">装備スロット</div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {EQUIPMENT_SLOTS.map(slot => (
            <div 
              key={slot} 
              className="flex flex-col items-center gap-2"
              onDragOver={(e) => {
                e.preventDefault();
                handleDragOver(e, `equipment_${slot}`);
              }}
              onDrop={(e) => handleDrop(e, `equipment_${slot}`)}
              onDragLeave={() => {
                if (dragOverTarget === `equipment_${slot}`) {
                  setDragOverTarget(null);
                }
              }}
            >
              <div className={`w-20 h-20 ${dragOverTarget === `equipment_${slot}` ? 'ring-4 ring-blue-500 rounded-lg' : ''}`}>
                <ItemSlot 
                  item={equipment[slot]} 
                  onClick={() => {}} 
                  isEquipped={true} 
                  iconSize={40}
                  onDragStart={equipment[slot] ? (e) => handleDragStart(e, equipment[slot], `equipment_${slot}`) : undefined}
                  onDragEnd={handleDragEnd}
                  isDropTarget={dragOverTarget === `equipment_${slot}`}
                  dragSource={draggedItem}
                  optionDisplayMode={optionDisplayMode}
                  equipmentType={slot}
                />
              </div>
              <span className="text-xs text-gray-500 uppercase text-center">{getSlotLabel(slot)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 pt-4 border-t border-gray-700">
          {[1, 2, 3].map(num => (
            <div 
              key={`skill${num}`} 
              className="flex flex-col items-center gap-2"
              onDragOver={(e) => {
                e.preventDefault();
                handleDragOver(e, `equipment_skill${num}`);
              }}
              onDrop={(e) => handleDrop(e, `equipment_skill${num}`)}
              onDragLeave={() => {
                if (dragOverTarget === `equipment_skill${num}`) {
                  setDragOverTarget(null);
                }
              }}
            >
              <div className={`w-16 h-16 ${dragOverTarget === `equipment_skill${num}` ? 'ring-4 ring-blue-500 rounded-lg' : ''}`}>
                <ItemSlot 
                  item={equipment[`skill${num}`]} 
                  onClick={() => {}} 
                  isEquipped={true} 
                  iconSize={32}
                  onDragStart={equipment[`skill${num}`] ? (e) => handleDragStart(e, equipment[`skill${num}`], `equipment_skill${num}`) : undefined}
                  onDragEnd={handleDragEnd}
                  isDropTarget={dragOverTarget === `equipment_skill${num}`}
                  dragSource={draggedItem}
                  optionDisplayMode={optionDisplayMode}
                  equipmentType="skill"
                />
              </div>
              <span className="text-xs text-gray-500 uppercase">スキル {num}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 売却エリア */}
      <div className="mb-6">
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

      {/* インベントリと倉庫を並べて表示 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* インベントリ */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <Backpack size={24} className="text-blue-500" /> インベントリ ({inventory.length}/{MAX_INVENTORY})
            </h3>
          </div>
          <div 
            className={`grid grid-cols-6 md:grid-cols-8 gap-3 p-4 rounded-lg border-2 ${dragOverTarget === 'inventory' && draggedItem?.source === 'warehouse' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 bg-gray-800/50'}`}
            onDragOver={(e) => handleDragOver(e, 'inventory')}
            onDrop={(e) => handleDrop(e, 'inventory')}
            onDragLeave={() => {
              if (dragOverTarget === 'inventory') {
                setDragOverTarget(null);
              }
            }}
          >
            {inventory.map(item => (
              <ItemSlot 
                key={item.id} 
                item={item} 
                onClick={() => {
                  if (inkModeItem) attachInk(inkModeItem, item);
                }}
                isSelected={selectedItem?.id === item.id}
                onDragStart={(e) => handleDragStart(e, item, 'inventory')}
                onDragEnd={handleDragEnd}
                isDropTarget={dragOverTarget === 'inventory' && draggedItem?.source === 'warehouse'}
                dragSource={draggedItem}
                optionDisplayMode={optionDisplayMode}
                equipmentType={item?.type}
              />
            ))}
          </div>
        </div>

        {/* 倉庫 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <Warehouse size={24} className="text-indigo-500" /> 倉庫 ({warehouse.length}/{MAX_WAREHOUSE})
            </h3>
          </div>
          <div 
            className={`grid grid-cols-6 md:grid-cols-8 gap-3 p-4 rounded-lg border-2 ${dragOverTarget === 'warehouse' && draggedItem?.source === 'inventory' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 bg-gray-800/50'}`}
            onDragOver={(e) => handleDragOver(e, 'warehouse')}
            onDrop={(e) => handleDrop(e, 'warehouse')}
            onDragLeave={() => {
              if (dragOverTarget === 'warehouse') {
                setDragOverTarget(null);
              }
            }}
          >
            {warehouse.map(item => (
              <ItemSlot 
                key={item.id} 
                item={item} 
                onClick={() => {}}
                isSelected={selectedItem?.id === item.id}
                onDragStart={(e) => handleDragStart(e, item, 'warehouse')}
                onDragEnd={handleDragEnd}
                isDropTarget={dragOverTarget === 'warehouse' && draggedItem?.source === 'inventory'}
                dragSource={draggedItem}
                optionDisplayMode={optionDisplayMode}
                equipmentType={item?.type}
              />
            ))}
            {warehouse.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-12">
                倉庫は空です
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

