// ============================================================================
// SwipeDeleteRow — swipe left to reveal / trigger a remove action
// SortableList   — touch drag-handle reordering with optional swipe-to-delete
// ============================================================================

import React from 'react';

// ----------------------------------------------------------------------------
// SwipeDeleteRow
// ----------------------------------------------------------------------------
export function SwipeDeleteRow({ children, onDelete, disabled }) {
  const [offsetX, setOffsetX] = React.useState(0);
  const swipingRef  = React.useRef(false);
  const startXRef   = React.useRef(null);
  const startYRef   = React.useRef(null);
  const THRESHOLD   = 90;

  const onTouchStart = (e) => {
    if (disabled) return;
    const t = e.touches[0];
    startXRef.current = t.clientX;
    startYRef.current = t.clientY;
    swipingRef.current = false;
  };

  const onTouchMove = (e) => {
    if (disabled || startXRef.current === null) return;
    const dx = e.touches[0].clientX - startXRef.current;
    const dy = e.touches[0].clientY - startYRef.current;
    if (!swipingRef.current) {
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
      if (Math.abs(dy) >= Math.abs(dx)) return;
      if (dx > 0) { startXRef.current = null; return; }
      swipingRef.current = true;
    }
    e.preventDefault();
    setOffsetX(Math.max(-THRESHOLD * 1.6, dx));
  };

  const onTouchEnd = () => {
    if (!swipingRef.current) { startXRef.current = null; return; }
    swipingRef.current = false;
    startXRef.current  = null;
    if (offsetX < -THRESHOLD) {
      setOffsetX(-window.innerWidth);
      setTimeout(onDelete, 220);
    } else {
      setOffsetX(0);
    }
  };

  const onTouchCancel = () => {
    swipingRef.current = false;
    startXRef.current  = null;
    setOffsetX(0);
  };

  return (
    <div
      className="swipe-row-wrap"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchCancel}
    >
      <div className="swipe-row-bg" style={{ opacity: Math.min(1, Math.abs(offsetX) / THRESHOLD) }}>
        <span className="swipe-row-label">Remove</span>
      </div>
      <div
        className="swipe-row-content"
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: swipingRef.current ? 'none' : 'transform 260ms cubic-bezier(0.23,1,0.32,1)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// SortableList
// ----------------------------------------------------------------------------
export function SortableList({ items, keyFn, renderItem, onReorder }) {
  const [displayOrder, setDisplayOrder] = React.useState(() => items.map((_, i) => i));
  const [dragFrom, setDragFrom]         = React.useState(-1);
  const [dragOver, setDragOver]         = React.useState(-1);

  const containerRef      = React.useRef(null);
  const ghostRef          = React.useRef(null);
  const dragDataRef       = React.useRef(null);
  const displayOrderRef   = React.useRef(displayOrder);
  const itemsRef          = React.useRef(items);
  const onReorderRef      = React.useRef(onReorder);
  const ghostTopRef       = React.useRef(0);

  // Keep refs current every render
  displayOrderRef.current = displayOrder;
  itemsRef.current        = items;
  onReorderRef.current    = onReorder;

  // Reset display order when list length changes
  React.useEffect(() => {
    setDisplayOrder(items.map((_, i) => i));
  }, [items.length]);

  const orderedItems = displayOrder.map(i => items[i]);

  const startDrag = (displayIdx, touchY) => {
    const container = containerRef.current;
    if (!container) return;
    const children = [...container.children];
    const el       = children[displayIdx];
    if (!el) return;

    const rect          = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    ghostTopRef.current = rect.top;

    dragDataRef.current = {
      fromIdx:     displayIdx,
      startY:      touchY,
      itemHeight:  rect.height,
      ghostTop:    rect.top,
      ghostLeft:   containerRect.left,
      ghostWidth:  containerRect.width,
      currentOver: displayIdx,
    };

    setDragFrom(displayIdx);
    setDragOver(displayIdx);
  };

  React.useEffect(() => {
    if (dragFrom < 0) return;

    const handleMove = (e) => {
      const d = dragDataRef.current;
      if (!d) return;
      e.preventDefault();
      const touch  = e.touches[0];
      const deltaY = touch.clientY - d.startY;
      const newTop = d.ghostTop + deltaY;
      ghostTopRef.current = newTop;
      if (ghostRef.current) ghostRef.current.style.top = `${newTop}px`;

      const newOver = Math.max(0, Math.min(
        itemsRef.current.length - 1,
        Math.round(d.fromIdx + deltaY / d.itemHeight),
      ));
      if (newOver !== d.currentOver) {
        d.currentOver = newOver;
        setDragOver(newOver);
      }
    };

    const handleEnd = () => {
      const d = dragDataRef.current;
      if (!d) return;
      const { fromIdx, currentOver: toIdx } = d;
      dragDataRef.current = null;
      setDragFrom(-1);
      setDragOver(-1);

      if (fromIdx !== toIdx) {
        const currentOrder = [...displayOrderRef.current];
        const [moved] = currentOrder.splice(fromIdx, 1);
        currentOrder.splice(toIdx, 0, moved);
        const newItems = currentOrder.map(i => itemsRef.current[i]);
        setDisplayOrder(currentOrder.map((_, i) => i)); // reset to identity
        onReorderRef.current?.(newItems);
      }
    };

    window.addEventListener('touchmove',   handleMove,  { passive: false });
    window.addEventListener('touchend',    handleEnd);
    window.addEventListener('touchcancel', handleEnd);
    return () => {
      window.removeEventListener('touchmove',   handleMove);
      window.removeEventListener('touchend',    handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };
  }, [dragFrom]);

  const getItemStyle = (displayIdx) => {
    if (dragFrom < 0) return {};
    if (displayIdx === dragFrom) return { opacity: 0, pointerEvents: 'none' };
    const from = dragFrom;
    const over = dragOver;
    const h    = dragDataRef.current?.itemHeight || 68;
    if (from < over && displayIdx > from && displayIdx <= over)
      return { transform: `translateY(-${h}px)`, transition: 'transform 200ms ease' };
    if (from > over && displayIdx >= over && displayIdx < from)
      return { transform: `translateY(${h}px)`,  transition: 'transform 200ms ease' };
    return { transition: 'transform 200ms ease' };
  };

  const ghostData = dragFrom >= 0 ? dragDataRef.current : null;

  return (
    <>
      <div ref={containerRef} className="sortable-container">
        {orderedItems.map((item, displayIdx) => (
          <div key={keyFn ? keyFn(item, displayIdx) : displayIdx} style={getItemStyle(displayIdx)}>
            {renderItem(item, displayIdx, (e) => {
              e.preventDefault();
              e.stopPropagation();
              startDrag(displayIdx, e.touches[0].clientY);
            })}
          </div>
        ))}
      </div>
      {ghostData && (
        <div
          ref={ghostRef}
          className="sortable-ghost"
          style={{
            position:      'fixed',
            left:          ghostData.ghostLeft,
            width:         ghostData.ghostWidth,
            top:           ghostTopRef.current,
            height:        ghostData.itemHeight,
            zIndex:        999,
            pointerEvents: 'none',
          }}
        >
          {renderItem(orderedItems[dragFrom], dragFrom, null, true)}
        </div>
      )}
    </>
  );
}
