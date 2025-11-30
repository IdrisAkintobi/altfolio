import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

interface DropdownMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && buttonRef.current && menuRef.current) {
      // Use requestAnimationFrame to ensure the menu is rendered
      requestAnimationFrame(() => {
        if (!buttonRef.current || !menuRef.current) return;
        
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const menuHeight = menuRef.current.offsetHeight;
        
        // Find the nearest scrollable parent (table container)
        let scrollParent = buttonRef.current.parentElement;
        while (scrollParent) {
          const style = window.getComputedStyle(scrollParent);
          const overflowY = style.overflowY;
          if (overflowY === 'auto' || overflowY === 'scroll' || scrollParent.tagName === 'TABLE') {
            break;
          }
          scrollParent = scrollParent.parentElement;
        }
        
        // Use viewport if no scrollable parent found
        const containerRect = scrollParent?.getBoundingClientRect() || {
          top: 0,
          bottom: window.innerHeight,
        };
        
        // Calculate space below and above within the container
        const spaceBelow = containerRect.bottom - buttonRect.bottom - 8; // 8px margin
        const spaceAbove = buttonRect.top - containerRect.top - 8; // 8px margin
        
        // Open upward if not enough space below but enough space above
        setOpenUpward(spaceBelow < menuHeight && spaceAbove >= menuHeight);
      });
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-slate-800 rounded transition-colors"
      >
        <MoreVertical className="w-4 h-4 text-slate-400" />
      </button>

      {isOpen && (
        <div 
          ref={menuRef}
          className={`absolute right-0 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 py-1 ${
            openUpward ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick();
                  setIsOpen(false);
                }
              }}
              disabled={item.disabled}
              className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                item.className || 'text-slate-300'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
