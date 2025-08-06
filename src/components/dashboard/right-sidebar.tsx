import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AssetDetailPanel from './asset-detail-panel';
import type { Asset, Relationship, AIInsight } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface RightSidebarProps {
  asset: Asset | null;
  relationships: Relationship[];
  allAssets: Asset[];
  onAddRelationship: (fromAssetId: string, insight: AIInsight) => void;
  onClose: () => void;
}

const RightSidebar = ({
  asset,
  relationships,
  allAssets,
  onAddRelationship,
  onClose,
}: RightSidebarProps) => {
  const isVisible = !!asset;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="w-full max-w-2xl border-l bg-background shadow-lg"
        >
          {asset && (
            <AssetDetailPanel
              asset={asset}
              relationships={relationships.filter(
                (r) => r.from === asset.id || r.to === asset.id
              )}
              allAssets={allAssets}
              onAddRelationship={(insight) =>
                onAddRelationship(asset.id, insight)
              }
              onClose={onClose}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RightSidebar;
