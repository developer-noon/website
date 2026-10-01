'use client';

import { AdjustmentsHorizontalIcon, CalculatorIcon, ChartBarIcon, ClockIcon, InformationCircleIcon, PencilSquareIcon, ReceiptPercentIcon, SparklesIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';

const DEFAULT_BASE_PAY = 50000;
const HOURLY_RATE_USD = 9;
const EXCHANGE_RATE_PKR = 275;
const HOURLY_RATE_PKR = HOURLY_RATE_USD * EXCHANGE_RATE_PKR;

function getCommissionTier(hours: number) {
  if (hours >= 200) return { rate: 0.2, label: '20% Tier (200h+)', nextThreshold: null, prevThreshold: 150 };
  if (hours >= 150) return { rate: 0.15, label: '15% Tier (150h to <200h)', nextThreshold: 200, nextRate: 0.2, prevThreshold: 100 };
  if (hours >= 100) return { rate: 0.1, label: '10% Tier (100h to <150h)', nextThreshold: 150, nextRate: 0.15, prevThreshold: 75 };
  if (hours >= 75) return { rate: 0.05, label: '5% Tier (75h to <100h)', nextThreshold: 100, nextRate: 0.1, prevThreshold: 0 };
  return { rate: 0, label: '0% Tier (<75h)', nextThreshold: 75, nextRate: 0.05, prevThreshold: 0 };
}

function formatPKR(value: number) {
  return `${Math.round(value).toLocaleString('en-US')} PKR`;
}

function formatUSD(value: number) {
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })} USD`;
}

export default function PayStructurePage() {
  const [hours, setHours] = useState('130');
  const [basePayInput, setBasePayInput] = useState(String(DEFAULT_BASE_PAY));
  const [isEditingBasePay, setIsEditingBasePay] = useState(false);

  const numericHours = Number(hours);
  const numericBasePay = Number(basePayInput);

  const hasValidHours = Number.isFinite(numericHours) && numericHours >= 0;
  const hasValidBasePay = Number.isFinite(numericBasePay) && numericBasePay >= 0;

  const calculation = useMemo(() => {
    const safeHours = hasValidHours ? numericHours : 0;
    const safeBasePay = hasValidBasePay ? numericBasePay : 0;

    const hourlyEquivalentPkr = safeHours * HOURLY_RATE_PKR;
    const tier = getCommissionTier(safeHours);
    const commissionAmount = hourlyEquivalentPkr * tier.rate;
    const finalPay = safeBasePay + commissionAmount;

    // Advanced Stats Calculations
    const effectiveHourlyRate = safeHours > 0 ? finalPay / safeHours : 0;
    const effectiveHourlyRateUsd = effectiveHourlyRate / EXCHANGE_RATE_PKR;
    const hoursToNextTier = tier.nextThreshold ? Math.max(0, tier.nextThreshold - safeHours) : 0;
    
    // Earnings projection at next tier
    let nextTierPotentialPay = finalPay;
    if (tier.nextThreshold && tier.nextRate) {
      const nextTierEquivalent = tier.nextThreshold * HOURLY_RATE_PKR;
      nextTierPotentialPay = safeBasePay + (nextTierEquivalent * tier.nextRate);
    }

    const commissionShare = finalPay > 0 ? (commissionAmount / finalPay) * 100 : 0;
    const weeklyHours = safeHours / 4.33;
    const weeklyPay = finalPay / 4.33;

    // Progress percentage toward next tier
    let tierProgress = 100;
    if (tier.nextThreshold) {
      const tierSpan = tier.nextThreshold - tier.prevThreshold;
      const hoursInTier = safeHours - tier.prevThreshold;
      tierProgress = Math.min(100, Math.max(0, (hoursInTier / tierSpan) * 100));
    }

    // Value per hour worked from commission alone
    const commissionPerHour = safeHours > 0 ? commissionAmount / safeHours : 0;

    return {
      safeBasePay,
      hourlyEquivalentPkr,
      hourlyEquivalentUsd: safeHours * HOURLY_RATE_USD,
      tier,
      commissionAmount,
      finalPay,
      finalPayUsd: finalPay / EXCHANGE_RATE_PKR,
      effectiveHourlyRate,
      effectiveHourlyRateUsd,
      hoursToNextTier,
      nextTierPotentialPay,
      commissionShare,
      weeklyHours,
      weeklyPay,
      tierProgress,
      commissionPerHour,
    };
  }, [hasValidHours, numericHours, hasValidBasePay, numericBasePay]);

  return (
    <main className="min-h-full bg-[#f8fafc] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto mb-12 max-w-2xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#2563eb] text-white shadow-lg shadow-blue-600/20">
            <CalculatorIcon className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#2563eb]">Pay structure</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl">Commission &amp; Base Pay Calculator</h1>
          <p className="mt-3 text-base text-[#4b5563] sm:text-lg">Calculate your exact earnings with advanced performance metrics and tiered commission insights.</p>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-12">
          {/* Inputs Section */}
          <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-xl shadow-gray-200/50 sm:p-8 lg:col-span-5">
            <h2 className="mb-6 flex items-center text-xl font-bold text-[#111827]">
              <AdjustmentsHorizontalIcon className="mr-2.5 h-6 w-6 text-[#2563eb]" aria-hidden="true" />Configuration Inputs
            </h2>
            <div className="space-y-6">
              {/* Total Hours Input */}
              <label className="block text-sm font-semibold text-[#374151]" htmlFor="hoursInput">
                Total Hours Worked
                <div className="relative mt-2">
                  <ClockIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9ca3af]" aria-hidden="true" />
                  <input 
                    id="hoursInput" 
                    type="number" 
                    min="0" 
                    step="0.5" 
                    value={hours} 
                    onChange={(event) => setHours(event.target.value)} 
                    placeholder="e.g. 130" 
                    className="block w-full rounded-xl border border-[#d1d5db] bg-[#f9fafb] py-3.5 pl-11 pr-16 text-lg font-medium text-[#111827] outline-none transition focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-blue-600/20" 
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#6b7280]">Hours</span>
                </div>
              </label>

              <div>
                <span className="mb-2.5 block text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Quick Presets (Hours)</span>
                <div className="grid grid-cols-4 gap-2">
                  {[60, 100, 130, 150].map((preset) => (
                    <button 
                      key={preset} 
                      type="button" 
                      onClick={() => setHours(String(preset))} 
                      className="rounded-lg border border-[#d1d5db] bg-[#f3f4f6] px-3 py-2 text-xs font-semibold text-[#374151] transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#2563eb]"
                    >
                      {preset}h
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4 text-xs text-[#4b5563]">
                <div className="flex items-center font-semibold text-[#111827]">
                  <InformationCircleIcon className="mr-1.5 h-4 w-4 text-[#2563eb]" aria-hidden="true" />Pay Structure Rules
                </div>
                <ul className="list-disc space-y-1 pl-4">
                  <li><strong className="text-[#374151]">Base:</strong> Editable fixed salary ({formatPKR(calculation.safeBasePay)}).</li>
                  <li><strong className="text-[#374151]">Hourly Base:</strong> $9 x 275 = 2,475 PKR/hr.</li>
                  <li><strong className="text-[#374151]">Tiers:</strong> &lt;75h (0%), 75-99h (5%), 100-149h (10%), 150-199h (15%), 200h+ (20%).</li>
                  <li><strong className="text-[#374151]">Payout Formula:</strong> Base Pay + Commission Amount.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Core Results Section */}
          <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-xl shadow-gray-200/50 sm:p-8 lg:col-span-7">
            <h2 className="mb-6 flex items-center justify-between gap-4 text-xl font-bold text-[#111827]">
              <span className="flex items-center">
                <ReceiptPercentIcon className="mr-2.5 h-6 w-6 text-[#2563eb]" aria-hidden="true" />Earnings Breakdown
              </span>
              <span className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2563eb]">
                {hasValidHours ? calculation.tier.label : '0% Tier'}
              </span>
            </h2>

            {(!hasValidHours || !hasValidBasePay) ? (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Please enter valid numeric values for hours and base pay greater than or equal to 0.
              </div>
            ) : null}

            <div className="space-y-4">
              <div className="rounded-2xl bg-[#111827] p-6 text-white shadow-md">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">Final Payout (Base + Commission)</span>
                <div className="mt-1 text-3xl font-extrabold sm:text-4xl">{formatPKR(calculation.finalPay)}</div>
                <div className="mt-1 text-xs text-gray-400">{formatUSD(calculation.finalPayUsd)}</div>
                <div className="mt-3 text-xs text-gray-300">Excludes raw hourly wages; calculated as Base + Tier % of Hourly Equivalent.</div>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                {/* Fixed Base Pay Summary Card with Toggleable Edit */}
                <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase text-[#6b7280]">Fixed Base Pay</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingBasePay(!isEditingBasePay)}
                      className="flex items-center gap-1 rounded-lg bg-white border border-gray-200 px-2.5 py-1 text-xs font-medium text-[#2563eb] shadow-sm transition hover:bg-blue-50"
                    >
                      {isEditingBasePay ? (
                        <>
                          <CheckIcon className="h-3.5 w-3.5" /> Done
                        </>
                      ) : (
                        <>
                          <PencilSquareIcon className="h-3.5 w-3.5" /> Edit
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-2">
                    {isEditingBasePay ? (
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="500"
                          value={basePayInput}
                          onChange={(e) => setBasePayInput(e.target.value)}
                          autoFocus
                          className="w-full rounded-lg border border-blue-500 bg-white px-3 py-1.5 text-lg font-bold text-[#111827] outline-none ring-2 ring-blue-600/20"
                        />
                      </div>
                    ) : (
                      <div className="text-xl font-bold text-[#111827]">
                        {formatPKR(calculation.safeBasePay)}
                      </div>
                    )}
                  </div>
                </div>

                <SummaryCard label="Hourly Equivalent Value" value={formatPKR(calculation.hourlyEquivalentPkr)} detail={formatUSD(calculation.hourlyEquivalentUsd)} accent />
                <SummaryCard label="Applied Commission Tier" value={`${calculation.tier.rate * 100}%`} />
                <SummaryCard label="Commission Amount" value={formatPKR(calculation.commissionAmount)} accent />
              </div>
            </div>
          </section>
        </div>

        {/* Comprehensive Stats & Performance Insights Section */}
        {hasValidHours && hasValidBasePay && (
          <section className="mt-8 rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-xl shadow-gray-200/50 sm:p-8">
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563eb]">
                  <ChartBarIcon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h2 className="text-lg font-bold text-[#111827]">Performance &amp; Payout Analytics</h2>
                  <p className="text-xs text-[#6b7280]">Granular breakdown of time efficiency and tier progression</p>
                </div>
              </div>
              {calculation.tier.nextThreshold && (
                <div className="text-xs font-medium text-[#4b5563] bg-[#f3f4f6] px-3 py-1.5 rounded-lg">
                  Tier Progress: <strong className="text-[#2563eb]">{calculation.tierProgress.toFixed(0)}%</strong> to {calculation.tier.nextThreshold}h
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Effective Hourly Rate */}
              <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4">
                <span className="text-xs font-semibold uppercase text-[#6b7280]">Effective Hourly Rate</span>
                <div className="mt-1 text-xl font-bold text-[#111827]">{formatPKR(calculation.effectiveHourlyRate)}</div>
                <div className="mt-0.5 text-xs text-[#9ca3af]">{formatUSD(calculation.effectiveHourlyRateUsd)} per hour worked</div>
              </div>

              {/* Commission Boost per Hour */}
              <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4">
                <span className="text-xs font-semibold uppercase text-[#6b7280]">Commission / Hour</span>
                <div className="mt-1 text-xl font-bold text-[#2563eb]">{formatPKR(calculation.commissionPerHour)}</div>
                <div className="mt-0.5 text-xs text-[#9ca3af]">Extra commission earned per hr</div>
              </div>

              {/* Next Tier Milestone */}
              <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4">
                <span className="text-xs font-semibold uppercase text-[#6b7280]">Next Tier Milestone</span>
                <div className="mt-1 text-xl font-bold text-[#111827]">
                  {calculation.tier.nextThreshold ? `${calculation.hoursToNextTier} hrs away` : 'Max Tier Reached! 🎉'}
                </div>
                <div className="mt-0.5 text-xs text-[#9ca3af]">
                  {calculation.tier.nextThreshold ? `Target: ${calculation.tier.nextThreshold}h (${calculation.tier.nextRate! * 100}%)` : 'Top tier achieved'}
                </div>
              </div>

              {/* Commission Share Ratio */}
              <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4">
                <span className="text-xs font-semibold uppercase text-[#6b7280]">Commission Share</span>
                <div className="mt-1 text-xl font-bold text-[#111827]">{calculation.commissionShare.toFixed(1)}%</div>
                <div className="mt-0.5 text-xs text-[#9ca3af]">Share of payout from commission</div>
              </div>

              {/* Weekly Average Breakdown */}
              <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4">
                <span className="text-xs font-semibold uppercase text-[#6b7280]">Weekly Average Pace</span>
                <div className="mt-1 text-xl font-bold text-[#111827]">{calculation.weeklyHours.toFixed(1)} hrs/wk</div>
                <div className="mt-0.5 text-xs text-[#9ca3af]">{formatPKR(calculation.weeklyPay)} per week avg</div>
              </div>

              {/* Monthly Equivalent */}
              <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4">
                <span className="text-xs font-semibold uppercase text-[#6b7280]">Current Monthly Pay</span>
                <div className="mt-1 text-xl font-bold text-[#111827]">{formatPKR(calculation.finalPay)}</div>
                <div className="mt-0.5 text-xs text-[#9ca3af]">For {numericHours} logged hours</div>
              </div>

              {/* Annualized Projection */}
              <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4 sm:col-span-2">
                <span className="text-xs font-semibold uppercase text-[#6b7280]">Annualized Projection</span>
                <div className="mt-1 text-xl font-bold text-[#111827]">{formatPKR(calculation.finalPay * 12)} <span className="text-xs font-normal text-[#9ca3af]">({formatUSD((calculation.finalPay * 12) / EXCHANGE_RATE_PKR)})</span></div>
                <div className="mt-0.5 text-xs text-[#9ca3af]">Estimated yearly income maintaining this exact monthly volume</div>
              </div>
            </div>

            {calculation.tier.nextThreshold && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-900">
                <div className="flex items-center">
                  <SparklesIcon className="mr-2 h-5 w-5 shrink-0 text-[#2563eb]" aria-hidden="true" />
                  <span>Working <strong className="font-semibold">{calculation.hoursToNextTier} more hours</strong> will push you into the <strong className="font-semibold">{calculation.tier.nextRate! * 100}% tier</strong>, boosting your payout to <strong className="font-semibold">{formatPKR(calculation.nextTierPotentialPay)}</strong>!</span>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Formula Section */}
        <section className="mt-8 rounded-2xl bg-[#111827] p-6 text-white sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-300">Calculation Formula</p>
          <p className="mt-3 text-sm leading-7 text-gray-200">
            Base Pay = {formatPKR(calculation.safeBasePay)} (Editable)<br />
            Hourly Rate = {formatUSD(HOURLY_RATE_USD)} = {formatPKR(HOURLY_RATE_PKR)} per hour<br />
            Commission = Hourly Equivalent Value x Applicable Commission Tier<br />
            Final Pay = Base Pay + Commission Amount
          </p>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({ label, value, detail, accent = false }: { label: string; value: string; detail?: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-4">
      <span className="text-xs font-semibold uppercase text-[#6b7280]">{label}</span>
      <div className={`mt-1 text-xl font-bold ${accent ? 'text-[#2563eb]' : 'text-[#111827]'}`}>{value}</div>
      {detail ? <div className="mt-0.5 text-xs text-[#9ca3af]">{detail}</div> : null}
    </div>
  );
}