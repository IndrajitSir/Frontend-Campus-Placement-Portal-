import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// Shadcn Components
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "../../Components/ui/dialog";
import { Button } from '../../Components/ui/button';
import { Card } from '../../Components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../../components/ui/tooltip';

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
        <DialogTitle></DialogTitle>
        <DialogContent className="max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key="dialog-content"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="shadow-md rounded-lg p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{displayName}</h3>
                    {email && <p className="text-sm text-gray-500">{email}</p>}
                    {phone && <p className="text-sm text-gray-500">{phone}</p>}
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
                        className="text-gray-700"
                      >
                        <strong>{field.label}:</strong> {field.value || 'N/A'}
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Footer row */}
                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                  {resumeUrl ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-blue-600 underline transition hover:brightness-110"
                        >
                          View Resume
                        </a>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Opens in new tab</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-sm text-gray-400">No resume</span>
                  )}
                  {data?.createdAt && (
                    <span className="text-xs text-gray-400">
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
                  className="cursor-pointer transition hover:bg-gray-300"
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
