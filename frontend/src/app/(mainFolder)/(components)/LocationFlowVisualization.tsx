

"use client";

import React, { useCallback, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  Panel,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

interface DeviceLocation {
  name: string; 
  location: string; 
  _id?: string;
}

interface LocationFlowVisualizationProps {
  data: DeviceLocation[];
}

export default function LocationFlowVisualization({
  data,
}: LocationFlowVisualizationProps) {
  // Function to generate nodes and edges from device location data
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Add root node
    nodes.push({
      id: "root",
      data: { label: "All Locations" },
      position: { x: 0, y: 0 },
      style: {
        background: "#d8f3dc",
        color: "#333",
        border: "1px solid #2d6a4f",
        width: 180,
        borderRadius: "4px",
        padding: "10px",
      },
    });

    // Track existing nodes to avoid duplicates
    const existingNodes = new Set(["root"]);
    const existingLocations = new Set<string>();

    // Process each device and its location
    data.forEach((device, deviceIndex) => {
      const yOffset = (deviceIndex + 1) * 100;

      // Create location node (if not already created)
      const locationNodeId = `loc_${device.location.replace(/\s+/g, "_")}`; // Replace spaces for ID
      if (!existingLocations.has(device.location)) {
        nodes.push({
          id: locationNodeId,
          data: { label: device.location },
          position: { x: 200, y: yOffset },
          style: {
            background: "#95d5b2",
            color: "#333",
            border: "1px solid #2d6a4f",
            width: 160,
            borderRadius: "4px",
            padding: "10px",
          },
        });
        existingNodes.add(locationNodeId);
        existingLocations.add(device.location);

        // Connect location to root
        edges.push({
          id: `edge_root_${locationNodeId}`,
          source: "root",
          target: locationNodeId,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
            color: "#555",
          },
          style: { stroke: "#555" },
        });
      }

      // Add device node
      const deviceNodeId = `device_${device._id || device.name.replace(/\s+/g, "_")}`;
      nodes.push({
        id: deviceNodeId,
        data: { label: `Device: ${device.name}` },
        position: { x: 400, y: yOffset },
        style: {
          background: "#ffcccc",
          color: "#333",
          border: "1px solid #ba181b",
          width: 160,
          borderRadius: "4px",
          padding: "10px",
        },
      });

      // Connect device to its location
      edges.push({
        id: `edge_${locationNodeId}_${deviceNodeId}`,
        source: locationNodeId,
        target: deviceNodeId,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: "#555",
        },
        style: { stroke: "#555" },
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [data]);

  // Set up node and edge states
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Fit view on initialization
  const fitView = useCallback(() => {
    // Trigger fit view
  }, []);

  return (
    <div style={{ height: 600, width: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        onInit={fitView}
      >
        <Background />
        <Controls />
        <Panel position="top-left">
          <h3 className="font-semibold">Device Location Hierarchy</h3>
        </Panel>
      </ReactFlow>
    </div>
  );
}


