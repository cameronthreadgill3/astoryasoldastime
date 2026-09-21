import { isAdminAuthenticated } from "@/lib/auth";
import { listProducts } from "@/lib/store";
import { AdminLogin } from "./AdminLogin";
import { AdminDashboard } from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <h1 className="font-serif text-4xl text-ink">Seller admin</h1>
        <p className="mt-2 text-ink-muted">
          Enter the admin password to manage products and uploads.
        </p>
        <div className="mt-6">
          <AdminLogin />
        </div>
      </div>
    );
  }

  const products = await listProducts({ includeInactive: true });
  return <AdminDashboard products={products} />;
}
