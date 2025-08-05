import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Play, Edit, Trash, Plus, Minus } from "lucide-react";
import { Jingle } from "@shared/schema";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function UploadJinglePage() {
  // Form state
  const [title, setTitle] = useState("");
  const [messageType, setMessageType] = useState("");
  const [language, setLanguage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [repeatType, setRepeatType] = useState("none");
  const [repeatCount, setRepeatCount] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Locations state
  const [availableLocations, setAvailableLocations] = useState([
    { id: 1, name: "Barcelona Office", selected: false },
    { id: 2, name: "Paris Store", selected: false },
    { id: 3, name: "London HQ", selected: false },
    { id: 4, name: "Tokyo Branch", selected: false },
    { id: 5, name: "Demo ( Fiverr Pvt Ltd )", selected: true },
  ]);
  const [selectedLocations, setSelectedLocations] = useState([
    { id: 5, name: "Demo ( Fiverr Pvt Ltd )" }
  ]);
  const { toast } = useToast();

  // Fetch jingles
  const { data: jingles, isLoading } = useQuery<Jingle[]>({
    queryKey: ["/api/jingles"],
  });

  // Delete jingle mutation
  const deleteMutation = useMutation({
    mutationFn: async (jingleId: number) => {
      return apiRequest("DELETE", `/api/jingles/${jingleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jingles"] });
      toast({
        title: "Success",
        description: "Jingle has been deleted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete jingle",
        variant: "destructive",
      });
    },
  });

  // Location management functions
  const handleAddLocation = (locationId: number) => {
    // Find the location in available locations
    const locationToAdd = availableLocations.find(loc => loc.id === locationId);
    if (!locationToAdd) return;
    
    // Update available locations
    setAvailableLocations(prev => prev.map(loc => 
      loc.id === locationId ? { ...loc, selected: true } : loc
    ));
    
    // Add to selected locations if not already there
    if (!selectedLocations.some(loc => loc.id === locationId)) {
      setSelectedLocations(prev => [...prev, { id: locationId, name: locationToAdd.name }]);
    }
    
    toast({
      title: "Location added",
      description: `${locationToAdd.name} has been added to selected locations`,
    });
  };
  
  const handleRemoveLocation = (locationId: number) => {
    // Find the location
    const locationToRemove = selectedLocations.find(loc => loc.id === locationId);
    if (!locationToRemove) return;
    
    // Update available locations
    setAvailableLocations(prev => prev.map(loc => 
      loc.id === locationId ? { ...loc, selected: false } : loc
    ));
    
    // Remove from selected locations
    setSelectedLocations(prev => prev.filter(loc => loc.id !== locationId));
    
    toast({
      title: "Location removed",
      description: `${locationToRemove.name} has been removed from selected locations`,
    });
  };
  
  const handleAddAllLocations = () => {
    // Set all available locations as selected
    setAvailableLocations(prev => prev.map(loc => ({ ...loc, selected: true })));
    
    // Add all to selected locations
    setSelectedLocations(availableLocations.map(loc => ({ id: loc.id, name: loc.name })));
    
    toast({
      title: "All locations added",
      description: "All available locations have been added",
    });
  };
  
  const handleRemoveAllLocations = () => {
    // Set all available locations as not selected
    setAvailableLocations(prev => prev.map(loc => ({ ...loc, selected: false })));
    
    // Clear selected locations
    setSelectedLocations([]);
    
    toast({
      title: "All locations removed",
      description: "All locations have been removed",
    });
  };

  // Upload jingle mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      // Validation
      const newErrors: Record<string, string> = {};
      
      if (!title || title.length < 3) {
        newErrors.title = "Title must be at least 3 characters";
      }
      
      if (!messageType) {
        newErrors.messageType = "Please select a message type";
      }
      
      if (!language) {
        newErrors.language = "Please select a language";
      }
      
      if (!selectedFile) {
        newErrors.file = "Please select a file to upload";
      }
      
      if (!termsAccepted) {
        newErrors.terms = "You must accept the terms and conditions";
      }
      
      if (selectedLocations.length === 0) {
        newErrors.locations = "Please select at least one location";
      }
      
      if (Object.keys(newErrors).length > 0) {
        setFormErrors(newErrors);
        throw new Error("Validation failed");
      }
      
      // Would normally upload the file here
      const formData = {
        title,
        messageType,
        language,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        status: "Pending Approval",
        filePath: selectedFile ? selectedFile.name : null,
      };
      
      return apiRequest("POST", "/api/jingles", formData);
    },
    onSuccess: () => {
      toast({
        title: "Upload successful",
        description: "Your jingle has been uploaded and is pending approval",
      });
      
      // Reset form
      setTitle("");
      setMessageType("");
      setLanguage("");
      setSelectedFile(null);
      setStartDate("");
      setEndDate("");
      setRepeatType("none");
      setRepeatCount("");
      setTermsAccepted(false);
      setFormErrors({});
      
      queryClient.invalidateQueries({ queryKey: ["/api/jingles"] });
    },
    onError: (error) => {
      if (error.message !== "Validation failed") {
        toast({
          title: "Upload failed",
          description: "There was an error uploading your jingle",
          variant: "destructive",
        });
      }
    },
  });

  const handleDelete = (jingleId: number) => {
    if (confirm("Are you sure you want to delete this jingle?")) {
      deleteMutation.mutate(jingleId);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (formErrors.file) {
      setFormErrors(prev => ({ ...prev, file: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    uploadMutation.mutate();
  };

  const formatDate = (dateString: Date | string | undefined) => {
    if (!dateString) return "N/A";
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return format(date, "MM/dd/yyyy");
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary/90 to-primary/70 text-white p-6 rounded-xl mb-6 shadow-md">
        <h1 className="text-2xl font-bold mb-2">Upload Jingle/Voiceover</h1>
        <p className="text-white/90">Upload your jingle and marketing messages here for insertion. Uploaded files are subjected to approval.</p>
        <div className="flex items-center mt-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-700 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            It is illegal to upload unauthorized copyrighted music
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary to-primary/80"></div>
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">New Upload</h2>
          </div>
          <div className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium">Message Title</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (formErrors.title) {
                      setFormErrors(prev => ({ ...prev, title: "" }));
                    }
                  }}
                  placeholder="A Title for Jingle / Voice Over"
                  className={`w-full px-3 py-2 border rounded-md ${formErrors.title ? "border-red-500" : "border-gray-300"}`}
                />
                {formErrors.title && (
                  <p className="text-sm text-red-500">{formErrors.title}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="file-preview" className="block text-sm font-medium">Message File (.mp3)</label>
                <div className="flex">
                  <input
                    id="file-preview"
                    type="text"
                    placeholder={selectedFile ? selectedFile.name : "No file selected"}
                    className={`rounded-l-md w-full px-3 py-2 border ${formErrors.file ? "border-red-500" : "border-gray-300"}`}
                    readOnly
                  />
                  <label
                    htmlFor="file-upload"
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-r-md hover:bg-gray-300 transition cursor-pointer inline-flex items-center"
                  >
                    Browse
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".mp3"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                {formErrors.file && (
                  <p className="text-sm text-red-500">{formErrors.file}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message-type" className="block text-sm font-medium">Message Type</label>
                <select
                  id="message-type"
                  value={messageType}
                  onChange={(e) => {
                    setMessageType(e.target.value);
                    if (formErrors.messageType) {
                      setFormErrors(prev => ({ ...prev, messageType: "" }));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md ${formErrors.messageType ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">Select message type</option>
                  <option value="vocal">Vocal</option>
                  <option value="instrumental">Instrumental</option>
                  <option value="fullmix">Full Mix</option>
                </select>
                {formErrors.messageType && (
                  <p className="text-sm text-red-500">{formErrors.messageType}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="language" className="block text-sm font-medium">Message Language</label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    if (formErrors.language) {
                      setFormErrors(prev => ({ ...prev, language: "" }));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md ${formErrors.language ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">Select language</option>
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                  <option value="german">German</option>
                </select>
                {formErrors.language && (
                  <p className="text-sm text-red-500">{formErrors.language}</p>
                )}
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium">Play Schedule</label>
                <div className="space-y-4">
                  <div className="flex flex-row items-center">
                    <input 
                      type="checkbox" 
                      id="start-date-checkbox"
                      checked={!!startDate}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setStartDate(new Date().toISOString().split('T')[0]);
                        } else {
                          setStartDate("");
                        }
                      }}
                      className="mr-2 rounded"
                    />
                    <label htmlFor="start-date-checkbox" className="mr-2 text-sm">Starts at:</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      disabled={!startDate}
                      className={`px-3 py-1.5 border rounded-md ${!startDate ? 'bg-gray-100 text-gray-400' : ''}`}
                    />
                  </div>
                  
                  <div className="flex flex-row items-center">
                    <input 
                      type="checkbox" 
                      id="end-date-checkbox"
                      checked={!!endDate}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEndDate(new Date().toISOString().split('T')[0]);
                        } else {
                          setEndDate("");
                        }
                      }}
                      className="mr-2 rounded"
                    />
                    <label htmlFor="end-date-checkbox" className="mr-2 text-sm">Stops after:</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={!endDate}
                      className={`px-3 py-1.5 border rounded-md ${!endDate ? 'bg-gray-100 text-gray-400' : ''}`}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Repeat message play (optional)</label>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="repeat-none"
                      name="repeat-type"
                      value="none"
                      checked={repeatType === "none"}
                      onChange={() => setRepeatType("none")}
                      className="mr-2"
                    />
                    <label htmlFor="repeat-none" className="text-sm">None</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="repeat-after"
                      name="repeat-type"
                      value="after"
                      checked={repeatType === "after"}
                      onChange={() => setRepeatType("after")}
                      className="mr-2"
                    />
                    <label htmlFor="repeat-after" className="mr-2 text-sm">
                      Repeat message after every
                    </label>
                    <input
                      type="number"
                      className="w-20 mr-2 px-2 py-1 border rounded"
                      disabled={repeatType !== "after"}
                      value={repeatType === "after" ? repeatCount : ""}
                      onChange={(e) => setRepeatCount(e.target.value)}
                    />
                    <span className="text-sm">message(s)</span>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="repeat-additional"
                      name="repeat-type"
                      value="additional"
                      checked={repeatType === "additional"}
                      onChange={() => setRepeatType("additional")}
                      className="mr-2"
                    />
                    <label htmlFor="repeat-additional" className="mr-2 text-sm">
                      Repeat message additional
                    </label>
                    <input
                      type="number"
                      className="w-20 mr-2 px-2 py-1 border rounded"
                      disabled={repeatType !== "additional"}
                      value={repeatType === "additional" ? repeatCount : ""}
                      onChange={(e) => setRepeatCount(e.target.value)}
                    />
                    <span className="text-sm">time(s)</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start pt-4">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (formErrors.terms) {
                      setFormErrors(prev => ({ ...prev, terms: "" }));
                    }
                  }}
                  className={`mt-1 rounded ${formErrors.terms ? "border-red-500" : ""}`}
                />
                <label htmlFor="terms" className="ml-2 text-sm">
                  I agree that this jingle / voice over does not violate any copyright and intellectual property or 3rd party privacy rights, otherwise I can be liable for legal prosecution and damages.
                </label>
              </div>
              {formErrors.terms && (
                <p className="text-sm text-red-500">{formErrors.terms}</p>
              )}
              
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? "Uploading..." : "Submit for Approval"}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                  onClick={() => {
                    setTitle("");
                    setMessageType("");
                    setLanguage("");
                    setSelectedFile(null);
                    setStartDate("");
                    setEndDate("");
                    setRepeatType("none");
                    setRepeatCount("");
                    setTermsAccepted(false);
                    setFormErrors({});
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-100 shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-secondary to-secondary/80"></div>
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Location(s) allowed to play this message</h2>
          </div>
          <div className="p-5 flex flex-col h-[450px]">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm bg-secondary/10 text-secondary px-3 py-1.5 rounded-full inline-flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary mr-2"></span>
                <span>{selectedLocations.length} items selected</span>
              </div>
              <div className="flex space-x-2">
                <button 
                  className="px-3 py-1.5 border border-secondary/30 rounded-md text-secondary hover:bg-secondary/5"
                  onClick={handleRemoveAllLocations}
                  disabled={selectedLocations.length === 0}
                >
                  Remove All
                </button>
                <button 
                  className="px-3 py-1.5 border border-secondary/30 rounded-md text-secondary hover:bg-secondary/5"
                  onClick={handleAddAllLocations}
                  disabled={selectedLocations.length === availableLocations.length}
                >
                  Add All
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Selected Locations Section */}
              <div>
                <h3 className="text-sm font-medium mb-2 text-secondary">Added Locations:</h3>
                <div className="border border-gray-100 rounded-md p-2 mb-4 max-h-40 overflow-y-auto shadow-sm">
                  {selectedLocations.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500 italic">No locations added yet</div>
                  ) : (
                    selectedLocations.map(location => (
                      <div key={location.id} className="flex justify-between items-center p-3 hover:bg-gray-50 transition-colors rounded">
                        <div className="flex items-center">
                          <span className="h-2 w-2 rounded-full bg-secondary mr-2"></span>
                          <span className="text-sm font-medium">{location.name}</span>
                        </div>
                        <button 
                          className="text-secondary hover:text-red-600 h-7 w-7 p-0 bg-transparent border-none flex items-center justify-center"
                          onClick={() => handleRemoveLocation(location.id)}
                          title="Remove location"
                        >
                          <Minus size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Available Locations Section */}
              <div>
                <h3 className="text-sm font-medium mb-2 text-secondary">Available Locations:</h3>
                <div className="border border-gray-100 rounded-md p-2 mb-4 max-h-40 overflow-y-auto shadow-sm">
                  {availableLocations.filter(loc => !loc.selected).length === 0 ? (
                    <div className="p-3 text-sm text-gray-500 italic">No more locations available</div>
                  ) : (
                    availableLocations.filter(loc => !loc.selected).map(location => (
                      <div key={location.id} className="flex justify-between items-center p-3 hover:bg-gray-50 transition-colors rounded">
                        <div className="flex items-center">
                          <span className="h-2 w-2 rounded-full bg-primary mr-2"></span>
                          <span className="text-sm font-medium">{location.name}</span>
                        </div>
                        <button 
                          className="text-secondary hover:text-green-600 h-7 w-7 p-0 bg-transparent border-none flex items-center justify-center"
                          onClick={() => handleAddLocation(location.id)}
                          title="Add location"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-auto">
              <div className="flex items-center mb-4">
                <input type="checkbox" id="termsAccept" className="mr-2" />
                <label htmlFor="termsAccept" className="text-sm">
                  I accept the <a href="#" className="text-primary hover:underline font-medium">Terms and Conditions</a>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Existing Jingles */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-100 shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary/90 via-secondary/60 to-primary/90"></div>
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Jingles & Voice Overs</h2>
            <span className="bg-secondary/10 text-secondary text-xs font-medium px-3 py-1 rounded-full">
              {jingles?.length || 0} items
            </span>
          </div>
          <div className="p-5">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-4 py-3 text-sm font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Type</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">From</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">To</th>
                  <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jingles && jingles.length > 0 ? (
                  jingles.map((jingle) => (
                    <tr key={jingle.id} className="border-b">
                      <td className="px-4 py-3">{jingle.title}</td>
                      <td className="px-4 py-3 capitalize">{jingle.type}</td>
                      <td className="px-4 py-3">{formatDate(jingle.startDate || undefined)}</td>
                      <td className="px-4 py-3">{formatDate(jingle.endDate || undefined)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          jingle.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : jingle.status === "Pending Approval"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {jingle.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            className="text-gray-500 hover:text-primary h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                            title="Play"
                          >
                            <Play size={16} />
                          </button>
                          <button 
                            className="text-gray-500 hover:text-primary h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="text-gray-500 hover:text-red-500 h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                            title="Delete"
                            onClick={() => handleDelete(jingle.id)}
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="rounded-full bg-primary/5 p-3 mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 font-medium">No jingles uploaded yet</p>
                        <p className="text-gray-400 text-sm mt-1">Upload your first jingle using the form above</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}