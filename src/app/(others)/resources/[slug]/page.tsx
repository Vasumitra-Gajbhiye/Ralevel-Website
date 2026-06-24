// import { MongoClient } from "mongodb";
// import { notFound } from "next/navigation";
// import ResourceClient from "./ResourceClient"; // client component in same folder
// import connectDB from "@/libs/mongodb";
// import resources2Data from "@/models/resources2Data";

// export const revalidate = 60; // ISR: revalidate every 60s (adjust as needed)

// export async function generateStaticParams() {
//   const db = await connectDB();
//   const docs =resources2Data.find({}, { projection: { slug: 1 } }).toArray();
//   return docs.map((d: any) => ({ slug: d.slug }));
// }

// export async function generateMetadata(props: {
//   params: Promise<{ slug: string }>;
// }) {
//   const { params } = props;
//   const { slug } = await params;
//   const db = await connectDB();

//   const doc = await db
//     .collection("resources2datas")
//     .findOne({ slug: slug }, { projection: { subject: 1 } });
//   if (!doc) {
//     return { title: "Resource not found" };
//   }
//   return {
//     title: `${doc.subject} Resources | r/alevel Repository`,
//     description: `A curated collection of ${doc.subject} notes, syllabus, past papers, videos and tools for A-Level.`,
//     openGraph: {
//       title: `${doc.subject} Resources | r/alevel`,
//       description: `Curated ${doc.subject} resources for A-Level students.`,
//     },
//   };
// }

// export default async function Page({
//   params,
// }: {
//   params: Promise<{ slug: string }>;
// }) {
//   const { slug } = await params; // 👈 MUST AWAIT
//   const db = await connectDB();
//   const resource = await db
//     .collection("resources2datas")
//     .findOne({ slug: slug });
//   if (!resource) {
//     console.log("resources not found");
//     notFound();
//   }

//   (resource as any)._id = resource._id.toString();

//   // CLEAN THE OBJECT (strip prototypes, ensure it’s serializable)
//   const serializable = JSON.parse(JSON.stringify(resource));

//   return <ResourceClient resource={serializable} />;
// }

import connectDB from "@/lib/mongodb";
import {
  getResource,
  getResourceForGenerateMetadata,
  getResourceForStaticParams,
} from "@/controller/resourceController";
import { notFound } from "next/navigation";
import ResourceClient from "./ResourceClient";

export const revalidate = 864000;

/* -----------------------------
   Static params (SSG paths)
------------------------------ */
export async function generateStaticParams() {
  await connectDB();

  const docs = await getResourceForStaticParams();

  return docs.map((d: any) => ({
    slug: d.slug,
  }));
}
type ResourceMeta = {
  subject: string;
};
/* -----------------------------
   Metadata (SEO)
------------------------------ */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // ✅ REQUIRED in Next 15
  await connectDB();

  const doc = await getResourceForGenerateMetadata(slug);

  if (!doc) {
    return { title: "Resource not found" };
  }

  return {
    title: `${doc.subject} Resources | r/alevel Repository`,
    description: `A curated collection of ${doc.subject} notes, syllabus, past papers, videos and tools for A-Level.`,
    openGraph: {
      title: `${doc.subject} Resources | r/alevel`,
      description: `Curated ${doc.subject} resources for A-Level students.`,
    },
  };
}

/* -----------------------------
   Page
------------------------------ */
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // ✅ REQUIRED in Next 15

  await connectDB();

  const resource = await getResource(slug);

  if (!resource) {
    notFound();
  }

  return <ResourceClient resource={resource} />;
}
