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
    background: '#ffffff',
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
    background: '#18181b', // A slightly lighter dark for the graph bg
};

const cyberpunkThemeColors = {
     node: {
        red: { border: '#f91880', background: '#5e173e' },
        orange: { border: '#ff7a00', background: '#663300' },
        yellow: { border: '#ffd400', background: '#594a00' },
        green: { border: '#32cd32', background: '#145214' },
    },
    font: '#00f0ff',
    edge: { color: '#7e22ce', highlight: '#f91880' },
    background: '#0d0c22'
}

const getNodeColor = (riskScore: number, theme: 'light' | 'dark' | 'cyberpunk' = 'light') => {
    const themes = {
      light: lightThemeColors.node,
      dark: darkThemeColors.node,
      cyberpunk: cyberpunkThemeColors.node,
    }
    const colors = themes[theme] || lightThemeColors.node;
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
    const currentTheme = (resolvedTheme || 'light') as 'light' | 'dark' | 'cyberpunk';


    const graphData = useMemo((): Data => {
        const themeColors = {
            light: lightThemeColors,
            dark: darkThemeColors,
            cyberpunk: cyberpunkThemeColors,
        }[currentTheme] || lightThemeColors;

        const nodes: Node[] = assets.map(asset => ({
            id: asset.id,
            label: asset.name,
            title: `${asset.type}: ${asset.name}`,
            shape: 'box',
            color: getNodeColor(asset.riskScore, currentTheme),
            borderWidth: 2,
            font: {
                face: 'Inter',
                color: themeColors.font,
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
            color: themeColors.edge,
            font: { 
                align: 'top', 
                face: 'Inter',
                color: themeColors.font,
             },
            smooth: {
                type: 'cubicBezier'
            }
        }));

        return { nodes, edges };
    }, [assets, relationships, currentTheme]);

    useEffect(() => {
        if (!containerRef.current) return;
        const themeColors = {
            light: lightThemeColors,
            dark: darkThemeColors,
            cyberpunk: cyberpunkThemeColors,
        }[currentTheme] || lightThemeColors;


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
    }, [currentTheme]);

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

    const themeColors = {
        light: lightThemeColors,
        dark: darkThemeColors,
        cyberpunk: cyberpunkThemeColors
    }[currentTheme] || lightThemeColors;

    return <div ref={containerRef} className="h-full w-full rounded-lg" style={{backgroundColor: themeColors.background}} />;
};

export default GraphView;
