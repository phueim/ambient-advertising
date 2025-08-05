import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Upload, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

const profileSettingsSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  businessType: z.string().optional(),
  companyAddress: z.string().optional(),
  country: z.string().optional(),
  timeZone: z.string().optional(),
  contactPerson: z.string().optional(),
  designation: z.string().optional(),
  phoneNumber: z.string().optional(),
  mobileNumber: z.string().optional(),
  emailAddress: z.string().email("Invalid email address").optional(),
  profileLogo: z.string().optional(),
});

const notificationSettingsSchema = z.object({
  announcementNotification: z.string().default("Yes"),
  connectionReportNotification: z.string().default("No"),
  voiceoverApprovalNotification: z.string().default("Yes"),
  preferredLanguage: z.string().default("English"),
});

const passwordChangeSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileSettingsFormValues = z.infer<typeof profileSettingsSchema>;
type NotificationSettingsFormValues = z.infer<typeof notificationSettingsSchema>;
type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  const profileForm = useForm<ProfileSettingsFormValues>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      companyName: user?.companyName || "FairPrice Finest",
      businessType: "Supermarket",
      companyAddress: "Singapore",
      country: "Singapore",
      timeZone: "+08:00",
      contactPerson: user?.username || "",
      designation: "",
      phoneNumber: "",
      mobileNumber: "",
      emailAddress: "",
      profileLogo: user?.profileLogo || "",
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      profileForm.reset({
        companyName: user.companyName || "FairPrice Finest",
        businessType: "Supermarket",
        companyAddress: "Singapore",
        country: "Singapore",
        timeZone: "+08:00",
        contactPerson: user.username || "",
        designation: "",
        phoneNumber: "",
        mobileNumber: "",
        emailAddress: "",
        profileLogo: user.profileLogo || "",
      });
    }
  }, [user, profileForm]);
  
  const notificationForm = useForm<NotificationSettingsFormValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      announcementNotification: "Yes",
      connectionReportNotification: "No",
      voiceoverApprovalNotification: "Yes",
      preferredLanguage: "English",
    },
  });

  const passwordForm = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileSettingsFormValues) => {
      const response = await apiRequest("/api/user/settings", "PUT", data);
      return response.json();
    },
    onSuccess: (updatedUser) => {
      // Update user context with new data
      if (updatedUser && user) {
        updateUser(updatedUser);
      }
      toast({
        title: "Success",
        description: "Your profile has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const updateProfileLogoMutation = useMutation({
    mutationFn: async (logoUrl: string) => {
      try {
        console.log("Uploading profile logo...", logoUrl.substring(0, 50) + "...");
        const response = await apiRequest("/api/user/profile-logo", "PUT", { logoUrl });
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error("Profile logo upload failed:", response.status, errorData);
          throw new Error(`Upload failed: ${response.status}`);
        }
        
        const result = await response.json();
        console.log("Profile logo upload successful:", result);
        return result;
      } catch (error) {
        console.error("Profile logo upload error:", error);
        throw error;
      }
    },
    onSuccess: (updatedUser) => {
      // Update user context with new profile logo
      console.log("Profile logo upload success, updating user context:", updatedUser?.profileLogo?.substring(0, 50));
      if (updatedUser && user) {
        updateUser({ profileLogo: updatedUser.profileLogo });
        console.log("User context updated with new profile logo");
        
        // Also update the form field to reflect the change
        profileForm.setValue('profileLogo', updatedUser.profileLogo);
      }
      toast({
        title: "Success",
        description: "Your profile logo has been updated successfully",
      });
    },
    onError: (error) => {
      console.error("Profile logo mutation error:", error);
      toast({
        title: "Error", 
        description: error.message || "Failed to update profile logo",
        variant: "destructive",
      });
    },
  });
  
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { oldPassword: string; newPassword: string }) => {
      const response = await apiRequest("/api/user/change-password", "PUT", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your password has been changed successfully",
      });
      passwordForm.reset();
      setIsEditingPassword(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });
  
  const onProfileSubmit = (data: ProfileSettingsFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const onNotificationSubmit = (data: NotificationSettingsFormValues) => {
    toast({
      title: "Success",
      description: "Your notification preferences have been updated successfully",
    });
  };
  
  const onPasswordSubmit = (data: PasswordChangeFormValues) => {
    changePasswordMutation.mutate({
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    });
  };
  
  return (
    <DashboardLayout>
      <h1 className="text-lg font-semibold mb-2">Account Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Profile Information */}
        <Card>
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-sm">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-1">
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-1.5">
                {/* Profile Logo Upload */}
                <FormField
                  control={profileForm.control}
                  name="profileLogo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Profile Logo</FormLabel>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={field.value || ""} alt="Profile logo" />
                          <AvatarFallback>
                            <User className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Input 
                            type="file" 
                            accept="image/*"
                            className="text-xs h-7"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Validate file size (max 5MB)
                                if (file.size > 5 * 1024 * 1024) {
                                  toast({
                                    title: "Error",
                                    description: "Image size must be less than 5MB",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                
                                // Convert to base64 and update form
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const base64String = event.target?.result as string;
                                  field.onChange(base64String);
                                  
                                  // Immediately update the profile logo via API
                                  updateProfileLogoMutation.mutate(base64String);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            disabled={updateProfileLogoMutation.isPending}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Upload company logo (JPG, PNG, max 5MB)
                            {updateProfileLogoMutation.isPending && " - Uploading..."}
                          </p>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Company Name</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-gray-50 text-xs h-7" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Business Type</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-gray-50 text-xs h-7" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="companyAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Company Address</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-gray-50 text-xs h-7" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Country</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-gray-50 text-xs h-7" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="timeZone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Time Zone</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-gray-50 text-xs h-7" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Contact Person</FormLabel>
                      <FormControl>
                        <Input {...field} className="text-xs h-7" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Designation</FormLabel>
                      <FormControl>
                        <Input {...field} className="text-xs h-7" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} className="text-xs h-7" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Mobile Number</FormLabel>
                      <FormControl>
                        <Input {...field} className="text-xs h-7" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="emailAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} className="text-xs h-7" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-1">
                  <Button 
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="text-xs h-7"
                  >
                    {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Right Column - Notifications and Password */}
        <div className="space-y-3">
          {/* Notification Settings */}
          <Card>
            <CardHeader className="pb-1 pt-3">
              <CardTitle className="text-sm">Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-1.5">
                  <FormField
                    control={notificationForm.control}
                    name="announcementNotification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Receive Notification: Announcement notification</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-xs h-7">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="connectionReportNotification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Receive Notification: Connection Report notification</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-xs h-7">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="voiceoverApprovalNotification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Receive Notification: Voiceover Approval notification</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-xs h-7">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="preferredLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Preferred Language:</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-xs h-7">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Chinese">Chinese</SelectItem>
                            <SelectItem value="Malay">Malay</SelectItem>
                            <SelectItem value="Tamil">Tamil</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end pt-1">
                    <Button type="submit" className="text-xs h-7">
                      Update Notifications
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader className="pb-1 pt-3">
              <CardTitle className="text-sm">Change Password</CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              {isEditingPassword ? (
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-1.5">
                    <FormField
                      control={passwordForm.control}
                      name="oldPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} className="text-xs h-7" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} className="text-xs h-7" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} className="text-xs h-7" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2 pt-1">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          passwordForm.reset();
                          setIsEditingPassword(false);
                        }}
                        className="text-xs h-7"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={changePasswordMutation.isPending}
                        className="text-xs h-7"
                      >
                        {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="text-center py-1.5">
                  <p className="text-gray-600 mb-1.5 text-xs">For security reasons, your password is hidden.</p>
                  <Button onClick={() => setIsEditingPassword(true)} className="text-xs h-7">
                    Change Password
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}