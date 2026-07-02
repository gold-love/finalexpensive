import React, { useState, useEffect, useRef } from 'react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DatePickerCalendar = ({ value, onChange, placeholder = 'mm/dd/yyyy', id, name, style, dropDirection = 'auto' }) => {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [dropUp, setDropUp] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [yearPickerStart, setYearPickerStart] = useState(Math.floor(new Date().getFullYear() / 10) * 10);
  const wrapperRef = useRef(null);
  const calRef = useRef(null);

  // Parse current value
  const selected = value ? new Date(value + 'T00:00:00') : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // When value changes externally, sync the view
  useEffect(() => {
    if (selected) {
      setViewYear(selected.getFullYear());
      setViewMonth(selected.getMonth());
    }
  }, [value]);

  // Scroll to selected year when year picker opens
  useEffect(() => {
    if (showYearPicker && calRef.current) {
      setTimeout(() => {
        const selectedBtn = calRef.current.querySelector('.dp-year-btn--selected');
        if (selectedBtn) {
          selectedBtn.scrollIntoView({ block: 'center' });
        }
      }, 0);
    }
  }, [showYearPicker]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Determine if calendar should open upward
  useEffect(() => {
    if (open && wrapperRef.current) {
      if (dropDirection === 'down') {
        setDropUp(false);
      } else if (dropDirection === 'up') {
        setDropUp(true);
      } else {
        const rect = wrapperRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setDropUp(spaceBelow < 360);
      }
    }
  }, [open, dropDirection]);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfWeek = (year, month) => new Date(year, month, 1).getDay();

  const MIN_YEAR = 1900;
  const MAX_YEAR = 2100;
  const yearValues = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, idx) => MIN_YEAR + idx);
  const yearOptions = yearValues.includes(viewYear)
    ? yearValues
    : [...yearValues, viewYear].sort((a, b) => a - b);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const toggleYearPicker = () => {
    setShowYearPicker(!showYearPicker);
  };

  const handleYearSelect = (year) => {
    setViewYear(year);
    setShowYearPicker(false);
  };

  const prevYearDecade = () => {
    setYearPickerStart(s => s - 10);
  };

  const nextYearDecade = () => {
    setYearPickerStart(s => s + 10);
  };

  const handleYearChange = (event) => {
    setViewYear(Number(event.target.value));
  };

  const handleSelect = (day) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const formatted = `${viewYear}-${mm}-${dd}`;
    // Emit a synthetic event compatible with existing onChange handlers
    if (onChange) {
      if (name) {
        onChange({ target: { name, value: formatted, type: 'text' } });
      } else {
        onChange({ target: { value: formatted } });
      }
    }
    setOpen(false);
  };

  const clearDate = (e) => {
    e.stopPropagation();
    if (onChange) {
      if (name) {
        onChange({ target: { name, value: '', type: 'text' } });
      } else {
        onChange({ target: { value: '' } });
      }
    }
  };

  // Build calendar grid
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isSelected = (day) => {
    if (!selected || !day) return false;
    return selected.getFullYear() === viewYear && selected.getMonth() === viewMonth && selected.getDate() === day;
  };
  const isToday = (day) => {
    if (!day) return false;
    return today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
  };

  const displayValue = selected
    ? `${String(selected.getMonth() + 1).padStart(2, '0')}/${String(selected.getDate()).padStart(2, '0')}/${selected.getFullYear()}`
    : '';

  return (
    <div ref={wrapperRef} className="dp-wrapper" style={style}>
      {/* Trigger */}
      <div
        className={`dp-trigger form-control${open ? ' dp-trigger--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        id={id}
        tabIndex={0}
        role="button"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={`dp-trigger__text${!displayValue ? ' dp-trigger__placeholder' : ''}`}>
          {displayValue || placeholder}
        </span>
        {value && (
          <button className="dp-trigger__clear" onClick={clearDate} title="Clear date" aria-label="Clear date">✕</button>
        )}
        <span className="dp-trigger__icon">📅</span>
      </div>

      {/* Dropdown calendar */}
      {open && (
        <div ref={calRef} className={`dp-calendar${dropUp ? ' dp-calendar--up' : ''}`}>
          {/* Header */}
          <div className="dp-header">
            <div className="dp-header__title" onClick={toggleYearPicker} style={{ cursor: 'pointer', padding: 0 }}>
              {!showYearPicker ? (
                <>
                  <span className="dp-header__month" style={{ display: 'inline', fontWeight: 700, fontSize: '15px' }}>{MONTH_NAMES[viewMonth]}</span>
                  <span className="dp-header__year" style={{ display: 'inline', marginLeft: '4px', fontWeight: 700, fontSize: '15px' }}>{viewYear}</span>
                  <span style={{ fontSize: '10px', marginLeft: '6px' }}>▼</span>
                </>
              ) : (
                <span className="dp-header__decade" style={{ fontWeight: 700, fontSize: '15px' }}>Select Year</span>
              )}
            </div>
            {!showYearPicker && (
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="dp-nav-btn" onClick={prevMonth} aria-label="Previous month" style={{ fontSize: '16px' }}>↑</button>
                <button className="dp-nav-btn" onClick={nextMonth} aria-label="Next month" style={{ fontSize: '16px' }}>↓</button>
              </div>
            )}
          </div>

          {/* Year Picker */}
          {showYearPicker && (
            <div className="dp-grid dp-year-grid" style={{ maxHeight: '250px', overflowY: 'auto' }}>
              {yearOptions.map(year => (
                <button
                  key={year}
                  className={`dp-year-btn ${year === viewYear ? 'dp-year-btn--selected' : ''}`}
                  onClick={() => handleYearSelect(year)}
                >
                  {year}
                </button>
              ))}
            </div>
          )}

          {/* Days grid */}
          {!showYearPicker && (
          <div className="dp-grid">
            {cells.map((day, i) => (
              <button
                key={i}
                className={
                  'dp-day' +
                  (day ? '' : ' dp-day--empty') +
                  (isSelected(day) ? ' dp-day--selected' : '') +
                  (isToday(day) ? ' dp-day--today' : '')
                }
                disabled={!day}
                onClick={() => day && handleSelect(day)}
                tabIndex={day ? 0 : -1}
              >
                {day || ''}
              </button>
            ))}
          </div>
          )}

        </div>
      )}
    </div>
  );
};

export default DatePickerCalendar;
