import { Product } from './types';

export const CATEGORIES = [
  "Tất cả sản phẩm",
  "Thiết bị xét nghiệm",
  "Thiết bị sinh học phân tử",
  "Kính hiển vi & Quang học",
  "Vật tư y sinh & Bảo quản"
];

export const BIOMEDICAL_PRODUCTS: Product[] = [
  {
    id: "ABT-HEM-100",
    name: "Máy Phân Tích Huyết Học Tự Động ABT-Hem100",
    category: "Thiết bị xét nghiệm",
    price: 185000000,
    unit: "Hệ thống",
    image: "https://images.unsplash.com/photo-1579154204601-01588f351167?w=500&auto=format&fit=crop&q=80",
    description: "Hệ thống phân tích 5 thành phần bạch cầu hoàn toàn tự động, tối ưu cho các bệnh viện từ tuyến huyện đến trung ương. Công nghệ đo laser dòng chảy tiên tiến kết hợp trở kháng xung.",
    specs: [
      "Tốc độ phân tích: 60 mẫu/giờ",
      "Kênh đo: 29 thông số kiểm tra chất lượng cao",
      "Thể tích hút mẫu nhỏ: 20 µL máu toàn phần",
      "Màn hình cảm ứng LCD hiển thị biểu đồ sắc nét",
      "Bộ lưu trữ: Lên đến 100.000 kết quả bệnh nhân"
    ],
    stock: 5,
    featured: true
  },
  {
    id: "ABT-PCR-96",
    name: "Hệ Thống Real-time PCR ABT-Cycler 96",
    category: "Thiết bị sinh học phân tử",
    price: 320000000,
    unit: "Hệ thống",
    image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500&auto=format&fit=crop&q=80",
    description: "Hệ thống PCR định lượng thời gian thực thông minh, tích hợp khả năng gia nhiệt cực nhanh và hệ thống quang học độ chuẩn xác tuyệt đối, hỗ trợ chẩn đoán mầm bệnh nhanh chóng.",
    specs: [
      "Khay chứa: 96 giếng (ống 0.2ml hoặc đĩa PCR)",
      "Số kênh màu: 4-6 kênh huỳnh quang (FAM, JOE, ROX, CY5)",
      "Hệ thống nhiệt: Peltier cao cấp gia nhiệt đạt 6.0 °C / giây",
      "Độ nhạy phát hiện: Đơn bản sao DNA mục tiêu",
      "Phần mềm: Tích hợp phân tích định lượng tuyệt đối, tương đối, SNP gen"
    ],
    stock: 3,
    featured: true
  },
  {
    id: "ABT-MIC-E500",
    name: "Kính Hiển Vi Quang Học Phản Xạ ABT-Optima E500",
    category: "Kính hiển vi & Quang học",
    price: 45000000,
    unit: "Bộ",
    image: "https://images.unsplash.com/photo-1582719471384-894fbb16e024?w=500&auto=format&fit=crop&q=80",
    description: "Kính hiển vi sinh học phục vụ nghiên cứu tế bào và chẩn đoán mô bệnh học với hệ thấu kính quang học vô cực cực kỳ xuất sắc, hạn chế tối đa quang sai màu.",
    specs: [
      "Đầu kính: Nghiêng 30 độ quay 360 độ điều chỉnh khoảng cách đồng tử",
      "Thị kính: Vi trường rộng WF10x/22mm tích hợp chống mốc",
      "Vật kính: Phẳng vô cực Plan Infinity (4x, 10x, 40x, 100x dầu)",
      "Nguồn sáng: Đèn LED Kohler công suất cao tuổi thọ 20.000 giờ",
      "Bàn sa trượt: Hai lớp kích thước lớn, sơn phủ chống mài mòn hóa chất"
    ],
    stock: 12,
    featured: true
  },
  {
    id: "ABT-CEN-H24",
    name: "Máy Ly Tâm Lạnh Tốc Độ Cao ABT-Centri H24",
    category: "Vật tư y sinh & Bảo quản",
    price: 115000000,
    unit: "Bộ",
    image: "https://images.unsplash.com/photo-1530026405186-ed1eaae6bbcd?w=500&auto=format&fit=crop&q=80",
    description: "Dòng máy ly tâm lạnh chuyên nghiệp bảo quản hoạt tính sinh học của protein, acid nucleic và tế bào trong quá trình tách mẫu tốc độ cao.",
    specs: [
      "Tốc độ tối đa: 16.500 vòng/phút (RCF đạt 26.000 xg)",
      "Dải nhiệt độ cài đặt: -20 °C đến +40 °C tự động làm lạnh nhanh",
      "Rotor tùy chọn: 24 ống x 1.5/2.0 mL chống rò rỉ sinh học",
      "Độ ồn khi chạy: Cực thấp dưới 56 dB",
      "Hệ thống an toàn: Tự động ngắt khi mất cân bằng, khóa nắp điện tử kép"
    ],
    stock: 8,
    featured: false
  },
  {
    id: "ABT-INC-300",
    name: "Tủ Ấm Khí CO2 Nuôi Cấy Tế Bào ABT-CellGrow 300",
    category: "Vật tư y sinh & Bảo quản",
    price: 155000000,
    unit: "Chiếc",
    image: "https://images.unsplash.com/photo-1581091870622-0a301bd41159?w=500&auto=format&fit=crop&q=80",
    description: "Môi trường nuôi cấy tế bào chuyên sâu với bộ kiểm soát nồng độ khí CO2 cảm biến hồng ngoại (IR) và hệ thống kiểm soát nhiệt độ áo nước, đảm bảo duy trì độ ẩm lý tưởng.",
    specs: [
      "Thể tích buồng: 180 Lít kháng khuẩn bằng thép không gỉ 304",
      "Kiểm soát nồng độ CO2: 0 - 20% độ chính xác ±0.1%",
      "Kiểm soát nhiệt độ: Nhiệt độ môi trường +5 °C đến 50 °C độ ổn định cao",
      "Độ ẩm trong tủ: Đạt >95% nhờ khay nước bốc hơi tự nhiên",
      "Khử trùng: Hệ thống chu trình nhiệt khô 140 °C diệt khuẩn hoàn toàn"
    ],
    stock: 4,
    featured: true
  },
  {
    id: "ABT-BIO-CAB2",
    name: "Tủ An Toàn Sinh Học Cấp II ABT-BioSafe II",
    category: "Vật tư y sinh & Bảo quản",
    price: 98000000,
    unit: "Hệ thống",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=80",
    description: "Tủ bảo vệ an toàn kép cho cả nhân viên vận hành, môi trường xung quanh và mẫu thử. Đạt tiêu chuẩn an toàn sinh học châu Âu EN12469.",
    specs: [
      "Dạng tủ an toàn sinh học: Cấp II (Type A2) tuần hoàn khí 70% qua màng HEPA",
      "Màng lọc chính: Màng HEPA chính và xả thải đạt hiệu suất lọc >99.999% hạt 0.3μm",
      "Tốc độ dòng khí cấp: 0.35 m/s | Tốc độ dòng khí hút: 0.53 m/s",
      "Hệ thống đèn: Đèn huỳnh quang chiếu sáng và đèn UV khử trùng cài đặt hẹn giờ",
      "Mặt bàn làm việc: Thép không gỉ 304 nguyên tấm dễ lau chùi sát khuẩn"
    ],
    stock: 6,
    featured: false
  }
];

