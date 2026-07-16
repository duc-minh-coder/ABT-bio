import React from "react";
import { motion } from "motion/react";
import { CORE_VALUES } from "../../data";
import { Product } from "../../types";
import {
  ArrowRight,
  Activity,
  Dna,
  Settings,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Sparkles,
  Building2,
  UserCheck,
  Award,
  Cpu,
} from "lucide-react";

interface HomeViewProps {
  products: Product[];
  onExploreProducts: () => void;
  onAddToCart: (product: Product) => void;
  onViewProductDetail: (product: Product) => void;
}

export default function HomeView({
  products,
  onExploreProducts,
  onAddToCart,
  onViewProductDetail,
}: HomeViewProps) {
  const featured = products.filter((p) => p.featured);

  // Stats Counters
  const stats = [
    {
      number: "250+",
      label: "Bệnh viện & Trung tâm xét nghiệm tin dùng",
      icon: Building2,
    },
    { number: "1,500+", label: "Hệ thống máy phân tích đã lắp đặt", icon: Cpu },
    {
      number: "40+",
      label: "Kỹ sư ứng dụng & hiệu chuẩn chuyên sâu",
      icon: UserCheck,
    },
    {
      number: "100%",
      label: "Đạt chuẩn ISO 13485 & CE/FDA Hoa Kỳ",
      icon: Award,
    },
  ];

  const partners = [
    { name: "Đại học Y Dược TP.HCM", type: "Học thuật & Chẩn đoán" },
    { name: "Bệnh viện Bạch Mai", type: "Y tế Tuyến đầu" },
    { name: "Viện Pasteur", type: "Nghiên cứu sinh học" },
    { name: "Hát Trung tâm Xét nghiệm Medic", type: "Xét nghiệm chuẩn xác" },
    { name: "Phòng thí nghiệm Quốc gia ABT-Lab", type: "Quy chuẩn mẫu thử" },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Showcase Section */}
      <section className="relative overflow-hidden bg-slate-950 py-20 px-6 lg:px-8 border-b border-cyan-950">
        {/* Background Gradients & Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />
        <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-1/4 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Copywrite */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5 animate-spin" />
                <span>GIẢI PHÁP THIẾT BỊ Y SINH CHUYÊN NGHIỆP</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
                Nâng tầm Y khoa bằng <br />
                <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  Công nghệ Chẩn đoán ABT
                </span>
              </h1>
              <p className="text-slate-300 text-base sm:text-lg max-w-2xl font-light leading-relaxed">
                Công ty Thiết bị Y sinh ABT tự hào là đối tác công nghệ chiến
                lược của các Bệnh viện, Viện Nghiên cứu và Trường Đại học hàng
                đầu Việt Nam. Chúng tôi cung cấp các giải pháp hoàn hảo cho
                phòng xét nghiệm, sinh học phân tử và quang học.
              </p>

              {/* Call-to actions */}
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  id="hero-explore-btn"
                  onClick={onExploreProducts}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 font-semibold text-sm text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 flex items-center gap-2 group transform hover:-translate-y-0.5"
                >
                  Khám phá Sản phẩm ABT
                  <ArrowRight className="h-4.5 w-4.5 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
                <a
                  href="#abt-about-section"
                  className="px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 font-semibold text-sm text-slate-300 hover:text-white transition-all duration-200 flex items-center gap-2"
                >
                  Giới thiệu Công ty ABT
                </a>
              </div>

              {/* Quality Badges */}
              <div className="pt-6 border-t border-slate-900 flex flex-wrap gap-x-8 gap-y-3 text-slate-400 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  <span>ISO 13485:2016 Certified</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  <span>CE & FDA Conformity</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                  <span>Bộ Y Tế cấp phép lưu hành</span>
                </div>
              </div>
            </div>

            {/* Right Graphic/Mock Showcase */}
            <div className="lg:col-span-5 relative mt-8 lg:mt-0">
              <div className="relative rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl shadow-cyan-500/5">
                <img
                  src="./assets/images/Light-Cycler-96.jpg"
                  alt="ABT Biomedical Equipment Showcase"
                  className="rounded-xl object-cover w-full h-[320px] sm:h-[380px] lg:h-[400px] border border-slate-800 brightness-95"
                />

                {/* Embedded Floating Widget */}
                <div className="absolute -bottom-6 -left-6 bg-slate-950 p-4 rounded-xl border border-teal-500/30 max-w-xs shadow-xl hidden sm:block">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                    <span className="text-[10px] text-teal-400 font-mono uppercase tracking-widest font-semibold">
                      Công nghệ nổi bật
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">
                    Máy Real-time PCR ABT-Cycler 96
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Được lắp đặt và hiệu chỉnh chính xác bởi kỹ sư sinh học ABT.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Outstanding Stats counters Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-gradient-to-b from-slate-900 to-slate-950 p-8 rounded-2xl border border-slate-850 shadow-inner">
          {stats.map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={idx}
                className="text-center p-4 space-y-2 border-r last:border-r-0 border-slate-800/80 last:border-0"
              >
                <div className="mx-auto w-10 h-10 rounded-lg bg-cyan-950/50 border border-cyan-800/30 flex items-center justify-center mb-3">
                  <IconComponent className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {stat.number}
                </div>
                <div className="text-xs text-slate-400 max-w-[180px] mx-auto leading-relaxed font-sans">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Core Values / Why Choose ABT */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-xs font-mono font-bold tracking-widest text-teal-400 uppercase">
            GIÁ TRỊ CỐT LÕI
          </h2>
          <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Đồng hành cùng Sự Phát triển của Y học Việt Nam
          </p>
          <div className="h-1 w-20 bg-gradient-to-r from-cyan-400 to-teal-400 mx-auto rounded-full" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {CORE_VALUES.map((val, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-slate-100 hover:border-cyan-300 shadow-sm transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center">
                  {idx === 0 && (
                    <ShieldCheck className="h-6 w-6 text-cyan-600" />
                  )}
                  {idx === 1 && <Clock className="h-6 w-6 text-cyan-600" />}
                  {idx === 2 && <Settings className="h-6 w-6 text-cyan-600" />}
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {val.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {val.desc}
                </p>
              </div>
              <div className="pt-4 flex items-center text-xs font-semibold text-cyan-600 hover:text-cyan-700 cursor-pointer">
                Xem thêm chi tiết
                <ArrowRight className="h-3 w-3 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Featured Products Showcase */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="text-left space-y-2">
            <h2 className="text-xs font-mono font-bold tracking-widest text-teal-500 uppercase">
              THIẾT BỊ KHUYÊN DÙNG
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Sản phẩm ABT Cao Cấp Nổi Bật
            </h3>
          </div>
          <button
            id="featured-explore-all-btn"
            onClick={onExploreProducts}
            className="text-sm font-semibold text-cyan-500 hover:text-cyan-600 flex items-center gap-1 text-left shrink-0"
          >
            Xem tất cả {products.length} sản phẩm
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product) => (
            <div
              id={`prod-card-${product.id}`}
              key={product.id}
              className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex flex-col justify-between group h-full shadow-lg"
            >
              <div className="relative overflow-hidden aspect-video">
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute top-2.5 right-2-5 right-2.5 bg-cyan-500 text-slate-950 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded shadow-md">
                  HOT
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between text-left">
                <div className="space-y-2">
                  <span className="text-[10px] text-teal-400 font-semibold tracking-wider uppercase font-mono">
                    {product.category}
                  </span>
                  <h4 className="font-bold text-sm text-slate-100 line-clamp-2 h-10 group-hover:text-cyan-300 pr-1 select-none">
                    {product.name}
                  </h4>
                  <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">Giá bán:</span>
                    <span className="text-base font-extrabold text-cyan-400">
                      {product.price.toLocaleString("vi-VN")} đ{" "}
                      <span className="text-[10px] font-normal text-slate-500">
                        /{product.unit}
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id={`home-view-detail-${product.id}`}
                      onClick={() => onViewProductDetail(product)}
                      className="py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-300 hover:text-white transition-all bg-slate-950 duration-205"
                    >
                      Chi tiết
                    </button>
                    <button
                      id={`home-add-cart-${product.id}`}
                      onClick={() => onAddToCart(product)}
                      className="py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-slate-950 font-bold transition-all duration-205"
                    >
                      Chọn mua
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. About ABT Corporate Section */}
      <section
        id="abt-about-section"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-100 dark:border-slate-850"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Công ty Thiết Bị Y Sinh ABT
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-light">
              Được thành lập bởi đội ngũ Giáo sư, Tiến sĩ và Thạc sĩ Y sinh giàu
              kinh nghiệm, **ABT Biomedical** tập trung định hướng cung cấp bộ
              sản phẩm đồng bộ cho kỹ thuật phòng lab vi sinh, nuôi tế bào và
              chẩn đoán phân tử hiện đại.
            </p>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-light">
              Chúng tôi sở hữu trung tâm dịch vụ kỹ thuật bảo dưỡng và hiệu
              chuẩn định kỳ uy tín tại Hà Nội và TP. Hồ Chí Minh, tự tin cam kết
              độ ổn định tối đa cho các hệ thống máy đại trà hoặc cao cấp của
              bệnh viện.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                  Trung tâm kỹ thuật
                </h5>
                <p className="text-xs text-slate-500">
                  Bảo dưỡng chính hãng, cung cấp vật tư tiêu hao dự trữ sẵn nhằm
                  tránh gián đoạn mẫu thử.
                </p>
              </div>
              <div className="space-y-1 p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                  Đại diện phân phối
                </h5>
                <p className="text-xs text-slate-500">
                  Hàng nhập khẩu nguyên đai nguyên kiện với đầy đủ xuất xứ CO,
                  CQ và Tờ khai hải quan đạt chuẩn.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wider text-slate-400 font-mono text-left uppercase">
              ĐỐI TÁC HỢP TÁC HÀNG ĐẦU
            </h4>
            <div className="grid gap-3">
              {partners.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-850"
                >
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    {p.name}
                  </span>
                  <span className="text-xs text-cyan-600 dark:text-cyan-400 font-mono bg-cyan-100 dark:bg-cyan-950/50 px-2 py-0.5 rounded">
                    {p.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
