import {NextRequest, NextResponse} from "next/server";
import {cookies} from "next/headers";
import {decodeJwt} from "jose";
import {Role, TokenPayload} from "@/lib/types/user";

// Route configurations based on access level
const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/register",
    "/unauthorized"
];

// Routes that regular users can access
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const userRoutes = [
    "/dashboard",
    "/dashboard/:path*", // Support for /dashboard/any/nested/route
    "/profile",
    "/profile/:id", // Support for dynamic profile routes
    "/settings",
    "/settings/:section",
    // Add more user-accessible routes
];

// Routes that only admins can access
const adminOnlyRoutes = [
    "users",
    "/users/:id",
];

/**
 * Checks if a given URL path matches a route pattern
 * Supports dynamic segments with :parameter and wildcard paths with :path*
 */
function matchesPattern(path: string, pattern: string): boolean {
    // Handle exact matches first
    if (path === pattern) return true;

    // Convert route pattern to regex
    const regexPattern = pattern
        .replace(/:[^/]+\*/g, '(?:/.*)?') // Replace :path* with optional wildcard
        .replace(/:[^/]+/g, '[^/]+');     // Replace :id with any segment pattern

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
}

/**
 * Checks if the path matches any of the patterns in the routes array
 */
function matchesAnyRoute(path: string, routes: string[]): boolean {
    return routes.some(pattern => matchesPattern(path, pattern));
}

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;

    // Check if the current path is public
    const isPublicRoute = matchesAnyRoute(path, publicRoutes);

    // Get token from cookies
    const cookie = (await cookies()).get("token")?.value;

    let session: TokenPayload | null = null;

    if (cookie) {
        try {
            session = decodeJwt(cookie) as TokenPayload;

            // Check if token is expired
            if (session.exp && session.exp * 1000 < Date.now()) {
                session = null;
            }
        } catch (err) {
            console.error("JWT Decode Failed:", err);
            session = null;
        }
    }

    // Redirect authenticated users away from login page
    if (session?.sub && (path === "/auth/login" || path === "/auth/register")) {
        return NextResponse.redirect(new URL("/global-assets/lookup", req.nextUrl));
    }

    // Authentication check: Redirect to login if accessing protected route without a session
    if (!isPublicRoute && !session?.sub) {
        const callbackUrl = encodeURIComponent(req.nextUrl.pathname);
        return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${callbackUrl}`, req.nextUrl));
    }

    // Authorization checks based on path and user role
    if (session?.sub) {
        // Check if the user is trying to access an admin-only route
        if (matchesAnyRoute(path, adminOnlyRoutes) && session?.role !== Role.ADMIN) {
            console.log(`Access denied: User role ${session?.role} tried to access admin-only route ${path}`);
            return NextResponse.redirect(new URL("/unauthorized", req.nextUrl));
        }

        // For future use: Check if an admin is trying to access user-only routes
        // (currently admins can access user routes by default)
        /*
        const isUserOnlyRoute = matchesAnyRoute(path, userRoutes) && !matchesAnyRoute(path, adminOnlyRoutes);
        if (isUserOnlyRoute && session?.role !== Role.USER) {
            console.log(`Access denied: Admin role ${session?.role} tried to access user-only route ${path}`);
            return NextResponse.redirect(new URL("/unauthorized", req.nextUrl));
        }
        */
    }

    return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.jpg$|favicon.ico).*)"],
};