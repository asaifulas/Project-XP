import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

function formatForDisplay(value) {
  if (!Number.isFinite(value)) return 'Cannot divide by zero'
  if (Object.is(value, -0)) return '0'

  const abs = Math.abs(value)
  if (abs !== 0 && (abs >= 1e12 || abs < 1e-9)) {
    return value.toExponential(10).replace(/\.?0+e/, 'e')
  }

  const s = String(value)
  if (s.length <= 14) return s
  return Number(value.toPrecision(12)).toString()
}

function parseNumber(input) {
  if (input === '' || input === '-' || input === '.') return 0
  if (input === '-.') return -0
  const n = Number(input)
  return Number.isFinite(n) ? n : 0
}

function calcBinary(op, a, b) {
  switch (op) {
    case '+':
      return a + b
    case '-':
      return a - b
    case '*':
      return a * b
    case '/':
      return b === 0 ? Number.POSITIVE_INFINITY : a / b
    default:
      return b
  }
}

function KeyButton({
  label,
  onPress,
  variant = 'default',
  className = '',
  title,
  disabled,
}) {
  const base =
    'h-8 select-none rounded-[3px] border border-[#7f9db9] bg-[#ece9d8] text-[12px] leading-none shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#aca899] active:shadow-[inset_2px_2px_2px_rgba(0,0,0,0.25)]'
  const variants = {
    default: 'text-[#0b0b0b]',
    number: 'text-[#1b4fbf] font-semibold',
    danger: 'text-[#c01010] font-semibold',
    op: 'text-[#0b0b0b] font-semibold',
  }

  return (
    <button
      type="button"
      className={[base, variants[variant] ?? variants.default, className]
        .filter(Boolean)
        .join(' ')}
      onClick={onPress}
      title={title ?? label}
      disabled={disabled}
    >
      {label}
    </button>
  )
}

