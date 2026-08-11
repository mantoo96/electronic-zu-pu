import { useEffect, useMemo } from "react";
import {
  Background,
  BaseEdge,
  Controls,
  EdgeLabelRenderer,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  getSmoothStepPath,
  useEdgesState,
  useNodesState,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps
} from "@xyflow/react";
import dagre from "dagre";
import type { FamilyData, Person, Relation } from "./types";
import { nameAvatarText, relationLabels } from "./labels";
import "@xyflow/react/dist/style.css";

type LayoutDirection = "TB" | "LR";
type PersonNode = Node<{ person: Person; selected: boolean; selectionOrder?: number; horizontal: boolean }, "person">;
type JunctionNode = Node<{ horizontal: boolean }, "junction">;
type FamilyNode = PersonNode | JunctionNode;

function ParentRelationEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, data }: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });
  const edgeData = data as { label?: string; horizontal?: boolean } | undefined;
  const customLabel = edgeData?.label;
  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} />
      <EdgeLabelRenderer>
        <div
          className={`parent-edge-label nodrag nopan ${edgeData?.horizontal ? "is-horizontal" : ""}`}
          style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
        >
          {customLabel || <><span>父母</span><b>{edgeData?.horizontal ? "→" : "↓"}</b><span>子女</span></>}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

function PersonCard({ data }: NodeProps<PersonNode>) {
  const { person } = data;
  const years = [person.birthDate?.slice(0, 4), person.isLiving ? "今" : person.deathDate?.slice(0, 4)]
    .filter(Boolean)
    .join(" — ");
  return (
    <div className={`person-node gender-${person.gender} ${data.selected ? "is-selected" : ""} ${data.selectionOrder ? "is-kinship-selected" : ""}`}>
      {data.selectionOrder && <span className="person-node__selection-order">{data.selectionOrder}</span>}
      {data.horizontal
        ? <Handle type="target" position={Position.Left} id="parent-left" className="node-handle" />
        : <>
          <Handle type="target" position={Position.Top} id="parent-top" className="node-handle" />
          <Handle type="target" position={Position.Left} id="spouse-left" className="node-handle node-handle--spouse" />
        </>}
      <div className="person-node__avatar">
        {person.avatar ? <img src={person.avatar} alt="" /> : <span>{nameAvatarText(person.name)}</span>}
      </div>
      <div className="person-node__content">
        <strong>{person.name}</strong>
        <span>{person.occupation || years || "资料待补充"}</span>
        {person.generation !== undefined && <em>第 {person.generation} 代</em>}
      </div>
      {data.horizontal
        ? <Handle type="source" position={Position.Right} id="child-right" className="node-handle" />
        : <>
          <Handle type="source" position={Position.Right} id="spouse-right" className="node-handle node-handle--spouse" />
          <Handle type="source" position={Position.Bottom} id="child-bottom" className="node-handle" />
        </>}
    </div>
  );
}

function FamilyJunction({ data }: NodeProps<JunctionNode>) {
  return (
    <div className="family-junction">
      {data.horizontal ? <>
        <Handle type="target" position={Position.Left} id="parents-in-left" className="node-handle" />
        <Handle type="source" position={Position.Right} id="children-out-right" className="node-handle" />
        <Handle type="target" position={Position.Top} id="bus-top" className="node-handle" />
        <Handle type="source" position={Position.Bottom} id="bus-bottom" className="node-handle" />
      </> : <>
        <Handle type="target" position={Position.Top} id="parents-in" className="node-handle" />
        <Handle type="source" position={Position.Bottom} id="children-out" className="node-handle" />
        <Handle type="target" position={Position.Left} id="bus-left" className="node-handle" />
        <Handle type="source" position={Position.Right} id="bus-right" className="node-handle" />
      </>}
    </div>
  );
}

