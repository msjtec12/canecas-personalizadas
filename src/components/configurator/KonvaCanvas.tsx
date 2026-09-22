'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Circle, Text as KonvaText, Image as KonvaImage, Transformer, Group } from 'react-konva';
import Konva from 'konva';
import { CanvasElement, PrintableArea, SurfaceDefinition, TextElement } from '@/types/configurator';
import { useImageLoader } from './useImageLoader';

interface ElementNodeProps {
  element: CanvasElement;
  isSelected: boolean;
  printableArea: PrintableArea;
  onSelect: () => void;
  onChange: (newAttrs: Partial<CanvasElement>) => void;
}

// Sub-component for individual Canvas Elements
const ElementNode: React.FC<ElementNodeProps> = ({
  element,
  isSelected,
  printableArea,
  onSelect,
  onChange,
}) => {
  const shapeRef = useRef<Konva.Node>(null);
  const [loadedImage] = useImageLoader(
    element.type === 'image' || element.type === 'clipart' ? element.src : undefined
  );

  // Enforce smooth boundary constraint during drag without ever locking
  const handleDragBound = (pos: { x: number; y: number }) => {
    const node = shapeRef.current;
    if (!node) return pos;

    // Get current bounding box
    const box = node.getClientRect({ skipTransform: false });
    const currentX = node.x();
    const currentY = node.y();

    const offsetX = box.x - currentX;
    const offsetY = box.y - currentY;

    const minX = printableArea.x;
    const maxX = printableArea.x + printableArea.width;
    const minY = printableArea.y;
    const maxY = printableArea.y + printableArea.height;

    let targetBoxX = pos.x + offsetX;
    let targetBoxY = pos.y + offsetY;

    // X-axis boundary clamping:
    // If element fits inside printable area, keep it fully inside.
    // If element is wider, allow user to drag it anywhere across the area without freezing.
    if (box.width <= printableArea.width) {
      targetBoxX = Math.max(minX, Math.min(targetBoxX, maxX - box.width));
    } else {
      const lower = maxX - box.width;
      const upper = minX;
      targetBoxX = Math.max(lower, Math.min(targetBoxX, upper));
    }

    // Y-axis boundary clamping:
    if (box.height <= printableArea.height) {
      targetBoxY = Math.max(minY, Math.min(targetBoxY, maxY - box.height));
    } else {
      const lower = maxY - box.height;
      const upper = minY;
      targetBoxY = Math.max(lower, Math.min(targetBoxY, upper));
    }

    return {
      x: targetBoxX - offsetX,
      y: targetBoxY - offsetY,
    };
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    if (!node) return;

    onChange({
      x: node.x(),
      y: node.y(),
      rotation: Math.round(node.rotation()),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
    });
  };

  if (element.type === 'text') {
    const textEl = element as TextElement;
    return (
      <KonvaText
        ref={shapeRef as React.RefObject<Konva.Text>}
        id={element.id}
        x={element.x}
        y={element.y}
        text={textEl.text}
        fontSize={textEl.fontSize}
        fontFamily={textEl.fontFamily}
        fill={textEl.fill}
        fontStyle={`${textEl.fontWeight === 'bold' ? 'bold ' : ''}${textEl.fontStyle === 'italic' ? 'italic' : ''}`.trim() || 'normal'}
        align={textEl.align}
        rotation={element.rotation}
        scaleX={element.scaleX}
        scaleY={element.scaleY}
        opacity={element.opacity}
        draggable
        dragBoundFunc={handleDragBound}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      />
    );
  }

  if (element.type === 'image' || element.type === 'clipart') {
    if (!loadedImage) return null;

    return (
      <KonvaImage
        ref={shapeRef as React.RefObject<Konva.Image>}
        id={element.id}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        image={loadedImage}
        rotation={element.rotation}
        scaleX={element.scaleX}
        scaleY={element.scaleY}
        opacity={element.opacity}
        draggable
        dragBoundFunc={handleDragBound}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      />
    );
  }

  return null;
};

