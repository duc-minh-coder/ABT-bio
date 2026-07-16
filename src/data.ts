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

