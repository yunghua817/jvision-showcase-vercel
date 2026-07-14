import { AdminDashboard } from "../../components/admin-dashboard";
import { isAdminAuthenticated } from "../../lib/admin-auth";
import { getManagedProducts } from "../../lib/products-store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();
  const products = authenticated ? await getManagedProducts() : [];
  return <AdminDashboard authenticated={authenticated} initialProducts={products} />;
}
