"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DatePickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ value, onChange, placeholder = "Sélectionner une date", className = "" }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverStyle, setPopoverStyle] = useState({});

  // Parse current value or use today
  const initialDate = value ? new Date(value) : new Date();
  const [currentMonth, setCurrentMonth] = useState(initialDate);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current && !containerRef.current.contains(event.target as Node) &&
        popoverRef.current && !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Update position on scroll or resize when open
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const popoverHeight = 360; // Estimated height of the DatePicker popover

        if (spaceBelow < popoverHeight && rect.top > popoverHeight) {
          // Open upwards if not enough space below but enough space above
          setPopoverStyle({
            top: rect.top - popoverHeight - 8,
            left: rect.left,
          });
        } else {
          // Default: open downwards
          setPopoverStyle({
            top: rect.bottom + 8,
            left: rect.left,
          });
        }
      }
    };

    updatePosition();
    
    if (isOpen) {
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  // Adjust so Monday is 0, Sunday is 6
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const selectDate = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // Adjust to local timezone to prevent offset issues
    const offset = d.getTimezoneOffset() * 60000;
    const localDate = new Date(d.getTime() - offset);
    onChange(localDate.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const vDate = new Date(value);
    return vDate.getDate() === day && vDate.getMonth() === currentMonth.getMonth() && vDate.getFullYear() === currentMonth.getFullYear();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === currentMonth.getMonth() && today.getFullYear() === currentMonth.getFullYear();
  };

  // Render grid
  const renderGrid = () => {
    const grid = [];
    // Empty cells
    for (let i = 0; i < startDay; i++) {
      grid.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }
    // Days
    for (let i = 1; i <= daysInMonth; i++) {
      const selected = isSelected(i);
      const today = isToday(i);
      grid.push(
        <button
          key={i}
          onClick={(e) => { e.preventDefault(); selectDate(i); }}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
            ${selected ? 'bg-white border border-primary/40 text-primary hover:bg-primary hover:text-white hover:border-primary shadow-md' : 'text-slate-700 hover:bg-slate-100'}
            ${today && !selected ? 'border border-primary text-primary' : ''}
          `}
        >
          {i}
        </button>
      );
    }
    return grid;
  };

  // Format displayed value
  const displayValue = value ? new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : "";

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer flex items-center justify-between transition-all ${className} ${isOpen ? 'ring-2 ring-primary/20' : ''}`}
      >
        <span className={value ? "text-slate-900" : "text-slate-400"}>
          {value ? displayValue : placeholder}
        </span>
        <CalendarIcon className="h-4 w-4 text-slate-400" />
      </div>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={popoverRef}
              style={popoverStyle}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="fixed z-[9999] bg-white rounded-2xl shadow-[0_12px_24px_-8px_rgba(0,0,0,0.15)] border border-slate-100 p-4 w-[280px]"
            >
              <div className="flex items-center justify-between mb-4">
                <button onClick={(e) => { e.preventDefault(); prevMonth(); }} className="p-2 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors border border-slate-100 shadow-sm">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="font-bold text-slate-900">
                  {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </div>
                <button onClick={(e) => { e.preventDefault(); nextMonth(); }} className="p-2 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors border border-slate-100 shadow-sm">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {days.map(d => (
                  <div key={d} className="text-xs font-semibold text-slate-400 w-8 h-8 flex items-center justify-center">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 place-items-center">
                {renderGrid()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
