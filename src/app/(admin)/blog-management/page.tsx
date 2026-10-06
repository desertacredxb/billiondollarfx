"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

interface Blog {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  shortDescription: string;
  coverImage: string;
  coverAlt: string;
  status: "draft" | "published" | "archived";
  category: string;
  author: string;
  tags: string[];
  faqs: FAQ[];
  createdAt: string;
}

export default function AdminBlogManagement() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/blogs");
      const data = await res.json();
      if (data.success && data.data) {
        setBlogs(data.data);
      }
    } catch (err) {
      triggerAlert("error", "Could not fetch index list values from server.");
    } finally {
      setLoading(false);
    }
  };

  const triggerAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleUpdateStatus = async (
    blogItem: Blog,
    newStatus: "draft" | "published" | "archived",
  ) => {
    const targetId = blogItem.id || blogItem._id;
    if (!targetId) {
      triggerAlert("error", "Invalid Document Identifier detected.");
      return;
    }

    try {
      const res = await fetch(`/api/blogs/${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        triggerAlert("success", `Status updated to ${newStatus}.`);
        fetchBlogs();
      } else {
        throw new Error(data.error || "Failed to update status.");
      }
    } catch (err: any) {
      triggerAlert("error", err.message);
    }
  };

  const handleDeleteBlog = async () => {
    if (!blogToDelete) return;
    const targetId = blogToDelete.id || blogToDelete._id;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/blogs/${targetId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        triggerAlert("success", "Article directory item purged.");
        setIsDeleteModalOpen(false);
        fetchBlogs();
      } else {
        throw new Error(data.error || "Failed to delete item.");
      }
    } catch (err: any) {
      triggerAlert("error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBlogs = blogs.filter((blog) => {
    const titleMatch =
      blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const categoryMatch =
      blog.category?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesSearch = titleMatch || categoryMatch;
    const matchesStatus =
      statusFilter === "all" || blog.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen px-3 py-6 bg-[#0a0f1c] text-slate-100">
      {/* Header Bar */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#927948]" /> Blog Directory
          </h1>
          <p className="text-xs font-semibold text-[#927948] uppercase tracking-wider mt-1">
            Manage your store articles and content pipeline
          </p>
        </div>
        <button
          onClick={() => router.push("/blog-management/add")}
          className="bg-[#927948] hover:bg-[#a68c56] text-white text-xs font-bold px-4 py-3 rounded-xl transition-all flex items-center gap-2 shadow-sm group cursor-pointer"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
          <span>Create New Post</span>
        </button>
      </div>

      {/* Alert Notifications */}
      {alert && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl border text-xs font-bold uppercase tracking-wide flex items-center gap-3 shadow-lg bg-[#121829] ${
            alert.type === "success"
              ? "border-emerald-500/40 text-emerald-400"
              : "border-rose-500/40 text-rose-400"
          }`}
        >
          {alert.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          )}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Control Tools Panel */}
      <div className="max-w-7xl mx-auto bg-[#121829] border border-[#1e293b] rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-slate-100 font-semibold bg-[#0a0f1c] border border-[#1e293b] rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#927948] transition-all placeholder:text-slate-500"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-44 text-xs font-bold bg-[#0a0f1c] text-slate-200 border border-[#1e293b] rounded-xl px-3.5 py-3 focus:outline-none focus:border-[#927948] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Blog Grid Content */}
      {loading ? (
        <div className="max-w-7xl mx-auto py-24 flex flex-col items-center justify-center gap-3 text-xs font-bold tracking-widest text-slate-500 uppercase">
          <Loader2 className="w-8 h-8 text-[#927948] animate-spin" />
          <span>Synchronizing records archive...</span>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.length > 0 ? (
            filteredBlogs.map((blog) => {
              const currentId = blog.id || blog._id;
              return (
                <div
                  key={currentId}
                  className="bg-[#121829] border border-[#1e293b] rounded-2xl overflow-hidden shadow-sm hover:border-[#927948]/50 transition-all flex flex-col group relative"
                >
                  <div className="w-full h-44 bg-[#0a0f1c] relative overflow-hidden border-b border-[#1e293b]">
                    <img
                      src={blog.coverImage || "/placeholder-image.jpg"}
                      alt={blog.coverAlt || blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md text-white shadow-inner ${
                          blog.status === "published"
                            ? "bg-emerald-600/90"
                            : blog.status === "archived"
                              ? "bg-slate-700/90"
                              : "bg-amber-600/90"
                        }`}
                      >
                        {blog.status}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md text-slate-200 bg-[#0a0f1c]/80 border border-[#1e293b]">
                        {blog.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-black text-slate-100 tracking-tight leading-snug line-clamp-2">
                        {blog.title}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">
                        {blog.shortDescription}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#1e293b] flex items-center justify-between gap-2">
                      <select
                        value={blog.status}
                        onChange={(e) =>
                          handleUpdateStatus(blog, e.target.value as any)
                        }
                        className="text-[10px] font-bold bg-[#0a0f1c] border border-[#1e293b] rounded-lg px-2 py-1.5 text-slate-300 focus:outline-none focus:border-[#927948] cursor-pointer"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Publish</option>
                        <option value="archived">Archive</option>
                      </select>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            router.push(
                              `/blog-management/${blog._id}/edit`,
                            )
                          }
                          className="p-2 text-slate-400 hover:text-[#927948] hover:bg-[#1e293b]/50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setBlogToDelete(blog);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-[#121829] border border-[#1e293b] border-dashed rounded-2xl p-16 text-center">
              <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                No matching articles found
              </p>
            </div>
          )}
        </div>
      )}

      {/* Deletion Confirmation Modal Overlay */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0a0f1c]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#121829] rounded-2xl border border-[#1e293b] shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-sm font-black tracking-tight text-white">
                Confirm Deletion
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <span className="font-bold text-slate-200">
                "{blogToDelete?.title}"
              </span>
              ? This will immediately remove it from all database indices.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-xs font-bold bg-[#1e293b] hover:bg-[#2e3d52] text-slate-200 px-4 py-2 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteBlog}
                className="text-xs font-black uppercase bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl tracking-wider shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                {actionLoading && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}