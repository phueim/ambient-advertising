import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Play, Plus, Minus, Trash, Edit } from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Jingle } from "@shared/schema";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function UploadJingle() {
  const [showForm, setShowForm] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [messageType, setMessageType] = useState("");
  const [language, setLanguage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [repeatType, setRepeatType] = useState("none");
  const [repeatCount, setRepeatCount] = useState("");
  const [specificTime, setSpecificTime] = useState("");
  const [specificTimeUnit, setSpecificTimeUnit] = useState("minutes");
  const [repeatEveryValue, setRepeatEveryValue] = useState("");
  const [repeatEveryUnit, setRepeatEveryUnit] = useState("minutes");
  const [stopBeforeValue, setStopBeforeValue] = useState("");
  const [stopBeforeUnit, setStopBeforeUnit] = useState("minutes");
  const [playFrequency, setPlayFrequency] = useState("daily");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
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
      
      // Reset form after successful upload
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/jingles"] });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload jingle",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTitle("");
    setMessageType("");
    setLanguage("");
    setSelectedFile(null);
    setStartDate("");
    setEndDate("");
    setRepeatType("none");
    setRepeatCount("");
    setSpecificTime("");
    setSpecificTimeUnit("minutes");
    setRepeatEveryValue("");
    setRepeatEveryUnit("minutes");
    setStopBeforeValue("");
    setStopBeforeUnit("minutes");
    setPlayFrequency("daily");
    setSelectedDays([]);
    setTermsAccepted(false);
    setFormErrors({});
  };

  const handleNewUpload = () => {
    resetForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (jingleId: number) => {
    if (confirm("Are you sure you want to delete this jingle?")) {
      deleteMutation.mutate(jingleId);
    }
  };

  // Location management functions
  const handleAddLocation = (locationId: number) => {
    const location = availableLocations.find(loc => loc.id === locationId);
    if (location && !selectedLocations.find(sel => sel.id === locationId)) {
      setSelectedLocations(prev => [...prev, { id: location.id, name: location.name }]);
      setAvailableLocations(prev => 
        prev.map(loc => loc.id === locationId ? { ...loc, selected: true } : loc)
      );
    }
  };

  const handleRemoveLocation = (locationId: number) => {
    setSelectedLocations(prev => prev.filter(loc => loc.id !== locationId));
    setAvailableLocations(prev => 
      prev.map(loc => loc.id === locationId ? { ...loc, selected: false } : loc)
    );
  };

  const handleAddAllLocations = () => {
    const allLocations = availableLocations.map(loc => ({ id: loc.id, name: loc.name }));
    setSelectedLocations(allLocations);
    setAvailableLocations(prev => prev.map(loc => ({ ...loc, selected: true })));
  };

  const handleRemoveAllLocations = () => {
    setSelectedLocations([]);
    setAvailableLocations(prev => prev.map(loc => ({ ...loc, selected: false })));
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
      
      {!showForm && (
        <div className="mb-4">
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Upload
          </Button>
        </div>
      )}
      
      {/* Upload Form Section */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 ${showForm ? 'block' : 'hidden'}`}>
        {/* Upload Form */}
        <Card className="border border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary to-primary/80"></div>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">New Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Message Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (formErrors.title) {
                      setFormErrors(prev => ({ ...prev, title: "" }));
                    }
                  }}
                  placeholder="A Title for Jingle / Voice Over"
                  className={formErrors.title ? "border-red-500" : ""}
                />
                {formErrors.title && (
                  <p className="text-sm text-red-500">{formErrors.title}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="file-preview">Message File (.mp3)</Label>
                <div className="flex">
                  <Input
                    id="file-preview"
                    type="text"
                    placeholder={selectedFile ? selectedFile.name : "No file selected"}
                    className={`rounded-r-none ${formErrors.file ? "border-red-500" : ""}`}
                    readOnly
                  />
                  <Label
                    htmlFor="file-upload"
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-r-md hover:bg-gray-300 transition cursor-pointer inline-flex items-center"
                  >
                    Browse
                  </Label>
                  <Input
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
                <Label htmlFor="message-type">Message Type</Label>
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
                <Label htmlFor="language">Message Language</Label>
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
                <Label className="block text-sm font-medium">Play Schedule</Label>
                <div className="space-y-3">
                  <div className="flex flex-row items-center gap-3">
                    <Checkbox
                      id="start-date-checkbox"
                      checked={!!startDate}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setStartDate(new Date().toISOString().split('T')[0]);
                        } else {
                          setStartDate("");
                        }
                      }}
                    />
                    <Label htmlFor="start-date-checkbox" className="text-sm">Starts at:</Label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      disabled={!startDate}
                      className={`px-3 py-2 border border-gray-300 rounded-md text-sm ${!startDate ? 'bg-gray-50 text-gray-400' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                    />
                  </div>
                  
                  <div className="flex flex-row items-center gap-3">
                    <Checkbox
                      id="end-date-checkbox"
                      checked={!!endDate}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setEndDate(new Date().toISOString().split('T')[0]);
                        } else {
                          setEndDate("");
                        }
                      }}
                    />
                    <Label htmlFor="end-date-checkbox" className="text-sm">Stops after:</Label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={!endDate}
                      className={`px-3 py-2 border border-gray-300 rounded-md text-sm ${!endDate ? 'bg-gray-50 text-gray-400' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <Label className="block text-sm font-medium">Repeat message play (optional)</Label>
                <div className="space-y-3">
                  {/* None Option */}
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="repeat-none"
                      name="repeat"
                      value="none"
                      checked={repeatType === "none"}
                      onChange={(e) => setRepeatType(e.target.value)}
                      className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <Label htmlFor="repeat-none" className="ml-2 text-sm">None</Label>
                  </div>

                  {/* Repeat message after every */}
                  <div className="flex items-center flex-wrap gap-2">
                    <input
                      type="radio"
                      id="repeat-every"
                      name="repeat"
                      value="every"
                      checked={repeatType === "every"}
                      onChange={(e) => setRepeatType(e.target.value)}
                      className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <Label htmlFor="repeat-every" className="text-sm">Repeat message after every</Label>
                    <select
                      disabled={repeatType !== "every"}
                      value={repeatType === "every" ? repeatEveryValue : ""}
                      onChange={(e) => setRepeatEveryValue(e.target.value)}
                      className={`px-2 py-1 border border-gray-300 rounded text-sm ${repeatType !== "every" ? 'bg-gray-100 text-gray-400' : 'bg-white'}`}
                    >
                      <option value="">Select</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                    <span className="text-sm">song(s)</span>
                  </div>

                  {/* Play at specific time */}
                  <div className="flex items-center flex-wrap gap-2">
                    <input
                      type="radio"
                      id="repeat-specific"
                      name="repeat"
                      value="specific"
                      checked={repeatType === "specific"}
                      onChange={(e) => setRepeatType(e.target.value)}
                      className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <Label htmlFor="repeat-specific" className="text-sm">Play at specific time:</Label>
                    <select
                      disabled={repeatType !== "specific"}
                      value={specificTime.slice(0, 2) || ""}
                      onChange={(e) => {
                        const hour = e.target.value;
                        const minute = specificTime.slice(2, 4) || "00";
                        setSpecificTime(hour + minute);
                      }}
                      className={`px-2 py-1 border border-gray-300 rounded text-sm w-16 ${repeatType !== "specific" ? 'bg-gray-100 text-gray-400' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                    >
                      <option value="">HH</option>
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i.toString().padStart(2, '0')}>
                          {i.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm mx-1">:</span>
                    <select
                      disabled={repeatType !== "specific"}
                      value={specificTime.slice(2, 4) || ""}
                      onChange={(e) => {
                        const hour = specificTime.slice(0, 2) || "00";
                        const minute = e.target.value;
                        setSpecificTime(hour + minute);
                      }}
                      className={`px-2 py-1 border border-gray-300 rounded text-sm w-16 ${repeatType !== "specific" ? 'bg-gray-100 text-gray-400' : 'bg-white'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 60 }, (_, i) => (
                        <option key={i} value={i.toString().padStart(2, '0')}>
                          {i.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Repeat every and Stop before sections */}
                {repeatType === "specific" && (
                  <div className="ml-6 space-y-3 border-l-2 border-gray-200 pl-4">
                    <div className="flex items-center flex-wrap gap-2">
                      <Label className="text-sm font-medium">Repeat every</Label>
                      <select
                        value={repeatEveryValue}
                        onChange={(e) => setRepeatEveryValue(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Select</option>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="20">20</option>
                        <option value="25">25</option>
                        <option value="30">30</option>
                        <option value="35">35</option>
                        <option value="40">40</option>
                        <option value="45">45</option>
                        <option value="50">50</option>
                        <option value="55">55</option>
                        <option value="60">60</option>
                      </select>
                      <span className="text-sm">minutes</span>
                    </div>

                    <div className="flex items-center flex-wrap gap-2">
                      <Label className="text-sm font-medium">Stop before</Label>
                      <select
                        value={stopBeforeValue.slice(0, 2) || ""}
                        onChange={(e) => {
                          const hour = e.target.value;
                          const minute = stopBeforeValue.slice(2, 4) || "00";
                          setStopBeforeValue(hour + minute);
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm w-16 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">HH</option>
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, '0')}>
                            {i.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      <span className="text-sm mx-1">:</span>
                      <select
                        value={stopBeforeValue.slice(2, 4) || ""}
                        onChange={(e) => {
                          const hour = stopBeforeValue.slice(0, 2) || "00";
                          const minute = e.target.value;
                          setStopBeforeValue(hour + minute);
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm w-16 bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">MM</option>
                        {Array.from({ length: 60 }, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, '0')}>
                            {i.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Play Frequency */}
                {repeatType === "specific" && (
                  <div className="space-y-3">
                    <Label className="block text-sm font-medium">Play Frequency</Label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="frequency-daily"
                          name="frequency"
                          value="daily"
                          checked={playFrequency === "daily"}
                          onChange={(e) => setPlayFrequency(e.target.value)}
                          className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                        />
                        <Label htmlFor="frequency-daily" className="ml-2 text-sm">Daily</Label>
                      </div>
                      
                      <div className="flex items-start">
                        <input
                          type="radio"
                          id="frequency-weekly"
                          name="frequency"
                          value="weekly"
                          checked={playFrequency === "weekly"}
                          onChange={(e) => setPlayFrequency(e.target.value)}
                          className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500 mt-1"
                        />
                        <div className="ml-2">
                          <Label htmlFor="frequency-weekly" className="text-sm">Weekly</Label>
                          {playFrequency === "weekly" && (
                            <div className="mt-2">
                              <div className="text-xs text-red-600 mb-2">* Works for devices connected online.</div>
                              <div className="bg-gray-800 text-white px-3 py-2 rounded">
                                <div className="text-xs font-medium mb-2">Days of Week</div>
                                <div className="grid grid-cols-7 gap-1">
                                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                    <div key={day} className="text-center">
                                      <div className="text-xs mb-1">{day}</div>
                                      <input
                                        type="checkbox"
                                        checked={selectedDays.includes(day)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedDays(prev => [...prev, day]);
                                          } else {
                                            setSelectedDays(prev => prev.filter(d => d !== day));
                                          }
                                        }}
                                        className="w-3 h-3"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-start pt-4">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={() => {
                    // Don't allow direct checking - must accept through dialog
                    setShowTermsDialog(true);
                  }}
                  className={formErrors.terms ? "border-red-500" : ""}
                />
                <Label 
                  htmlFor="terms" 
                  className="ml-2 text-sm cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowTermsDialog(true);
                  }}
                >
                  I accept the <span className="text-primary hover:underline">Terms and Conditions</span>
                </Label>
              </div>
              {formErrors.terms && (
                <p className="text-sm text-red-500">{formErrors.terms}</p>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 px-6"
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? "Uploading..." : "Submit for Approval"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="border-primary/20 hover:bg-primary/5 hover:text-primary px-6"
                  onClick={() => setShowCancelDialog(true)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        {/* Locations Section */}
        <Card className="border border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-secondary to-secondary/80"></div>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Location(s) allowed to play this message</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-[450px]">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm bg-secondary/10 text-secondary px-3 py-1.5 rounded-full inline-flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary mr-2"></span>
                <span>{selectedLocations.length} items selected</span>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  className="border-secondary/30 hover:bg-secondary/5 hover:text-secondary text-secondary"
                  onClick={handleRemoveAllLocations}
                  disabled={selectedLocations.length === 0}
                >
                  Remove All
                </Button>
                <Button 
                  variant="outline" 
                  className="border-secondary/30 hover:bg-secondary/5 hover:text-secondary text-secondary"
                  onClick={handleAddAllLocations}
                  disabled={selectedLocations.length === availableLocations.length}
                >
                  Add All
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 flex-grow">
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
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-secondary hover:text-red-600 h-7 w-7 p-0"
                          onClick={() => handleRemoveLocation(location.id)}
                          title="Remove location"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Available Locations Section */}
              <div>
                <h3 className="text-sm font-medium mb-2 text-gray-700">Available Locations:</h3>
                <div className="border border-gray-100 rounded-md p-2 max-h-40 overflow-y-auto shadow-sm">
                  {availableLocations.filter(loc => !loc.selected).length === 0 ? (
                    <div className="p-3 text-sm text-gray-500 italic">All locations added</div>
                  ) : (
                    availableLocations
                      .filter(location => !location.selected)
                      .map(location => (
                        <div key={location.id} className="flex justify-between items-center p-3 hover:bg-gray-50 transition-colors rounded">
                          <div className="flex items-center">
                            <span className="h-2 w-2 rounded-full bg-gray-400 mr-2"></span>
                            <span className="text-sm">{location.name}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-600 hover:text-secondary h-7 w-7 p-0"
                            onClick={() => handleAddLocation(location.id)}
                            title="Add location"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
            {formErrors.locations && (
              <p className="text-sm text-red-500 mt-2">{formErrors.locations}</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Your Jingles & Voice Overs */}
      <Card className={`mt-8 border border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden ${showForm ? 'hidden' : 'block'}`}>
        <div className="h-2 bg-gradient-to-r from-primary/80 via-secondary/60 to-primary/80"></div>
        <CardHeader>
          <CardTitle className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Your Jingles & Voice Overs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jingles && jingles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-primary/90 text-white">
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Message Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Type & Language</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Schedule</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"></div>
                          <p>Loading your jingles...</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    jingles.map((jingle) => (
                      <tr key={jingle.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-secondary/10 rounded-full flex items-center justify-center">
                              <Play className="h-4 w-4 text-secondary" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium">{jingle.title}</p>
                              <p className="text-xs text-gray-500">Submitted for approval</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">{jingle.type || "Vocal"}</div>
                          <div className="text-xs text-gray-500">{jingle.language || "English"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            {jingle.startDate ? format(new Date(jingle.startDate), "MM/dd/yyyy") : "No start date"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {jingle.endDate ? `Until ${format(new Date(jingle.endDate), "MM/dd/yyyy")}` : "No end date"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs font-medium rounded-full ${
                            jingle.status === "Approved" 
                              ? "bg-green-100 text-green-800" 
                              : jingle.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {jingle.status || "Pending Approval"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <div className="flex justify-end space-x-2">
                            <Button size="sm" variant="outline" className="border-primary/20 hover:bg-primary/5 hover:text-primary text-gray-600">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleDelete(jingle.id)}
                            >
                              <Trash className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Play className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jingles uploaded yet</h3>
              <p className="text-gray-500 text-sm mb-4">
                Your submitted jingles and voice overs will appear here with detailed information after you complete the "Submit for Approval" process.
              </p>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload Your First Jingle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Upload</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to cancel? All form data will be lost.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Continue Editing
            </Button>
            <Button
              onClick={() => {
                setShowCancelDialog(false);
                resetForm();
                setShowForm(false);
              }}
            >
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terms and Conditions Dialog */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-primary">Terms and Conditions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold text-primary mb-2">1. Acceptance of Terms</h3>
              <p>By uploading jingles and voiceovers to our platform, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our service.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-primary mb-2">2. Content Ownership and Rights</h3>
              <p>You represent and warrant that you own or have the necessary rights to upload and distribute the audio content. You grant us a non-exclusive license to use, reproduce, and distribute your content through our platform for the intended business purposes.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-primary mb-2">3. Content Guidelines</h3>
              <p>All uploaded content must comply with our content guidelines:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>No copyrighted material without proper authorization</li>
                <li>No offensive, discriminatory, or inappropriate content</li>
                <li>Content must be suitable for commercial use</li>
                <li>Audio quality must meet our technical standards</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-primary mb-2">4. Approval Process</h3>
              <p>All uploaded content is subject to review and approval. USEA reserve the right to reject content that does not meet our guidelines or quality standards. Approval typically takes up to 1-2 business days.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-primary mb-2">5. Technical Requirements</h3>
              <p>Supported formats: MP3, AAC. Maximum file size: 10MB. Recommended bitrate: 192kbps or higher for optimal quality.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-primary mb-2">6. Liability and Disclaimer</h3>
              <p>USEA are not responsible for any loss or damage arising from the use of uploaded content. You indemnify us against any claims related to your uploaded content.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-primary mb-2">7. Privacy and Data Protection</h3>
              <p>USEA handle your data in accordance with our Privacy Policy. Your content and personal information are protected and used only for legitimate business purposes.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-primary mb-2">8. Modifications</h3>
              <p>USEA reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.</p>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              onClick={() => {
                setTermsAccepted(true);
                setShowTermsDialog(false);
                if (formErrors.terms) {
                  setFormErrors(prev => ({ ...prev, terms: "" }));
                }
              }}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              I Accept Terms and Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}