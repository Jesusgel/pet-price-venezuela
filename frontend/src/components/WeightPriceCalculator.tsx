'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale } from 'lucide-react';
import { formatBs, formatUSD } from '@/utils/currency';

interface WeightPriceCalculatorProps {
  priceUsd: number;
  weightKg: number;
  rate: number | null;
  productName: string;
}

interface WeightPreset {
  label: string;
  sublabel: string;
  valueKg: number;
}

const WEIGHT_PRESETS: WeightPreset[] = [
  { label: '250g', sublabel: '¼ kg', valueKg: 0.25 },
  { label: '500g', sublabel: '½ kg', valueKg: 0.5 },
  { label: '1 kg', sublabel: '', valueKg: 1 },
  { label: '2 kg', sublabel: '', valueKg: 2 },
];

export function WeightPriceCalculator({
  priceUsd,
  weightKg,
  rate,
  productName,
}: WeightPriceCalculatorProps) {
  const [weightInput, setWeightInput] = useState<string>('');
  const [activePreset, setActivePreset] = useState<number | null>(null);

  const pricePerKgUsd = priceUsd / weightKg;

  // Peso activo: lo que esté en el input (escrito o puesto por un preset)
  const activeWeightKg = weightInput ? parseFloat(weightInput) : null;
  const isValidWeight =
    activeWeightKg !== null && activeWeightKg > 0 && !isNaN(activeWeightKg);

  const targetPriceUsd = isValidWeight ? pricePerKgUsd * activeWeightKg! : null;
  const targetPriceBs =
    targetPriceUsd !== null && rate ? targetPriceUsd * rate : null;

  // Etiqueta legible del peso seleccionado
  const activeWeightLabel =
    activePreset !== null
      ? WEIGHT_PRESETS[activePreset].label
      : weightInput
        ? `${weightInput} kg`
        : '';

  const handlePresetClick = (index: number) => {
    const preset = WEIGHT_PRESETS[index];
    setWeightInput(String(preset.valueKg));
    setActivePreset(index);
  };

  const handleInputChange = (value: string) => {
    // Permitir solo números y un punto decimal
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setWeightInput(value);
      // Resaltar preset si el valor coincide exactamente
      const matchIndex = WEIGHT_PRESETS.findIndex(
        (p) => String(p.valueKg) === value
      );
      setActivePreset(matchIndex >= 0 ? matchIndex : null);
    }
  };

  return (
    <div
      className="bg-gradient-to-br from-surface-container-low to-surface-container
                  rounded-2xl p-4 sm:p-5 border border-border shadow-xs space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Scale className="w-4 h-4 text-secondary" />
        <h3 className="text-sm font-bold text-primary font-display">
          Calculadora de Precio por Peso
        </h3>
      </div>

      {/* Precio por kg de referencia */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
        <span>Precio por kg:</span>
        <span className="font-bold text-primary">{formatUSD(pricePerKgUsd)}</span>
        {rate && (
          <>
            <span>·</span>
            <span className="font-bold text-secondary">
              {formatBs(pricePerKgUsd * rate)}
            </span>
          </>
        )}
      </div>

      {/* INPUT PRINCIPAL — El usuario escribe el peso deseado */}
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          placeholder="Escribe el peso deseado"
          value={weightInput}
          onChange={(e) => handleInputChange(e.target.value)}
          className="w-full pl-4 pr-12 py-3 rounded-xl border-2 border-border bg-white
                     text-base font-semibold text-foreground placeholder:text-outline
                     focus:outline-none focus:ring-2 focus:ring-secondary/25
                     focus:border-secondary transition-all"
        />
        <span
          className="absolute right-4 top-1/2 -translate-y-1/2 text-sm
                       font-bold text-muted-foreground pointer-events-none"
        >
          kg
        </span>
      </div>

      {/* Botones preset — atajos que rellenan el input */}
      <div className="grid grid-cols-4 gap-2">
        {WEIGHT_PRESETS.map((preset, index) => (
          <button
            key={preset.label}
            onClick={() => handlePresetClick(index)}
            className={`flex flex-col items-center justify-center py-2 px-1.5
                       rounded-xl border text-xs font-bold transition-all duration-200
                       ${
                         activePreset === index
                           ? 'bg-secondary text-white border-secondary shadow-md'
                           : 'bg-white text-primary border-border hover:border-secondary/50 hover:shadow-sm'
                       }`}
          >
            <span className="text-sm">{preset.label}</span>
            {preset.sublabel && (
              <span
                className={`text-[10px] font-medium mt-0.5 ${
                  activePreset === index ? 'text-white/80' : 'text-muted-foreground'
                }`}
              >
                {preset.sublabel}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* RESULTADO — Muestra USD y VES simultáneamente */}
      <AnimatePresence mode="wait">
        {isValidWeight && targetPriceUsd !== null && (
          <motion.div
            key={activeWeightKg}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white rounded-xl p-4 border border-secondary/20 shadow-xs"
          >
            <p className="text-xs text-muted-foreground mb-3">
              {activeWeightLabel} de &quot;{productName}&quot;
            </p>

            {/* Ambas monedas lado a lado */}
            <div className="grid grid-cols-2 gap-3">
              {/* Precio USD */}
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                  Dólar
                </span>
                <span className="text-xl font-black text-primary font-display">
                  {formatUSD(targetPriceUsd)}
                </span>
              </div>

              {/* Precio VES */}
              <div className="flex flex-col items-end text-right">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                  Bolívares
                </span>
                {targetPriceBs !== null ? (
                  <span className="text-xl font-black text-secondary font-display">
                    {formatBs(targetPriceBs)}
                  </span>
                ) : (
                  <span className="text-sm text-outline italic">
                    Tasa no disponible
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
