import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
// Shadcn Components
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogDescription } from "../../components/ui/dialog";
// Components
import PlacementSearch from "./PlacementSearch/PlacementSearch.jsx";
// Dialog Boxes
import CreateJobPost from "../../Dialog/Create_JobPost/CreateJobPost.jsx";
import Missing_Details_Form_Dialog from "../../Dialog/Student_Missing_Details_Form/Missing_Details_Form_Dialog.jsx";
// CONTEXT api
import { useUserData } from "../../context/AuthContext/AuthContext.jsx";
import { usePlacementData } from "../../context/PlacementContext/PlacementContext.jsx";
// icons
import { ArrowLeftCircleIcon } from "lucide-react";
import { Trash } from "lucide-react";
// Environment variable
const API_URL = import.meta.env.VITE_API_URL;

const Placements = () => {
  const { placements, setPlacements } = usePlacementData();
  const { accessToken, role } = useUserData();
  const [applyPlacementDialog, setApplyPlacementDialog] = useState(false);
  const [appliedConfirmationDialog, setAppliedConfirmationDialog] = useState(false);
  const [placementInfoDialog, setPlacementInfoDialog] = useState(false);
  const [createPostDialog, setCreatePostDialog] = useState(false);
  const [missingDetailsFillFormDialog, setMissingDetailsFillFormDialog] = useState(true);
  const [showSearchResult, setShowSearchResult] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [placementInfo, setPlacementInfo] = useState({});
  const [filteredPlacement, setFilteredPlacement] = useState({});
  const [applicationID, setApplicationID] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editedInfo, setEditedInfo] = useState(placementInfo);

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
    const res = await fetch(`${API_URL}/api/v1/applications/${applicationID}`, {
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

  const handlePostDelete = async (id) => {
    const res = await fetch(`${API_URL}/api/v1/placements/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
    });
    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }
    const response = await res.json();
    console.log("response delete post", response);
    if (!response.success) {
      toast.warning(response.message)
    }
    const updatedPosts = placements.filter((placement) => placement._id !== id);
    setPlacements(updatedPosts);
  }

  const handleUpdate = async () => {
    setEditMode(false);
    let payload = { newPlacementPost: placementInfo };
    const res = await fetch(`${API_URL}/api/v1/placements/${placementInfo._id}`, {
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

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex items-center justify-between gap-55 w-full">
        <h2 className="text-2xl font-bold mb-4 w-60">Available Placements</h2>
        <div className="flex items-center justify-between">
          {
            !showSearchResult && role !== "student" &&
            <Button className="cursor-pointer" onClick={() => setCreatePostDialog(true)}>Create Post</Button>
          }
          {showSearchResult &&
            <Button onClick={() => { cleanSearchedData(); }} className="bg-black cursor-pointer rounded-[70px] hover:bg-gray-600"> <ArrowLeftCircleIcon /></Button>
          }
          <PlacementSearch onQuery={searchQueryFromChild} />
          {/* <SearchDialogUpdated data={placements} searchCriteria={["company_name", "job_title"]} onQuery={searchQueryFromChild}  placeholderValue={"Search by company or job title"}/> */}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {showSearchResult ? (
          filteredPlacement !== null ? (
            <div key={filteredPlacement._id} className="border p-4 rounded shadow-md bg-white">
              <h3 className="text-xl font-semibold">
                {filteredPlacement.job_title} at {filteredPlacement.company_name}
              </h3>
              <p className="text-gray-600">{filteredPlacement.description}</p>
              <p>Location: {filteredPlacement.location || "Not found"}</p>
              <p>Eligibility: {filteredPlacement.eligibility}</p>
              <p>Last Date : {filteredPlacement.last_date}</p>
              {role === "student" ? (
                <Button onClick={() => { setApplyPlacementDialog(true); setApplicationID(filteredPlacement._id); }}
                  className="mt-2 inline-block bg-blue-700 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-400"
                >
                  Apply
                </Button>
              ) : (
                <div className="flex items-end mt-3">
                  <Button onClick={() => { setPlacementInfo(filteredPlacement); setEditedInfo(filteredPlacement); setPlacementInfoDialog(true); }}
                    className="bg-blue-700 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-400"
                  >
                    Update
                  </Button>
                  <Button onClick={() => handlePostDelete(filteredPlacement._id)}
                    variant="destructive" size="icon"
                    className="ml-4 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-400"
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
                <div key={placement._id} className="border p-4 rounded shadow-md bg-white">
                  <h3 className="text-xl font-semibold">
                    {placement.job_title} at {placement.company_name}
                  </h3>
                  <p className="text-gray-600">{placement.description}</p>
                  <p>Location: {placement.location || "Not found"}</p>
                  <p>Eligibility: {placement.eligibility}</p>
                  <p>Last Date : {placement.last_date}</p>
                  {role === "student" ? (
                    <Button
                      className="mt-2 inline-block bg-blue-700 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-400"
                      onClick={() => {
                        setApplyPlacementDialog(true);
                        setApplicationID(placement._id);
                      }}
                    >
                      Apply
                    </Button>
                  ) : (
                    <div className="flex items-end mt-3">
                      <Button
                        className="bg-blue-700 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-400"
                        onClick={() => {
                          setPlacementInfo(placement);
                          setEditedInfo(placement);
                          setPlacementInfoDialog(true);
                        }}
                      >
                        Update
                      </Button>
                      <Button variant="destructive" size="icon"
                        className="ml-4 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-400"
                        onClick={() => handlePostDelete(placement._id)}
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
            <div key={placement._id} className="border p-4 rounded shadow-md bg-white">
              <h3 className="text-xl font-semibold">
                {placement.job_title} at {placement.company_name}
              </h3>
              <p className="text-gray-600">{placement.description}</p>
              <p>Location: {placement.location || "Not found"}</p>
              <p>Eligibility: {placement.eligibility}</p>
              <p>Last Date : {new Date(placement.last_date).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              })}</p>
              {role === "student" ? (
                <Button
                  className="mt-2 inline-block bg-blue-700 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-400"
                  onClick={() => {
                    setApplyPlacementDialog(true);
                    setApplicationID(placement._id);
                  }}
                >
                  Apply
                </Button>
              ) : (
                <div className="flex items-end mt-3">
                  <Button
                    className="bg-blue-700 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-400"
                    onClick={() => {
                      setPlacementInfo(placement);
                      setEditedInfo(placement);
                      setPlacementInfoDialog(true);
                    }}
                  >
                    Update
                  </Button>
                  <Button variant="destructive" size="icon"
                    className="ml-4 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-400"
                    onClick={() => handlePostDelete(placement._id)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>


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
  );
};

export default Placements;
