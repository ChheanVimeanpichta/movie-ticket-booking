import React, { useEffect } from "react";
import { X, ShieldAlert, Mail } from "lucide-react";

export interface AccountDisabledModalProps {
  isOpen: boolean;
  email?: string;
  message?: string;
  onClose: () => void;
}

export default function AccountDisabledModal({
  isOpen,
  email,
  message,
  onClose,
}: AccountDisabledModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-disabled-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-red-500/25 bg-gradient-to-b from-[#181113] via-cine-card to-[#0d0d0f] p-6 sm:p-8 shadow-[0_25px_70px_rgba(228,22,42,0.3)] text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top glowing ambient gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cine-red to-transparent opacity-90" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-lg p-1 text-cine-text transition-colors hover:bg-white/5 hover:text-cine-white"
        >
          <X size={18} />
        </button>

        {/* Security Shield Icon */}
        <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-red-500/20 blur-xl animate-pulse" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/20 to-red-950/40 text-cine-red shadow-inner">
            <ShieldAlert size={32} className="stroke-[2.2]" />
          </div>
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
          Account Suspended
        </div>

        {/* Title */}
        <h3
          id="account-disabled-title"
          className="mt-3 text-xl sm:text-2xl font-black text-cine-white tracking-tight"
        >
          Access Restricted
        </h3>

        {/* Description */}
        <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-cine-text">
          {message ||
            "Your account has been disabled by an administrator. Access to booking, active sessions, and reservations has been suspended."}
        </p>

        {/* Context Details Card */}
        <div className="mt-5 rounded-xl border border-white/5 bg-white/[0.02] p-3.5 sm:p-4 text-left text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-cine-text">
              Status
            </span>
            <span className="font-semibold text-red-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Disabled by Administrator
            </span>
          </div>
          {email && (
            <div className="flex items-center justify-between border-t border-white/5 pt-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-cine-text">
                Account
              </span>
              <span
                className="font-medium text-cine-text-light truncate max-w-[200px]"
                title={email}
              >
                {email}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-white/5 pt-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-cine-text">
              Support Desk
            </span>
            <a
              href="mailto:support@cinestar.com"
              className="font-medium text-cine-red hover:underline flex items-center gap-1"
            >
              <Mail size={12} />
              support@cinestar.com
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-cine-red py-3 text-sm font-bold text-white shadow-lg shadow-cine-red/25 transition-all duration-200 hover:bg-cine-red/80 hover:shadow-cine-red/40 active:scale-[0.99]"
          >
            Understood
          </button>
          <a
            href="mailto:support@cinestar.com?subject=Inquiry%20Regarding%20Disabled%20Account"
            className="w-full rounded-xl border border-cine-border bg-cine-card py-2.5 text-xs font-semibold text-cine-text-light transition-colors hover:border-zinc-700 hover:text-white"
          >
            Contact Support Team
          </a>
        </div>
      </div>
    </div>
  );
}
