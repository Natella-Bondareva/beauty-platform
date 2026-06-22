import { useRef } from 'react';

const accent = '#D57A66';
const peach = '#FFD1B3';

export default function CodeInput({ value, onChange, autoFocus, margin = '24px 0' }) {
  const refs = useRef([]);
  const digits = value.padEnd(4, ' ').split('');

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[i] && digits[i] !== ' ') {
        onChange(value.slice(0, i) + value.slice(i + 1));
      } else if (i > 0) {
        onChange(value.slice(0, i - 1) + value.slice(i));
        refs.current[i - 1]?.focus();
      }
      return;
    }
    if (!/\d/.test(e.key)) return;
    e.preventDefault();
    const next = value.slice(0, i) + e.key + value.slice(i + 1);
    onChange(next.slice(0, 4));
    if (i < 3) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    onChange(pasted);
    refs.current[Math.min(pasted.length, 3)]?.focus();
  };

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin }}>
      {[0, 1, 2, 3].map((i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
            if (i === 0 && autoFocus && el) el.focus();
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] === ' ' ? '' : digits[i]}
          onChange={() => {}}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          style={{
            width: 48,
            height: 52,
            padding: 0,
            boxSizing: 'border-box',
            textAlign: 'center',
            fontSize: 20,
            fontWeight: 700,
            borderRadius: 12,
            border: `2px solid ${digits[i] && digits[i] !== ' ' ? accent : peach}`,
            outline: 'none',
            color: '#1E293B',
            background: '#fff',
            transition: 'border-color 0.15s',
            lineHeight: '48px',
          }}
        />
      ))}
    </div>
  );
}
