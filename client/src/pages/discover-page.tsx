import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Play } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Song, Playlist } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Type definitions for the form steps
type BusinessType = "Retail" | "F&B" | "Hospitality" | "Others";
type FnBOutlet = "Bakery / Bake Shop" | "Bar" | "Foodcourt" | "Café" | "Fast Food Chain" | "Restaurant";
type OriginCountry = "China" | "Hong Kong" | "France" | "Italy" | "Japan" | "Korea" | "Not applicable";
type BrandValue = "Family" | "Value for Money" | "Adventurous" | "Affluence" | "Not Applicable";
type TrackType = "Vocal only" | "Instrumental only";

export default function DiscoverPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(5);

  // Form state
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [fnbOutlet, setFnbOutlet] = useState<FnBOutlet | null>(null);
  const [originCountry, setOriginCountry] = useState<OriginCountry | null>(null);
  const [brandValue, setBrandValue] = useState<BrandValue | null>(null);
  const [trackType, setTrackType] = useState<TrackType | null>(null);
  
  // Results state
  const [showResults, setShowResults] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>("");
  
  // Load playlists
  const { data: playlists } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
    enabled: !!user,
  });
  
  // Load recommended songs based on preferences
  const { data: recommendedSongs, isLoading, refetch } = useQuery<Song[]>({
    queryKey: ["/api/songs", "recommended", { businessType, fnbOutlet, originCountry, brandValue, trackType }],
    queryFn: async () => {
      // We'll modify this to use our step-based preferences
      const queryParams = new URLSearchParams();
      
      // Only add parameters that are selected
      if (businessType) queryParams.append("businessType", businessType);
      if (fnbOutlet) queryParams.append("fnbOutlet", fnbOutlet);
      if (originCountry && originCountry !== "Not applicable") queryParams.append("originCountry", originCountry);
      if (brandValue && brandValue !== "Not Applicable") queryParams.append("brandValue", brandValue);
      if (trackType) queryParams.append("trackType", trackType);
      
      const response = await fetch(`/api/songs/search?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch recommendations");
      return response.json();
    },
    enabled: false, // Don't fetch on component mount, only when all steps are complete
  });
  
  // Add song to playlist mutation
  const addToPlaylistMutation = useMutation({
    mutationFn: async (data: { playlistId: number, songId: number }) => {
      const response = await apiRequest(
        "POST", 
        `/api/playlists/${data.playlistId}/songs`, 
        { songId: data.songId }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Song added to playlist successfully",
      });
      
      // Invalidate playlists query
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add song to playlist",
        variant: "destructive",
      });
    }
  });

  // Navigate to next step if current step is valid
  const goToNextStep = () => {
    // Validate current step
    if (currentStep === 1 && !businessType) {
      toast({
        title: "Selection required",
        description: "Please select the nature of your business",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 2 && businessType === "F&B" && !fnbOutlet) {
      toast({
        title: "Selection required",
        description: "Please select the type of F&B outlet",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 3 && !originCountry) {
      toast({
        title: "Selection required",
        description: "Please select the country of origin for your branding",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 4 && !brandValue) {
      toast({
        title: "Selection required",
        description: "Please select the brand values",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 5 && !trackType) {
      toast({
        title: "Selection required",
        description: "Please select your track type preference",
        variant: "destructive",
      });
      return;
    }

    // If it's the last step, show results
    if (currentStep === totalSteps) {
      refetch();
      setShowResults(true);
      return;
    }

    // Move to next step
    setCurrentStep(currentStep + 1);
  };

  // Send results
  const sendMyResult = () => {
    if (!recommendedSongs || recommendedSongs.length === 0) {
      toast({
        title: "No recommendations",
        description: "No recommended songs to send",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Your music recommendations have been processed successfully!",
    });

    // Reset the form
    setCurrentStep(1);
    setBusinessType(null);
    setFnbOutlet(null);
    setOriginCountry(null);
    setBrandValue(null);
    setTrackType(null);
    setShowResults(false);
  };

  // Reset to specific step based on previous selection
  const resetToStep = (step: number) => {
    setCurrentStep(step);
    setShowResults(false);

    // Reset values for steps after the target step
    if (step <= 1) {
      setBusinessType(null);
      setFnbOutlet(null);
      setOriginCountry(null);
      setBrandValue(null);
      setTrackType(null);
    } else if (step <= 2) {
      setFnbOutlet(null);
      setOriginCountry(null);
      setBrandValue(null);
      setTrackType(null);
    } else if (step <= 3) {
      setOriginCountry(null);
      setBrandValue(null);
      setTrackType(null);
    } else if (step <= 4) {
      setBrandValue(null);
      setTrackType(null);
    } else if (step <= 5) {
      setTrackType(null);
    }
  };

  // Render circle step indicator
  const StepCircle = ({ number }: { number: number }) => (
    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-semibold text-sm 
      ${currentStep >= number ? 'bg-green-500' : 'bg-gray-300'}`}>
      {number}
    </div>
  );

  // Render current step question heading
  const renderStepHeading = () => {
    switch (currentStep) {
      case 1:
        return "What is the nature of your business?";
      case 2:
        return "What kind of F&B outlet is it?";
      case 3:
        return "Is your branding closely tied down to the country-of-origin?";
      case 4:
        return "What values does your brand advocate?";
      case 5:
        return "Do you prefer vocal or instrumental tracks?";
      default:
        return "";
    }
  };

  // Visual selector component with images
  const VisualOption = ({ 
    id, 
    value, 
    checked, 
    onChange, 
    label, 
    image,
    icon
  }: { 
    id: string, 
    value: string, 
    checked: boolean, 
    onChange: (value: any) => void, 
    label: string,
    image?: string,
    icon?: React.ReactNode
  }) => (
    <div 
      className={`
        relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200
        border-2 ${checked ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'} 
        hover:border-primary/50 mb-3
      `}
      onClick={() => onChange(value)}
    >
      <input 
        type="radio"
        id={id}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      <div className="flex flex-col h-full">
        {image && (
          <div className="h-32 overflow-hidden bg-gray-100">
            <img src={image} alt={label} className="w-full h-full object-cover" />
          </div>
        )}
        <div className={`p-4 ${!image && icon ? 'flex items-center' : ''}`}>
          {icon && <div className="mr-3 text-primary">{icon}</div>}
          <div>
            <label htmlFor={id} className="font-medium cursor-pointer block">{label}</label>
          </div>
        </div>
      </div>
      {checked && (
        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Discover Brand Fit Music</h1>
        <p className="text-gray-600 mb-6">Find the right music for your business. Make quick changes or search for new playlists.</p>
        
        {!showResults ? (
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-0 overflow-hidden">
              {/* Question Header */}
              <div className="bg-black text-white p-4 flex items-center">
                <StepCircle number={currentStep} />
                <h2 className="ml-3 font-medium">{renderStepHeading()}</h2>
              </div>
              
              {/* Previous Steps (Already Answered) */}
              {currentStep > 1 && (
                <div className="px-6 pt-4">
                  {businessType && (
                    <div className="flex items-center mb-2">
                      <StepCircle number={1} />
                      <div className="ml-3">
                        <h3 className="font-medium">What is the nature of your business?</h3>
                        <p className="text-gray-700">{businessType}</p>
                      </div>
                      <button 
                        className="ml-auto text-primary hover:underline text-sm"
                        onClick={() => resetToStep(1)}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                  
                  {currentStep > 2 && businessType === "F&B" && fnbOutlet && (
                    <div className="flex items-center mb-2">
                      <StepCircle number={2} />
                      <div className="ml-3">
                        <h3 className="font-medium">What kind of F&B outlet is it?</h3>
                        <p className="text-gray-700">{fnbOutlet}</p>
                      </div>
                      <button 
                        className="ml-auto text-primary hover:underline text-sm"
                        onClick={() => resetToStep(2)}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                  
                  {currentStep > 3 && originCountry && (
                    <div className="flex items-center mb-2">
                      <StepCircle number={3} />
                      <div className="ml-3">
                        <h3 className="font-medium">Is your branding closely tied down to the country-of-origin?</h3>
                        <p className="text-gray-700">{originCountry}</p>
                      </div>
                      <button 
                        className="ml-auto text-primary hover:underline text-sm"
                        onClick={() => resetToStep(3)}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                  
                  {currentStep > 4 && brandValue && (
                    <div className="flex items-center mb-2">
                      <StepCircle number={4} />
                      <div className="ml-3">
                        <h3 className="font-medium">What values does your brand advocate?</h3>
                        <p className="text-gray-700">{brandValue}</p>
                      </div>
                      <button 
                        className="ml-auto text-primary hover:underline text-sm"
                        onClick={() => resetToStep(4)}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Current Step Question */}
              <div className="p-6">
                {currentStep === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      className={`
                        relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200
                        border-2 ${businessType === "Retail" ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'} 
                        hover:border-primary/50 mb-3
                      `}
                      onClick={() => setBusinessType("Retail")}
                    >
                      <input 
                        type="radio"
                        id="business-retail"
                        value="Retail"
                        checked={businessType === "Retail"}
                        onChange={() => setBusinessType("Retail")}
                        className="sr-only"
                      />
                      <div className="flex flex-col h-full">
                        <div className="h-32 overflow-hidden bg-gray-100">
                          <img src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Retail" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <label htmlFor="business-retail" className="font-medium cursor-pointer block">Retail</label>
                        </div>
                      </div>
                      {businessType === "Retail" && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div 
                      className={`
                        relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200
                        border-2 ${businessType === "F&B" ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'} 
                        hover:border-primary/50 mb-3
                      `}
                      onClick={() => setBusinessType("F&B")}
                    >
                      <input 
                        type="radio"
                        id="business-fnb"
                        value="F&B"
                        checked={businessType === "F&B"}
                        onChange={() => setBusinessType("F&B")}
                        className="sr-only"
                      />
                      <div className="flex flex-col h-full">
                        <div className="h-32 overflow-hidden bg-gray-100">
                          <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Food & Beverage" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <label htmlFor="business-fnb" className="font-medium cursor-pointer block">Food & Beverage</label>
                        </div>
                      </div>
                      {businessType === "F&B" && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div 
                      className={`
                        relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200
                        border-2 ${businessType === "Hospitality" ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'} 
                        hover:border-primary/50 mb-3
                      `}
                      onClick={() => setBusinessType("Hospitality")}
                    >
                      <input 
                        type="radio"
                        id="business-hospitality"
                        value="Hospitality"
                        checked={businessType === "Hospitality"}
                        onChange={() => setBusinessType("Hospitality")}
                        className="sr-only"
                      />
                      <div className="flex flex-col h-full">
                        <div className="h-32 overflow-hidden bg-gray-100">
                          <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Hospitality" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <label htmlFor="business-hospitality" className="font-medium cursor-pointer block">Hospitality</label>
                        </div>
                      </div>
                      {businessType === "Hospitality" && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div 
                      className={`
                        relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200
                        border-2 ${businessType === "Others" ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'} 
                        hover:border-primary/50 mb-3
                      `}
                      onClick={() => setBusinessType("Others")}
                    >
                      <input 
                        type="radio"
                        id="business-others"
                        value="Others"
                        checked={businessType === "Others"}
                        onChange={() => setBusinessType("Others")}
                        className="sr-only"
                      />
                      <div className="flex flex-col h-full">
                        <div className="h-32 overflow-hidden bg-gray-100">
                          <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Others" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <label htmlFor="business-others" className="font-medium cursor-pointer block">Others</label>
                        </div>
                      </div>
                      {businessType === "Others" && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {currentStep === 2 && businessType === "F&B" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bakery */}
                    <div 
                      className={`
                        relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200
                        border-2 ${fnbOutlet === "Bakery / Bake Shop" ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'} 
                        hover:border-primary/50 mb-3
                      `}
                      onClick={() => setFnbOutlet("Bakery / Bake Shop")}
                    >
                      <input 
                        type="radio"
                        id="fnb-bakery"
                        value="Bakery / Bake Shop"
                        checked={fnbOutlet === "Bakery / Bake Shop"}
                        onChange={() => setFnbOutlet("Bakery / Bake Shop")}
                        className="sr-only"
                      />
                      <div className="flex flex-col h-full">
                        <div className="h-32 overflow-hidden bg-gray-100">
                          <img src="https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Bakery" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <label htmlFor="fnb-bakery" className="font-medium cursor-pointer block">Bakery / Bake Shop</label>
                        </div>
                      </div>
                      {fnbOutlet === "Bakery / Bake Shop" && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Bar */}
                    <div 
                      className={`
                        relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200
                        border-2 ${fnbOutlet === "Bar" ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'} 
                        hover:border-primary/50 mb-3
                      `}
                      onClick={() => setFnbOutlet("Bar")}
                    >
                      <input 
                        type="radio"
                        id="fnb-bar"
                        value="Bar"
                        checked={fnbOutlet === "Bar"}
                        onChange={() => setFnbOutlet("Bar")}
                        className="sr-only"
                      />
                      <div className="flex flex-col h-full">
                        <div className="h-32 overflow-hidden bg-gray-100">
                          <img src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Bar" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <label htmlFor="fnb-bar" className="font-medium cursor-pointer block">Bar</label>
                        </div>
                      </div>
                      {fnbOutlet === "Bar" && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Foodcourt */}
                    <div 
                      className={`
                        relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200
                        border-2 ${fnbOutlet === "Foodcourt" ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'} 
                        hover:border-primary/50 mb-3
                      `}
                      onClick={() => setFnbOutlet("Foodcourt")}
                    >
                      <input 
                        type="radio"
                        id="fnb-foodcourt"
                        value="Foodcourt"
                        checked={fnbOutlet === "Foodcourt"}
                        onChange={() => setFnbOutlet("Foodcourt")}
                        className="sr-only"
                      />
                      <div className="flex flex-col h-full">
                        <div className="h-32 overflow-hidden bg-gray-100">
                          <img src="https://images.unsplash.com/photo-1526069631228-723c945bea6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Foodcourt" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <label htmlFor="fnb-foodcourt" className="font-medium cursor-pointer block">Foodcourt</label>
                        </div>
                      </div>
                      {fnbOutlet === "Foodcourt" && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Café */}
                    <div 
                      className={`
                        relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200
                        border-2 ${fnbOutlet === "Café" ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'} 
                        hover:border-primary/50 mb-3
                      `}
                      onClick={() => setFnbOutlet("Café")}
                    >
                      <input 
                        type="radio"
                        id="fnb-cafe"
                        value="Café"
                        checked={fnbOutlet === "Café"}
                        onChange={() => setFnbOutlet("Café")}
                        className="sr-only"
                      />
                      <div className="flex flex-col h-full">
                        <div className="h-32 overflow-hidden bg-gray-100">
                          <img src="https://images.unsplash.com/photo-1525610553991-2bede1a236e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Café" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <label htmlFor="fnb-cafe" className="font-medium cursor-pointer block">Café</label>
                        </div>
                      </div>
                      {fnbOutlet === "Café" && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Fast Food Chain */}
                    <div 
                      className={`
                        relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200
                        border-2 ${fnbOutlet === "Fast Food Chain" ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'} 
                        hover:border-primary/50 mb-3
                      `}
                      onClick={() => setFnbOutlet("Fast Food Chain")}
                    >
                      <input 
                        type="radio"
                        id="fnb-fastfood"
                        value="Fast Food Chain"
                        checked={fnbOutlet === "Fast Food Chain"}
                        onChange={() => setFnbOutlet("Fast Food Chain")}
                        className="sr-only"
                      />
                      <div className="flex flex-col h-full">
                        <div className="h-32 overflow-hidden bg-gray-100">
                          <img src="https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Fast Food Chain" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <label htmlFor="fnb-fastfood" className="font-medium cursor-pointer block">Fast Food Chain</label>
                        </div>
                      </div>
                      {fnbOutlet === "Fast Food Chain" && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Restaurant */}
                    <div 
                      className={`
                        relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200
                        border-2 ${fnbOutlet === "Restaurant" ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'} 
                        hover:border-primary/50 mb-3
                      `}
                      onClick={() => setFnbOutlet("Restaurant")}
                    >
                      <input 
                        type="radio"
                        id="fnb-restaurant"
                        value="Restaurant"
                        checked={fnbOutlet === "Restaurant"}
                        onChange={() => setFnbOutlet("Restaurant")}
                        className="sr-only"
                      />
                      <div className="flex flex-col h-full">
                        <div className="h-32 overflow-hidden bg-gray-100">
                          <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Restaurant" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <label htmlFor="fnb-restaurant" className="font-medium cursor-pointer block">Restaurant</label>
                        </div>
                      </div>
                      {fnbOutlet === "Restaurant" && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {currentStep === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* China */}
                    <div 
                      className={`
                        relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200
                        border-2 ${originCountry === "China" ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'} 
                        hover:border-primary/50 mb-3
                      `}
                      onClick={() => setOriginCountry("China")}
                    >
                      <input 
                        type="radio"
                        id="origin-china"
                        value="China"
                        checked={originCountry === "China"}
                        onChange={() => setOriginCountry("China")}
                        className="sr-only"
                      />
                      <div className="flex flex-col h-full">
                        <div className="h-32 overflow-hidden bg-gray-100">
                          <img src="https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="China" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <label htmlFor="origin-china" className="font-medium cursor-pointer block">China</label>
                        </div>
                      </div>
                      {originCountry === "China" && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Hong Kong */}
                    <div 
                      className={`
                        relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200
                        border-2 ${originCountry === "Hong Kong" ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'} 
                        hover:border-primary/50 mb-3
                      `}
                      onClick={() => setOriginCountry("Hong Kong")}
                    >
                      <input 
                        type="radio"
                        id="origin-hongkong"
                        value="Hong Kong"
                        checked={originCountry === "Hong Kong"}
                        onChange={() => setOriginCountry("Hong Kong")}
                        className="sr-only"
                      />
                      <div className="flex flex-col h-full">
                        <div className="h-32 overflow-hidden bg-gray-100">
                          <img src="https://images.unsplash.com/photo-1536599018102-9f803c140fc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Hong Kong" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <label htmlFor="origin-hongkong" className="font-medium cursor-pointer block">Hong Kong</label>
                        </div>
                      </div>
                      {originCountry === "Hong Kong" && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* France */}
                    <div 
                      className={`
                        relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200
                        border-2 ${originCountry === "France" ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'} 
                        hover:border-primary/50 mb-3
                      `}
                      onClick={() => setOriginCountry("France")}
                    >
                      <input 
                        type="radio"
                        id="origin-france"
                        value="France"
                        checked={originCountry === "France"}
                        onChange={() => setOriginCountry("France")}
                        className="sr-only"
                      />
                      <div className="flex flex-col h-full">
                        <div className="h-32 overflow-hidden bg-gray-100">
                          <img src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="France" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <label htmlFor="origin-france" className="font-medium cursor-pointer block">France</label>
                        </div>
                      </div>
                      {originCountry === "France" && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Italy */}
                    <div 
                      className={`
                        relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200
                        border-2 ${originCountry === "Italy" ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'} 
                        hover:border-primary/50 mb-3
                      `}
                      onClick={() => setOriginCountry("Italy")}
                    >
                      <input 
                        type="radio"
                        id="origin-italy"
                        value="Italy"
                        checked={originCountry === "Italy"}
                        onChange={() => setOriginCountry("Italy")}
                        className="sr-only"
                      />
                      <div className="flex flex-col h-full">
                        <div className="h-32 overflow-hidden bg-gray-100">
                          <img src="https://images.unsplash.com/photo-1525874684015-58379d421a52?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Italy" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <label htmlFor="origin-italy" className="font-medium cursor-pointer block">Italy</label>
                        </div>
                      </div>
                      {originCountry === "Italy" && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Japan */}
                    <div 
                      className={`
                        relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200
                        border-2 ${originCountry === "Japan" ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'} 
                        hover:border-primary/50 mb-3
                      `}
                      onClick={() => setOriginCountry("Japan")}
                    >
                      <input 
                        type="radio"
                        id="origin-japan"
                        value="Japan"
                        checked={originCountry === "Japan"}
                        onChange={() => setOriginCountry("Japan")}
                        className="sr-only"
                      />
                      <div className="flex flex-col h-full">
                        <div className="h-32 overflow-hidden bg-gray-100">
                          <img src="https://images.unsplash.com/photo-1528164344705-47542687000d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Japan" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <label htmlFor="origin-japan" className="font-medium cursor-pointer block">Japan</label>
                        </div>
                      </div>
                      {originCountry === "Japan" && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Korea */}
                    <div 
                      className={`
                        relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200
                        border-2 ${originCountry === "Korea" ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'} 
                        hover:border-primary/50 mb-3
                      `}
                      onClick={() => setOriginCountry("Korea")}
                    >
                      <input 
                        type="radio"
                        id="origin-korea"
                        value="Korea"
                        checked={originCountry === "Korea"}
                        onChange={() => setOriginCountry("Korea")}
                        className="sr-only"
                      />
                      <div className="flex flex-col h-full">
                        <div className="h-32 overflow-hidden bg-gray-100">
                          <img src="https://images.unsplash.com/photo-1548115184-bc6544d06a58?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Korea" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <label htmlFor="origin-korea" className="font-medium cursor-pointer block">Korea</label>
                        </div>
                      </div>
                      {originCountry === "Korea" && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Not Applicable */}
                    <div 
                      className={`
                        relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200
                        border-2 ${originCountry === "Not applicable" ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'} 
                        hover:border-primary/50 mb-3
                      `}
                      onClick={() => setOriginCountry("Not applicable")}
                    >
                      <input 
                        type="radio"
                        id="origin-na"
                        value="Not applicable"
                        checked={originCountry === "Not applicable"}
                        onChange={() => setOriginCountry("Not applicable")}
                        className="sr-only"
                      />
                      <div className="flex flex-col h-full">
                        <div className="p-4 flex items-center justify-center h-full">
                          <div className="mr-3 text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                          <label htmlFor="origin-na" className="font-medium cursor-pointer block">Not applicable</label>
                        </div>
                      </div>
                      {originCountry === "Not applicable" && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {currentStep === 4 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Family */}
                    <div 
                      className={`
                        relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200
                        border-2 ${brandValue === "Family" ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'} 
                        hover:border-primary/50 mb-3
                      `}
                      onClick={() => setBrandValue("Family")}
                    >
                      <input 
                        type="radio"
                        id="value-family"
                        value="Family"
                        checked={brandValue === "Family"}
                        onChange={() => setBrandValue("Family")}
                        className="sr-only"
                      />
                      <div className="flex flex-col h-full">
                        <div className="h-32 overflow-hidden bg-gray-100">
                          <img src="https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Family" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <label htmlFor="value-family" className="font-medium cursor-pointer block">Family</label>
                        </div>
                      </div>
                      {brandValue === "Family" && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Value for Money */}
                    <div 
                      className={`
                        relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200
                        border-2 ${brandValue === "Value for Money" ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'} 
                        hover:border-primary/50 mb-3
                      `}
                      onClick={() => setBrandValue("Value for Money")}
                    >
                      <input 
                        type="radio"
                        id="value-money"
                        value="Value for Money"
                        checked={brandValue === "Value for Money"}
                        onChange={() => setBrandValue("Value for Money")}
                        className="sr-only"
                      />
                      <div className="flex flex-col h-full">
                        <div className="h-32 overflow-hidden bg-gray-100">
                          <img src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Value for Money" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <label htmlFor="value-money" className="font-medium cursor-pointer block">Value for Money</label>
                        </div>
                      </div>
                      {brandValue === "Value for Money" && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Adventurous */}
                    <div 
                      className={`
                        relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200
                        border-2 ${brandValue === "Adventurous" ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'} 
                        hover:border-primary/50 mb-3
                      `}
                      onClick={() => setBrandValue("Adventurous")}
                    >
                      <input 
                        type="radio"
                        id="value-adventurous"
                        value="Adventurous"
                        checked={brandValue === "Adventurous"}
                        onChange={() => setBrandValue("Adventurous")}
                        className="sr-only"
                      />
                      <div className="flex flex-col h-full">
                        <div className="h-32 overflow-hidden bg-gray-100">
                          <img src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Adventurous" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <label htmlFor="value-adventurous" className="font-medium cursor-pointer block">Adventurous</label>
                        </div>
                      </div>
                      {brandValue === "Adventurous" && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Affluence */}
                    <div 
                      className={`
                        relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200
                        border-2 ${brandValue === "Affluence" ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'} 
                        hover:border-primary/50 mb-3
                      `}
                      onClick={() => setBrandValue("Affluence")}
                    >
                      <input 
                        type="radio"
                        id="value-affluence"
                        value="Affluence"
                        checked={brandValue === "Affluence"}
                        onChange={() => setBrandValue("Affluence")}
                        className="sr-only"
                      />
                      <div className="flex flex-col h-full">
                        <div className="h-32 overflow-hidden bg-gray-100">
                          <img src="https://images.unsplash.com/photo-1460887375916-2198b989282a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Affluence" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <label htmlFor="value-affluence" className="font-medium cursor-pointer block">Affluence</label>
                        </div>
                      </div>
                      {brandValue === "Affluence" && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Not Applicable */}
                    <div 
                      className={`
                        relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200
                        border-2 ${brandValue === "Not Applicable" ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'} 
                        hover:border-primary/50 mb-3
                      `}
                      onClick={() => setBrandValue("Not Applicable")}
                    >
                      <input 
                        type="radio"
                        id="value-na"
                        value="Not Applicable"
                        checked={brandValue === "Not Applicable"}
                        onChange={() => setBrandValue("Not Applicable")}
                        className="sr-only"
                      />
                      <div className="flex flex-col h-full">
                        <div className="p-4 flex items-center justify-center h-full">
                          <div className="mr-3 text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                          <label htmlFor="value-na" className="font-medium cursor-pointer block">Not Applicable</label>
                        </div>
                      </div>
                      {brandValue === "Not Applicable" && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {currentStep === 5 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Vocal only */}
                    <div 
                      className={`
                        relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200
                        border-2 ${trackType === "Vocal only" ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'} 
                        hover:border-primary/50 mb-3
                      `}
                      onClick={() => setTrackType("Vocal only")}
                    >
                      <input 
                        type="radio"
                        id="track-vocal"
                        value="Vocal only"
                        checked={trackType === "Vocal only"}
                        onChange={() => setTrackType("Vocal only")}
                        className="sr-only"
                      />
                      <div className="flex flex-col h-full">
                        <div className="h-32 overflow-hidden bg-gray-100">
                          <img src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Vocal only" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <label htmlFor="track-vocal" className="font-medium cursor-pointer block">Vocal only</label>
                        </div>
                      </div>
                      {trackType === "Vocal only" && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Instrumental only */}
                    <div 
                      className={`
                        relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200
                        border-2 ${trackType === "Instrumental only" ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'} 
                        hover:border-primary/50 mb-3
                      `}
                      onClick={() => setTrackType("Instrumental only")}
                    >
                      <input 
                        type="radio"
                        id="track-instrumental"
                        value="Instrumental only"
                        checked={trackType === "Instrumental only"}
                        onChange={() => setTrackType("Instrumental only")}
                        className="sr-only"
                      />
                      <div className="flex flex-col h-full">
                        <div className="h-32 overflow-hidden bg-gray-100">
                          <img src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Instrumental only" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <label htmlFor="track-instrumental" className="font-medium cursor-pointer block">Instrumental only</label>
                        </div>
                      </div>
                      {trackType === "Instrumental only" && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Next Button */}
              <div className="p-6 pt-0">
                <Button 
                  onClick={goToNextStep}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  Next &gt;
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Results View
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-0 overflow-hidden">
              {/* Results Header */}
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Finish. Recommended songs:</h2>
                
                {/* Display previous selections */}
                <div className="mb-6 space-y-2">
                  <div className="flex items-center">
                    <StepCircle number={1} />
                    <div className="ml-3">
                      <h3 className="font-medium">What is the nature of your business?</h3>
                      <p className="text-gray-700">{businessType}</p>
                    </div>
                  </div>
                  
                  {businessType === "F&B" && (
                    <div className="flex items-center">
                      <StepCircle number={2} />
                      <div className="ml-3">
                        <h3 className="font-medium">What kind of F&B outlet is it?</h3>
                        <p className="text-gray-700">{fnbOutlet}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <StepCircle number={3} />
                    <div className="ml-3">
                      <h3 className="font-medium">Is your branding closely tied down to the country-of-origin?</h3>
                      <p className="text-gray-700">{originCountry}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <StepCircle number={4} />
                    <div className="ml-3">
                      <h3 className="font-medium">What values does your brand advocate?</h3>
                      <p className="text-gray-700">{brandValue}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <StepCircle number={5} />
                    <div className="ml-3">
                      <h3 className="font-medium">Do you prefer vocal or instrumental tracks?</h3>
                      <p className="text-gray-700">{trackType}</p>
                    </div>
                  </div>
                </div>
                
                {/* Recommended Songs */}
                <div className="grid grid-cols-12 gap-6">
                  {/* Restaurant Image */}
                  <div className="col-span-12 md:col-span-4">
                    {businessType === "F&B" && fnbOutlet === "Restaurant" && (
                      <div className="rounded-lg overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80" 
                          alt="Restaurant setting"
                          className="w-full h-auto"
                        />
                      </div>
                    )}
                    {businessType === "Retail" && (
                      <div className="rounded-lg overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                          alt="Retail store"
                          className="w-full h-auto"
                        />
                      </div>
                    )}
                    {businessType === "Hospitality" && (
                      <div className="rounded-lg overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                          alt="Hotel lobby"
                          className="w-full h-auto"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Song List */}
                  <div className="col-span-12 md:col-span-8">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-black text-white">
                          <th className="px-4 py-2 text-left">Song Title</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <tr>
                            <td className="px-4 py-4 text-center">
                              <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                              </div>
                              <p className="mt-2">Loading recommendations...</p>
                            </td>
                          </tr>
                        ) : recommendedSongs && recommendedSongs.length > 0 ? (
                          recommendedSongs.slice(0, 5).map((song, index) => (
                            <tr key={song.id} className="border-b border-gray-200">
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  <button className="text-red-500 mr-2">
                                    <Play className="h-4 w-4" />
                                  </button>
                                  <span>Track #{index + 1}</span>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-4 py-8 text-center">
                              <div className="flex flex-col items-center">
                                <Music className="h-8 w-8 text-gray-400 mb-2" />
                                <p>No matching tracks found. Try adjusting your preferences.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    
                    {/* Send Button */}
                    <div className="mt-6 flex justify-center">
                      <Button 
                        onClick={sendMyResult}
                        className="bg-primary hover:bg-primary/90 text-white"
                      >
                        Send My Result
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
