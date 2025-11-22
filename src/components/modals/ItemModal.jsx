import React from 'react';
import { Backpack, Warehouse } from 'lucide-react';
import { ItemIcon } from '../ItemIcon';
import { RARITIES, getElementConfig, SPECIAL_OPTIONS } from '../../constants.jsx';

export const ItemModal = ({
  selectedItem,
  getStats,
  warehouseTab,
  setSelectedItem,
  sellItem,
  moveToWarehouse,
  moveToInventory,
  equipItem,
  unequipItem,
  equipment,
  startDungeon,
  setTab,
  setEquipmentItemMode,
  setInkModeItem,
  renderMergedOptions,
}) => {
  if (!selectedItem || selectedItem.type === 'portal_basic') return null;

  const equipmentItemTypes = ['enhancement_stone', 'enchant_scroll', 'element_stone', 'special_stone', 'reroll_scroll', 'option_slot_stone', 'rarity_upgrade_stone'];
  const isEquipmentItem = equipmentItemTypes.includes(selectedItem.type);
  const isNormalItem = selectedItem.type !== 'stone' && !selectedItem.isEquipped && !isEquipmentItem;

  return (
    <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-8" onClick={() => setSelectedItem(null)}>
      <div className="bg-gray-800 w-full max-w-2xl rounded-xl border-2 border-gray-700 p-8 shadow-2xl animate-[slideUp_0.2s_ease-out]" onClick={e => e.stopPropagation()}>
        
        {selectedItem.name && (
          <div className="flex gap-6 mb-6">
            <div className={`w-20 h-20 rounded-lg flex items-center justify-center border-2 ${RARITIES[selectedItem.rarity]?.bg || 'bg-gray-800'} ${RARITIES[selectedItem.rarity]?.border || 'border-gray-600'}`}>
              <ItemIcon item={selectedItem} size={40} />
            </div>
            <div className="flex-1">
              <div className={`text-sm font-bold uppercase mb-2 ${RARITIES[selectedItem.rarity]?.color || 'text-gray-400'}`}>
                {RARITIES[selectedItem.rarity]?.label || 'Item'}
              </div>
              <div className="text-2xl font-bold">{selectedItem.name || '無名のアイテム'}</div>
            </div>
          </div>
        )}

        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-6 text-base max-h-96 overflow-y-auto">
          {selectedItem.type === 'ink' && (
            <div className="text-purple-300 mb-4">
              <div className="text-lg mb-2">効果: {selectedItem.mod.label} {selectedItem.mod.val > 0 ? '+' : ''}{selectedItem.mod.val}{selectedItem.mod.unit || ''}</div>
              {selectedItem.mod.penalty && (
                <div className="text-red-400 text-sm">
                  デメリット: {selectedItem.mod.penalty.type === 'power_down' ? '威力低下' : 'CD増加'} {selectedItem.mod.penalty.val * 100}%
                </div>
              )}
            </div>
          )}

          {selectedItem.type === 'enhancement_stone' && (
            <div className="text-yellow-300 mb-4">
              <div className="text-lg mb-2">効果: 装備品の基本ステータスを{(selectedItem.mult * 100).toFixed(0)}%強化</div>
              {selectedItem.count && selectedItem.count > 1 && (
                <div className="text-sm text-blue-400 mb-2">所持数: {selectedItem.count}</div>
              )}
              <div className="text-sm text-gray-400">装備品に使用できます</div>
            </div>
          )}

          {selectedItem.type === 'enchant_scroll' && (
            <div className="text-blue-300 mb-4">
              <div className="text-lg mb-2">効果: 装備品にランダムオプションを1つ追加</div>
              {selectedItem.count && selectedItem.count > 1 && (
                <div className="text-sm text-blue-400 mb-2">所持数: {selectedItem.count}</div>
              )}
              <div className="text-sm text-gray-400">オプション枠に空きがある装備品に使用できます</div>
            </div>
          )}

          {selectedItem.type === 'element_stone' && (
            <div className="text-cyan-300 mb-4">
              <div className="text-lg mb-2">効果: {getElementConfig(selectedItem.element).label}耐性 +{selectedItem.value}%を付与</div>
              {selectedItem.count && selectedItem.count > 1 && (
                <div className="text-sm text-blue-400 mb-2">所持数: {selectedItem.count}</div>
              )}
              <div className="text-sm text-gray-400">オプション枠に空きがある装備品に使用できます</div>
            </div>
          )}

          {selectedItem.type === 'special_stone' && (
            <div className="text-purple-300 mb-4">
              <div className="text-lg mb-2">効果: 特殊オプション「{SPECIAL_OPTIONS.find(o => o.type === selectedItem.specialType)?.label || ''} +{selectedItem.value}{SPECIAL_OPTIONS.find(o => o.type === selectedItem.specialType)?.unit || ''}」を付与</div>
              {selectedItem.count && selectedItem.count > 1 && (
                <div className="text-sm text-blue-400 mb-2">所持数: {selectedItem.count}</div>
              )}
              <div className="text-sm text-gray-400">オプション枠に空きがある装備品に使用できます</div>
            </div>
          )}

          {selectedItem.type === 'reroll_scroll' && (
            <div className="text-green-300 mb-4">
              <div className="text-lg mb-2">効果: 装備品のランダムなオプションを1つ変更</div>
              {selectedItem.count && selectedItem.count > 1 && (
                <div className="text-sm text-blue-400 mb-2">所持数: {selectedItem.count}</div>
              )}
              <div className="text-sm text-gray-400">オプションが存在する装備品に使用できます</div>
            </div>
          )}

          {selectedItem.type === 'option_slot_stone' && (
            <div className="text-cyan-300 mb-4">
              <div className="text-lg mb-2">効果: 装備品のオプション枠を{selectedItem.slots || 1}つ増やす</div>
              {selectedItem.count && selectedItem.count > 1 && (
                <div className="text-sm text-blue-400 mb-2">所持数: {selectedItem.count}</div>
              )}
              <div className="text-sm text-gray-400">最大5枠まで増やすことができます</div>
            </div>
          )}

          {selectedItem.type === 'rarity_upgrade_stone' && (
            <div className="text-orange-300 mb-4">
              <div className="text-lg mb-2">効果: 装備品のレアリティを{selectedItem.upgrades || 1}段階上げる</div>
              {selectedItem.count && selectedItem.count > 1 && (
                <div className="text-sm text-blue-400 mb-2">所持数: {selectedItem.count}</div>
              )}
              <div className="text-sm text-gray-400">レジェンダリーまで上げることができます</div>
            </div>
          )}

          {selectedItem.type === 'skill' && selectedItem.skillData && (
            <div className="mb-4">
              {selectedItem.skillData.level && (
                <div className="text-yellow-400 text-lg font-bold mb-3">Lv.{selectedItem.skillData.level}</div>
              )}
              {selectedItem.skillData.requiredStat && (
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 mb-4">
                  <div className="text-red-400 text-sm font-bold mb-1">必要能力値: {selectedItem.skillData.requiredStat}</div>
                  <div className="text-xs text-gray-400">現在: {getStats.str + getStats.vit + getStats.dex}</div>
                  {(getStats.str + getStats.vit + getStats.dex) < selectedItem.skillData.requiredStat && (
                    <div className="text-red-500 text-xs mt-1">※装備できません</div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-cyan-300 flex justify-between items-center">
                  <span className="text-gray-400">タイプ</span>
                  <span className="font-bold">{selectedItem.skillData.type === 'buff' ? 'BUFF' : selectedItem.skillData.type === 'heal' ? 'HEAL' : 'ATTACK'}</span>
                </div>
                <div className="text-cyan-300 flex justify-between items-center">
                  <span className="text-gray-400">属性</span>
                  <span className="font-bold">{getElementConfig(selectedItem.skillData.element || 'none').label}</span>
                </div>
                {selectedItem.skillData.power !== undefined && (
                  <div className="text-cyan-300 flex justify-between items-center">
                    <span className="text-gray-400">威力</span>
                    <span className="font-bold">x{typeof selectedItem.skillData.power === 'number' ? selectedItem.skillData.power.toFixed(1) : selectedItem.skillData.power}</span>
                  </div>
                )}
                {selectedItem.skillData.cd !== undefined && (
                  <div className="text-cyan-300 flex justify-between items-center">
                    <span className="text-gray-400">CD</span>
                    <span className="font-bold">{selectedItem.skillData.cd}s</span>
                  </div>
                )}
                {selectedItem.skillData.mpCost !== undefined && (
                  <div className="text-cyan-300 flex justify-between items-center">
                    <span className="text-gray-400">MPコスト</span>
                    <span className="font-bold text-cyan-400">{selectedItem.skillData.mpCost}</span>
                  </div>
                )}
                {selectedItem.skillData.duration !== undefined && (
                  <div className="text-cyan-300 flex justify-between items-center">
                    <span className="text-gray-400">持続時間</span>
                    <span className="font-bold">{selectedItem.skillData.duration}s</span>
                  </div>
                )}
              </div>
              
              {selectedItem.inkSlots !== undefined && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <div className="text-sm text-gray-500 mb-3">インクスロット ({(selectedItem.inks?.length || 0)}/{selectedItem.inkSlots})</div>
                  <div className="flex gap-2 flex-wrap">
                    {(selectedItem.inks || []).map((ink, i) => (
                      <div key={i} className="bg-purple-900/40 border border-purple-500 px-3 py-2 rounded-lg text-sm text-purple-200">
                        {ink.name || ink.mod?.label || `インク ${i + 1}`}
                      </div>
                    ))}
                    {(selectedItem.inks?.length || 0) < (selectedItem.inkSlots || 0) && !selectedItem.isEquipped && (
                      <button onClick={() => { setInkModeItem(selectedItem); setSelectedItem(null); }} className="bg-gray-800 border-2 border-dashed border-gray-600 px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:border-white transition-colors">
                        + インク装着
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {(selectedItem.baseStats || selectedItem.stats) && Object.keys(selectedItem.baseStats || selectedItem.stats || {}).length > 0 && (
            <>
              {Object.entries(selectedItem.baseStats || selectedItem.stats || {}).map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                  <span className="text-gray-400 uppercase text-sm">{k}</span>
                  <span className="font-bold text-lg">{v}</span>
                </div>
              ))}
            </>
          )}
          {selectedItem.options && selectedItem.options.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              {renderMergedOptions(selectedItem.options, selectedItem.type)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {isNormalItem && (
            <>
              <button onClick={() => sellItem(selectedItem)} className="py-4 rounded-lg border-2 border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors font-bold">
                売却
              </button>
              {warehouseTab ? (
                <button onClick={() => moveToInventory(selectedItem)} className="py-4 rounded-lg bg-blue-600 text-white font-bold text-lg hover:bg-blue-500 transition-colors">
                  インベントリへ移動
                </button>
              ) : (
                <button onClick={() => moveToWarehouse(selectedItem)} className="py-4 rounded-lg bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-500 transition-colors">
                  倉庫へ移動
                </button>
              )}
              {selectedItem.type === 'skill' ? (
                <div className="flex gap-2">
                  <button onClick={() => equipItem(selectedItem, 1)} className="flex-1 py-3 bg-blue-900 text-white text-sm rounded-lg hover:bg-blue-800 transition-colors font-bold">S1</button>
                  <button onClick={() => equipItem(selectedItem, 2)} className="flex-1 py-3 bg-blue-900 text-white text-sm rounded-lg hover:bg-blue-800 transition-colors font-bold">S2</button>
                  <button onClick={() => equipItem(selectedItem, 3)} className="flex-1 py-3 bg-blue-900 text-white text-sm rounded-lg hover:bg-blue-800 transition-colors font-bold">S3</button>
                </div>
              ) : selectedItem.type !== 'ink' ? (
                <div className="flex gap-2">
                  <button onClick={() => equipItem(selectedItem)} className="flex-1 py-4 rounded-lg bg-blue-600 text-white font-bold text-lg hover:bg-blue-500 transition-colors">
                    装備
                  </button>
                  {!warehouseTab && (
                    <button onClick={() => moveToWarehouse(selectedItem)} className="px-4 py-4 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors" title="倉庫へ移動">
                      <Warehouse size={20} />
                    </button>
                  )}
                </div>
              ) : null}
            </>
          )}
          
          {selectedItem.isEquipped && (
            <div className="col-span-2 space-y-3">
              <div className="text-center text-sm text-gray-500 py-2 bg-gray-900 rounded-lg">装備中</div>
              <div className="flex gap-2">
                <button onClick={() => unequipItem(selectedItem.type === 'skill' ? Object.keys(equipment).find(key => equipment[key]?.id === selectedItem.id) : selectedItem.type)} className="flex-1 py-4 bg-red-900/50 text-red-200 border-2 border-red-800 rounded-lg text-base font-bold hover:bg-red-900/70 transition-colors">
                  外す
                </button>
                {!warehouseTab && (
                  <button onClick={() => { unequipItem(selectedItem.type === 'skill' ? Object.keys(equipment).find(key => equipment[key]?.id === selectedItem.id) : selectedItem.type); moveToWarehouse(selectedItem); }} className="px-4 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors" title="外して倉庫へ移動">
                    <Warehouse size={20} />
                  </button>
                )}
              </div>
            </div>
          )}
          
          {selectedItem.type === 'stone' && (
            <>
              <button onClick={() => sellItem(selectedItem)} className="py-4 rounded-lg border-2 border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors font-bold">
                売却
              </button>
              <div className="flex gap-2">
                <button onClick={() => { startDungeon(selectedItem); setSelectedItem(null); }} className="flex-1 py-4 rounded-lg bg-cyan-700 text-white font-bold text-lg hover:bg-cyan-600 transition-colors">
                  使用
                </button>
                {warehouseTab && (
                  <button onClick={() => moveToInventory(selectedItem)} className="px-4 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors" title="インベントリへ移動">
                    <Backpack size={20} />
                  </button>
                )}
              </div>
            </>
          )}

          {isEquipmentItem && (
            <>
              <button onClick={() => sellItem(selectedItem)} className="py-4 rounded-lg border-2 border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors font-bold">
                売却
              </button>
              <div className="flex gap-2">
                <button onClick={() => { setTab('equipment'); setEquipmentItemMode(selectedItem); setSelectedItem(null); }} className="flex-1 py-4 rounded-lg bg-green-600 text-white font-bold text-lg hover:bg-green-500 transition-colors">
                  装備強化タブで使用
                </button>
                {warehouseTab ? (
                  <button onClick={() => moveToInventory(selectedItem)} className="px-4 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors" title="インベントリへ移動">
                    <Backpack size={20} />
                  </button>
                ) : (
                  <button onClick={() => moveToWarehouse(selectedItem)} className="px-4 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors" title="倉庫へ移動">
                    <Warehouse size={20} />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

