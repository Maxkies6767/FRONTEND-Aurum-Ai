import { useEffect, useRef } from "react";

export function GlobalCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const burstLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let hasMoved = false;
    let frameId: number;

    const onMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      if (!hasMoved) {
        ringX = mouseX;
        ringY = mouseY;
        hasMoved = true;
      }
    };

    const update = () => {
      const dotTransform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      const ringTransform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

      if (dotRef.current) dotRef.current.style.transform = dotTransform;
      if (ringRef.current) ringRef.current.style.transform = ringTransform;

      frameId = requestAnimationFrame(update);
    };

    const isInteractive = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      Boolean(
        target.closest("button, a, input, select, textarea, [role='button'], label, .interactive"),
      );

    const onOver = (event: MouseEvent) => {
      if (!isInteractive(event.target)) return;
      ringRef.current?.classList.add("cursor-ring-hover");
      dotRef.current?.classList.add("cursor-dot-hover");
    };

    const onOut = (event: MouseEvent) => {
      if (!isInteractive(event.target)) return;
      ringRef.current?.classList.remove("cursor-ring-hover");
      dotRef.current?.classList.remove("cursor-dot-hover");
    };

    const onDown = (event: MouseEvent) => {
      ringRef.current?.classList.add("cursor-ring-active");
      dotRef.current?.classList.add("cursor-dot-active");
      const burstLayer = burstLayerRef.current;
      if (!burstLayer) return;
      const burst = document.createElement("span");
      burst.className = "cursor-click-burst";
      burst.style.left = `${event.clientX}px`;
      burst.style.top = `${event.clientY}px`;
      burstLayer.appendChild(burst);
      window.setTimeout(() => burst.remove(), 620);
    };

    const onUp = () => {
      ringRef.current?.classList.remove("cursor-ring-active");
      dotRef.current?.classList.remove("cursor-dot-active");
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mouseout", onOut, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });
    window.addEventListener("blur", onUp);
    frameId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("blur", onUp);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <>
      <div ref={burstLayerRef} className="cursor-burst-layer" />
      <div ref={ringRef} className="cursor-ring" />
      <div ref={dotRef} className="cursor-dot" />
    </>
  );
}
