// components/builder/Designer.tsx

"use client";

import React from "react";
import DesignerSidebar from "./DesignerSidebar";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { ElementsType, FormElementInstance, FormElements } from "@/types";
import { idGenerator } from "@/lib/idGenerator";
import { useAppContext } from "../../context/AppProvider";
import DragOverlayWrapper from "./DragOverlayWrapper";
import { GripVertical } from "lucide-react";
import { Button } from "../ui/button";
import { BiSolidTrash } from "react-icons/bi";

function Designer() {
  const {
    data: { elements, selectedElement },
    actions: { formActions },
    selectors: { setSelectedElement },
  } = useAppContext();

  const droppable = useDroppable({
    id: "designer-drop-area",
    data: {
      isDesignerDropArea: true,
    },
  });

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log("Drag Ended:", event);

    if (!active || !over) return;

    const isDesignerBtnElement = active.data?.current?.isDesignerBtnElement;
    const isDroppingOverDesignerDropArea = over.data?.current?.isDesignerDropArea;

    const droppingSidebarBtnOverDesignerDropArea =
      isDesignerBtnElement && isDroppingOverDesignerDropArea;

    if (droppingSidebarBtnOverDesignerDropArea) {
      const type = active.data?.current?.type;
      const newElement = FormElements[type as ElementsType].construct(idGenerator());

      formActions.addElement(elements.length, newElement);
      console.log("Added new element at the end:", newElement);
      return;
    }

    const isDroppingOverDesignerElementTopHalf = over.data?.current?.isTopHalfDesignerElement;
    const isDroppingOverDesignerElementBottomHalf = over.data?.current?.isBottomHalfDesignerElement;
    const isDroppingOverDesignerElement =
      isDroppingOverDesignerElementTopHalf || isDroppingOverDesignerElementBottomHalf;

    const droppingSidebarBtnOverDesignerElement =
      isDesignerBtnElement && isDroppingOverDesignerElement;

    if (droppingSidebarBtnOverDesignerElement) {
      const type = active.data?.current?.type;
      const newElement = FormElements[type as ElementsType].construct(idGenerator());

      const overId = over.data?.current?.elementId;
      const overElementIndex = elements.findIndex((el) => el.id === overId);
      if (overElementIndex === -1) {
        console.error("Element not found for dropping:", overId);
        return;
      }

      let indexForNewElement = overElementIndex;
      if (isDroppingOverDesignerElementBottomHalf) {
        indexForNewElement = overElementIndex + 1;
      }

      formActions.addElement(indexForNewElement, newElement);
      console.log(`Added new element at index ${indexForNewElement}:`, newElement);
      return;
    }

    const isDraggingDesignerElement = active.data?.current?.isDesignerElement;
    const draggingDesignerElementOverAnotherDesignerElement =
      isDroppingOverDesignerElement && isDraggingDesignerElement;

    if (draggingDesignerElementOverAnotherDesignerElement) {
      const activeId = active.data?.current?.elementId;
      const overId = over.data?.current?.elementId;

      const activeElementIndex = elements.findIndex((el) => el.id === activeId);
      const overElementIndex = elements.findIndex((el) => el.id === overId);

      if (activeElementIndex === -1 || overElementIndex === -1) {
        console.error("Element not found for reordering:", activeId, overId);
        return;
      }

      const activeElement = { ...elements[activeElementIndex] };
      formActions.removeElement(activeId);
      console.log("Removed element for reordering:", activeId);

      let indexForNewElement = overElementIndex;
      if (isDroppingOverDesignerElementBottomHalf) {
        indexForNewElement = overElementIndex + 1;
      }

      formActions.addElement(indexForNewElement, activeElement);
      console.log(`Reordered element to index ${indexForNewElement}:`, activeElement);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex w-full h-full">
        <div
          className="p-4 w-full"
          onClick={() => {
            if (selectedElement) setSelectedElement(null);
          }}
        >
          <div
            ref={droppable.setNodeRef}
            className={cn(
              "bg-background max-w-[920px] h-full m-auto rounded-xl flex flex-col flex-grow items-center justify-start flex-1 overflow-y-auto",
              droppable.isOver && "ring-4 ring-primary ring-inset"
            )}
          >
            {!droppable.isOver && elements.length === 0 && (
              <p className="text-3xl text-muted-foreground flex flex-grow items-center font-bold">
                Drop here
              </p>
            )}

            {droppable.isOver && elements.length === 0 && (
              <div className="p-4 w-full">
                <div className="h-[120px] rounded-md bg-primary/20"></div>
              </div>
            )}

            {elements.length > 0 && (
              <div className="flex flex-col w-full gap-2 p-4">
                {elements.map((element) => (
                  <DesignerElementWrapper key={element.id} element={element} />
                ))}
              </div>
            )}
          </div>
        </div>
        <DesignerSidebar />
        <DragOverlayWrapper />
      </div>
    </DndContext>
  );
}

