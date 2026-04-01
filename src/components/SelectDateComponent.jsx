import React, { useState, useRef, useMemo, useEffect } from 'react';
import Icon from './_Icon';

export default function SelectDateComponent({
    value = { start: null, end: null },
    onChange,
    placeholder = "Pilih rentang tanggal...",
    single = false,
    className = ""
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [tempRange, setTempRange] = useState({ start: null, end: null });
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const quickRanges = [
        { label: 'Hari Ini', value: 'today' },
        { label: 'Kemarin', value: 'yesterday' },
        { label: '7 Hari Terakhir', value: 'last7days' },
        { label: '30 Hari Terakhir', value: 'last30days' },
        { label: 'Bulan Ini', value: 'thisMonth' },
        { label: 'Bulan Lalu', value: 'lastMonth' },
        { label: 'Tahun Lalu', value: 'lastYear' },
    ];

    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const selectedLabel = useMemo(() => {
        if (!value?.start) return placeholder;

        const formatDate = (date) => {
            if (!date) return '';
            const d = new Date(date);
            return d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' });
        };

        if (single || !value.end) {
            return formatDate(value.start);
        }

        return `${formatDate(value.start)} - ${formatDate(value.end)}`;
    }, [value, placeholder, single]);

    const daysInMonth = useMemo(() => {
        return new Date(currentYear, currentMonth + 1, 0).getDate();
    }, [currentYear, currentMonth]);

    const firstDayOfMonth = useMemo(() => {
        return new Date(currentYear, currentMonth, 1).getDay();
    }, [currentYear, currentMonth]);

    const calendarDays = useMemo(() => {
        const days = [];
        const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            days.push({
                day: prevMonthDays - i,
                isCurrentMonth: false,
                date: new Date(currentYear, currentMonth - 1, prevMonthDays - i)
            });
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                day: i,
                isCurrentMonth: true,
                date: new Date(currentYear, currentMonth, i)
            });
        }

        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                day: i,
                isCurrentMonth: false,
                date: new Date(currentYear, currentMonth + 1, i)
            });
        }

        return days;
    }, [currentYear, currentMonth, firstDayOfMonth, daysInMonth]);

    const nextMonthCalendar = useMemo(() => {
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        const daysInNextMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
        const firstDay = new Date(nextYear, nextMonth, 1).getDay();

        const days = [];
        const prevMonthDays = new Date(nextYear, nextMonth, 0).getDate();

        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({
                day: prevMonthDays - i,
                isCurrentMonth: false,
                date: new Date(nextYear, nextMonth - 1, prevMonthDays - i)
            });
        }

        for (let i = 1; i <= daysInNextMonth; i++) {
            days.push({
                day: i,
                isCurrentMonth: true,
                date: new Date(nextYear, nextMonth, i)
            });
        }

        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                day: i,
                isCurrentMonth: false,
                date: new Date(nextYear, nextMonth + 1, i)
            });
        }

        return {
            days,
            month: nextMonth,
            year: nextYear
        };
    }, [currentMonth, currentYear]);

    const isDateInRange = (date) => {
        if (!tempRange.start) return false;

        const start = new Date(tempRange.start).setHours(0, 0, 0, 0);
        const end = tempRange.end ? new Date(tempRange.end).setHours(0, 0, 0, 0) : start;
        const current = new Date(date).setHours(0, 0, 0, 0);

        return current >= Math.min(start, end) && current <= Math.max(start, end);
    };

    const isDateSelected = (date) => {
        if (!tempRange.start) return false;

        const current = new Date(date).setHours(0, 0, 0, 0);
        const start = new Date(tempRange.start).setHours(0, 0, 0, 0);
        const end = tempRange.end ? new Date(tempRange.end).setHours(0, 0, 0, 0) : null;

        return current === start || (end && current === end);
    };

    const selectQuickRange = (range) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        switch (range) {
            case 'today':
                setTempRange({ start: new Date(), end: new Date() });
                break;
            case 'yesterday':
                setTempRange({ start: yesterday, end: yesterday });
                break;
            case 'last7days': {
                const last7 = new Date(today);
                last7.setDate(last7.getDate() - 6);
                setTempRange({ start: last7, end: today });
                break;
            }
            case 'last30days': {
                const last30 = new Date(today);
                last30.setDate(last30.getDate() - 29);
                setTempRange({ start: last30, end: today });
                break;
            }
            case 'thisMonth':
                setTempRange({
                    start: new Date(today.getFullYear(), today.getMonth(), 1),
                    end: new Date(today.getFullYear(), today.getMonth() + 1, 0)
                });
                break;
            case 'lastMonth':
                setTempRange({
                    start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
                    end: new Date(today.getFullYear(), today.getMonth(), 0)
                });
                break;
            case 'lastYear':
                setTempRange({
                    start: new Date(today.getFullYear() - 1, 0, 1),
                    end: new Date(today.getFullYear() - 1, 11, 31)
                });
                break;
            default:
                break;
        }
    };

    const selectDate = (date) => {
        if (single) {
            setTempRange({ start: date, end: null });
        } else {
            if (!tempRange.start || tempRange.end) {
                setTempRange({ start: date, end: null });
            } else {
                if (date < tempRange.start) {
                    setTempRange({ start: date, end: tempRange.start });
                } else {
                    setTempRange(prev => ({ ...prev, end: date }));
                }
            }
        }
    };

    const previousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setTempRange(value?.start ? { ...value } : { start: null, end: null });
        }
    };

    const applyRange = () => {
        if (onChange) onChange({ ...tempRange });
        setIsOpen(false);
    };

    const cancel = () => {
        setTempRange(value?.start ? { ...value } : { start: null, end: null });
        setIsOpen(false);
    };

    const clearSelection = (e) => {
        e.stopPropagation();
        if (onChange) onChange({ start: null, end: null });
    };

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div ref={dropdownRef} className={`relative w-full ${className}`}>
            {/* Input Toggle */}
            <div
                onClick={toggleDropdown}
                className={`flex items-center justify-between px-4 py-2 bg-white border rounded-xl cursor-pointer transition-all duration-300 ${isOpen
                        ? 'border-indigo-500 ring-4 ring-indigo-500/10'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
            >
                <span className={`text-[12px] font-bold truncate flex-1 ${value?.start ? 'text-slate-800' : 'text-slate-400 font-medium'}`}>
                    {selectedLabel}
                </span>

                <div className="flex items-center gap-2">
                    {value?.start && (
                        <button
                            onClick={clearSelection}
                            className="text-slate-400 hover:text-rose-500 transition-colors p-0.5"
                        >
                            <Icon name="X" size={14} />
                        </button>
                    )}
                    <Icon name="CalendarDays" size={16} className="text-slate-400 group-hover:text-indigo-500" />
                </div>
            </div>

            {/* Dropdown Panel */}
            {isOpen && (
                <div
                    className="absolute z-50 mt-2 bg-white border border-slate-100 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                    style={{ width: 'max-content', minWidth: '700px', right: 0 }}
                >
                    <div className="flex">
                        {/* Quick Ranges Sidebar */}
                        <div className="w-48 bg-slate-50/50 border-r border-slate-100 p-4">
                            <div className="space-y-1">
                                {quickRanges.map((range) => (
                                    <button
                                        key={range.value}
                                        onClick={() => selectQuickRange(range.value)}
                                        className="w-full text-left px-3 py-2 text-[12px] font-bold text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                                    >
                                        {range.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Calendars Area */}
                        <div className="flex-1 p-5">
                            {/* Header Navigator */}
                            <div className="flex items-center justify-between mb-4">
                                <button onClick={previousMonth} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                                    <Icon name="ChevronLeft" size={18} />
                                </button>

                                <div className="flex-1 text-center">
                                    <span className="text-[13px] font-bold text-slate-800">
                                        {months[currentMonth]} {currentYear} <span className="text-slate-300 mx-2">&mdash;</span> {months[nextMonthCalendar.month]} {nextMonthCalendar.year}
                                    </span>
                                </div>

                                <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                                    <Icon name="ChevronRight" size={18} />
                                </button>
                            </div>

                            {/* Grid 2 Months */}
                            <div className="flex gap-6">
                                {/* Current Month */}
                                <div className="flex-1">
                                    <div className="text-center text-[12px] font-black text-slate-800 mb-3 tracking-wide">
                                        {months[currentMonth]} {currentYear}
                                    </div>
                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                        {['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mg'].map(day => (
                                            <div key={day} className="text-center text-[11px] font-bold text-slate-400 py-1">
                                                {day}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7 gap-y-1">
                                        {calendarDays.map((day, index) => {
                                            const selected = isDateSelected(day.date);
                                            const inRange = isDateInRange(day.date);
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => selectDate(day.date)}
                                                    className={`aspect-square flex items-center justify-center text-[12px] font-bold rounded-full transition-all duration-200 outline-none
                            ${!day.isCurrentMonth ? 'text-slate-300' : 'text-slate-700'}
                            ${selected ? 'bg-indigo-600 !text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-600 ring-offset-1' : ''}
                            ${inRange && !selected ? 'bg-indigo-50 !text-indigo-700 rounded-none' : ''}
                            ${!selected && !inRange && day.isCurrentMonth ? 'hover:bg-slate-100 hover:text-slate-900 group-focus-visible:ring-2' : ''}
                          `}
                                                >
                                                    {day.day}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Next Month */}
                                <div className="flex-1">
                                    <div className="text-center text-[12px] font-black text-slate-800 mb-3 tracking-wide">
                                        {months[nextMonthCalendar.month]} {nextMonthCalendar.year}
                                    </div>
                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                        {['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mg'].map(day => (
                                            <div key={day} className="text-center text-[11px] font-bold text-slate-400 py-1">
                                                {day}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7 gap-y-1">
                                        {nextMonthCalendar.days.map((day, index) => {
                                            const selected = isDateSelected(day.date);
                                            const inRange = isDateInRange(day.date);
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => selectDate(day.date)}
                                                    className={`aspect-square flex items-center justify-center text-[12px] font-bold rounded-full transition-all duration-200 outline-none
                            ${!day.isCurrentMonth ? 'text-slate-300' : 'text-slate-700'}
                            ${selected ? 'bg-indigo-600 !text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-600 ring-offset-1' : ''}
                            ${inRange && !selected ? 'bg-indigo-50 !text-indigo-700 rounded-none' : ''}
                            ${!selected && !inRange && day.isCurrentMonth ? 'hover:bg-slate-100 hover:text-slate-900 group-focus-visible:ring-2' : ''}
                          `}
                                                >
                                                    {day.day}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Footer */}
                    <div className="flex items-center justify-end space-x-3 px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                        <button
                            onClick={cancel}
                            className="px-4 py-2 text-[12px] font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={applyRange}
                            className="px-5 py-2 text-[12px] font-bold bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95"
                        >
                            Terapkan
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
