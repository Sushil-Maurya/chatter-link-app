import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "../hooks/use-toast";
import { io, Socket } from "socket.io-client";

export const AuthContext: React.Context<any> = createContext(null);

const baseUrl = import.meta.env.VITE_BASE_URL;

axios.defaults.baseURL = baseUrl;
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authUser, setAuthUser] = useState(null);
    const [onlineUser, setOnlineUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const toast = useToast();

    const validateAuthUser = async () => {

        const option = {
            method: 'GET',
            url: '/api/check-auth',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
        axios(option).then(({ data }) => {
            setAuthUser(data.user);
            handleSocketConnection(data.user);
            // toast.success('User validated successfully');
        }).catch((error) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
            console.log(error);
        })
    }

    const handleSocketConnection = (userData: any) => {
        if (!userData||socket?.connected) return;
        const newSocket = io(baseUrl,{
                      query: {
                userId: userData.id,
            },
        });
        newSocket.connect();
        newSocket.emit('add-user', userData);
        setSocket(newSocket);
        newSocket.on('getOnlineUser', (users: any) => {
            setOnlineUser(users);
        });
    }

    // login
    const login = async (action:string,credentials: any) => {
        const option = {
            method: 'POST',
            url: `/api/${action}`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: credentials
        }
        axios(option).then(({ data }) => {
            setAuthUser(data.user);
            handleSocketConnection(data.user);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            localStorage.setItem('token', data.token);
            setToken(data.token);
            toast({
                variant: "default",
                title: "Success",
                description: "User logged in successfully",
            });
        }).catch((error) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
            console.log(error);
        })
    }

    // logout
    const logout = async () => {
        const option = {
            method: 'POST',
            url: '/api/logout',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }
        axios(option).then(() => {
            setAuthUser(null);
            handleSocketConnection(null);
            localStorage.removeItem('token');
            setToken(null);
            setOnlineUser(null);
            axios.defaults.headers.common['Authorization'] = '';
            socket?.disconnect();
            setSocket(null);
            toast({
                variant: "default",
                title: "Success",
                description: "User logged out successfully",
            });
        }).catch((error) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
            console.log(error);
        })
    }

    // update user
    const updateUser = async (userData: any) => {
        const option = {
            method: 'PUT',
            url: '/api/update-user',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            data: userData
        }
        axios(option).then(({ data }) => {
            setAuthUser(data.user);
            toast({
                variant: "default",
                title: "Success",
                description: "User profile updated successfully",
            });
        }).catch((error) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
            console.log(error);
        })
    }
    useEffect(() => {
        validateAuthUser();
    }, [token]);

    const value = { axios, authUser, onlineUser,  token, logout, updateUser, socket, login };
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;