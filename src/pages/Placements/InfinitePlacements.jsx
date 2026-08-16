import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from "react-toastify";
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import CircleLoader from '../../Components/Loader/CircleLoader';
import PlacementCard from '../../Components/Placements/PlacementCard.jsx';
// Shadcn Components
import { Label } from '../../Components/ui/label';
import { Input } from '../../Components/ui/input';
import { Card, CardContent } from '../../Components/ui/card';
import { Button } from "../../Components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogDescription } from "../../Components/ui/dialog";
// Components
import PlacementSearch from "./PlacementSearch/PlacementSearch.jsx";
// Dialog Boxes
import CreateJobPost from "../../Dialog/Create_JobPost/CreateJobPost.jsx";
import Missing_Details_Form_Dialog from "../../Dialog/Student_Missing_Details_Form/Missing_Details_Form_Dialog.jsx";
import DeletePlacementPostDialog from "../../Dialog/DeletePlacement_dialog/DeletePlacementDialog";
// CONTEXT api
import { useUserData } from "../../context/AuthContext/AuthContext.jsx";
// icons
import { ArrowLeftCircleIcon } from "lucide-react";
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

const InfinitePlacements = () => {
  const [placements, setPlacements] = useState([]);
  const { accessToken, role } = useUserData();
  const [applyPlacementDialog, setApplyPlacementDialog] = useState(false);
  const [appliedConfirmationDialog, setAppliedConfirmationDialog] = useState(false);
  const [placementInfoDialog, setPlacementInfoDialog] = useState(false);
  const [createPostDialog, setCreatePostDialog] = useState(false);
  const [missingDetailsFillFormDialog, setMissingDetailsFillFormDialog] = useState(true);
  const [showSearchResult, setShowSearchResult] = useState(false);
  const [postDeleteDialog, setPostDeleteDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [placementInfo, setPlacementInfo] = useState({});
  const [filteredPlacement, setFilteredPlacement] = useState({});
  const [postID, setPostID] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editedInfo, setEditedInfo] = useState(placementInfo);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();
  const [loading, setLoading] = useState(false);
  const [removingPostID, setRemovingPostID] = useState(null);


  useEffect(() => {
    let cancelled = false;
    const fetchPlacements = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/v2/placements?page=${page}&limit=10`);
        if (cancelled) return;
        const newPlacements = Array.isArray(res?.data?.data?.data) ? res?.data?.data?.data : [];
        if (newPlacements.length === 0) {
          setHasMore(false);
          return;
        }
        // De-dupe by _id so React StrictMode / repeated triggers can never
        // append the same placement twice.
        setPlacements((prev) => {
          const existing = new Set((Array.isArray(prev) ? prev : []).map((p) => p?._id));
          const fresh = newPlacements.filter((p) => p?._id && !existing.has(p._id));
          return [...(Array.isArray(prev) ? prev : []), ...fresh];
        });
      } catch (err) {
        if (!cancelled) console.error("Failed to fetch placements", err);
      }
    };

    if (hasMore) fetchPlacements();
    return () => {
      cancelled = true;
    };
  }, [page, hasMore]);

  useEffect(() => {
    if (inView && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [inView, hasMore]);

  if (!accessToken || !role) return <CircleLoader />;

  const cleanSearchedData = () => {
    setFilteredPlacement({});
    setSearchQuery("");
    setShowSearchResult(false);
  }

  const handleEditChange = (e) => {
    setEditedInfo({ ...editedInfo, [e.target.name]: e.target.value });
  };

  const saveChanges = () => {
    setPlacementInfo(editedInfo);
    setEditMode(false);
  };

  const applyForPlacement = async () => {
    const res = await fetch(`${API_URL}/api/v1/applications/${postID}`, {
      method: "POST",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
    })
    const response = await res.json();
    if (!response.success) {
      toast.warning(response.message)
    }
    if (response.success) {
      setAppliedConfirmationDialog(true);
    }
  }

  const handleUpdate = async () => {
    setEditMode(false);
    let payload = { newPlacementPost: placementInfo };
    const res = await fetch(`${API_URL}/api/v1/placements/${placementInfo?._id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error ${res.status}: ${res.statusText} - ${errorText}`);
    }

    const text = await res.text(); // get raw response
    const response = text ? await res.json() : {}; // safely parse if not empty
    toast.success(response.message || "Updated successfully!");
    setPlacementInfoDialog(false);
  }

  const searchQueryFromChild = (query) => {
    if (typeof query === "string") { setSearchQuery(query); }
    setFilteredPlacement(query);
    setShowSearchResult(true);
  }
  const handlePostDeleted = (deletedID) => {
    setRemovingPostID(deletedID);
    setTimeout(() => {
      setPlacements((prevPlacements) =>
        (Array.isArray(prevPlacements) ? prevPlacements : []).filter((placement) => placement?._id !== deletedID)
      );
      setRemovingPostID(null);
      setLoading(false);
      setPostDeleteDialog(false);
    }, 300);
  }
  return (
    <>
      <div className="p-6">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Available Placements</h2>
            <p className="mt-1 text-sm text-slate-500">Browse placement drives and apply to the ones that fit you.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {
              !showSearchResult && role !== "student" &&
              <Button className="cursor-pointer" onClick={() => setCreatePostDialog(true)}>Create Post</Button>
            }
            {showSearchResult &&
              <Button onClick={() => { cleanSearchedData(); }} className="bg-slate-900 cursor-pointer rounded-xl hover:bg-slate-700" aria-label="Clear search"> <ArrowLeftCircleIcon /></Button>
            }
            <PlacementSearch onQuery={searchQueryFromChild} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {showSearchResult ? (
            filteredPlacement?._id ? (
              <PlacementCard
                key={filteredPlacement?._id}
                placement={filteredPlacement}
                role={role}
                onApply={() => { setApplyPlacementDialog(true); setPostID(filteredPlacement?._id); }}
                onUpdate={() => { setPlacementInfo(filteredPlacement); setEditedInfo(filteredPlacement); setPlacementInfoDialog(true); }}
                onDelete={() => { setPostDeleteDialog(true); setPostID(filteredPlacement?._id); }}
              />
            ) : (
              // Fallback: filteredPlacement is null, so filter placements list by search query
              placements.filter((p) =>
                p.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.job_title.toLowerCase().includes(searchQuery.toLowerCase())
              )
                .map((placement) => (
                  placement?._id && (
                    <PlacementCard
                      key={placement?._id}
                      placement={placement}
                      role={role}
                      onApply={() => { setApplyPlacementDialog(true); setPostID(placement?._id); }}
                      onUpdate={() => { setPlacementInfo(placement); setEditedInfo(placement); setPlacementInfoDialog(true); }}
                      onDelete={() => { setPostDeleteDialog(true); setPostID(placement?._id); }}
                    />
                  )
                ))
            )
          ) : (
            // Default case: show all placements
            Array.isArray(placements) && placements.map((placement) => (
              placement?._id && (
                <PlacementCard
                  key={placement?._id}
                  placement={placement}
                  role={role}
                  removing={removingPostID === placement?._id}
                  onApply={() => { setApplyPlacementDialog(true); setPostID(placement?._id); }}
                  onUpdate={() => { setPlacementInfo(placement); setEditedInfo(placement); setPlacementInfoDialog(true); }}
                  onDelete={() => { setPostDeleteDialog(true); setPostID(placement?._id); }}
                />
              )
            ))
          )}
          {hasMore && (
            <div ref={ref} className="col-span-full flex items-center justify-center gap-3 py-8 text-sm text-slate-500">
              <CircleLoader />
              Loading more placements…
            </div>
          )}
        </div>
        {/* Delete placement post */}
        <DeletePlacementPostDialog deletePlacementPostDialog={postDeleteDialog} setDeletePlacementPostDialog={setPostDeleteDialog} placementPostID={postID} onPostDelete={handlePostDeleted} loading={loading} setLoading={setLoading} />
        {/* Apply Placement Confirmation Dialog */}
        <Dialog open={applyPlacementDialog} onOpenChange={setApplyPlacementDialog} className="max-h-[90vh] overflow-y-auto">
          <DialogContent>
            <DialogHeader>Fill These Details: </DialogHeader>
            <Missing_Details_Form_Dialog onCancel={setMissingDetailsFillFormDialog} />
            <DialogFooter>
              <Button className="cursor-pointer" variant="outline" onClick={() => setApplyPlacementDialog(false)}>Cancel</Button>
              <Button className="cursor-pointer" onClick={applyForPlacement}>{missingDetailsFillFormDialog ? "Skip & Apply" : "GO"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Applied Placement Confirmation Dialog */}
        <Dialog open={appliedConfirmationDialog} onOpenChange={setAppliedConfirmationDialog}>
          <DialogContent>
            <DialogHeader>Applied</DialogHeader>
            <DialogFooter>
              {/* <Button className="cursor-pointer" variant="secondary" onClick={() => setApplyPlacementDialog(false)}>Cancel</Button> */}
              <Button className="cursor-pointer" onClick={() => { setAppliedConfirmationDialog(false); setApplyPlacementDialog(false) }}>OK</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Create Job Post Dialog */}
        <Dialog open={createPostDialog} onOpenChange={setCreatePostDialog}>
          <DialogContent>
            <DialogHeader>Create new post</DialogHeader>
            <DialogDescription><CreateJobPost onCancel={setCreatePostDialog} /></DialogDescription>
          </DialogContent>
        </Dialog>
        {/* Placement Post Info Dialog */}
        <Dialog open={placementInfoDialog} onOpenChange={setPlacementInfoDialog}>
          <DialogContent>
            <DialogHeader>
              <Card className="mt-6 p-4">
                <h3 className="text-lg font-semibold flex justify-between ">
                  Placement Post Details
                  {
                    !editMode && <Button variant="outline" className="cursor-pointer" size="sm" onClick={() => setEditMode(true)}>✏️</Button>
                  }
                </h3>
                {editMode ? (
                  <div>
                    <Label>Job Title</Label>
                    <Input name="job_title" value={editedInfo.job_title} onChange={handleEditChange} />
                    <Label>Location</Label>
                    <Input name="location" value={editedInfo.location || ""} onChange={handleEditChange} />
                    <Label>Description</Label>
                    <Input name="description" value={editedInfo.description} onChange={handleEditChange} />
                    <Label>Eligibility</Label>
                    <Input name="eligibility" value={editedInfo.eligibility} onChange={handleEditChange} />
                    <Label>Last Date</Label>
                    <Input type="date" name="last_date" value={editedInfo.last_date} onChange={handleEditChange} />
                    <Button className="mt-2 cursor-pointer" onClick={saveChanges}>Save Changes</Button>
                  </div>
                ) : (
                  <CardContent>
                    <p>Company: {editedInfo.company_name}</p>
                    <p>Location: {editedInfo.location || "Not found"}</p>
                    <p>Job Title: {editedInfo.job_title}</p>
                    <p>Eligibility: {editedInfo.eligibility}</p>
                    <p>Description: {editedInfo.description}</p>
                    <p>Last Date : {editedInfo.last_date}</p>
                  </CardContent>
                )}
              </Card>
            </DialogHeader>
            <DialogFooter>
              <Button className="cursor-pointer" variant="outline" onClick={() => { setEditMode(false); setPlacementInfoDialog(false); }}>Cancel</Button>
              <Button className="cursor-pointer" onClick={handleUpdate}>Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div >
    </>
  );
};

export default InfinitePlacements;
