import React from 'react'
import { LoaderCircle } from 'lucide-react'

/**
 * Spinner used while data is being fetched.
 *
 * - fullScreen (default): fills the viewport height (page-level loading).
 * - inline: pass `fullScreen={false}` to drop it into a card/section, with an
 *   optional `label` under the spinner.
 */
function CircleLoader({ fullScreen = true, label, className = "" }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 ${fullScreen ? "h-screen" : "py-16"} ${className}`}
    >
      <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      {label && <p className="text-sm text-slate-400">{label}</p>}
    </div>
  )
}

export default CircleLoader
