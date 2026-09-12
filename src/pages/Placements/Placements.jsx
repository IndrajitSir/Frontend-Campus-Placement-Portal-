import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
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
import { usePlacementData } from "../../context/PlacementContext/PlacementContext.jsx";
import CircleLoader from "../../Components/Loader/CircleLoader.jsx";
// icons
import { ArrowLeftCircleIcon } from "lucide-react";
import { Trash } from "lucide-react";
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

// Shared visual classes for the raw browse cards (kept identical across all three branches).
const rawCardClass =
  "rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-colors hover:border-indigo-200/80 hover:shadow-lg hover:shadow-indigo-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-indigo-400/30";
const rawTitleClass = "text-xl font-semibold text-slate-900 dark:text-slate-100";
const rawMetaClass = "text-sm text-slate-500 dark:text-slate-400";
const applyBtnClass =
  "mt-3 inline-block cursor-pointer bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-white shadow-md shadow-indigo-500/25 hover:brightness-110";
const updateBtnClass =
  "cursor-pointer bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-white shadow-md shadow-indigo-500/25 hover:brightness-110";
const deleteBtnClass =
  "ml-4 cursor-pointer border-red-200 px-4 py-2 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10";

const Placements = () => {
  const { placements, setPlacements, loadingPlacements } = usePlacementData();
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
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setEditedInfo((prevInfo) => ({ ...prevInfo, location: "Not Mentioned!" }))
    cleanSearchedData();
  }, []);

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
    console.log(`Apply placement: ${JSON.stringify(response)}`);
    if (!response.success) {
      toast.warning(response.message)
    }
    if (response.success) {
      setAppliedConfirmationDialog(true);
    }
  }

  const handlePostDeleted = () => {
    const updatedPosts = placements.filter((placement) => placement?._id !== postID);
    setPlacements(updatedPosts);
  }

  const handleUpdate = async () => {
    setEditMode(false);
    try {
      const { _id, company_name, job_title, description, eligibility, location, last_date } = editedInfo;
      const payload = { company_name, job_title, description, eligibility, location, last_date };
      const res = await fetch(`${API_URL}/api/v1/placements/${_id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });
      const response = await res.json();
      if (!res.ok) {
        toast.error(response.message || "Update failed");
        return;
      }
      toast.success(response.message || "Updated successfully!");
      setPlacementInfoDialog(false);
    } catch (error) {
      toast.error("Failed to update placement");
      console.error(error);
    }
  }

  const searchQueryFromChild = (query) => {
    if (typeof query === "string") { setSearchQuery(query); }
    setFilteredPlacement(query);
    setShowSearchResult(true);
  }


  if (loadingPlacements) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <CircleLoader />
      </div>
    );
  }

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="mb-6 flex w-full flex-wrap items-center justify-between gap-4">
        <h2 className="mb-0 w-60 text-2xl font-bold text-slate-900 dark:text-slate-100">Available Placements</h2>
        <div className="flex flex-wrap items-center gap-3">
          {
            !showSearchResult && role !== "student" &&
            <Button variant="gradient" className="cursor-pointer" onClick={() => setCreatePostDialog(true)}>Create Post</Button>
          }
          {showSearchResult &&
            <Button onClick={() => { cleanSearchedData(); }} className="cursor-pointer rounded-xl bg-slate-900 text-white hover:bg-slate-700 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20" aria-label="Clear search"> <ArrowLeftCircleIcon /></Button>
          }
          <PlacementSearch onQuery={searchQueryFromChild} />
          {/* <SearchDialogUpdated data={placements} searchCriteria={["company_name", "job_title"]} onQuery={searchQueryFromChild}  placeholderValue={"Search by company or job title"}/> */}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {showSearchResult ? (
          filteredPlacement !== null ? (
            <div key={filteredPlacement?._id} className={rawCardClass}>
              <h3 className={rawTitleClass}>
                {filteredPlacement?.job_title} at {filteredPlacement?.company_name}
              </h3>
              <p className={`${rawMetaClass} mt-1`}>{filteredPlacement?.description}</p>
              <p className={`mt-1 ${rawMetaClass}`}>Location: {filteredPlacement?.location || "Not found"}</p>
              <p className={rawMetaClass}>Eligibility: {filteredPlacement?.eligibility}</p>
              <p className={rawMetaClass}>Last Date : {filteredPlacement?.last_date}</p>
              {role === "student" ? (
                <Button onClick={() => { setApplyPlacementDialog(true); setPostID(filteredPlacement?._id); }}
                  className={applyBtnClass}
                >
                  Apply
                </Button>
              ) : (
                <div className="mt-3 flex items-end">
                  <Button onClick={() => { setPlacementInfo(filteredPlacement); setEditedInfo(filteredPlacement); setPlacementInfoDialog(true); }}
                    className={updateBtnClass}
                  >
                    Update
                  </Button>
                  <Button onClick={() => { setPostDeleteDialog(true); setPostID(filteredPlacement?._id); }}
                    variant="destructive" size="icon"
                    className={deleteBtnClass}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // Fallback: filteredPlacement is null, so filter placements list by search query
            placements.filter((p) =>
              p.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.job_title.toLowerCase().includes(searchQuery.toLowerCase())
            )
              .map((placement) => (
                <div key={placement?._id} className={rawCardClass}>
                  <h3 className={rawTitleClass}>
                    {placement?.job_title} at {placement?.company_name}
                  </h3>
                  <p className={`${rawMetaClass} mt-1`}>{placement?.description}</p>
                  <p className={`mt-1 ${rawMetaClass}`}>Location: {placement?.location || "Not found"}</p>
                  <p className={rawMetaClass}>Eligibility: {placement?.eligibility}</p>
                  <p className={rawMetaClass}>Last Date : {placement?.last_date}</p>
                  {role === "student" ? (
                    <Button
                      className={applyBtnClass}
                      onClick={() => {
                        setApplyPlacementDialog(true);
                        setPostID(placement?._id);
                      }}
                    >
                      Apply
                    </Button>
                  ) : (
                    <div className="mt-3 flex items-end">
                      <Button
                        className={updateBtnClass}
                        onClick={() => {
                          setPlacementInfo(placement);
                          setEditedInfo(placement);
                          setPlacementInfoDialog(true);
                        }}
                      >
                        Update
                      </Button>
                      <Button variant="destructive" size="icon"
                        className={deleteBtnClass}
                        onClick={() => { setPostDeleteDialog(true); setPostID(filteredPlacement?._id); }}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  )}
                </div>
              ))
          )
        ) : (
          // Default case: show all placements
          placements.map((placement) => (
            <div key={placement?._id} className={rawCardClass}>
              <h3 className={rawTitleClass}>
                {placement?.job_title} at {placement?.company_name}
              </h3>
              <p className={`${rawMetaClass} mt-1`}>{placement?.description}</p>
              <p className={`mt-1 ${rawMetaClass}`}>Location: {placement?.location || "Not found"}</p>
              <p className={rawMetaClass}>Eligibility: {placement?.eligibility}</p>
              <p className={rawMetaClass}>Last Date : {new Date(placement?.last_date).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              })}</p>
              {role === "student" ? (
                <Button
                  className={applyBtnClass}
                  onClick={() => {
                    setApplyPlacementDialog(true);
                    setPostID(placement?._id);
                  }}
                >
                  Apply
                </Button>
              ) : (
                <div className="mt-3 flex items-end">
                  <Button
                    className={updateBtnClass}
                    onClick={() => {
                      setPlacementInfo(placement);
                      setEditedInfo(placement);
                      setPlacementInfoDialog(true);
                    }}
                  >
                    Update
                  </Button>
                  <Button variant="destructive" size="icon"
                    className={deleteBtnClass}
                    onClick={() => { setPostDeleteDialog(true); setPostID(filteredPlacement?._id); }}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              )}
            </div>
          ))
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
            <Button className="cursor-pointer" variant="gradient" onClick={applyForPlacement}>{missingDetailsFillFormDialog ? "Skip & Apply" : "GO"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Applied Placement Confirmation Dialog */}
      <Dialog open={appliedConfirmationDialog} onOpenChange={setAppliedConfirmationDialog}>
        <DialogContent>
          <DialogHeader>Applied</DialogHeader>
          <DialogFooter>
            {/* <Button className="cursor-pointer" variant="secondary" onClick={() => setApplyPlacementDialog(false)}>Cancel</Button> */}
            <Button className="cursor-pointer" variant="gradient" onClick={() => { setAppliedConfirmationDialog(false); setApplyPlacementDialog(false) }}>OK</Button>
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
                  <Button className="mt-2 cursor-pointer" variant="gradient" onClick={saveChanges}>Save Changes</Button>
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
            <Button className="cursor-pointer" variant="gradient" onClick={handleUpdate}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default Placements;