export default function CalculatorApp({ keyboardActive = true }) {
  const keyboardRootRef = useRef(null)
  const [error, setError] = useState(null)
  const [entry, setEntry] = useState('0')
  const [acc, setAcc] = useState(null)
  const [pendingOp, setPendingOp] = useState(null)
  const [overwrite, setOverwrite] = useState(true)
  const [memory, setMemory] = useState(0)
  const [lastOp, setLastOp] = useState(null)
  const [lastOperand, setLastOperand] = useState(null)
  const entryRef = useRef(entry)

  useEffect(() => {
    entryRef.current = entry
  }, [entry])

  const display = useMemo(() => {
    if (error) return error
    return entry
  }, [entry, error])

  function setEntryFromNumber(n) {
    const next = formatForDisplay(n)
    if (next === 'Cannot divide by zero') {
      setError(next)
      setEntry('0')
      setAcc(null)
      setPendingOp(null)
      setLastOp(null)
      setLastOperand(null)
      setOverwrite(true)
      return
    }
    setEntry(next)
  }

  const clearAll = useCallback(() => {
    setError(null)
    setEntry('0')
    setAcc(null)
    setPendingOp(null)
    setOverwrite(true)
    setLastOp(null)
    setLastOperand(null)
  }, [])

  const clearEntry = useCallback(() => {
    setError(null)
    setEntry('0')
    setOverwrite(true)
  }, [])

  const backspace = useCallback(() => {
    if (error) return
    if (overwrite) return
    setEntry((prev) => {
      if (prev.length <= 1) return '0'
      if (prev.length === 2 && prev.startsWith('-')) return '0'
      const next = prev.slice(0, -1)
      if (next === '-' || next === '' || next === '-.') return '0'
      return next
    })
  }, [error, overwrite])

  const inputDigit = useCallback(
    (d) => {
      if (error) return
      setEntry((prev) => {
        if (overwrite) return d
        if (prev === '0') return d
        if (prev === '-0') return `-${d}`
        if (prev.length >= 18) return prev
        return prev + d
      })
      setOverwrite(false)
    },
    [error, overwrite],
  )

  const inputDot = useCallback(() => {
    if (error) return
    setEntry((prev) => {
      if (overwrite) return '0.'
      if (prev.includes('.')) return prev
      return prev + '.'
    })
    setOverwrite(false)
  }, [error, overwrite])

  const commitPending = useCallback(
    (nextOp) => {
      if (error) return
      const current = parseNumber(entryRef.current)

      if (pendingOp && acc != null && !overwrite) {
        const result = calcBinary(pendingOp, acc, current)
        setEntryFromNumber(result)
        setAcc(result)
      } else if (acc == null) {
        setAcc(current)
      }

      setPendingOp(nextOp)
      setOverwrite(true)
      setLastOp(null)
      setLastOperand(null)
    },
    [acc, error, overwrite, pendingOp],
  )

  const equals = useCallback(() => {
    if (error) return

    const current = parseNumber(entryRef.current)

    if (pendingOp && acc != null) {
      const operand = overwrite ? acc : current
      const result = calcBinary(pendingOp, acc, operand)
      setEntryFromNumber(result)
      setAcc(result)
      setPendingOp(null)
      setOverwrite(true)
      setLastOp(pendingOp)
      setLastOperand(operand)
      return
    }

    if (lastOp && acc != null && lastOperand != null) {
      const result = calcBinary(lastOp, acc, lastOperand)
      setEntryFromNumber(result)
      setAcc(result)
      setOverwrite(true)
    }
  }, [acc, error, lastOp, lastOperand, overwrite, pendingOp])

  function toggleSign() {
    if (error) return
    setEntry((prev) => {
      if (prev === '0') return prev
      if (prev.startsWith('-')) return prev.slice(1)
      return `-${prev}`
    })
  }

  function unary(fn) {
    if (error) return
    const current = parseNumber(entryRef.current)
    const next = fn(current)
    setEntryFromNumber(next)
    setOverwrite(true)
  }

  function percent() {
    if (error) return
    const current = parseNumber(entryRef.current)
    if (pendingOp && acc != null) {
      setEntryFromNumber((acc * current) / 100)
      setOverwrite(false)
      return
    }
    setEntryFromNumber(current / 100)
    setOverwrite(false)
  }

  useLayoutEffect(() => {
    if (!keyboardActive) return
    keyboardRootRef.current?.focus({ preventScroll: true })
  }, [keyboardActive])

  useEffect(() => {
    if (!keyboardActive) return undefined

    function shouldIgnoreTarget(target) {
      if (!(target instanceof Element)) return false
      return Boolean(
        target.closest(
          'input:not([type="button"]):not([type="submit"]):not([type="reset"]), textarea, select, [contenteditable="true"]',
        ),
      )
    }

    function onKeyDown(e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      if (shouldIgnoreTarget(e.target)) return

      const numpadDigit = /^Numpad([0-9])$/.exec(e.code)?.[1]
      if (numpadDigit) {
        e.preventDefault()
        e.stopPropagation()
        inputDigit(numpadDigit)
        return
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault()
        e.stopPropagation()
        inputDigit(e.key)
        return
      }

      if (e.key === '.' || e.code === 'NumpadDecimal') {
        e.preventDefault()
        e.stopPropagation()
        inputDot()
        return
      }

      if (e.key === 'Backspace') {
        e.preventDefault()
        e.stopPropagation()
        backspace()
        return
      }

      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        clearAll()
        return
      }

      if (e.key === 'Delete') {
        e.preventDefault()
        e.stopPropagation()
        clearEntry()
        return
      }

      if (e.key === 'Enter' || e.key === '=' || e.code === 'NumpadEnter') {
        e.preventDefault()
        e.stopPropagation()
        equals()
        return
      }

      const ops = {
        '+': '+',
        '-': '-',
        '*': '*',
        '/': '/',
      }
      const opByCode = {
        NumpadAdd: '+',
        NumpadSubtract: '-',
        NumpadMultiply: '*',
        NumpadDivide: '/',
      }
      const op = ops[e.key] ?? opByCode[e.code]
      if (op) {
        e.preventDefault()
        e.stopPropagation()
        commitPending(op)
      }
    }

    window.addEventListener('keydown', onKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true })
  }, [
    keyboardActive,
    backspace,
    clearAll,
    clearEntry,
    commitPending,
    equals,
    inputDigit,
    inputDot,
  ])

  return (
    <div
      ref={keyboardRootRef}
      tabIndex={-1}
      data-calculator-keyboard-root
      className="outline-none focus-visible:ring-2 focus-visible:ring-[#316ac5]/40"
      aria-label="Calculator"
    >
      <div className="flex items-center gap-4 border-b border-black/20 bg-[#ece9d8] px-2 py-1 text-[11px] text-black">
            <button type="button" className="rounded px-1 hover:bg-black/10">
              Edit
            </button>
            <button type="button" className="rounded px-1 hover:bg-black/10">
              View
            </button>
            <button type="button" className="rounded px-1 hover:bg-black/10">
              Help
            </button>
          </div>

          <div className="mt-2 rounded border border-[#7f9db9] bg-white p-1 shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#aca899]">
            <div className="flex items-center justify-between border border-[#404040] bg-[#f7fbff] px-2 py-2 font-xp text-[18px] leading-none text-black">
              <span className="w-5 text-[11px] text-zinc-600" aria-hidden>
                {Math.abs(memory) > 0 ? 'M' : ''}
              </span>
              <span className="min-h-[18px] flex-1 text-right tabular-nums">
                {display}
              </span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-6 gap-2">
            <span
              aria-hidden
              className="h-8 rounded-[3px] border border-[#7f9db9] bg-[#ece9d8] shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#aca899]"
            />
            <KeyButton
              label="Backspace"
              variant="danger"
              className="col-span-2"
              onPress={backspace}
            />
            <KeyButton label="CE" variant="danger" onPress={clearEntry} />
            <KeyButton label="C" variant="danger" onPress={clearAll} />
            <span aria-hidden className="h-8" />

            <KeyButton label="MC" onPress={() => setMemory(0)} title="Memory Clear" />
            <KeyButton label="7" variant="number" onPress={() => inputDigit('7')} />
            <KeyButton label="8" variant="number" onPress={() => inputDigit('8')} />
            <KeyButton label="9" variant="number" onPress={() => inputDigit('9')} />
            <KeyButton label="/" variant="op" onPress={() => commitPending('/')} />
            <KeyButton label="sqrt" variant="op" onPress={() => unary(Math.sqrt)} />

            <KeyButton
              label="MR"
              onPress={() => {
                if (error) return
                setError(null)
                setEntryFromNumber(memory)
                setOverwrite(true)
              }}
              title="Memory Recall"
            />
            <KeyButton label="4" variant="number" onPress={() => inputDigit('4')} />
            <KeyButton label="5" variant="number" onPress={() => inputDigit('5')} />
            <KeyButton label="6" variant="number" onPress={() => inputDigit('6')} />
            <KeyButton label="*" variant="op" onPress={() => commitPending('*')} />
            <KeyButton label="%" variant="op" onPress={percent} />

            <KeyButton
              label="MS"
              onPress={() => {
                if (error) return
                setMemory(parseNumber(entryRef.current))
                setOverwrite(true)
              }}
              title="Memory Store"
            />
            <KeyButton label="1" variant="number" onPress={() => inputDigit('1')} />
            <KeyButton label="2" variant="number" onPress={() => inputDigit('2')} />
            <KeyButton label="3" variant="number" onPress={() => inputDigit('3')} />
            <KeyButton label="-" variant="op" onPress={() => commitPending('-')} />
            <KeyButton label="1/x" variant="op" onPress={() => unary((v) => 1 / v)} />

            <KeyButton
              label="M+"
              onPress={() => {
                if (error) return
                setMemory((m) => m + parseNumber(entryRef.current))
                setOverwrite(true)
              }}
              title="Memory Add"
            />
            <KeyButton label="0" variant="number" onPress={() => inputDigit('0')} />
            <KeyButton label="+/-" variant="op" onPress={toggleSign} />
            <KeyButton label="." variant="op" onPress={inputDot} />
            <KeyButton label="+" variant="op" onPress={() => commitPending('+')} />
            <KeyButton label="=" variant="op" onPress={equals} />
          </div>
    </div>
  )
}