export const CORE_VALUES = [
  {
    title: "Chất lượng Chuẩn Quốc tế",
    desc: "Mọi thiết bị sinh học ABT cung cấp đều đạt tiêu chuẩn FDA, CE, ISO 13485 khắt khe nhất."
  },
  {
    title: "Hỗ trợ Kỹ thuật 24/7",
    desc: "Đội ngũ kỹ sư chuyên môn cao hỗ trợ lắp đặt, bảo hành, hiệu chuẩn thiết bị trên toàn quốc."
  },
  {
    title: "Giải pháp Toàn diện",
    desc: "Từ tư vấn thiết kế lab, phòng sạch vi sinh đến cung cấp hệ thống máy móc xét nghiệm hiện đại."
  }
];

export const MOCK_ORDERS: any[] = [
  {
    id: "DH-9821-ABT",
    date: "2026-06-05T08:30:00Z",
    customerName: "PGS.TS Nguyễn Văn Hải",
    email: "hainguyen@hcmus.edu.vn",
    phone: "0903123456",
    address: "Phòng thí nghiệm Sinh học Phân tử, Đại học Khoa học Tự nhiên",
    organization: "Đại học Khoa học Tự nhiên TP.HCM",
    paymentMethod: "payos",
    items: [
      {
        product: BIOMEDICAL_PRODUCTS[1], // Real-time PCR
        quantity: 1,
        priceAtOrder: 320000000
      }
    ],
    status: "completed",
    total: 320000000,
    paymentStatus: "paid",
    notes: "Xin hóa đơn VAT cho trường học."
  },
  {
    id: "DH-1423-ABT",
    date: "2026-06-07T14:15:00Z",
    customerName: "ThS. BS Trần Minh Tâm",
    email: "tamtran@hospital.org",
    phone: "0918765432",
    address: "Khoa Xét nghiệm, Tầng 3 Tòa nhà B",
    organization: "Bệnh viện Đa khoa Hoàn Mỹ",
    paymentMethod: "paypal",
    items: [
      {
        product: BIOMEDICAL_PRODUCTS[0], // Huyết học
        quantity: 1,
        priceAtOrder: 185000000
      },
      {
        product: BIOMEDICAL_PRODUCTS[4], // Tủ ấm CO2
        quantity: 1,
        priceAtOrder: 155000000
      }
    ],
    status: "paid",
    total: 340000000,
    paymentStatus: "paid",
    notes: "Đặt gấp để thay thế thiết bị cũ đang quá tải."
  },
  {
    id: "DH-2309-ABT",
    date: "2026-06-08T09:40:00Z",
    customerName: "Nguyễn Thị Mai Phương",
    email: "phuongabt@care-biotech.vn",
    phone: "0982345678",
    address: "Số 15, Đường Số 4, Khu Công nghệ cao Quận 9",
    organization: "Công ty Cổ phần Công nghệ sinh học Care",
    paymentMethod: "payos",
    items: [
      {
        product: BIOMEDICAL_PRODUCTS[2], // Kính hiển vi
        quantity: 2,
        priceAtOrder: 45000000
      }
    ],
    status: "pending_payment",
    total: 90000000,
    paymentStatus: "unpaid",
    notes: "Sẽ chuyển khoản qua mã QR PayOS vào buổi chiều."
  }
];

