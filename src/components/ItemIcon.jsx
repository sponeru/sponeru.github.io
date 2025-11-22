import React from 'react';
import { Sword, Shield, Map as MapIcon, Droplet, Gem, Sparkles, ScrollText, Flame, Snowflake, Zap, Sun, Moon, ArrowUpCircle, Layers, Circle, Footprints } from 'lucide-react';
import { getElementConfig } from '../constants.jsx';

export const ItemIcon = ({ item, size = 24 }) => {
  if (item.type === 'weapon') return <Sword size={size} />;
  if (item.type === 'armor') return <Shield size={size} />;
  if (item.type === 'amulet') return <Gem size={size} className="text-purple-400" />;
  if (item.type === 'ring') return <Circle size={size} className="text-yellow-400" />;
  if (item.type === 'belt') return <Layers size={size} className="text-orange-400" />;
  if (item.type === 'feet') return <Footprints size={size} className="text-cyan-400" />;
  if (item.type === 'stone') return <MapIcon size={size} />;
  if (item.type === 'ink') return <Droplet size={size} className="text-purple-400" />;
  if (item.type === 'skill') {
      if (!item.skillData) {
          return <ScrollText size={size} className="text-gray-400" />;
      }
      const el = item.skillData.element || 'none';
      const config = getElementConfig(el);
      if (config?.icon) {
          return React.cloneElement(config.icon, { size });
      }
      return <ScrollText size={size} className="text-gray-400" />;
  }
  if (item.type === 'enhancement_stone') return <Sparkles size={size} className="text-yellow-400" />;
  if (item.type === 'enchant_scroll') return <ScrollText size={size} className="text-blue-400" />;
  if (item.type === 'element_stone') {
      const el = item.element || 'none';
      const config = getElementConfig(el);
      return React.cloneElement(config.icon, { size });
  }
  if (item.type === 'special_stone') return <Gem size={size} className="text-purple-400" />;
  if (item.type === 'reroll_scroll') return <ScrollText size={size} className="text-green-400" />;
  if (item.type === 'option_slot_stone') return <Layers size={size} className="text-cyan-400" />;
  if (item.type === 'rarity_upgrade_stone') return <ArrowUpCircle size={size} className="text-orange-400" />;
  return <Gem size={size} />;
};