interface KonvaCanvasProps {
  surface: SurfaceDefinition;
  elements: CanvasElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, attrs: Partial<CanvasElement>) => void;
  stageRef: React.RefObject<Konva.Stage | null>;
  showSafetyGuide?: boolean;
}

export const KonvaCanvas: React.FC<KonvaCanvasProps> = ({
  surface,
  elements,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  stageRef,
  showSafetyGuide = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const printableArea = surface.printableArea;

  // Responsive stage scaling state
  const [stageScale, setStageScale] = useState<number>(1);

  // Auto-fit stage scale to container with exact proportions
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = () => {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      if (containerWidth > 0 && containerHeight > 0) {
        const scaleX = containerWidth / surface.canvasWidth;
        const scaleY = containerHeight / surface.canvasHeight;
        const scale = Math.min(scaleX, scaleY, 1);
        setStageScale(scale);
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);

    return () => observer.disconnect();
  }, [surface.canvasWidth, surface.canvasHeight]);

  // Update Transformer binding whenever selection or elements change
  useEffect(() => {
    if (!trRef.current) return;
    const stage = stageRef.current;
    if (!stage) return;

    if (selectedElementId) {
      const selectedNode = stage.findOne(`#${selectedElementId}`);
      if (selectedNode) {
        trRef.current.nodes([selectedNode]);
        trRef.current.getLayer()?.batchDraw();
        return;
      }
    }
    trRef.current.nodes([]);
    trRef.current.getLayer()?.batchDraw();
  }, [selectedElementId, elements, stageRef, stageScale]);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.target === e.target.getStage() || e.target.name() === 'background-guide') {
      onSelectElement(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
    >
      <Stage
        ref={stageRef}
        width={surface.canvasWidth * stageScale}
        height={surface.canvasHeight * stageScale}
        scaleX={stageScale}
        scaleY={stageScale}
        onMouseDown={handleStageClick}
        onTouchStart={handleStageClick}
        className="touch-none select-none cursor-pointer"
      >
        <Layer>
          {/* Printable Area Safety Guides */}
          {showSafetyGuide && (
            <Group name="guides-group">
              {printableArea.isCircle ? (
                <Circle
                  name="background-guide"
                  x={printableArea.x + printableArea.width / 2}
                  y={printableArea.y + printableArea.height / 2}
                  radius={printableArea.width / 2}
                  stroke="#2563EB"
                  strokeWidth={1.5}
                  dash={[6, 4]}
                  fill="rgba(37, 99, 235, 0.04)"
                />
              ) : (
                <Rect
                  name="background-guide"
                  x={printableArea.x}
                  y={printableArea.y}
                  width={printableArea.width}
                  height={printableArea.height}
                  cornerRadius={printableArea.borderRadius || 4}
                  stroke="#2563EB"
                  strokeWidth={1.5}
                  dash={[6, 4]}
                  fill="rgba(37, 99, 235, 0.04)"
                />
              )}
            </Group>
          )}

          {/* Render All Elements in Z-Index Order */}
          {elements
            .slice()
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((el) => (
              <ElementNode
                key={el.id}
                element={el}
                isSelected={el.id === selectedElementId}
                printableArea={printableArea}
                onSelect={() => onSelectElement(el.id)}
                onChange={(attrs) => onUpdateElement(el.id, attrs)}
              />
            ))}

          {/* Transformer for Selection, Rotation & Scaling */}
          <Transformer
            ref={trRef}
            flipEnabled={false}
            rotateEnabled={true}
            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
            anchorSize={9}
            anchorCornerRadius={4}
            anchorFill="#C25E48"
            anchorStroke="#FFFFFF"
            anchorStrokeWidth={2}
            borderStroke="#C25E48"
            borderStrokeWidth={1.5}
            borderDash={[4, 3]}
            boundBoxFunc={(oldBox, newBox) => {
              // Safety: prevent inversion or collapse below 10px
              if (Math.abs(newBox.width) < 10 || Math.abs(newBox.height) < 10) {
                return oldBox;
              }
              return newBox;
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default KonvaCanvas;