export const MOCK_USERS: any[] = [
  {
    id: "USR-001",
    name: "Quản trị viên ABT",
    email: "admin@abt-biomedical.vn",
    role: "admin",
    status: "active",
    department: "Ban Công nghệ & Điều hành",
    createdAt: "2026-01-10T08:00:00Z"
  },
  {
    id: "USR-002",
    name: "Khách hàng Thử nghiệm",
    email: "user@abt-biomedical.vn",
    role: "user",
    status: "active",
    department: "Phòng R&D - Lab Sinh học",
    createdAt: "2026-02-14T09:30:05Z"
  },
  {
    id: "USR-003",
    name: "PGS.TS Nguyễn Văn Hải",
    email: "hainguyen@hcmus.edu.vn",
    role: "user",
    status: "active",
    department: "Đại học Khoa học Tự nhiên TP.HCM",
    createdAt: "2026-04-18T10:12:00Z"
  },
  {
    id: "USR-004",
    name: "ThS. BS Trần Minh Tâm",
    email: "tamtran@hospital.org",
    role: "user",
    status: "active",
    department: "Khoa Xét nghiệm - BV Đa khoa Hoàn Mỹ",
    createdAt: "2026-05-02T16:45:00Z"
  },
  {
    id: "USR-005",
    name: "Nguyễn Thị Mai Phương",
    email: "phuongabt@care-biotech.vn",
    role: "user",
    status: "active",
    department: "Care Biotech Corp",
    createdAt: "2026-05-15T11:22:11Z"
  },
  {
    id: "USR-006",
    name: "Kiểm nghiệm viên Blocked Demo",
    email: "blocked@abt-biomedical.vn",
    role: "user",
    status: "blocked",
    department: "Phòng Lab Vô trùng Việt Nam",
    createdAt: "2026-06-01T15:00:00Z"
  }
];

