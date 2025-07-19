"use client";

import React, { useEffect, useRef, useMemo } from 'react';
import { Network } from 'vis-network/standalone/esm/vis-network';
import type { Data, Options, Node, Edge } from 'vis-network';
import type { Asset, Relationship } from '@/lib/types';
import { Server, Users, Network as NetworkIcon, Shield } from 'lucide-react';

const getNodeColor = (riskScore: number) => {
    if (riskScore > 0.75) return { border: '#ef4444', background: '#fecaca' }; // red
    if (riskScore > 0.5) return { border: '#f97316', background: '#fed7aa' }; // orange
    if (riskScore > 0.25) return { border: '#eab308', background: '#fef08a' }; // yellow
    return { border: '#22c55e', background: '#dcfce7' }; // green
};

const getIcon = (assetType: string) => {
    switch (assetType) {
        case 'EC2Instance':
            return 'server';
        case 'IAMUser':
            return 'users';
        case 'VPC':
            return 'network-icon';
        case 'SecurityGroup':
            return 'shield';
        default:
            return 'server';
    }
}

const GraphView = ({
    assets,
    relationships,
    onSelectNode,
    selectedNodeId
}: {
    assets: Asset[];
    relationships: Relationship[];
    onSelectNode: (nodeId: string | null) => void;
    selectedNodeId: string | null;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const networkRef = useRef<Network | null>(null);

    const graphData = useMemo((): Data => {
        const nodes: Node[] = assets.map(asset => ({
            id: asset.id,
            label: asset.name,
            title: `${asset.type}: ${asset.name}`,
            shape: 'box',
            color: getNodeColor(asset.riskScore),
            borderWidth: 2,
            font: {
                face: 'Inter',
            },
            margin: 10,
            shapeProperties: {
                borderRadius: 4
            }
        }));

        const edges: Edge[] = relationships.map(rel => ({
            id: rel.id,
            from: rel.from,
            to: rel.to,
            label: rel.type.replace(/_/g, ' '),
            arrows: 'to',
            color: { color: '#94a3b8', highlight: '#1E3A8A' },
            font: { align: 'top', face: 'Inter' },
            smooth: {
                type: 'cubicBezier'
            }
        }));

        return { nodes, edges };
    }, [assets, relationships]);

    useEffect(() => {
        if (!containerRef.current) return;

        const options: Options = {
            layout: {
                hierarchical: false,
                 improvedLayout: true,
            },
            physics: {
                enabled: true,
                solver: 'forceAtlas2Based',
                stabilization: {
                    enabled: true,
                    iterations: 1000,
                    fit: true,
                },
                forceAtlas2Based: {
                    gravitationalConstant: -50,
                    centralGravity: 0.01,
                    springLength: 100,
                    springConstant: 0.08,
                    damping: 0.4,
                    avoidOverlap: 0.5
                },
            },
            interaction: {
                dragNodes: true,
                zoomView: true,
                dragView: true,
            },
            nodes: {
                font: {
                    size: 14,
                    color: '#0f172a'
                },
            },
            edges: {
                width: 1.5,
            }
        };

        const network = new Network(containerRef.current, graphData, options);
        networkRef.current = network;

        network.on('click', (properties) => {
            const { nodes } = properties;
            if (nodes.length > 0) {
                onSelectNode(nodes[0]);
            } else {
                onSelectNode(null);
            }
        });

        network.on("stabilizationIterationsDone", function () {
            network.setOptions( { physics: false } );
        });

        return () => {
            network.destroy();
            networkRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (networkRef.current) {
            networkRef.current.setData(graphData);
        }
    }, [graphData]);

    useEffect(() => {
        if (networkRef.current && selectedNodeId) {
            networkRef.current.selectNodes([selectedNodeId]);
            networkRef.current.focus(selectedNodeId, { scale: 1.2, animation: true });
        } else if (networkRef.current) {
            networkRef.current.unselectAll();
            networkRef.current.fit({ animation: true });
        }
    }, [selectedNodeId]);

    return <div ref={containerRef} className="h-full w-full bg-white rounded-lg shadow-inner" />;
};

export default GraphView;
