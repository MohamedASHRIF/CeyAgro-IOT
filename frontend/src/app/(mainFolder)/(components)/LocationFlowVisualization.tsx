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
  // Function to normalize location names for comparison
  const normalizeLocationName = useCallback((location: string): string => {
    return location
      .toLowerCase()                    // Convert to lowercase
      .trim()                          // Remove leading/trailing spaces
      .replace(/\s+/g, ' ')            // Replace multiple spaces with single space
      .replace(/[^\w\s]/g, '')         // Remove special characters except spaces
      .trim();                         // Final trim after character removal
  }, []);

  // Function to get a clean display name (preserves original casing but cleans up)
  const getDisplayName = useCallback((location: string): string => {
    return location
      .trim()                          // Remove leading/trailing spaces
      .replace(/\s+/g, ' ')            // Replace multiple spaces with single space
      .replace(/^\w/, c => c.toUpperCase()); // Capitalize first letter
  }, []);

  // Function to generate nodes and edges from device location data
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Validate data
    if (!data || !Array.isArray(data)) {
      console.warn('LocationFlowVisualization: Invalid data provided');
      return { initialNodes: [], initialEdges: [] };
    }

    // Filter out invalid entries
    const validData = data.filter(device => {
      if (!device || typeof device !== 'object') {
        console.warn('LocationFlowVisualization: Invalid device object:', device);
        return false;
      }
      if (!device.name || typeof device.name !== 'string' || device.name.trim() === '') {
        console.warn('LocationFlowVisualization: Invalid device name:', device);
        return false;
      }
      if (!device.location || typeof device.location !== 'string' || device.location.trim() === '') {
        console.warn('LocationFlowVisualization: Invalid location:', device);
        return false;
      }
      return true;
    });

    if (validData.length === 0) {
      console.warn('LocationFlowVisualization: No valid data to display');
      return { initialNodes: [], initialEdges: [] };
    }

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
        fontSize: "14px",
        fontWeight: "600",
      },
    });

    // Track locations using normalized names to avoid duplicates
    const locationMap = new Map<string, {
      nodeId: string;
      displayName: string;
      deviceCount: number;
      yPosition: number;
    }>();

    // First pass: collect and normalize all unique locations
    validData.forEach((device) => {
      const normalizedLocation = normalizeLocationName(device.location);
      
      if (!locationMap.has(normalizedLocation)) {
        const displayName = getDisplayName(device.location);
        const nodeId = `loc_${normalizedLocation.replace(/\s+/g, "_")}`;
        
        locationMap.set(normalizedLocation, {
          nodeId,
          displayName,
          deviceCount: 0,
          yPosition: (locationMap.size + 1) * 120, // Increased spacing
        });
      }
      
      // Increment device count for this location
      const locationInfo = locationMap.get(normalizedLocation)!;
      locationInfo.deviceCount++;
    });

    // Create location nodes
    locationMap.forEach((locationInfo, normalizedLocation) => {
      const label = `${locationInfo.displayName}${locationInfo.deviceCount > 1 ? ` (${locationInfo.deviceCount} devices)` : ''}`;
      
      nodes.push({
        id: locationInfo.nodeId,
        data: { label },
        position: { x: 250, y: locationInfo.yPosition },
        style: {
          background: "#95d5b2",
          color: "#333",
          border: "1px solid #2d6a4f",
          width: 200,
          borderRadius: "4px",
          padding: "12px",
          fontSize: "13px",
          fontWeight: "500",
        },
      });

      // Connect location to root
      edges.push({
        id: `edge_root_${locationInfo.nodeId}`,
        source: "root",
        target: locationInfo.nodeId,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: "#555",
        },
        style: { stroke: "#555", strokeWidth: 2 },
      });
    });

    // Second pass: create device nodes and connect them to locations
    const deviceCountPerLocation = new Map<string, number>();
    
    validData.forEach((device) => {
      const normalizedLocation = normalizeLocationName(device.location);
      const locationInfo = locationMap.get(normalizedLocation)!;
      
      // Track how many devices we've added for this location (for positioning)
      const currentDeviceIndex = deviceCountPerLocation.get(normalizedLocation) || 0;
      deviceCountPerLocation.set(normalizedLocation, currentDeviceIndex + 1);
      
      // Calculate device position (spread devices horizontally if multiple in same location)
      const baseX = 500;
      const deviceSpacing = 180;
      const deviceX = baseX + (currentDeviceIndex * deviceSpacing);
      
      const deviceNodeId = `device_${device._id || device.name.replace(/\s+/g, "_")}_${currentDeviceIndex}`;
      
      nodes.push({
        id: deviceNodeId,
        data: { 
          label: (
            <div>
              <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                {device.name}
              </div>
              <div style={{ fontSize: "11px", opacity: 0.7 }}>
                @ {getDisplayName(device.location)}
              </div>
            </div>
          )
        },
        position: { x: deviceX, y: locationInfo.yPosition },
        style: {
          background: "#ffebee",
          color: "#333",
          border: "1px solid #e57373",
          width: 160,
          borderRadius: "4px",
          padding: "10px",
          fontSize: "12px",
        },
      });

      // Connect device to its location
      edges.push({
        id: `edge_${locationInfo.nodeId}_${deviceNodeId}`,
        source: locationInfo.nodeId,
        target: deviceNodeId,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: "#555",
        },
        style: { stroke: "#666", strokeWidth: 1.5 },
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [data, normalizeLocationName, getDisplayName]);

  // Set up node and edge states
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Fit view on initialization
  const fitView = useCallback(() => {
    // Trigger fit view - handled by ReactFlow's fitView prop
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
        minZoom={0.1}
        maxZoom={2}
      >
        <Background />
        <Controls />
        <Panel position="top-left">
          <div style={{ background: "white", padding: "12px", borderRadius: "4px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600" }}>
              Device Location Hierarchy
            </h3>
            <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
              {data?.length || 0} devices across {new Set(data?.map(d => normalizeLocationName(d?.location || '')) || []).size} locations
            </p>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