export interface DesignerElementWrapperProps {
  element: FormElementInstance;
}

function DesignerElementWrapper({ element }: DesignerElementWrapperProps) {
  const {
    data: { selectedElement },
    actions: { formActions },
    selectors: { setSelectedElement },
  } = useAppContext();

  const [mouseIsOver, setMouseIsOver] = React.useState<boolean>(false);

  const topHalf = useDroppable({
    id: element.id + "-top",
    data: {
      type: element.type,
      elementId: element.id,
      isTopHalfDesignerElement: true,
    },
  });

  const bottomHalf = useDroppable({
    id: element.id + "-bottom",
    data: {
      type: element.type,
      elementId: element.id,
      isBottomHalfDesignerElement: true,
    },
  });

  // Make only the drag handle draggable
  const dragHandle = useDraggable({
    id: element.id + "-drag-handler",
    data: {
      type: element.type,
      elementId: element.id,
      isDesignerElement: true,
    },
  });

  const DesignerElement = FormElements[element.type].designerComponent;

  const handleMouseEnter = () => setMouseIsOver(true);
  const handleMouseLeave = () => setMouseIsOver(false);
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Element clicked:", element);
    setSelectedElement(element);
  };

  return (
    <div
      className={cn(
        " relative h-[120px] flex flex-col text-foreground hover:cursor-pointer rounded-md ring-1 ring-accent ring-inset",
        selectedElement?.id === element.id && "ring-4 ring-primary"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div
        ref={topHalf.setNodeRef}
        className="absolute w-full h-1/2 rounded-t-md z-1"
      />
      <div
        ref={bottomHalf.setNodeRef}
        className="absolute w-full bottom-0 h-1/2 rounded-b-md z-1"
      />

      {mouseIsOver && (
        <div className="absolute right-0 h-full ">
          <Button
            className="flex justify-center h-full border rounded-md rounded-l-none bg-red-500"
            variant={"outline"}
            onClick={(e) => {
              e.stopPropagation();
              formActions.removeElement(element.id);
            }}
          >
            <BiSolidTrash className="h-6 w-6" />
          </Button>
        </div>
      )}

      {topHalf.isOver && (
        <div className="absolute top-0 w-full rounded-md h-[7px] bg-primary rounded-b-none" />
      )}

      <div className="group flex w-full h-[120px] items-center rounded-md bg-accent/40 px-4 py-2">
        {/* Drag Handle */}
        <div
          ref={dragHandle.setNodeRef}
          {...dragHandle.listeners}
          {...dragHandle.attributes}
          className="mr-4 cursor-grab ease-out duration-300 transition-all opacity-100 group-hover:opacity-100 z-20 flex items-center justify-center p-2"
        >
          {/* Use a more intuitive drag icon */}
          <GripVertical className="h-5 w-5 text-gray-500" />
        </div>
        <DesignerElement elementInstance={element} />
      </div>

      {bottomHalf.isOver && (
        <div className="absolute bottom-0 w-full rounded-md h-[7px] bg-primary rounded-t-none" />
      )}
    </div>
  );
}

export default Designer;
