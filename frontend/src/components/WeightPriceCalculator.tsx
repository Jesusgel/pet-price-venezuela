'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale } from 'lucide-react';
import { formatBs, formatUSD } from '@/utils/currency';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type PriceMode = 'saco_bcv' | 'detal_bcv' | 'saco_cash' | 'detal_cash';

interface PriceModeConfig {
  id: PriceMode;
  label: string;
  shortLabel: string;
  /** Precio base en USD para este modo */
  priceUsd: number | null;
  /** Si true, el resultado se muestra en Bs. (tasa BCV); si false, en USD efectivo */
  isBcv: boolean;
  /** Si true, es venta al detal (por kg con presets); si false, venta por saco (por unidad sin presets) */
  isRetail: boolean;
}

interface WeightPriceCalculatorProps {
  /** Precio saco al BCV (USD) — siempre presente */
  priceUsd: number;
  /** Precio detal al BCV (USD) — opcional */
  priceUsdRetail: number | null;
  /** Precio saco en efectivo (USD) — opcional */
  priceUsdCash: number | null;
  /** Precio detal en efectivo (USD) — opcional */
  priceUsdRetailCash: number | null;
  /** Peso referencial del saco en kg */
  weightKg?: number | null;
  /** Tasa BCV actual */
  rate: number | null;
  /** Nombre del producto */
  productName: string;
}

