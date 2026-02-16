import { useState } from "react";
import { Calculator as CalcIcon, X } from "lucide-react";

export function Calculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [resetDisplay, setResetDisplay] = useState(false);

  const handleNumber = (num: string) => {
    if (resetDisplay) {
      setDisplay(num);
      setResetDisplay(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const handleOperation = (op: string) => {
    const current = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(current);
    } else if (operation) {
      const result = calculate(previousValue, current, operation);
      setDisplay(result.toString());
      setPreviousValue(result);
    }

    setOperation(op);
    setResetDisplay(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "*": return a * b;
      case "/": return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (previousValue !== null && operation) {
      const current = parseFloat(display);
      const result = calculate(previousValue, current, operation);
      setDisplay(result.toString());
      setPreviousValue(null);
      setOperation(null);
      setResetDisplay(true);
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setResetDisplay(false);
  };

  const handleDecimal = () => {
    if (resetDisplay) {
      setDisplay("0.");
      setResetDisplay(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-24 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 shadow-xl transition-all hover:scale-105 active:scale-95"
        aria-label="Calcolatrice"
      >
        <CalcIcon className="h-6 w-6 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xs rounded-2xl bg-card p-4 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Calcolatrice</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1 transition-all hover:bg-muted active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Display */}
        <div className="mb-4 rounded-lg bg-muted p-4">
          <div className="text-right text-2xl font-bold">{display}</div>
          {operation && (
            <div className="text-right text-xs text-muted-foreground">
              {previousValue} {operation}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={handleClear}
            className="col-span-2 rounded-lg bg-red-500 p-4 font-semibold text-white transition-all active:scale-95"
          >
            C
          </button>
          <button
            onClick={() => handleOperation("/")}
            className="rounded-lg bg-muted p-4 font-semibold transition-all active:scale-95"
          >
            ÷
          </button>
          <button
            onClick={() => handleOperation("*")}
            className="rounded-lg bg-muted p-4 font-semibold transition-all active:scale-95"
          >
            ×
          </button>

          {["7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => handleNumber(num)}
              className="rounded-lg bg-card p-4 font-semibold shadow-sm transition-all active:scale-95"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleOperation("-")}
            className="rounded-lg bg-muted p-4 font-semibold transition-all active:scale-95"
          >
            -
          </button>

          {["4", "5", "6"].map((num) => (
            <button
              key={num}
              onClick={() => handleNumber(num)}
              className="rounded-lg bg-card p-4 font-semibold shadow-sm transition-all active:scale-95"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleOperation("+")}
            className="rounded-lg bg-muted p-4 font-semibold transition-all active:scale-95"
          >
            +
          </button>

          {["1", "2", "3"].map((num) => (
            <button
              key={num}
              onClick={() => handleNumber(num)}
              className="rounded-lg bg-card p-4 font-semibold shadow-sm transition-all active:scale-95"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleEquals}
            className="row-span-2 rounded-lg bg-green-500 p-4 font-semibold text-white transition-all active:scale-95"
          >
            =
          </button>

          <button
            onClick={() => handleNumber("0")}
            className="col-span-2 rounded-lg bg-card p-4 font-semibold shadow-sm transition-all active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleDecimal}
            className="rounded-lg bg-card p-4 font-semibold shadow-sm transition-all active:scale-95"
          >
            .
          </button>
        </div>
      </div>
    </div>
  );
}
