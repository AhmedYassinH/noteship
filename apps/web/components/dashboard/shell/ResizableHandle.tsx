"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "@/lib/utils";
import type { ShellDir } from "./types";

type DragState = {
  pointerId: number;
  startWidth: number;
  startX: number;
};

type ResizableHandleProps = {
  dir: ShellDir;
  max: number;
  min: number;
  onChange: (nextWidth: number) => void;
  onCommit: () => void;
  reducedMotion: boolean;
  value: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const ResizableHandle = ({
  dir,
  max,
  min,
  onChange,
  onCommit,
  reducedMotion,
  value,
}: ResizableHandleProps) => {
  const dragStateRef = useRef<DragState | null>(null);

  const updateWidth = (deltaX: number, startWidth: number) => {
    const next = dir === "rtl" ? startWidth - deltaX : startWidth + deltaX;
    onChange(clamp(next, min, max));
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      pointerId: event.pointerId,
      startWidth: value,
      startX: event.clientX,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;
    if (!state || state.pointerId !== event.pointerId) return;
    updateWidth(event.clientX - state.startX, state.startWidth);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;
    if (!state || state.pointerId !== event.pointerId) return;
    dragStateRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    onCommit();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 32 : 16;
    const key = event.key;
    if (key === "Home") {
      event.preventDefault();
      onChange(min);
      onCommit();
      return;
    }
    if (key === "End") {
      event.preventDefault();
      onChange(max);
      onCommit();
      return;
    }
    if (key !== "ArrowLeft" && key !== "ArrowRight") return;
    event.preventDefault();
    const deltaX = key === "ArrowLeft" ? -step : step;
    updateWidth(deltaX, value);
    onCommit();
  };

  return (
    <div
      aria-label="Resize sidebar"
      aria-orientation="vertical"
      aria-valuemax={max}
      aria-valuemin={min}
      aria-valuenow={Math.round(value)}
      className={cn(
        "absolute top-0 bottom-0 z-20 w-3 cursor-col-resize touch-none outline-none",
        dir === "rtl" ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2",
      )}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      role="separator"
      tabIndex={0}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[rgba(15,23,42,0.2)]",
          !reducedMotion && "transition-colors duration-150",
        )}
      />
    </div>
  );
};

export default ResizableHandle;
