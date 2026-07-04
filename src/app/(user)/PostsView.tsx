import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Post } from '../../types';
import { Search, BookOpen, Clock, User, ArrowLeft, Bookmark } from 'lucide-react';

interface PostsViewProps {
  posts: Post[];
}

export default function PostsView({ posts }: PostsViewProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Tất cả');

  const categories = ['Tất cả', 'An toàn phòng thí nghiệm', 'Công nghệ mới', 'Hướng dẫn sử dụng'];

  const filtered = posts.filter(p => {
    const matchCategory = activeCategory === 'Tất cả' || p.category === activeCategory;
    const matchQuery = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       p.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 text-left" id="posts-view-root">
      
      <AnimatePresence mode="wait">
        {!selectedPost ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Top Bar with category chips and search field */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-5 rounded-3xl shadow-sm">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-cyan-400" />
                  Cổng Thông Tin Học Thuật & SOP Y Sinh
                </h2>
                <p className="text-xs text-slate-500">Tìm hiểu kiến thức vận hành, hướng dẫn an toàn và tin y sinh từ chuyên gia ABT.</p>
              </div>

              {/* Search Box */}
              <div className="flex items-center gap-2 max-w-sm w-full bg-slate-50 dark:bg-slate-950 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-850 text-xs">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  id="posts-search-field"
                  placeholder="Tìm chủ đề, bài viết, từ khóa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs text-slate-800 dark:text-slate-100 w-full"
                />
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  id={`cat-chip-${cat}`}
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                    activeCategory === cat
                      ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white border-transparent shadow shadow-cyan-400/20'
                      : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-850 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid of articles */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.length === 0 ? (
                <div className="col-span-full py-16 text-center text-slate-400 text-xs">
                  Không tìm thấy bài viết học tập nào phù hợp với tìm kiếm của bạn.
                </div>
              ) : (
                filtered.map((item) => (
                  <div
                    id={`post-list-card-${item.id}`}
                    key={item.id}
                    className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-48 bg-slate-100 dark:bg-slate-950 relative overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase text-white bg-slate-900/80 backdrop-blur-md border border-slate-800/40">
                          {item.category}
                        </span>
                      </div>

                      <div className="p-5 space-y-2.5">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold font-mono">
                          <User className="h-3 w-3" />
                          <span>{item.author}</span>
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>{item.readTime}</span>
                        </div>

                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-normal line-clamp-2 hover:text-cyan-500 transition cursor-pointer" onClick={() => setSelectedPost(item)}>
                          {item.title}
                        </h3>

                        <p className="text-[11px] text-slate-500 line-clamp-3 leading-relaxed">
                          {item.summary}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <button
                        id={`read-article-btn-${item.id}`}
                        onClick={() => setSelectedPost(item)}
                        className="w-full py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 text-xs font-bold text-slate-600 dark:text-slate-350 border border-slate-200/50 dark:border-slate-850 transition flex items-center justify-center gap-1.5"
                      >
                        <BookOpen className="h-4 w-4" />
                        Đọc bài nghiên cứu
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </motion.div>
        ) : (
          <motion.div
            key="article-detail"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8 space-y-6"
            id={`post-detail-${selectedPost.id}`}
          >
            {/* Back button */}
            <button
              id="back-to-posts-list"
              onClick={() => setSelectedPost(null)}
              className="px-4 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition flex items-center gap-1.5 shrink-0 self-start"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </button>

            {/* Featured Image */}
            <div className="h-64 sm:h-80 bg-slate-950 rounded-2xl overflow-hidden relative">
              <img
                src={selectedPost.image}
                alt={selectedPost.title}
                className="w-full h-full object-cover opacity-85"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-4 left-4 px-3 py-1 bg-cyan-600 text-white rounded-lg text-xs font-extrabold uppercase">
                {selectedPost.category}
              </span>
            </div>

            {/* Meta and titles */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-slate-400 font-bold font-mono">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" /> {selectedPost.author}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {selectedPost.readTime}
                </span>
                <span>•</span>
                <span>Cập nhật: {new Date(selectedPost.date).toLocaleDateString("vi-VN")}</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                {selectedPost.title}
              </h1>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border-l-4 border-cyan-500 italic text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                "{selectedPost.summary}"
              </div>
            </div>

            {/* Content markup parsing */}
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 whitespace-pre-line">
              {selectedPost.content}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
