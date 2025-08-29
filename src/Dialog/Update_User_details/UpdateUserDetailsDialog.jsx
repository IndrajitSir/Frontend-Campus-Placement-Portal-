import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "../../Components/ui/dialog";
import { Button } from '../../Components/ui/button';
import { Label } from '../../Components/ui/label';
import { Input } from '../../Components/ui/input';

export default function UpdateUserDialog({ isOpen, setIsOpen, userInfo }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (userInfo) {
      const base = {
        name: userInfo?.user?.name || "",
        email: userInfo?.user?.email || "",
        phoneNumber: userInfo?.user?.phoneNumber || ""
      };

      if (userInfo.user.role === "student") {
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
    console.log("Updated Info:", formData);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input name="name" value={formData.name || ""} onChange={handleChange} />
          </div>

          <div>
            <Label>Email</Label>
            <Input name="email" value={formData.email || ""} onChange={handleChange} />
          </div>

          <div>
            <Label>Phone Number</Label>
            <Input name="phoneNumber" value={formData.phoneNumber || ""} onChange={handleChange} />
          </div>

          {userInfo?.user?.role === "student" && (
            <>
              <div>
                <Label>Location</Label>
                <Input name="location" value={formData.location || ""} onChange={handleChange} />
              </div>

              <div>
                <Label>About</Label>
                <Input name="about" value={formData.about || ""} onChange={handleChange} />
              </div>

              <div>
                <Label>Professional Skill</Label>
                <Input name="professional_skill" value={formData.professional_skill || ""} onChange={handleChange} />
              </div>

              <div>
                <Label>Department</Label>
                <Input name="department" value={formData.department || ""} onChange={handleChange} />
              </div>

              <div>
                <Label>Resume</Label>
                <Input name="resume" value={formData.resume || ""} onChange={handleChange} />
              </div>

              <div>
                <Label>Avatar</Label>
                <Input name="avatar" value={formData.avatar || ""} onChange={handleChange} />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