export function layoutGraph(data: FamilyData, selectedId?: string, selectionIds: string[] = [], layoutDirection: LayoutDirection = "TB") {
  const horizontal = layoutDirection === "LR";
  const orient = (position: { x: number; y: number }) => horizontal
    ? { x: position.y * 1.5, y: position.x * 0.38 }
    : position;
  const graph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: "TB", ranksep: 74, nodesep: 38, marginx: 30, marginy: 30 });

  // 配偶组成一个布局单元，保证同一代横向并排；父母关系连接布局单元而非个人。
  const parent = new Map(data.people.map((person) => [person.id, person.id]));
  const find = (id: string): string => {
    const current = parent.get(id) ?? id;
    if (current === id) return id;
    const root = find(current);
    parent.set(id, root);
    return root;
  };
  const union = (left: string, right: string) => {
    const leftRoot = find(left);
    const rightRoot = find(right);
    if (leftRoot !== rightRoot) parent.set(rightRoot, leftRoot);
  };
  data.relations
    .filter((relation) => relation.type === "spouse")
    .forEach((relation) => union(relation.fromPersonId, relation.toPersonId));

  // 即使没有录入配偶关系，共同指向同一子女的父母也应作为同层家庭单元展示。
  const parentsByChild = new Map<string, string[]>();
  data.relations.filter((relation) => relation.type === "parent").forEach((relation) => {
    parentsByChild.set(relation.toPersonId, [...(parentsByChild.get(relation.toPersonId) ?? []), relation.fromPersonId]);
  });
  parentsByChild.forEach((parentIds) => {
    const firstParent = parentIds[0];
    if (!firstParent) return;
    parentIds.slice(1).forEach((parentId) => union(firstParent, parentId));
  });

  const groups = new Map<string, Person[]>();
  data.people.forEach((person) => {
    const root = find(person.id);
    groups.set(root, [...(groups.get(root) ?? []), person]);
  });
  const genderOrder = { male: 0, female: 1, other: 2, unknown: 3 };
  groups.forEach((people) => people.sort((a, b) => genderOrder[a.gender] - genderOrder[b.gender]));

  const personToUnit = new Map<string, string>();
  const unitWidths = new Map<string, number>();
  const unitMembers = new Map<string, Person[]>();
  groups.forEach((people, root) => {
    const unitId = `unit-${root}`;
    const width = people.length * 210 + Math.max(0, people.length - 1) * 42;
    people.forEach((person) => personToUnit.set(person.id, unitId));
    unitWidths.set(unitId, width);
    unitMembers.set(unitId, people);
    graph.setNode(unitId, { width, height: 82 });
  });

  const hierarchyTypes = new Set(["parent", "adoptive_parent", "guardian"]);
  const layoutEdges = new Set<string>();
  data.relations.filter((relation) => hierarchyTypes.has(relation.type)).forEach((relation) => {
    const source = personToUnit.get(relation.fromPersonId);
    const target = personToUnit.get(relation.toPersonId);
    if (!source || !target || source === target) return;
    const edgeKey = `${source}->${target}`;
    if (!layoutEdges.has(edgeKey)) {
      graph.setEdge(source, target);
      layoutEdges.add(edgeKey);
    }
  });
  dagre.layout(graph);

  const unitGeneration = new Map<string, number>();
  unitMembers.forEach((members, unitId) => {
    const explicitGenerations = members
      .map((person) => person.generation)
      .filter((generation): generation is number => generation !== undefined);
    if (explicitGenerations.length) unitGeneration.set(unitId, Math.min(...explicitGenerations));
  });

  // 根据父母关系补全未填写的代数；显式填写的代数始终优先。
  for (let index = 0; index < unitMembers.size; index += 1) {
    let changed = false;
    data.relations.filter((relation) => relation.type === "parent").forEach((relation) => {
      const sourceUnit = personToUnit.get(relation.fromPersonId);
      const targetUnit = personToUnit.get(relation.toPersonId);
      if (!sourceUnit || !targetUnit || sourceUnit === targetUnit) return;
      const sourceGeneration = unitGeneration.get(sourceUnit);
      const targetGeneration = unitGeneration.get(targetUnit);
      if (sourceGeneration !== undefined && targetGeneration === undefined) {
        unitGeneration.set(targetUnit, sourceGeneration + 1);
        changed = true;
      } else if (sourceGeneration === undefined && targetGeneration !== undefined) {
        unitGeneration.set(sourceUnit, targetGeneration - 1);
        changed = true;
      }
    });
    if (!changed) break;
  }

  // 完全孤立且未填写代数的成员，使用 Dagre 的层级结果作为回退。
  const dagreLevels = [...new Set([...unitMembers.keys()].map((unitId) => graph.node(unitId)?.y ?? 0))].sort((a, b) => a - b);
  const knownOffset = [...unitGeneration.entries()].map(([unitId, generation]) => {
    const rank = dagreLevels.indexOf(graph.node(unitId)?.y ?? 0);
    return generation - Math.max(0, rank);
  })[0] ?? 1;
  unitMembers.forEach((_members, unitId) => {
    if (unitGeneration.has(unitId)) return;
    const rank = dagreLevels.indexOf(graph.node(unitId)?.y ?? 0);
    unitGeneration.set(unitId, Math.max(0, rank) + knownOffset);
  });

  const personOrder = new Map(data.people.map((person, index) => [person.id, index]));
  const insertionOrder = (unitId: string) => Math.min(...(unitMembers.get(unitId) ?? []).map((person) => personOrder.get(person.id) ?? 0));
  const oldestBirthDate = (unitId: string) => unitMembers.get(unitId)
    ?.map((person) => person.birthDate)
    .filter((date): date is string => Boolean(date))
    .sort()[0];
  const compareUnits = (left: string, right: string) => {
    const leftBirthDate = oldestBirthDate(left);
    const rightBirthDate = oldestBirthDate(right);
    if (leftBirthDate && rightBirthDate && leftBirthDate !== rightBirthDate) {
      return leftBirthDate.localeCompare(rightBirthDate);
    }
    return insertionOrder(left) - insertionOrder(right);
  };

  // 每个成员家庭只选择一个主要上级家庭，避免整代成员被连接成一根全局母线。
  const parentCandidates = new Map<string, Map<string, number>>();
  data.relations.filter((relation) => relation.type === "parent").forEach((relation) => {
    const sourceUnit = personToUnit.get(relation.fromPersonId);
    const targetUnit = personToUnit.get(relation.toPersonId);
    if (!sourceUnit || !targetUnit || sourceUnit === targetUnit) return;
    const candidates = parentCandidates.get(targetUnit) ?? new Map<string, number>();
    candidates.set(sourceUnit, (candidates.get(sourceUnit) ?? 0) + 1);
    parentCandidates.set(targetUnit, candidates);
  });
  const primaryParentByUnit = new Map<string, string>();
  parentCandidates.forEach((candidates, targetUnit) => {
    const primary = [...candidates.entries()].sort((left, right) => right[1] - left[1] || compareUnits(left[0], right[0]))[0]?.[0];
    if (primary) primaryParentByUnit.set(targetUnit, primary);
  });

  const childrenByUnit = new Map<string, string[]>();
  primaryParentByUnit.forEach((sourceUnit, targetUnit) => {
    childrenByUnit.set(sourceUnit, [...(childrenByUnit.get(sourceUnit) ?? []), targetUnit]);
  });
  childrenByUnit.forEach((children) => children.sort(compareUnits));

  const generationRows = [...new Set([...unitGeneration.values()])].sort((left, right) => left - right);
  const generationY = new Map(generationRows.map((generation, index) => [generation, 41 + index * 210]));
  const subtreeWidths = new Map<string, number>();
  const calculateSubtreeWidth = (unitId: string, visiting = new Set<string>()): number => {
    if (subtreeWidths.has(unitId)) return subtreeWidths.get(unitId)!;
    if (visiting.has(unitId)) return unitWidths.get(unitId) ?? 210;
    const nextVisiting = new Set(visiting).add(unitId);
    const children = childrenByUnit.get(unitId) ?? [];
    const childrenWidth = children.reduce((total, childId) => total + calculateSubtreeWidth(childId, nextVisiting), 0)
      + Math.max(0, children.length - 1) * 90;
    const width = Math.max(unitWidths.get(unitId) ?? 210, childrenWidth);
    subtreeWidths.set(unitId, width);
    return width;
  };

  const roots = [...unitMembers.keys()].filter((unitId) => !primaryParentByUnit.has(unitId)).sort(compareUnits);
  const unitPositions = new Map<string, { x: number; y: number }>();
  const placedUnits = new Set<string>();
  const placeSubtree = (unitId: string, left: number) => {
    if (placedUnits.has(unitId)) return;
    placedUnits.add(unitId);
    const subtreeWidth = calculateSubtreeWidth(unitId);
    const centerX = left + subtreeWidth / 2;
    const generation = unitGeneration.get(unitId) ?? generationRows[0] ?? 1;
    unitPositions.set(unitId, { x: centerX, y: generationY.get(generation) ?? 41 });
    const children = childrenByUnit.get(unitId) ?? [];
    const childrenWidth = children.reduce((total, childId) => total + calculateSubtreeWidth(childId), 0)
      + Math.max(0, children.length - 1) * 90;
    let childLeft = centerX - childrenWidth / 2;
    children.forEach((childId) => {
      placeSubtree(childId, childLeft);
      childLeft += calculateSubtreeWidth(childId) + 90;
    });
  };

  let forestLeft = 30;
  roots.forEach((rootId) => {
    placeSubtree(rootId, forestLeft);
    forestLeft += calculateSubtreeWidth(rootId) + 180;
  });
  [...unitMembers.keys()].filter((unitId) => !placedUnits.has(unitId)).sort(compareUnits).forEach((unitId) => {
    placeSubtree(unitId, forestLeft);
    forestLeft += calculateSubtreeWidth(unitId) + 180;
  });

  const personPositions = new Map<string, { x: number; y: number }>();
  const junctionPositions = new Map<string, { x: number; y: number }>();
  groups.forEach((people, root) => {
    const unitId = `unit-${root}`;
    const position = unitPositions.get(unitId) || { x: 0, y: 0 };
    const unitWidth = unitWidths.get(unitId) ?? 210;
    const startX = position.x - unitWidth / 2;
    people.forEach((person, index) => {
      personPositions.set(person.id, { x: startX + index * 252, y: position.y - 41 });
    });
    if (people.length > 1) {
      junctionPositions.set(unitId, { x: position.x - 3, y: position.y - 3 });
    }
  });

  const childFamilyAnchor = (childId: string) => {
    const childUnit = personToUnit.get(childId);
    const childUnitPosition = childUnit ? unitPositions.get(childUnit) : undefined;
    const childPosition = personPositions.get(childId);
    const hasFamilyJunction = Boolean(childUnit && (unitMembers.get(childUnit)?.length ?? 0) > 1);
    return {
      x: hasFamilyJunction && childUnitPosition ? childUnitPosition.x : (childPosition?.x ?? 0) + 105,
      targetId: hasFamilyJunction ? `junction-${childUnit}` : childId,
      targetHandle: horizontal
        ? (hasFamilyJunction ? "parents-in-left" : "parent-left")
        : (hasFamilyJunction ? "parents-in" : "parent-top")
    };
  };

  // 一个家庭单元只生成一条父母主干，再从家庭分支点连接所有子女。
  const parentRelationsByUnit = new Map<string, Relation[]>();
  data.relations.filter((relation) => relation.type === "parent").forEach((relation) => {
    const sourceUnit = personToUnit.get(relation.fromPersonId);
    const targetUnit = personToUnit.get(relation.toPersonId);
    if (!sourceUnit || !targetUnit || sourceUnit === targetUnit) return;
    if (primaryParentByUnit.get(targetUnit) !== sourceUnit) return;
    parentRelationsByUnit.set(sourceUnit, [...(parentRelationsByUnit.get(sourceUnit) ?? []), relation]);
  });
  const familyHubPositions = new Map<string, { x: number; y: number }>();
  const familyBranchPositions = new Map<string, { x: number; y: number }>();
  parentRelationsByUnit.forEach((relations, sourceUnit) => {
    const sourcePosition = unitPositions.get(sourceUnit);
    const childTop = Math.min(...relations.map((relation) => personPositions.get(relation.toPersonId)?.y ?? Infinity));
    if (!sourcePosition || !Number.isFinite(childTop)) return;
    const hubPosition = { x: sourcePosition.x - 3, y: childTop - 31 };
    familyHubPositions.set(sourceUnit, hubPosition);
    [...new Set(relations.map((relation) => relation.toPersonId))].forEach((childId) => {
      const childPosition = personPositions.get(childId);
      if (childPosition) {
        const branchPosition = { x: childFamilyAnchor(childId).x, y: hubPosition.y };
        if (Math.abs(branchPosition.x - hubPosition.x) > 1) {
          familyBranchPositions.set(`${sourceUnit}-${childId}`, branchPosition);
        }
      }
    });
  });

  const nodes: FamilyNode[] = data.people.map((person) => ({
    id: person.id,
    type: "person",
    position: orient(personPositions.get(person.id) ?? { x: 0, y: 0 }),
    data: {
      person,
      selected: selectedId === person.id,
      selectionOrder: selectionIds.includes(person.id) ? selectionIds.indexOf(person.id) + 1 : undefined,
      horizontal
    }
  }));
  junctionPositions.forEach((position, unitId) => {
    nodes.push({ id: `junction-${unitId}`, type: "junction", position: orient(position), data: { horizontal } });
  });
  familyHubPositions.forEach((position, unitId) => {
    nodes.push({ id: `family-hub-${unitId}`, type: "junction", position: orient(position), data: { horizontal } });
  });
  familyBranchPositions.forEach((position, branchId) => {
    nodes.push({ id: `family-branch-${branchId}`, type: "junction", position: orient(position), data: { horizontal } });
  });

  const edges: Edge[] = [];
  const handledParentIds = new Set<string>();
  parentRelationsByUnit.forEach((relations, sourceUnit) => {
    const members = unitMembers.get(sourceUnit) ?? [];
    const uniqueChildren = [...new Set(relations.map((relation) => relation.toPersonId))];
    const customLabel = relations.find((relation) => relation.label)?.label;
    relations.forEach((relation) => handledParentIds.add(relation.id));
    const source = members.length > 1 ? `junction-${sourceUnit}` : relations[0].fromPersonId;
    edges.push({
      id: `family-trunk-${sourceUnit}`,
      source,
      target: `family-hub-${sourceUnit}`,
      sourceHandle: horizontal ? (members.length > 1 ? "children-out-right" : "child-right") : (members.length > 1 ? "children-out" : "child-bottom"),
      targetHandle: horizontal ? "parents-in-left" : "parents-in",
      type: "parent",
      data: { label: customLabel, horizontal },
      style: { stroke: "#68897d", strokeWidth: 1.6 },
      labelStyle: { fill: "#496158", fontSize: 11, fontWeight: 600 },
      labelBgStyle: { fill: "#f7f3e9", fillOpacity: 0.92 }
    });

    const childBranchId = (childId: string) => familyBranchPositions.has(`${sourceUnit}-${childId}`)
      ? `family-branch-${sourceUnit}-${childId}`
      : `family-hub-${sourceUnit}`;
    const busPoints = [...new Map([
      { id: `family-hub-${sourceUnit}`, x: familyHubPositions.get(sourceUnit)?.x ?? 0 },
      ...uniqueChildren.map((childId) => ({
        id: childBranchId(childId),
        x: familyBranchPositions.get(`${sourceUnit}-${childId}`)?.x ?? familyHubPositions.get(sourceUnit)?.x ?? 0
      }))
    ].map((point) => [point.id, point])).values()].sort((left, right) => left.x - right.x);
    busPoints.slice(0, -1).forEach((point, index) => {
      const nextPoint = busPoints[index + 1];
      edges.push({
        id: `family-bus-${sourceUnit}-${index}`,
        source: point.id,
        target: nextPoint.id,
        sourceHandle: horizontal ? "bus-bottom" : "bus-right",
        targetHandle: horizontal ? "bus-top" : "bus-left",
        type: "straight",
        style: { stroke: "#68897d", strokeWidth: 1.6 }
      });
    });
    uniqueChildren.forEach((childId) => {
      const childAnchor = childFamilyAnchor(childId);
      edges.push({
        id: `family-child-${sourceUnit}-${childId}`,
        source: childBranchId(childId),
        target: childAnchor.targetId,
        sourceHandle: horizontal ? "children-out-right" : "children-out",
        targetHandle: childAnchor.targetHandle,
        type: "straight",
        style: { stroke: "#68897d", strokeWidth: 1.6 }
      });
    });
  });

  data.relations.filter((relation) => !handledParentIds.has(relation.id)).forEach((relation) => {
    const isSpouse = relation.type === "spouse";
    const fromPosition = personPositions.get(relation.fromPersonId);
    const toPosition = personPositions.get(relation.toPersonId);
    const spouseReversed = isSpouse && fromPosition && toPosition && fromPosition.x > toPosition.x;
    edges.push({
      id: relation.id,
      source: spouseReversed ? relation.toPersonId : relation.fromPersonId,
      target: spouseReversed ? relation.fromPersonId : relation.toPersonId,
      sourceHandle: horizontal ? "child-right" : isSpouse ? "spouse-right" : "child-bottom",
      targetHandle: horizontal ? "parent-left" : isSpouse ? "spouse-left" : "parent-top",
      label: relation.type === "parent" ? undefined : relation.label || relationLabels[relation.type],
      type: relation.type === "parent" ? "parent" : isSpouse ? "straight" : "smoothstep",
      data: relation.type === "parent" ? { label: relation.label, horizontal } : undefined,
      animated: false,
      style: { stroke: isSpouse ? "#b77453" : "#68897d", strokeWidth: 1.6 },
      labelStyle: { fill: "#496158", fontSize: 11, fontWeight: 600 },
      labelBgStyle: { fill: "#f7f3e9", fillOpacity: 0.92 }
    });
  });
  return { nodes, edges };
}

