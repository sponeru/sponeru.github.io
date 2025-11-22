import React from 'react';
import { StatsSidebar } from '../StatsSidebar';
import { PortalView } from './PortalView';
import { InventoryView } from './InventoryView';
import { EquipmentView } from './EquipmentView';
import { StatsView } from './StatsView';
import { SkillTree } from '../SkillTree';

export const TownView = ({
  tab,
  player,
  getStats,
  equipment,
  inventory,
  warehouse,
  stones,
  warehouseTab,
  selectedItem,
  setSelectedItem,
  inkModeItem,
  attachInk,
  equipmentItemMode,
  setEquipmentItemMode,
  draggedItem,
  dragOverTarget,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDrop,
  setDragOverTarget,
  onItemClick,
  learnSkill,
  useItemOnEquipment,
  startDungeon,
  optionDisplayMode,
  setOptionDisplayMode,
}) => {
  return (
    <div className="flex-1 flex overflow-hidden">
      <StatsSidebar 
        player={player} 
        getStats={getStats} 
        equipment={equipment}
        optionDisplayMode={optionDisplayMode}
        setOptionDisplayMode={setOptionDisplayMode}
      />

      <div className="flex-1 overflow-y-auto">
        {tab === 'portal' && (
          <PortalView 
            stones={stones} 
            onSelectStone={setSelectedItem}
            onSelectPortal={setSelectedItem}
            onStartDungeon={startDungeon}
          />
        )}

        {tab === 'inventory' && (
          <InventoryView
            equipment={equipment}
            inventory={inventory}
            warehouse={warehouse}
            warehouseTab={warehouseTab}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            inkModeItem={inkModeItem}
            attachInk={attachInk}
            draggedItem={draggedItem}
            dragOverTarget={dragOverTarget}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            setDragOverTarget={setDragOverTarget}
            optionDisplayMode={optionDisplayMode}
          />
        )}

        {tab === 'stats' && (
          <StatsView 
            player={player} 
            getStats={getStats} 
          />
        )}

        {tab === 'skills' && (
          <SkillTree 
            learnedSkills={player.learnedSkills || {}}
            skillPoints={player.skillPoints || 0}
            onLearnSkill={learnSkill}
            playerLevel={player.level}
          />
        )}

        {tab === 'equipment' && (
          <EquipmentView
            equipment={equipment}
            inventory={inventory}
            warehouse={warehouse}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            equipmentItemMode={equipmentItemMode}
            setEquipmentItemMode={setEquipmentItemMode}
            draggedItem={draggedItem}
            dragOverTarget={dragOverTarget}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            setDragOverTarget={setDragOverTarget}
            useItemOnEquipment={useItemOnEquipment}
            optionDisplayMode={optionDisplayMode}
          />
        )}
      </div>
    </div>
  );
};

