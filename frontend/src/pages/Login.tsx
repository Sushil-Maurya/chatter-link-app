import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import { useAuthStore } from "../stores/useAuthStore";

const Login: React.FC = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const { login, isLoggingIn } = useAuthStore();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Login Error",
        description: "Please enter all required fields",
        variant: "destructive",
      });
      return;
    }
    
    await login({
      email,
      password
    });
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4 transition-colors">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-card p-8 shadow-sm border border-border">
          <div className="mb-6 text-center">
            <h1 className="mb-1 text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
            <p className="text-gray-600 dark:text-gray-300">Log in to continue to WhatsApp</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
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
                  placeholder="Enter email"
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
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                >
                  {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <span className="animate-spin mr-2">⏳</span> Logging in...
                </>
              ) : "Login"}
            </Button>
            
            <div className="mt-4 text-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
              <Link to="/register" className="font-semibold text-primary hover:underline">
                Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
