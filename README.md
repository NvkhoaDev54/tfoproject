# 🎓 Student Management DApp on Sui Blockchain

Ứng dụng quản lý sinh viên phi tập trung (DApp) được xây dựng trên Sui blockchain, cho phép quản lý hồ sơ sinh viên, điểm số và cấp chứng chỉ một cách minh bạch và bảo mật.

## 📋 Tính năng

### ✅ Đã hoàn thành
- 🎯 **Quản lý sinh viên**: Tạo và quản lý hồ sơ sinh viên trên blockchain
- 📊 **Dashboard**: Hiển thị thống kê tổng quan về sinh viên, điểm số
- 📜 **Cấp chứng chỉ**: Phát hành chứng chỉ cho sinh viên với xác thực blockchain
- 💾 **Lưu trữ**: Kết hợp localStorage và blockchain để đảm bảo dữ liệu
- 🔄 **Đồng bộ blockchain**: Tải dữ liệu từ blockchain events
- 🔐 **Xác thực**: Chỉ Admin có quyền thêm sinh viên và cấp chứng chỉ

### 🚧 Đang phát triển
- 📚 **Quản lý điểm số**: Thêm điểm cho sinh viên theo từng môn học
- 📈 **Tính GPA**: Tự động tính GPA dựa trên điểm số

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **@mysten/dapp-kit** - Sui wallet integration
- **@mysten/sui/client** - Sui blockchain interaction
- **Lucide React** - Icons

### Blockchain
- **Sui Move** - Smart contract language
- **Sui Testnet** - Deployment network

## 📦 Cấu trúc dự án

```
tfoproject/
├── sources/                    # Move smart contracts
│   ├── tfoproject.move        # Main contract
│   └── tfoproject_tests.move  # Contract tests
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── StudentManagement.jsx
│   │   ├── hooks/
│   │   │   └── useSuiWallet.js
│   │   ├── utils/
│   │   │   └── suiClient.js
│   │   └── constants/
│   │       └── contracts.js
│   └── package.json
├── Move.toml                   # Move package config
└── README.md
```

## 🚀 Cài đặt và Chạy

### Yêu cầu
- Node.js >= 18
- Sui CLI
- Git

### 1. Clone dự án
```bash
git clone https://github.com/NvkhoaDev54/tfoproject.git
cd tfoproject
```

### 2. Cài đặt dependencies
```bash
cd frontend
npm install
```

### 3. Chạy ứng dụng
```bash
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:5173`

## 🔧 Cấu hình Blockchain

### Contract đã deploy trên Sui Testnet:

```javascript
PACKAGE_ID: "0x6406149ffd64c1275590d31367323c61509f0dd3416dccf28b44cff4e70f4e53"
ADMIN_CAP: "0x88a5e93f7ca0e3bf7d8b166c8cb333a3ab9deb34b127cbeb127d9427b4d24d72"
REGISTRY: "0xc456b2d252bb0bac7773147cd4ef46f5fbbc217bef5df38cc62fa9742b56ee15"
NETWORK: "testnet"
```

### Deploy contract mới (optional)

1. Build contract:
```bash
sui move build
```

2. Deploy lên testnet:
```bash
sui client publish --gas-budget 100000000
```

3. Cập nhật địa chỉ contract trong `frontend/src/constants/contracts.js`

## 📖 Hướng dẫn sử dụng

### 1. Kết nối ví Sui
- Click nút "Connect Wallet" ở góc trên bên phải
- Chọn Sui Wallet và xác nhận kết nối
- Đảm bảo ví có Sui testnet tokens

### 2. Thêm sinh viên mới
- Chuyển sang tab "Students"
- Click "Add Student"
- Điền thông tin: Student ID, Name, Email, Major, Enrollment Year
- Click "Add Student" và xác nhận transaction trong ví

### 3. Cấp chứng chỉ
- Chuyển sang tab "Certificates"
- Click "Issue Certificate"
- Điền thông tin chứng chỉ
- Click "Issue Certificate" và xác nhận transaction

### 4. Làm mới dữ liệu từ blockchain
- Click nút "Refresh from Blockchain" để tải dữ liệu mới nhất từ blockchain
- Dữ liệu tự động load khi mở lại trang

## 🔑 Smart Contract Functions

### Public Entry Functions

#### `create_student`
Tạo hồ sơ sinh viên mới (chỉ Admin)
```move
public entry fun create_student(
    _: &AdminCap,
    registry: &mut StudentRegistry,
    student_id: String,
    name: String,
    email: String,
    major: String,
    enrollment_year: u64,
    ctx: &mut TxContext
)
```

#### `issue_certificate`
Cấp chứng chỉ cho sinh viên (chỉ Admin)
```move
public entry fun issue_certificate(
    _: &AdminCap,
    student_id: String,
    certificate_name: String,
    issued_by: String,
    issue_date: u64,
    description: String,
    recipient: address,
    ctx: &mut TxContext
)
```

#### `add_grade`
Thêm điểm cho sinh viên (chỉ Admin)
```move
public entry fun add_grade(
    _: &AdminCap,
    student_id: String,
    course_code: String,
    course_name: String,
    credits: u64,
    grade: u64,
    semester: String,
    year: u64,
    recipient: address,
    ctx: &mut TxContext
)
```

## 🎯 Events

Contract phát sinh các events để frontend có thể theo dõi:

- `StudentCreated`: Khi tạo sinh viên mới
- `CertificateIssued`: Khi cấp chứng chỉ
- `GradeAdded`: Khi thêm điểm số

## 🐛 Xử lý lỗi thường gặp

### "Please connect your wallet first"
- Đảm bảo đã cài đặt Sui Wallet extension
- Click "Connect Wallet" để kết nối

### "Failed to create student: Transaction failed"
- Kiểm tra ví có đủ SUI tokens
- Đảm bảo Student ID chưa tồn tại
- Kiểm tra tất cả trường đã điền đầy đủ

### "Object is owned by account address"
- AdminCap phải thuộc về địa chỉ ví đang kết nối
- Liên hệ admin để transfer AdminCap

## 🔐 Bảo mật

- Chỉ owner của AdminCap mới có quyền tạo sinh viên và cấp chứng chỉ
- Tất cả transactions đều được ký bởi ví người dùng
- Dữ liệu được lưu bất biến trên blockchain

## 📝 License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết

## 👥 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:
1. Fork dự án
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📧 Liên hệ

- GitHub: [@NvkhoaDev54](https://github.com/NvkhoaDev54)
- Project Link: [https://github.com/NvkhoaDev54/tfoproject](https://github.com/NvkhoaDev54/tfoproject)

## 🙏 Acknowledgments

- [Sui Documentation](https://docs.sui.io/)
- [Mysten Labs](https://mystenlabs.com/)
- [React Documentation](https://react.dev/)

---

⭐ Nếu dự án này hữu ích, hãy cho một star nhé!
