// frontend/src/components/tunnels/WireGuardForm.tsx
import React, { useState } from "react";
import { createTunnel } from "../../api/tunnels";

interface Props {
  onCreated?: () => void;
}

export const WireGuardForm: React.FC<Props> = ({ onCreated }) => {
  const [name, setName] = useState("WireGuard اصلی");
  const [port, setPort] = useState<number>(51820);
  const [cidr, setCidr] = useState("10.10.0.0/24");
  const [peers, setPeers] = useState<number>(5);
  const [dns, setDns] = useState("1.1.1.1, 8.8.8.8");
  const [allowedIps, setAllowedIps] = useState("0.0.0.0/0, ::/0");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await createTunnel({
        name,
        core: "wireguard",
        type: "server",
        node_id: null,
        spec: {
          port,
          cidr,
          peers,
          dns,
          allowed_ips: allowedIps,
        },
      });

      setSuccess("تانل WireGuard با موفقیت ایجاد شد.");
      if (onCreated) onCreated();
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "خطای نامشخص در ساخت تانل WireGuard";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-bold text-slate-50" dir="rtl">
        ساخت تانل WireGuard
      </h2>
      <p className="mb-4 text-sm text-slate-300" dir="rtl">
        این فرم، مشخصات سرور WireGuard را به‌صورت یک تونل با{" "}
        <span className="font-mono">core=wireguard</span> در پنل ذخیره می‌کند تا بعداً
        برای مدیریت یا تولید کانفیگ‌ها از آن استفاده شود.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
        <div className="space-y-1">
          <label className="text-sm text-slate-200">نام تانل</label>
          <input
            className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none focus:border-cyan-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثلاً: WG اصلی"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
          <div className="space-y-1">
            <label className="text-sm text-slate-200">پورت سرور</label>
            <input
              type="number"
              className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none focus:border-cyan-400"
              value={port}
              onChange={(e) => setPort(Number(e.target.value) || 51820)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-200">CIDR داخلی</label>
            <input
              className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none focus:border-cyan-400"
              value={cidr}
              onChange={(e) => setCidr(e.target.value)}
              placeholder="مثلاً 10.10.0.0/24"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-200">تعداد Peer پیش‌فرض</label>
          <input
            type="number"
            className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none focus:border-cyan-400"
            value={peers}
            onChange={(e) => setPeers(Number(e.target.value) || 1)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-200">DNS برای کلاینت‌ها</label>
          <input
            className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none focus:border-cyan-400"
            value={dns}
            onChange={(e) => setDns(e.target.value)}
            placeholder="مثلاً 1.1.1.1, 8.8.8.8"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-200">Allowed IPs</label>
          <input
            className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none focus:border-cyan-400"
            value={allowedIps}
            onChange={(e) => setAllowedIps(e.target.value)}
            placeholder="مثلاً 0.0.0.0/0, ::/0"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/70 bg-red-950/50 px-3 py-2 text-xs text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-500/70 bg-emerald-950/50 px-3 py-2 text-xs text-emerald-200">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-2 inline-flex items-center justify-center rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-cyan-700"
        >
          {saving ? "در حال ساخت..." : "ساخت تانل WireGuard"}
        </button>
      </form>
    </div>
  );
};