export const MOCK_POSTS: any[] = [
  {
    id: "POST-001",
    title: "Hướng dẫn thiết lập phòng xét nghiệm Real-time PCR chuẩn y tế",
    category: "An toàn phòng thí nghiệm",
    summary: "Chi tiết sơ đồ bố trí khu vực vô trùng một chiều, kiểm tra áp suất âm và hệ thống màng lọc không khí HEPA.",
    content: "### Quy trình 3 phòng 1 chiều chống nhiễm chéo\n\nTrong kỹ thuật Real-time PCR chẩn đoán phân tử sinh vật học, việc chống lây nhiễm sản phẩm khuếch đại (amplicon) là tối quan trọng. ABT Biomedical khuyến nghị sơ đồ 3 phòng biệt lập:\n\n1. **Phòng chuẩn bị hóa chất (Reagent Prep):** Tuyệt đối áp suất dương, không mang mẫu ADN/ARN vào đây. Sử dụng tủ an toàn sinh học cấp II dòng khí thổi xuôi giữ sạch master mix.\n2. **Phòng chuẩn bị mẫu (Sample Prep):** Áp suất âm nhẹ để bảo vệ người thao tác tách chiết mẫu bệnh phẩm. Đặt máy tách chiết tự động và các thiết bị ly tâm lạnh ly trích hạt từ.\n3. **Phòng khuếch đại (Amplification/Detection):** Nơi chứa máy Real-time PCR ABT-Cycler 96. Tuyệt đối không mở nắp ống PCR sau khi phản ứng kết thúc để tránh bay hơi khí dung chứa hàng triệu bản sao mục tiêu vào không khí phòng.\n\n### Tiêu chí khí sạch HEPA H14\nHệ thống AHU và lọc khí sơ cấp, thứ cấp và HEPA phải giữ cho hạt bụi phòng Prep dưới chuẩn ISO Class 5 hoặc Class 7 tùy theo quy chuẩn y sinh hiện hành.",
    author: "Kỹ sư Y sinh Lê Văn Sơn",
    date: "2026-06-02T14:30:00Z",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=80",
    readTime: "5 phút đọc"
  },
  {
    id: "POST-002",
    title: "Ứng dụng của hạt Nano từ tính trong tách chiết axit nucleic hiệu suất cao",
    category: "Công nghệ mới",
    summary: "So sánh công nghệ cột lọc silica truyền thống với dòng hạt từ tính tự động hóa, giải pháp bứt phá thời gian tinh sạch mẫu.",
    content: "### Cơ chế tương tác tĩnh điện đảo ngược\n\nHạt từ tinh sạch cốt lõi là hạt nano oxit sắt từ ($Fe_3O_4$) được bọc ngoài bằng lớp silica vô định hình hoặc nhóm carboxyl có khả năng hấp phụ axit nucleic trong điều kiện nồng độ muối cao (chaotropic salt) như Guanidine Hydrochloride.\n\n```\nHạt từ-Silica + NaCl + DNA -> Phức hợp tủa từ tính hấp phụ dễ gom bằng nam châm ngoài\n```\n\n### Ưu điểm vượt trội của tự động hóa:\n- **Tối ưu thời gian:** Chỉ mất 20-30 phút cho 96 mẫu, giảm 3 lần so với ly tâm cột lọc quay truyền thống.\n- **Đồng đều cao:** Tỷ lệ thu hồi ADN đạt trên 95% bất kể tay nghề của kỹ thuật viên phòng Lab.\n- **An toàn hơn:** Không dùng dung môi độc hại như Chloroform hay Phenol gây kích ứng bỏng hô hấp.",
    author: "TS. Nguyễn Thị Lam Anh",
    date: "2026-06-04T10:15:00Z",
    image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500&auto=format&fit=crop&q=80",
    readTime: "7 phút đọc"
  },
  {
    id: "POST-003",
    title: "Hiệu chuẩn định kỳ thấu kính kính hiển vi quang học vô cực ABT",
    category: "Hướng dẫn sử dụng",
    summary: "Bình ổn quang sai màu sắc, vệ sinh bề mặt vật kính dầu 100x bằng dung dịch xylen chuyên dụng không làm hư hại lớp keo thấu kính.",
    content: "### Khuyến cáo quy trình vệ sinh mỗi ngày\n\nSau khi sử dụng vật kính ngâm dầu 100x, luôn có tàn dư dầu soi bám dính. Nếu để lâu, bụi bẩn bám dính biến tính đông cứng làm hỏng vĩnh viễn thấu kính đầu tiên:\n\n1. Dùng giấy lau kính chuyên dụng (không vụn vải) lau nhẹ nhàng theo vòng tròn từ tâm ra ngoài biên.\n2. Nhỏ 1 giọt hỗn hợp cồn/ether tỷ lệ 3:7 hoặc dung dịch rửa thấu kính chuyên ngành y sinh để làm sạch dầu triệt để.\n3. **Tuyệt đối cấm:** Dùng cồn công nghiệp nồng độ cao đổ trực tiếp vào vật kính hoặc dùng mũi kim cọ sát cơ học xước quang lớp tráng chống lóa.\n\nBảo dưỡng đúng cách giúp duy trì độ sâu trường ảnh vi mô và độ phân giải xuất sắc trong nhiều năm chẩn đoán số sốt xuất huyết hay phát hiện trực khuẩn lao.",
    author: "Trưởng phòng Bảo hành ABT-Corp",
    date: "2026-06-06T09:00:00Z",
    image: "https://images.unsplash.com/photo-1582719471384-894fbb16e024?w=500&auto=format&fit=crop&q=80",
    readTime: "4 phút đọc"
  }
];

