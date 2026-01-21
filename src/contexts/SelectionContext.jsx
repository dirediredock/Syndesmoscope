import { createContext, useContext, useState, useCallback, useMemo } from 'react'

/**
 * SelectionContext manages the shared selection state across all visualization panes.
 * 
 * Selection types:
 * - Hovered: Temporary highlight on mouse hover (muted color)
 * - Selected: Persistent highlight from click (solid color)
 * 
 * Both nodes and edges can be selected, identified by their idx values
 * which are consistent across all precomputed JSON data.
 */

const SelectionContext = createContext(null)

export function SelectionProvider({ children }) {
  // Hovered items (non-persistent, follows mouse)
  const [hoveredNodes, setHoveredNodes] = useState(new Set())
  const [hoveredEdges, setHoveredEdges] = useState(new Set())
  
  // Selected items (persistent, toggle on click)
  const [selectedNodes, setSelectedNodes] = useState(new Set())
  const [selectedEdges, setSelectedEdges] = useState(new Set())

  // Node hover handlers
  const hoverNode = useCallback((nodeIdx) => {
    setHoveredNodes(new Set([nodeIdx]))
  }, [])

  const hoverNodes = useCallback((nodeIdxArray) => {
    setHoveredNodes(new Set(nodeIdxArray))
  }, [])

  const clearHoveredNodes = useCallback(() => {
    setHoveredNodes(new Set())
  }, [])

  // Edge hover handlers
  const hoverEdge = useCallback((edgeIdx) => {
    setHoveredEdges(new Set([edgeIdx]))
  }, [])

  const hoverEdges = useCallback((edgeIdxArray) => {
    setHoveredEdges(new Set(edgeIdxArray))
  }, [])

  const clearHoveredEdges = useCallback(() => {
    setHoveredEdges(new Set())
  }, [])

  // Clear all hover
  const clearHover = useCallback(() => {
    setHoveredNodes(new Set())
    setHoveredEdges(new Set())
  }, [])

  // Node selection handlers (toggle)
  const toggleNodeSelection = useCallback((nodeIdx) => {
    setSelectedNodes(prev => {
      const next = new Set(prev)
      if (next.has(nodeIdx)) {
        next.delete(nodeIdx)
      } else {
        next.add(nodeIdx)
      }
      return next
    })
  }, [])

  const selectNodes = useCallback((nodeIdxArray) => {
    setSelectedNodes(prev => {
      const next = new Set(prev)
      nodeIdxArray.forEach(idx => next.add(idx))
      return next
    })
  }, [])

  const deselectNodes = useCallback((nodeIdxArray) => {
    setSelectedNodes(prev => {
      const next = new Set(prev)
      nodeIdxArray.forEach(idx => next.delete(idx))
      return next
    })
  }, [])

  const clearSelectedNodes = useCallback(() => {
    setSelectedNodes(new Set())
  }, [])

  // Edge selection handlers (toggle)
  const toggleEdgeSelection = useCallback((edgeIdx) => {
    setSelectedEdges(prev => {
      const next = new Set(prev)
      if (next.has(edgeIdx)) {
        next.delete(edgeIdx)
      } else {
        next.add(edgeIdx)
      }
      return next
    })
  }, [])

  const selectEdges = useCallback((edgeIdxArray) => {
    setSelectedEdges(prev => {
      const next = new Set(prev)
      edgeIdxArray.forEach(idx => next.add(idx))
      return next
    })
  }, [])

  const deselectEdges = useCallback((edgeIdxArray) => {
    setSelectedEdges(prev => {
      const next = new Set(prev)
      edgeIdxArray.forEach(idx => next.delete(idx))
      return next
    })
  }, [])

  const clearSelectedEdges = useCallback(() => {
    setSelectedEdges(new Set())
  }, [])

  // Clear all selections
  const clearAllSelections = useCallback(() => {
    setHoveredNodes(new Set())
    setHoveredEdges(new Set())
    setSelectedNodes(new Set())
    setSelectedEdges(new Set())
  }, [])

  // Helper to check if a node is highlighted (either hovered or selected)
  const isNodeHighlighted = useCallback((nodeIdx) => {
    return hoveredNodes.has(nodeIdx) || selectedNodes.has(nodeIdx)
  }, [hoveredNodes, selectedNodes])

  // Helper to check if an edge is highlighted
  const isEdgeHighlighted = useCallback((edgeIdx) => {
    return hoveredEdges.has(edgeIdx) || selectedEdges.has(edgeIdx)
  }, [hoveredEdges, selectedEdges])

  const value = useMemo(() => ({
    // State
    hoveredNodes,
    hoveredEdges,
    selectedNodes,
    selectedEdges,
    
    // Node hover
    hoverNode,
    hoverNodes,
    clearHoveredNodes,
    
    // Edge hover
    hoverEdge,
    hoverEdges,
    clearHoveredEdges,
    clearHover,
    
    // Node selection
    toggleNodeSelection,
    selectNodes,
    deselectNodes,
    clearSelectedNodes,
    
    // Edge selection
    toggleEdgeSelection,
    selectEdges,
    deselectEdges,
    clearSelectedEdges,
    
    // Utilities
    clearAllSelections,
    isNodeHighlighted,
    isEdgeHighlighted,
  }), [
    hoveredNodes, hoveredEdges, selectedNodes, selectedEdges,
    hoverNode, hoverNodes, clearHoveredNodes,
    hoverEdge, hoverEdges, clearHoveredEdges, clearHover,
    toggleNodeSelection, selectNodes, deselectNodes, clearSelectedNodes,
    toggleEdgeSelection, selectEdges, deselectEdges, clearSelectedEdges,
    clearAllSelections, isNodeHighlighted, isEdgeHighlighted
  ])

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  )
}

export function useSelection() {
  const context = useContext(SelectionContext)
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider')
  }
  return context
}
