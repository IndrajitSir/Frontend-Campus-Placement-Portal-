import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { popSpring } from '../../lib/motion.js';
// Shadcn Components
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "../../Components/ui/dialog";
import { Button } from '../../Components/ui/button';
import { Card } from '../../Components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../../components/ui/tooltip';
// Icons
import { ExternalLink } from 'lucide-react';

const FIELD_LABELS = {
  department: 'Department',
  location: 'Location',
  company_name: 'Company',
  job_title: 'Job Title',
  professional_skill: 'Professional Skill',
  about: 'About',
}

function Display_User_Details_Dialog({ displayUserDetailsDialog, setDisplayUserDetailsDialog, data }) {
  const displayName = data?.userInfo?.name || data?.student_id?.name || 'Student'
  const email = data?.userInfo?.email || data?.student_id?.email || ''
  const phone = data?.userInfo?.phoneNumber || data?.student_id?.phoneNumber || ''

  const fields = [
    { label: FIELD_LABELS.department, value: data?.studentInfo?.department ?? data?.department ?? null },
    { label: FIELD_LABELS.location, value: data?.studentInfo?.location ?? data?.location ?? null },
    { label: FIELD_LABELS.company_name, value: data?.placementInfo?.company_name ?? null },
    { label: FIELD_LABELS.job_title, value: data?.placementInfo?.job_title ?? null },
    { label: FIELD_LABELS.professional_skill, value: data?.studentInfo?.professional_skill ?? data?.professional_skill ?? null },
    { label: FIELD_LABELS.about, value: data?.studentInfo?.about ?? data?.about ?? null },
  ].filter(Boolean)

  const resumeUrl = data?.studentInfo?.resume || data?.resume

  return (
    <TooltipProvider delayDuration={200}>
      <Dialog open={displayUserDetailsDialog} onOpenChange={setDisplayUserDetailsDialog}>
        <DialogContent className="max-w-md rounded-2xl dark:border-white/10 dark:bg-slate-900">
          <DialogTitle className="dark:text-slate-100">Candidate Details</DialogTitle>
          <AnimatePresence mode="wait">
            <motion.div
              key="dialog-content"
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              transition={popSpring}
            >
              <Card className="rounded-2xl border-slate-200/80 p-5 shadow-md dark:border-white/10 dark:bg-white/[0.04]">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">{displayName}</h3>
                    {email && <p className="text-sm text-slate-500 dark:text-slate-400">{email}</p>}
                    {phone && <p className="text-sm text-slate-500 dark:text-slate-400">{phone}</p>}
                  </div>
                </div>

                {/* Field grid */}
                {fields.length > 0 && (
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    {fields.map((field) => (
                      <motion.div
                        key={field.label}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-slate-700 dark:text-slate-300"
                      >
                        <strong className="text-slate-900 dark:text-slate-100">{field.label}:</strong> {field.value || 'N/A'}
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Footer row */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-white/10">
                  {resumeUrl ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-indigo-600 underline transition hover:brightness-110 dark:text-indigo-400"
                        >
                          View Resume <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Opens in new tab</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-sm text-slate-400 dark:text-slate-500">No resume</span>
                  )}
                  {data?.createdAt && (
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(data.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          <DialogFooter>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="cursor-pointer transition dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/10"
                  variant="secondary"
                  onClick={() => setDisplayUserDetailsDialog(false)}
                >
                  Ok
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Close dialog</p>
              </TooltipContent>
            </Tooltip>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}

export default Display_User_Details_Dialog
