"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { useCallback, useId, useRef, useState } from "react";

type FormStatus = "idle" | "submitting" | "success" | "error";

const drawerSpring = { type: "spring" as const, stiffness: 420, damping: 36, mass: 0.8 };
const drawerEase = { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.06 + i * 0.05,
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
  exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

export function ContactDrawer() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formId = useId();
  const honeypotId = useId();
  const reducedMotion = useReducedMotion();

  const toggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        setStatus("idle");
        setErrorMessage("");
        requestAnimationFrame(() => textareaRef.current?.focus());
      }
      return next;
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = message.trim();
    if (trimmed.length < 10) {
      setErrorMessage("Please write at least a few words (10 characters minimum).");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          name: name.trim() || undefined,
          website: (e.currentTarget.elements.namedItem("website") as HTMLInputElement)
            ?.value,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }

      setStatus("success");
      setMessage("");
      setName("");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    }
  }

  const drawerTransition = reducedMotion ? drawerEase : drawerSpring;

  return (
    <div className="mt-6 w-full max-w-md text-center">
      <motion.button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={`${formId}-drawer`}
        className="relative text-sm text-white/60 underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white/60"
        animate={{ opacity: open ? 1 : 0.85 }}
        transition={{ duration: 0.2 }}
      >
        Do you want to work together?
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${formId}-drawer`}
            key="drawer"
            initial={
              reducedMotion
                ? { opacity: 0 }
                : { height: 0, opacity: 0, clipPath: "inset(0 0 100% 0 round 12px)" }
            }
            animate={
              reducedMotion
                ? { opacity: 1, height: "auto" }
                : {
                    height: "auto",
                    opacity: 1,
                    clipPath: "inset(0 0 0% 0 round 12px)",
                  }
            }
            exit={
              reducedMotion
                ? { opacity: 0 }
                : { height: 0, opacity: 0, clipPath: "inset(0 0 100% 0 round 12px)" }
            }
            transition={drawerTransition}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-4 h-px w-12 origin-center bg-white/25"
              aria-hidden
            />

            <div className="max-h-[38dvh] overflow-y-auto overscroll-contain pt-4">
              {status === "success" ? (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-white/80"
                >
                  Thanks — we&apos;ll be in touch.
                </motion.p>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3 text-left">
                  <input
                    type="text"
                    name="website"
                    id={honeypotId}
                    tabIndex={-1}
                    autoComplete="off"
                    className="pointer-events-none absolute h-0 w-0 opacity-0"
                    aria-hidden
                  />

                  <motion.div
                    custom={0}
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <label
                      htmlFor={`${formId}-name`}
                      className="mb-1 block text-xs text-white/50"
                    >
                      Name (optional)
                    </label>
                    <input
                      id={`${formId}-name`}
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={100}
                      className="w-full rounded-md border border-white/20 bg-black px-2.5 py-1.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/60 focus:ring-1 focus:ring-white/40"
                      placeholder="Your name"
                      disabled={status === "submitting"}
                    />
                  </motion.div>

                  <motion.div
                    custom={1}
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <label
                      htmlFor={`${formId}-message`}
                      className="mb-1 block text-xs text-white/50"
                    >
                      Message
                    </label>
                    <textarea
                      ref={textareaRef}
                      id={`${formId}-message`}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={3}
                      maxLength={2000}
                      className="w-full resize-none rounded-md border border-white/20 bg-black px-2.5 py-1.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/60 focus:ring-1 focus:ring-white/40"
                      placeholder="Tell us a bit about what you have in mind…"
                      disabled={status === "submitting"}
                    />
                  </motion.div>

                  {status === "error" && errorMessage && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-white/70"
                      role="alert"
                    >
                      {errorMessage}
                    </motion.p>
                  )}

                  <motion.div
                    custom={2}
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="w-full rounded-md bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {status === "submitting" ? "Sending…" : "Send message"}
                    </button>
                  </motion.div>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
