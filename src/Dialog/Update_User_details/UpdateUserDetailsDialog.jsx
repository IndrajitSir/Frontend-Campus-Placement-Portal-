import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { popSpring } from '../../lib/motion.js';
// Shadcn Components
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "../../Components/ui/dialog";
import { Button } from '../../Components/ui/button';
import { Label } from '../../Components/ui/label';
import { Input } from '../../Components/ui/input';
// Icons
import { LoaderCircle } from 'lucide-react';

const inputClasses = "focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200";

export default function UpdateUserDialog({ isOpen, setIsOpen, userInfo }) {
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userInfo) {
      const base = {
        name: userInfo?.user?.name || "",
        email: userInfo?.user?.email || "",
        phoneNumber: userInfo?.user?.phoneNumber || ""
      };

      if (userInfo?.user?.role === "student") {
        setFormData({
          ...base,
          location: userInfo.student?.location || "",
          about: userInfo.student?.about || "",
          professional_skill: userInfo.student?.professional_skill || "",
          department: userInfo.student?.department || "",
          resume: userInfo.student?.resume || "",
          avatar: userInfo.student?.avatar || ""
        });
      } else {
        setFormData(base);
      }
    }
  }, [userInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setSaving(true);
    console.log("Updated Info:", formData);
    setTimeout(() => {
      setSaving(false);
      setIsOpen(false);
    }, 400);
  };

  const labelClasses = "dark:text-slate-300";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl dark:border-white/10 dark:bg-slate-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={popSpring}
        >
          <DialogHeader>
            <DialogTitle className="dark:text-slate-100">Update User Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className={labelClasses}>Name</Label>
              <Input name="name" value={formData.name || ""} onChange={handleChange} className={inputClasses} />
            </div>

            <div className="space-y-1.5">
              <Label className={labelClasses}>Email</Label>
              <Input name="email" value={formData.email || ""} onChange={handleChange} className={inputClasses} />
            </div>

            <div className="space-y-1.5">
              <Label className={labelClasses}>Phone Number</Label>
              <Input name="phoneNumber" value={formData.phoneNumber || ""} onChange={handleChange} className={inputClasses} />
            </div>

            {userInfo?.user?.role === "student" && (
              <>
                <div className="space-y-1.5">
                  <Label className={labelClasses}>Location</Label>
                  <Input name="location" value={formData.location || ""} onChange={handleChange} className={inputClasses} />
                </div>

                <div className="space-y-1.5">
                  <Label className={labelClasses}>About</Label>
                  <Input name="about" value={formData.about || ""} onChange={handleChange} className={inputClasses} />
                </div>

                <div className="space-y-1.5">
                  <Label className={labelClasses}>Professional Skill</Label>
                  <Input name="professional_skill" value={formData.professional_skill || ""} onChange={handleChange} className={inputClasses} />
                </div>

                <div className="space-y-1.5">
                  <Label className={labelClasses}>Department</Label>
                  <Input name="department" value={formData.department || ""} onChange={handleChange} className={inputClasses} />
                </div>

                <div className="space-y-1.5">
                  <Label className={labelClasses}>Resume</Label>
                  <Input name="resume" value={formData.resume || ""} onChange={handleChange} className={inputClasses} />
                </div>

                <div className="space-y-1.5">
                  <Label className={labelClasses}>Avatar</Label>
                  <Input name="avatar" value={formData.avatar || ""} onChange={handleChange} className={inputClasses} />
                </div>
              </>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" className="cursor-pointer dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/10" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button variant="gradient" className="cursor-pointer" onClick={handleSave} disabled={saving}>
              {saving ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Saving…</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
