import { Sword, Shield, Map as MapIcon, Droplet, Gem, Sparkles, ScrollText, Flame, Snowflake, Zap, Sun, Moon, ArrowUpCircle, Layers } from 'lucide-react';
import { getElementConfig } from '../constants.jsx';

export const ItemIcon = ({ item, size = 24 }) => {
  if (item.type === 'weapon') return <Sword size={size} />;
  if (item.type === 'armor') return <Shield size={size} />;
  if (item.type === 'stone') return <MapIcon size={size} />;
  if (item.type === 'ink') return <Droplet size={size} className="text-purple-400" />;
  if (item.type === 'skill') {
      const el = item.skillData?.element || 'none';
      return getElementConfig(el).icon;
  }
  if (item.type === 'enhancement_stone') return <Sparkles size={size} className="text-yellow-400" />;
  if (item.type === 'enchant_scroll') return <ScrollText size={size} className="text-blue-400" />;
  if (item.type === 'element_stone') {
      const el = item.element || 'none';
      return getElementConfig(el).icon;
  }
  if (item.type === 'special_stone') return <Gem size={size} className="text-purple-400" />;
  if (item.type === 'reroll_scroll') return <ScrollText size={size} className="text-green-400" />;
  if (item.type === 'option_slot_stone') return <Layers size={size} className="text-cyan-400" />;
  if (item.type === 'rarity_upgrade_stone') return <ArrowUpCircle size={size} className="text-orange-400" />;
  return <Gem size={size} />;
};