interface Props {
  data: FamilyData;
  selectedId?: string;
  selectionIds?: string[];
  layoutDirection?: LayoutDirection;
  onSelect: (person: Person) => void;
}

export function FamilyGraph({ data, selectedId, selectionIds = [], layoutDirection = "TB", onSelect }: Props) {
  const layout = useMemo(() => layoutGraph(data, selectedId, selectionIds, layoutDirection), [data, selectedId, selectionIds, layoutDirection]);
  const [nodes, setNodes, onNodesChange] = useNodesState(layout.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layout.edges);

  useEffect(() => {
    setNodes(layout.nodes);
    setEdges(layout.edges);
  }, [layout, setEdges, setNodes]);

  if (!data.people.length) {
    return (
      <div className="empty-state">
        <div className="empty-state__tree">枝</div>
        <h2>从第一位家人开始</h2>
        <p>点击“添加成员”录入基础信息，再用“添加关系”连接彼此。</p>
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={{ person: PersonCard, junction: FamilyJunction }}
      edgeTypes={{ parent: ParentRelationEdge }}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={(_, node) => {
        const person = (node.data as { person?: Person }).person;
        if (person) onSelect(person);
      }}
      fitView
      fitViewOptions={{ padding: 0.12, maxZoom: 1 }}
      minZoom={0.08}
      maxZoom={1.8}
      proOptions={{ hideAttribution: true }}
    >
      <Background color="#c8d3cb" gap={25} size={1} />
      <Controls position="bottom-left" showInteractive={false} />
      <MiniMap
        position="bottom-right"
        pannable
        zoomable
        nodeColor={(node) => !node.data.person ? "transparent" : (node.data.person as Person).gender === "female" ? "#b47b70" : "#587c70"}
        maskColor="rgba(247, 243, 233, .72)"
      />
    </ReactFlow>
  );
}
