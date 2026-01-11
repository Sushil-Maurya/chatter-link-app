import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, User, Lock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import { useAuthStore } from "../stores/useAuthStore";

const Register: React.FC = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  
  const { signup, isSigningUp } = useAuthStore();
  const { toast } = useToast();

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Registration Error",
        description: "Please fill out all fields",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateEmail(email)) {
      toast({
        title: "Registration Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    if (!validatePassword(password)) {
      toast({
        title: "Registration Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Registration Error",
        description: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }
    
    // Call signup from store
    // bio is required by backend, checking userController.ts: if (!name || !email || !password || !bio)
    // We add a default bio here.
    // bio is required by backend
    const success = await signup({
      name,
      email,
      password,
      gender,
      bio: "Hey there! I am using ChatterLink."
    });

    if (success) {
      // Redirect to login page only if signup was successful
      window.location.href = "/login"; // Using window location or navigate from hook if available. 
      // Since it's inside component, usage of hook is better but I see 'Link' imported. I need 'useNavigate'. 
      // Let's add useNavigate hook usage.
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4 transition-colors">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-card p-8 shadow-sm border border-border">
          <div className="mb-6 text-center">
            <h1 className="mb-1 text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
            <p className="text-gray-600 dark:text-gray-300">Sign up to get started with WhatsApp</p>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <User size={18} />
                </div>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Mail size={18} />
                </div>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Lock size={18} />
                </div>
                <Input
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                >
                  {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Password must be at least 6 characters
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Lock size={18} />
                </div>
                <Input
                  type={isConfirmPasswordVisible ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="pl-10 pr-10 cursor-pointer"
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 cursor-pointer"
                >
                  {isConfirmPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Gender
              </label>
              <div className="grid grid-cols-2 gap-4">
                 <div
                    className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                      gender === "male"
                        ? "bg-primary/10 border-primary"
                        : "bg-background border-input hover:bg-accent hover:text-accent-foreground"
                    }`}
                    onClick={() => setGender("male")}
                  >
                    <span className="text-sm font-medium">Male</span>
                  </div>
                  <div
                    className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                      gender === "female"
                        ? "bg-primary/10 border-primary"
                        : "bg-background border-input hover:bg-accent hover:text-accent-foreground"
                    }`}
                    onClick={() => setGender("female")}
                  >
                    <span className="text-sm font-medium">Female</span>
                  </div>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <span className="animate-spin mr-2">⏳</span> Creating account...
                </>
              ) : "Create Account"}
            </Button>
            
            <div className="mt-4 text-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
