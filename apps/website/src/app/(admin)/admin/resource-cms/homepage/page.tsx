import {
  getCachedResourceSubjects,
  getResourcesHomepage,
} from "@/lib/data/resources-homepage";
import HomepageEditorClient from "./HomepageEditorClient";

export default async function ResourcesHomepageAdminPage() {
  const [config, subjects] = await Promise.all([
    getResourcesHomepage(),
    getCachedResourceSubjects(),
  ]);

  return <HomepageEditorClient initialConfig={config} subjects={subjects} />;
}
