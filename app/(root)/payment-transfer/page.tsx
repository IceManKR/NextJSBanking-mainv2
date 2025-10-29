"use client";

import React, { useMemo, useState } from "react";

// HorizonBank_TransferPage.tsx
// Next.js App Router friendly client component (Tailwind CSS)
// Purpose: Transfer Funds page supporting multiple methods (Internal, IMPS/NEFT/RTGS, UPI), scheduling, add beneficiary flow, confirmation & OTP simulation.

type Payee = {
  id: string;
  name: string;
  accountNumber?: string;
  ifsc?: string;
  vpa?: string; // for UPI
  bank?: string;
};

export default function TransferPage() {
  const [method, setMethod] = useState<"internal" | "neft" | "imps" | "rtgs" | "upi">("internal");
  const [payees, setPayees] = useState<Payee[]>(mockPayees());
  const [selectedPayee, setSelectedPayee] = useState<Payee | null>(payees[0] ?? null);
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [scheduleType, setScheduleType] = useState<"now" | "schedule">("now");
  const [scheduleDate, setScheduleDate] = useState<string | null>(null);
  const [showAddPayee, setShowAddPayee] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const balance = 150000.5; // mock balance

  const canProceed = useMemo(() => {
    if (!selectedPayee) return false;
    const num = Number(amount);
    if (Number.isNaN(num) || num <= 0) return false;
    if (num > balance) return false;
    if (method === "upi" && !selectedPayee.vpa) return false;
    if ((method === "neft" || method === "imps" || method === "rtgs") && (!selectedPayee.accountNumber || !selectedPayee.ifsc)) return false;
    return true;
  }, [selectedPayee, amount, method]);

  function startTransfer() {
    setError(null);
    if (!canProceed) return;
    setShowConfirm(true);
  }

  function confirmTransfer() {
    setShowConfirm(false);
    // for sensitive actions show OTP
    setShowOtp(true);
    // in real app: request OTP from backend
  }

  function submitOtp() {
    setStatus("processing");
    // simple mock OTP check
    setTimeout(() => {
      if (otp === "123456") {
        setStatus("success");
        setShowOtp(false);
        // clear form
        setAmount("");
        setRemarks("");
      } else {
        setStatus("error");
        setError("Invalid OTP. Try 123456 for mock demo.");
      }
    }, 900);
  }

  function addPayee(newPayee: Payee) {
    setPayees((p) => [newPayee, ...p]);
    setSelectedPayee(newPayee);
    setShowAddPayee(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Transfer Funds</h1>
            <p className="text-sm text-gray-500">Send money securely using different transfer methods.</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Available balance</div>
            <div className="font-semibold text-lg">{formatCurrency(balance)}</div>
          </div>
        </header>

        <section className="bg-white p-4 rounded-2xl shadow-sm">
          <h2 className="text-sm font-medium mb-3">Choose Method</h2>
          <div className="flex gap-2 flex-wrap">
            <MethodBtn label="Within Bank" id="internal" active={method === "internal"} onClick={() => setMethod("internal")} />
            <MethodBtn label="IMPS" id="imps" active={method === "imps"} onClick={() => setMethod("imps")} />
            <MethodBtn label="NEFT" id="neft" active={method === "neft"} onClick={() => setMethod("neft")} />
            <MethodBtn label="RTGS" id="rtgs" active={method === "rtgs"} onClick={() => setMethod("rtgs")} />
            <MethodBtn label="UPI" id="upi" active={method === "upi"} onClick={() => setMethod("upi")} />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <aside className="lg:col-span-1">
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Payee</h3>
                <button onClick={() => setShowAddPayee(true)} className="text-sm text-sky-600 underline">Add</button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {payees.map((p) => (
                  <button key={p.id} onClick={() => setSelectedPayee(p)} className={`w-full text-left p-2 rounded-md ${selectedPayee?.id === p.id ? 'bg-sky-50 border' : 'hover:bg-gray-50'}`}>
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500">{shortPayeeDesc(p)}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm mt-4 text-sm text-gray-600">
              <h4 className="font-medium mb-2">Method Notes</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>IMPS: Instant, 24x7.</li>
                <li>NEFT: Batch-processed, bank timings apply.</li>
                <li>RTGS: For high-value immediate transfers.</li>
                <li>UPI: Use VPA for quick transfer; no IFSC needed.</li>
              </ul>
            </div>
          </aside>

          <div className="lg:col-span-2">
            <div className="bg-white p-4 rounded-2xl shadow-sm space-y-4">
              <div>
                <label className="text-xs text-gray-500">To</label>
                <div className="mt-1 p-3 border rounded-md bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{selectedPayee?.name ?? '—'}</div>
                      <div className="text-xs text-gray-500 mt-1">{fullPayeeDesc(selectedPayee)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500">Amount</label>
                <div className="mt-1 flex gap-2">
                  <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" inputMode="decimal" className="flex-1 border rounded px-3 py-2 text-lg font-medium" />
                  <button onClick={() => setAmount(String(balance))} className="px-3 py-2 bg-white border rounded">Max</button>
                </div>
                <div className="text-xs text-gray-500 mt-1">Available: {formatCurrency(balance)}</div>
              </div>

              <div>
                <label className="text-xs text-gray-500">Remarks (optional)</label>
                <input value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Rent, groceries, etc." className="w-full border rounded px-3 py-2 text-sm mt-1" />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs">Schedule</label>
                <div className="flex gap-2 items-center">
                  <label className={`px-3 py-1 border rounded ${scheduleType==='now' ? 'bg-sky-600 text-white' : ''}`}>
                    <input type="radio" name="schedule" checked={scheduleType==='now'} onChange={() => setScheduleType('now')} className="hidden" /> Now
                  </label>
                  <label className={`px-3 py-1 border rounded ${scheduleType==='schedule' ? 'bg-sky-600 text-white' : ''}`}>
                    <input type="radio" name="schedule" checked={scheduleType==='schedule'} onChange={() => setScheduleType('schedule')} className="hidden" /> Schedule
                  </label>
                </div>
                {scheduleType === 'schedule' && (
                  <input type="date" value={scheduleDate ?? ''} onChange={(e) => setScheduleDate(e.target.value || null)} className="ml-4 border rounded px-2 py-1 text-sm" />
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button onClick={() => { setAmount(''); setRemarks(''); }} className="px-4 py-2 border rounded">Reset</button>
                <button disabled={!canProceed} onClick={startTransfer} className={`px-4 py-2 rounded ${canProceed ? 'bg-sky-600 text-white' : 'bg-gray-200 text-gray-500'}`}>Proceed</button>
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}
            </div>
          </div>
        </section>

        {/* Confirm Modal */}
        {showConfirm && selectedPayee && (
          <ConfirmModal
            method={method}
            payee={selectedPayee}
            amount={Number(amount)}
            remarks={remarks}
            scheduleType={scheduleType}
            scheduleDate={scheduleDate}
            onCancel={() => setShowConfirm(false)}
            onConfirm={confirmTransfer}
          />
        )}

        {/* OTP Modal */}
        {showOtp && (
          <OtpModal
            onCancel={() => { setShowOtp(false); setStatus('idle'); setOtp(''); }}
            otp={otp}
            setOtp={setOtp}
            submitOtp={submitOtp}
            status={status}
            infoText={'For demo use 123456 as OTP'}
          />
        )}

        {/* Add Payee Modal */}
        {showAddPayee && (
          <AddPayeeModal onClose={() => setShowAddPayee(false)} onAdd={addPayee} />
        )}

        {/* Status message */}
        {status === 'success' && (
          <div className="bg-green-50 border border-green-100 text-green-800 p-3 rounded">Transfer successful ✅</div>
        )}
        {status === 'error' && error && (
          <div className="bg-red-50 border border-red-100 text-red-800 p-3 rounded">{error}</div>
        )}

      </div>
    </div>
  );
}

/* ---------------- Subcomponents ---------------- */

function MethodBtn({ label, id, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`px-3 py-2 rounded-md border ${active ? 'bg-sky-600 text-white' : 'bg-white'}`}>{label}</button>
  );
}

function ConfirmModal({ method, payee, amount, remarks, scheduleType, scheduleDate, onCancel, onConfirm }: any) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-40">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-2">Confirm Transfer</h2>
        <div className="text-sm text-gray-600 mb-4">Please verify the details below before confirming.</div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-gray-500">To</div>
            <div className="font-medium">{payee.name}</div>
            <div className="text-xs text-gray-500">{fullPayeeDesc(payee)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Method</div>
            <div className="font-medium">{method.toUpperCase()}</div>
            <div className="text-xs text-gray-500 mt-2">Schedule</div>
            <div>{scheduleType === 'now' ? 'Execute now' : `On ${scheduleDate}`}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Amount</div>
            <div className="font-medium">{formatCurrency(amount)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Remarks</div>
            <div>{remarks || '—'}</div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-sky-600 text-white rounded">Confirm & Send OTP</button>
        </div>
      </div>
    </div>
  );
}

function OtpModal({ onCancel, otp, setOtp, submitOtp, status, infoText }: any) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6">
        <h3 className="text-lg font-semibold">Enter OTP</h3>
        <div className="text-sm text-gray-500">We have sent an OTP to your registered mobile number.</div>
        <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" inputMode="numeric" className="mt-4 w-full border rounded px-3 py-2 text-lg text-center" />
        <div className="mt-4 flex justify-between items-center">
          <button onClick={onCancel} className="px-3 py-2 border rounded">Cancel</button>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500 mr-2">{infoText}</div>
            <button onClick={submitOtp} className={`px-3 py-2 rounded ${status === 'processing' ? 'bg-gray-200' : 'bg-sky-600 text-white'}`}>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddPayeeModal({ onClose, onAdd }: any) {
  const [name, setName] = useState("");
  const [acc, setAcc] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [vpa, setVpa] = useState("");
  const [bank, setBank] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleAdd() {
    if (!name) return setError("Enter payee name");
    if (!acc && !vpa) return setError("Provide account number+IFSC or VPA for UPI");
    const p: Payee = { id: `pay-${Date.now()}`, name, accountNumber: acc || undefined, ifsc: ifsc || undefined, vpa: vpa || undefined, bank: bank || undefined };
    onAdd(p);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-40">
      <div className="bg-white w-full max-w-md rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-2">Add Payee</h3>
        <div className="space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Payee name" className="w-full border rounded px-3 py-2" />
          <input value={acc} onChange={(e) => setAcc(e.target.value)} placeholder="Account number (leave empty for UPI)" className="w-full border rounded px-3 py-2" />
          <input value={ifsc} onChange={(e) => setIfsc(e.target.value)} placeholder="IFSC" className="w-full border rounded px-3 py-2" />
          <input value={vpa} onChange={(e) => setVpa(e.target.value)} placeholder="VPA (for UPI)" className="w-full border rounded px-3 py-2" />
          <input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="Bank name (optional)" className="w-full border rounded px-3 py-2" />
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button onClick={handleAdd} className="px-4 py-2 bg-sky-600 text-white rounded">Add Payee</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Helpers & Mock Data ---------------- */

function formatCurrency(amount: number | string) {
  const num = typeof amount === 'string' ? Number(amount) : amount;
  if (Number.isNaN(num)) return '₹ 0.00';
  return `₹ ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function mockPayees(): Payee[] {
  return [
    { id: 'p1', name: 'Rahul Sharma', accountNumber: '123456789012', ifsc: 'HZNB0000123', bank: 'Horizon Bank' },
    { id: 'p2', name: 'Rent Account', accountNumber: '987654321098', ifsc: 'HZNB0000456', bank: 'Horizon Bank' },
    { id: 'p3', name: 'Priya Gupta', vpa: 'priya@upi', bank: 'State UPI' },
  ];
}

function shortPayeeDesc(p: Payee | undefined) {
  if (!p) return '';
  if (p.vpa) return p.vpa;
  if (p.accountNumber) return `${maskAccount(p.accountNumber)} • ${p.bank ?? ''}`;
  return '';
}

function fullPayeeDesc(p: Payee | null) {
  if (!p) return '';
  const parts = [] as string[];
  if (p.accountNumber) parts.push(`A/C ${maskAccount(p.accountNumber)}`);
  if (p.ifsc) parts.push(`IFSC ${p.ifsc}`);
  if (p.vpa) parts.push(`VPA ${p.vpa}`);
  if (p.bank) parts.push(p.bank);
  return parts.join(' • ');
}

function maskAccount(ac: string) {
  return ac.replace(/.(?=.{4})/g, '*');
}
