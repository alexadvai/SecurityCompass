"use client";

import React, { useEffect, useRef, useMemo } from 'react';
import { Network } from 'vis-network/standalone/esm/vis-network';
import type { Data, Options, Node, Edge } from 'vis-network';
import type { Asset, Relationship } from '@/lib/types';
import { useTheme } from 'next-themes';

const lightThemeColors = {
    node: {
        red: { border: '#ef4444', background: '#fecaca' },
        orange: { border: '#f97316', background: '#fed7aa' },
        yellow: { border: '#eab308', background: '#fef08a' },
        green: { border: '#22c55e', background: '#dcfce7' },
    },
    font: '#0f172a',
    edge: { color: '#94a3b8', highlight: '#1E3A8A' },
};

const darkThemeColors = {
    node: {
        red: { border: '#ef4444', background: '#991b1b' },
        orange: { border: '#f97316', background: '#9a3412' },
        yellow: { border: '#eab308', background: '#854d0e' },
        green: { border: '#22c55e', background: '#166534' },
    },
    font: '#f8fafc',
    edge: { color: '#64748b', highlight: '#60a5fa' },
}

const getNodeColor = (riskScore: number, theme: 'light' | 'dark' = 'light') => {
    const colors = theme === 'light' ? lightThemeColors.node : darkThemeColors.node;
    if (riskScore > 0.75) return colors.red;
    if (riskScore > 0.5) return colors.orange;
    if (riskScore > 0.25) return colors.yellow;
    return colors.green;
};


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
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const graphData = useMemo((): Data => {
        const theme = isDark ? 'dark' : 'light';
        const nodes: Node[] = assets.map(asset => ({
            id: asset.id,
            label: asset.name,
            title: `${asset.type}: ${asset.name}`,
            shape: 'box',
            color: getNodeColor(asset.riskScore, theme),
            borderWidth: 2,
            font: {
                face: 'Inter',
                color: isDark ? darkThemeColors.font : lightThemeColors.font,
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
            color: isDark ? darkThemeColors.edge : lightThemeColors.edge,
            font: { 
                align: 'top', 
                face: 'Inter',
                color: isDark ? darkThemeColors.font : lightThemeColors.font,
             },
            smooth: {
                type: 'cubicBezier'
            }
        }));

        return { nodes, edges };
    }, [assets, relationships, isDark]);

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
            if (networkRef.current) {
                networkRef.current.destroy();
                networkRef.current = null;
            }
        };
    // We want to re-initialize the network when the theme changes to apply colors
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDark]);

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

    return <div ref={containerRef} className="h-full w-full bg-background rounded-lg shadow-inner" />;
};

export default GraphView;
