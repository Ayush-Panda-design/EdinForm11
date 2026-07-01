"use client";

/**
 * DnD Field List — drag-and-drop reordering using @dnd-kit
 * Usage: <DndFieldList fields={fields} onReorder={handleReorder} renderField={...} />
 */

import React, { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

export interface DndField {
  id: string;
  order: number;
}

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
}

function SortableItem({ id, children, disabled }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
    position: "relative",
  };

  return (
    <div ref={setNodeRef} style={style} className="group">
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className={`mt-3 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
          aria-label="Drag to reorder"
          disabled={disabled}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

interface DndFieldListProps<T extends DndField> {
  fields: T[];
  onReorder: (newOrder: Array<{ fieldId: string; order: number }>) => void;
  renderField: (field: T, index: number) => React.ReactNode;
  disabled?: boolean;
}

export function DndFieldList<T extends DndField>({
  fields,
  onReorder,
  renderField,
  disabled = false,
}: DndFieldListProps<T>) {
  const [localFields, setLocalFields] = useState<T[]>(fields);

  // Sync when parent fields change
  React.useEffect(() => {
    setLocalFields(fields);
  }, [fields]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setLocalFields((prev) => {
        const oldIndex = prev.findIndex((f) => f.id === active.id);
        const newIndex = prev.findIndex((f) => f.id === over.id);
        const reordered = arrayMove(prev, oldIndex, newIndex);
        // Propagate new order to parent
        onReorder(reordered.map((f, i) => ({ fieldId: f.id, order: i })));
        return reordered;
      });
    },
    [onReorder]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={localFields.map((f) => f.id)}
        strategy={verticalListSortingStrategy}
        disabled={disabled}
      >
        <div className="space-y-2">
          {localFields.map((field, index) => (
            <SortableItem key={field.id} id={field.id} disabled={disabled}>
              {renderField(field, index)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
