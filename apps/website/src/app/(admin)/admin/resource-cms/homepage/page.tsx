import { guardSection } from "@/lib/admin-access/page-guard";
import {
  getCachedResourceSubjects,
  getResourcesHomepage,
} from "@/lib/data/resources-homepage";
import HomepageEditorClient from "./HomepageEditorClient";

export default async function ResourcesHomepageAdminPage() {
  const denied = await guardSection("resource-cms");
  if (denied) return denied;

  const [config, subjects] = await Promise.all([
    getResourcesHomepage(),
    getCachedResourceSubjects(),
  ]);

  return <HomepageEditorClient initialConfig={config} subjects={subjects} />;
}
