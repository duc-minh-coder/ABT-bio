import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, Plus, BookOpen, Trash2 } from "lucide-react";
import { Post } from "../../types";

interface AdminPostsPanelProps {
  posts: Post[];
  onAddNewPost: (newPost: Post) => void;
  onDeletePost: (postId: string) => void;
}

export default function AdminPostsPanel({
  posts,
  onAddNewPost,
  onDeletePost,
}: AdminPostsPanelProps) {
  const [postQuery, setPostQuery] = useState("");
  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostCategory, setNewPostCategory] = useState(
    "An toàn phòng thí nghiệm",
  );
  const [newPostSummary, setNewPostSummary] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostAuthor, setNewPostAuthor] = useState("");

  const filteredPosts = posts.filter((post) => {
    const q = postQuery.trim().toLowerCase();
    return (
      post.title.toLowerCase().includes(q) ||
      post.summary.toLowerCase().includes(q) ||
      post.category.toLowerCase().includes(q)
    );
  });

  const handleCreatePost = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newPostTitle || !newPostSummary || !newPostContent) return;

    onAddNewPost({
      id: `POST-${Math.floor(100 + Math.random() * 900)}`,
      title: newPostTitle,
      category: newPostCategory,
      summary: newPostSummary,
      content: newPostContent,
      author: newPostAuthor || "Hội đồng Kỹ thuật ABT",
      date: new Date().toISOString(),
      image:
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=80",
      readTime: "5 phút đọc",
    });

    setNewPostTitle("");
    setNewPostCategory("An toàn phòng thí nghiệm");
    setNewPostSummary("");
    setNewPostContent("");
    setNewPostAuthor("");
    setShowAddPostModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-5 rounded-3xl shadow-sm">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase">
            Quản lý bài viết
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Tạo, tìm kiếm và xóa các bài viết chuyên môn.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-850 text-xs w-full sm:max-w-xs">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tiêu đề hoặc danh mục..."
              value={postQuery}
              onChange={(e) => setPostQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[11px] text-slate-900 dark:text-slate-200 w-full"
            />
          </div>
          <button
            onClick={() => setShowAddPostModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-rose-500 transition"
          >
            <Plus className="h-4 w-4" />
            Tạo bài mới
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-8 text-center text-sm text-slate-500">
            Không có bài viết phù hợp.
          </div>
        ) : (
          filteredPosts.map((post) => (
            <article
              key={post.id}
              className="rounded-3xl overflow-hidden border border-slate-150 dark:border-slate-850 bg-white dark:bg-slate-900 shadow-sm"
            >
              <div className="relative h-40 bg-slate-900 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3 left-3 rounded-full bg-rose-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                  {post.category}
                </span>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-slate-400">
                    {post.id} • {post.readTime}
                  </p>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-3">
                    {post.summary}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[10px] text-slate-400">
                    Tác giả:{" "}
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {post.author}
                    </span>
                  </p>
                  <button
                    onClick={() => onDeletePost(post.id)}
                    className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 px-3 py-2 text-rose-600 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 transition"
                  >
                    <Trash2 className="inline h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <AnimatePresence>
        {showAddPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-800 p-6 shadow-2xl overflow-hidden max-h-[calc(100vh-4rem)] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase">
                    Soạn bài viết mới
                  </h3>
                  <p className="text-xs text-slate-500">
                    Nhập thông tin để xuất bản bài viết.
                  </p>
                </div>
                <button
                  className="text-slate-400 hover:text-slate-700"
                  onClick={() => setShowAddPostModal(false)}
                >
                  Đóng
                </button>
              </div>
              <form
                onSubmit={handleCreatePost}
                className="space-y-4 text-sm text-slate-800 dark:text-slate-200"
              >
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-1">
                    Tiêu đề
                  </label>
                  <input
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 outline-none"
                    placeholder="Hướng dẫn lắp đặt tủ cấy y sinh"
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Chuyên mục
                    <select
                      value={newPostCategory}
                      onChange={(e) => setNewPostCategory(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 outline-none"
                    >
                      <option>An toàn phòng thí nghiệm</option>
                      <option>Công nghệ mới</option>
                      <option>Hướng dẫn sử dụng</option>
                    </select>
                  </label>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Tác giả
                    <input
                      value={newPostAuthor}
                      onChange={(e) => setNewPostAuthor(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 outline-none"
                      placeholder="TS. Lê Thị Bích"
                    />
                  </label>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-1">
                    Tóm tắt
                  </label>
                  <textarea
                    value={newPostSummary}
                    onChange={(e) => setNewPostSummary(e.target.value)}
                    rows={2}
                    className="w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-3 outline-none"
                    placeholder="Tóm tắt nội dung của bài viết trong 2-3 câu"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-1">
                    Nội dung
                  </label>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={6}
                    className="w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-3 outline-none"
                    placeholder="Nhập nội dung chi tiết ở đây..."
                    required
                  />
                </div>
                <button className="w-full rounded-3xl bg-rose-600 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-rose-500 transition">
                  Xuất bản bài viết
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