interface WeightPreset {
  label: string;
  sublabel: string;
  valueKg: number;
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const WEIGHT_PRESETS: WeightPreset[] = [
  { label: '250g', sublabel: '¼ kg', valueKg: 0.25 },
  { label: '500g', sublabel: '½ kg', valueKg: 0.5 },
  { label: '1 kg', sublabel: '', valueKg: 1 },
  { label: '2 kg', sublabel: '', valueKg: 2 },
];

// ─── Componente ──────────────────────────────────────────────────────────────

export function WeightPriceCalculator({
  priceUsd,
  priceUsdRetail,
  priceUsdCash,
  priceUsdRetailCash,
  rate,
  productName,
}: WeightPriceCalculatorProps) {
  const [inputValue, setInputValue] = useState<string>('');
  const [activePreset, setActivePreset] = useState<number | null>(null);
  const [activeMode, setActiveMode] = useState<PriceMode>('saco_bcv');

  // Construir modos disponibles según qué precios están configurados
  const modes: PriceModeConfig[] = [
    {
      id: 'saco_bcv',
      label: 'Saco · BCV',
      shortLabel: 'Saco BCV',
      priceUsd: priceUsd,
      isBcv: true,
      isRetail: false,
    },
    ...(priceUsdRetail !== null
      ? [{
          id: 'detal_bcv' as PriceMode,
          label: 'Detal · BCV',
          shortLabel: 'Detal BCV',
          priceUsd: priceUsdRetail,
          isBcv: true,
          isRetail: true,
        }]
      : []),
    ...(priceUsdCash !== null
      ? [{
          id: 'saco_cash' as PriceMode,
          label: 'Saco · Efectivo',
          shortLabel: 'Saco $',
          priceUsd: priceUsdCash,
          isBcv: false,
          isRetail: false,
        }]
      : []),
    ...(priceUsdRetailCash !== null
      ? [{
          id: 'detal_cash' as PriceMode,
          label: 'Detal · Efectivo',
          shortLabel: 'Detal $',
          priceUsd: priceUsdRetailCash,
          isBcv: false,
          isRetail: true,
        }]
      : []),
  ];

  const currentMode = modes.find((m) => m.id === activeMode) ?? modes[0];
  const isSackMode = !currentMode.isRetail;

  // Precio unitario base según modo
  const basePriceUsd = currentMode.priceUsd;

  // Valor numérico ingresado
  const numericValue = inputValue ? parseFloat(inputValue) : null;
  const isValidNumber = numericValue !== null && numericValue > 0 && !isNaN(numericValue);

  // Precio total calculado
  const targetPriceUsd = isValidNumber && basePriceUsd !== null ? basePriceUsd * numericValue : null;

  const targetPriceBs =
    currentMode.isBcv && targetPriceUsd !== null && rate
      ? targetPriceUsd * rate
      : null;

  // Etiqueta descriptiva para el bloque de resultado
  const activeResultLabel = (() => {
    if (!isValidNumber) return '';
    if (isSackMode) {
      return `${numericValue} ${numericValue === 1 ? 'saco' : 'sacos'} de "${productName}"`;
    }
    const weightLabel = activePreset !== null ? WEIGHT_PRESETS[activePreset].label : `${inputValue} kg`;
    return `${weightLabel} de "${productName}"`;
  })();

  // Precio de referencia en la cabecera
  const refPriceBs = currentMode.isBcv && basePriceUsd !== null && rate ? basePriceUsd * rate : null;

  const handlePresetClick = (index: number) => {
    const preset = WEIGHT_PRESETS[index];
    setInputValue(String(preset.valueKg));
    setActivePreset(index);
  };

  const handleInputChange = (value: string) => {
    if (value === '' || (isSackMode ? /^\d+$/.test(value) : /^\d*\.?\d*$/.test(value))) {
      setInputValue(value);
      if (!isSackMode) {
        const matchIndex = WEIGHT_PRESETS.findIndex((p) => String(p.valueKg) === value);
        setActivePreset(matchIndex >= 0 ? matchIndex : null);
      } else {
        setActivePreset(null);
      }
    }
  };

  const handleModeChange = (modeId: PriceMode) => {
    setActiveMode(modeId);
    setInputValue('');
    setActivePreset(null);
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
          Calculadora de Precio
        </h3>
      </div>

      {/* Selector de modo */}
      {modes.length > 1 && (
        <div className="flex gap-1.5 flex-wrap">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border
                ${activeMode === mode.id
                  ? 'bg-secondary text-white border-secondary shadow-sm'
                  : 'bg-white text-primary border-border hover:border-secondary/50'
                }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      )}

      {/* Precio de referencia */}
      {basePriceUsd !== null ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <span>
            {isSackMode ? 'Precio por saco' : 'Precio por kg'} ({currentMode.shortLabel}):
          </span>
          <span className="font-bold text-primary">{formatUSD(basePriceUsd)}</span>
          {refPriceBs !== null && (
            <>
              <span>·</span>
              <span className="font-bold text-secondary">{formatBs(refPriceBs)}</span>
            </>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic">
          Precio no configurado.
        </p>
      )}

      {/* INPUT PRINCIPAL */}
      <div className="relative">
        <input
          type="text"
          inputMode={isSackMode ? 'numeric' : 'decimal'}
          placeholder={isSackMode ? 'Escribe la cantidad de sacos (ej: 1, 2...)' : 'Escribe el peso deseado'}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          className="w-full pl-4 pr-20 py-3 rounded-xl border-2 border-border bg-white
                     text-base font-semibold text-foreground placeholder:text-outline
                     focus:outline-none focus:ring-2 focus:ring-secondary/25
                     focus:border-secondary transition-all"
        />
        <span
          className="absolute right-4 top-1/2 -translate-y-1/2 text-sm
                       font-bold text-muted-foreground pointer-events-none"
        >
          {isSackMode ? 'saco(s)' : 'kg'}
        </span>
      </div>

      {/* Botones preset — SOLO se muestran para venta al DETAL */}
      {!isSackMode && (
        <div className="grid grid-cols-4 gap-2">
          {WEIGHT_PRESETS.map((preset, index) => (
            <button
              key={preset.label}
              onClick={() => handlePresetClick(index)}
              className={`flex flex-col items-center justify-center py-2 px-1.5
                         rounded-xl border text-xs font-bold transition-all duration-200
                         ${activePreset === index
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
      )}

      {/* RESULTADO */}
      <AnimatePresence mode="wait">
        {isValidNumber && targetPriceUsd !== null && (
          <motion.div
            key={`${activeMode}-${inputValue}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white rounded-xl p-4 border border-secondary/20 shadow-xs"
          >
            <p className="text-xs text-muted-foreground mb-3">
              {activeResultLabel} — {currentMode.label}
            </p>

            <div className={`grid gap-3 ${currentMode.isBcv ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {/* Precio USD */}
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                  {currentMode.isBcv ? 'Dólar' : 'Efectivo USD'}
                </span>
                <span className="text-xl font-black text-primary font-display">
                  {formatUSD(targetPriceUsd)}
                </span>
              </div>

              {/* Precio VES — solo para modos BCV */}
              {currentMode.isBcv && (
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
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
