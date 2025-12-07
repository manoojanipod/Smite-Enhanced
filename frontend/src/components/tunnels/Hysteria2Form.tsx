// frontend/src/components/tunnels/Hysteria2Form.tsx
import React, { useState } from "react";
import { createTunnel } from "../../api/tunnels";

interface Props {
  onCreated?: () => void;
}

const defaultPort = 8448;

export const Hysteria2Form: React.FC<Props> = ({ onCreated }) => {
  const [name, setName] = useState("HY2 اصلی");
  const [port, setPort] = useState<number>(defaultPort);
  const [password, setPassword] = useState("ChangeMe123");
  const [up, setUp] = useState("50 Mbps");
  const [down, setDown] = useState("200 Mbps");
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
        core: "hysteria2",
        type: "server",
        node_id: null,
        spec: {
          port,
          password,
          up,
          down,
        },
      });

      setSuccess("تانل Hysteria2 با موفقیت ایجاد شد.");
      if (onCreated) onCreated();
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "خطای نامشخص در ساخت تانل Hysteria2";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-bold text-slate-50" dir="rtl">
        ساخت تانل Hysteria2
      </h2>
      <p className="mb-4 text-sm text-slate-300" dir="rtl">
        این فرم، فقط یک رکورد تونل با <span className="font-mono">core=hysteria2</span> در
        پنل می‌سازد. سرویس اصلی Hysteria2 را همین حالا با Docker بالا آورده‌ای.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
        <div className="space-y-1">
          <label className="text-sm text-slate-200">نام تانل</label>
          <input
            className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none focus:border-cyan-400"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثلاً: HY2 خارج اصلی"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
          <div className="space-y-1">
            <label className="text-sm text-slate-200">پورت سرور</label>
            <input
              type="number"
              className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none focus:border-cyan-400"
              value={port}
              onChange={(e) => setPort(Number(e.target.value) || defaultPort)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-200">پسورد اتصال</label>
            <input
              className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none focus:border-cyan-400 font-mono"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
          <div className="space-y-1">
            <label className="text-sm text-slate-200">سرعت دانلود (down)</label>
            <input
              className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none focus:border-cyan-400"
              value={down}
              onChange={(e) => setDown(e.target.value)}
              placeholder="مثلاً 200 Mbps"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-200">سرعت آپلود (up)</label>
            <input
              className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none focus:border-cyan-400"
              value={up}
              onChange={(e) => setUp(e.target.value)}
              placeholder="مثلاً 50 Mbps"
            />
          </div>
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
          {saving ? "در حال ساخت..." : "ساخت تانل Hysteria2"}
        </button>
      </form>
    </div>
  );
};
