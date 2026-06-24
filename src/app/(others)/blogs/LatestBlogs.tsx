// app/blogs/BlogGrid.tsx (SERVER)
import { cldImage } from "@/lib/cloudinary";
import { motion } from "framer-motion";

export default function BlogGrid({ blogs }: { blogs: any[] }) {
  return (
    <div
      className="grid gap-10 sm:gap-12"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}
    >
      {blogs.map((blog, i) => (
        <motion.a
          key={i}
          href={`/blogs/${blog.slug}`}
          whileHover={{ y: -6 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 group"
        >
          <div className="overflow-hidden relative">
            <img
              src={cldImage(`/blogs/${blog._id}/mainImgThumb.jpg`)}
              alt={blog.mainTitle}
              className="object-cover w-full h-56 group-hover:scale-105 transition-all duration-500"
            />
            <span className="absolute top-3 left-3 bg-sky-100 text-sky-800 px-3 py-1 text-xs font-medium rounded-full">
              {blog.tag}
            </span>
          </div>
          <div className="p-5">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-sky-700 transition-colors">
              {blog.mainTitle}
            </h3>
            <p className="text-xs text-gray-500 mt-2">
              {blog.date} • {blog.author}
            </p>
          </div>
        </motion.a>
      ))}
    </div>
  );
}
