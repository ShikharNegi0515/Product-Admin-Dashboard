/**
 * Root page – redirects authenticated users to /products,
 * unauthenticated users to /login.
 */
import { redirect } from "next/navigation";

export default function RootPage() {
  // Server-side: always redirect to /products (ProtectedRoute handles auth).
  redirect("/products");
}
