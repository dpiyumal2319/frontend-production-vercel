'use server';

import {redirect} from "next/navigation";
import {cookies} from 'next/headers';
import {LoginResponse} from "@/lib/types/login";
import {User} from "@/lib/types/user";
import {FormState, HTTPValidationError, RegisterResponse, registerSchema} from "@/lib/types/register";
import AxiosInstance from "@/lib/server-fetcher";
import axios from "axios";
import {createSession, deleteSession} from "@/actions/sessions";


export async function login(_previousState: string, formData: FormData): Promise<string> {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    // Validate form input
    if (!username || !password) {
        return "Please fill in all fields";
    }

    try {
        const response = await AxiosInstance.post<LoginResponse>('/auth/login', {
            username,
            password
        });

        await createSession(response.data);
        console.log(`User ${username} logged in successfully`);

        // Redirect to dashboard after successful login
        redirect('/global-assets/lookup');
    } catch (error) {
        // Type narrowing for the axios error
        if (axios.isAxiosError(error)) {
            console.log(error.response?.data);
            const errorData = error.response?.data as HTTPValidationError | { detail?: string };

            if (Array.isArray(errorData?.detail) && errorData.detail.length > 0) {
                console.error(errorData.detail);
                return errorData.detail[0].msg;
            } else if (typeof errorData?.detail === "string") {
                return errorData.detail;
            } else if (error.response?.status === 404) {
                return "Invalid credentials";
            } else {
                console.error("Login API error:", error.response?.data);
                return "Failed to login. Please try again.";
            }
        }
        throw error;
    }
}

export const registerUser = async (
    prevState: FormState,
    formData: FormData
): Promise<FormState> => {
    // Extract data from FormData
    const rawData = {
        name: formData.get('name') as string,
        username: formData.get('username') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        birthday: formData.get('birthday') as string,
        gender: formData.get('gender') as string,
        confirmPassword: formData.get('confirmPassword') as string,
        avatar: formData.get('avatar') as string || undefined,
    };

    // Double-check server-side validation (as a safeguard)
    // Client validation should have already caught errors, but this ensures security
    const validationResult = registerSchema.safeParse(rawData);

    if (!validationResult.success) {
        const errors: Record<string, string> = {};
        validationResult.error.issues.forEach(issue => {
            if (issue.path[0]) {
                errors[issue.path[0].toString()] = issue.message;
            }
        });

        console.error("Validation errors:", errors);

        return {
            success: false,
            message: "Please correct the errors in the form",
            errors
        };
    }

    try {
        // Send registration request to the server
        const response = await AxiosInstance.post<RegisterResponse>("/auth/user/reg", rawData);

        return {
            success: true,
            message: response.data.message || "User registered successfully",
            errors: {}
        };
    } catch (error: unknown) {
        console.error("Registration error:", error);

        let message = "An error occurred during registration. Please try again.";
        const errors: Record<string, string> = {};

        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const detail = error.response?.data?.detail;

            if (status === 409 && typeof detail === "string") {
                if (detail.includes("Username")) {
                    errors.username = detail;
                } else if (detail.includes("Email")) {
                    errors.email = detail;
                }
                message = detail;
            } else if (typeof detail === "string") {
                message = detail;
            }
        }

        return {
            success: false,
            message,
            errors
        };
    }
};

export async function logout(): Promise<void> {
    await deleteSession();
    redirect('/');
}

export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user')?.value;

    if (!userCookie) {
        return null;
    }

    try {
        const user: User = JSON.parse(userCookie);
        if (!user) {
            return null;
        }
        return user;
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        }
        return null;
    }
}

/**
 * Verifies a user by making a request to the backend API
 * @returns User object if successful, null if not authenticated
 */
export async function verifyUser(): Promise<User | null> {
    try {
        // Get the current user from cookies
        const currentUser = await getCurrentUser();

        // If no user in cookies, return null immediately
        if (!currentUser) {
            return null;
        }

        // Verify with backend
        const response = await AxiosInstance.post<User>('/auth/verify', {
            username: currentUser.username
        });

        const verifiedUser = response.data;

        // Optional: Check if the verified user matches the cookie user
        // You can adjust these checks based on what fields you want to compare
        if (verifiedUser.user_id !== currentUser.user_id || verifiedUser.username !== currentUser.username || verifiedUser.role !== currentUser.role) {
            console.warn('User mismatch between cookie and server');
            await logout();
            return null;
        }

        return verifiedUser;
    } catch (error) {
        // Handle different types of errors
        if (axios.isAxiosError(error)) {
            // Handle specific status codes
            if (error.response?.status === 401) {
                console.error("Authentication failed: Token invalid or expired");
                await logout();
            } else if (error.response?.status === 404) {
                console.error("User not found");
                await logout();
            } else {
                console.error("API error:", error.response?.data || error.message);
            }
        } else {
            console.error("Unexpected error during user verification:", error);
        }

        return null;
    }
}
