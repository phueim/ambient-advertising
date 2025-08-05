import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Mail, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

const forgotPasswordSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

const forgotUsernameSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
type ForgotUsernameFormValues = z.infer<typeof forgotUsernameSchema>;

export default function AuthPage() {
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showForgotUsername, setShowForgotUsername] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [isUsernameSubmitting, setIsUsernameSubmitting] = useState(false);
  const { user, login } = useAuth();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      username: "",
    },
  });

  const forgotUsernameForm = useForm<ForgotUsernameFormValues>({
    resolver: zodResolver(forgotUsernameSchema),
    defaultValues: {
      email: "",
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const onLoginSubmit = (data: LoginFormValues) => {
    setIsSubmitting(true);
    
    // Check for admin credentials
    if (data.username === "admin" && data.password === "admin123") {
      // Set a simple flag in localStorage to indicate logged in
      localStorage.setItem('isLoggedIn', 'true');
      
      toast({
        title: "Login successful",
        description: "Welcome to the USEA Music Dashboard!"
      });
      
      navigate('/');
    } else {
      toast({
        title: "Login failed",
        description: "Please use 'admin' as username and 'admin123' as password",
        variant: "destructive"
      });
      
      // Show error messages on form fields
      loginForm.setError("username", { 
        message: "Invalid credentials" 
      });
      loginForm.setError("password", { 
        message: "Invalid credentials" 
      });
    }
    
    setIsSubmitting(false);
  };

  const onForgotPasswordSubmit = (data: ForgotPasswordFormValues) => {
    setIsPasswordSubmitting(true);
    
    // Simulate password reset email sending
    setTimeout(() => {
      toast({
        title: "Password reset email sent",
        description: `If an account with username "${data.username}" exists, a new password will be sent via email to the registered email address.`,
      });
      
      forgotPasswordForm.reset();
      setShowForgotPassword(false);
      setIsPasswordSubmitting(false);
    }, 1500);
  };

  const onForgotUsernameSubmit = (data: ForgotUsernameFormValues) => {
    setIsUsernameSubmitting(true);
    
    // Simulate username reminder email sending
    setTimeout(() => {
      toast({
        title: "Username reminder sent",
        description: `If an account with ${data.email} exists, you will receive your username shortly.`,
      });
      
      forgotUsernameForm.reset();
      setShowForgotUsername(false);
      setIsUsernameSubmitting(false);
    }, 1500);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-7xl flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 p-6 md:p-10">
          <div className="mx-auto mb-10">
            <div className="text-5xl font-bold text-sidebar flex items-center justify-center">
              <span>U</span>
            </div>
            <div className="text-xl font-semibold text-sidebar text-center mt-2">USEA</div>
            <div className="h-1 w-12 bg-primary mx-auto mt-2"></div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Login</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <Label htmlFor="rememberMe" className="text-sm">Remember me</Label>
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center space-y-2">
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-primary"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgotten password?
                </Button>
                <div>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="text-primary"
                    onClick={() => setShowForgotUsername(true)}
                  >
                    Forgotten username?
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="hidden md:flex md:w-1/2 bg-sidebar p-10 text-white flex-col justify-center items-center">
          <div className="max-w-md">
            <h1 className="text-3xl font-bold mb-4">USEA Music Management</h1>
            <p className="mb-6">
              Manage your music, playlists, and audio advertisements all in one place. Customize your brand's sound and create the perfect atmosphere for your customers.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="bg-primary h-2 w-2 rounded-full mr-2"></span>
                Create and manage custom playlists
              </li>
              <li className="flex items-center">
                <span className="bg-primary h-2 w-2 rounded-full mr-2"></span>
                Schedule music for different times of the day
              </li>
              <li className="flex items-center">
                <span className="bg-primary h-2 w-2 rounded-full mr-2"></span>
                Upload custom jingles and voiceovers
              </li>
              <li className="flex items-center">
                <span className="bg-primary h-2 w-2 rounded-full mr-2"></span>
                Request professional audio production
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Forgotten Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-primary">
              <Mail className="mr-2 h-5 w-5" />
              Reset Password
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Please provide the login username for your account. A new password will be sent via email to the registered email address.
            </p>
            <Form {...forgotPasswordForm}>
              <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                <FormField
                  control={forgotPasswordForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registered Username</FormLabel>
                      <FormControl>
                        <Input 
                          type="text" 
                          placeholder="Enter your username" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90"
                    disabled={isPasswordSubmitting}
                  >
                    {isPasswordSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Forgotten Username Dialog */}
      <Dialog open={showForgotUsername} onOpenChange={setShowForgotUsername}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-primary">
              <User className="mr-2 h-5 w-5" />
              Username Reminder
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Please provide the registered email address for your account. Your username will be sent via email to this registered email address.
            </p>
            <Form {...forgotUsernameForm}>
              <form onSubmit={forgotUsernameForm.handleSubmit(onForgotUsernameSubmit)} className="space-y-4">
                <FormField
                  control={forgotUsernameForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Enter your email address" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForgotUsername(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90"
                    disabled={isUsernameSubmitting}
                  >
                    {isUsernameSubmitting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                    ) : (
                      "Send Username"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}