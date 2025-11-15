# Student Management DApp

Ứng dụng quản lý sinh viên phi tập trung được xây dựng trên Sui Blockchain.

## Cài đặt

```bash
# Clone project
git clone <your-repo>
cd student-management-dapp

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build
```

## Deploy Smart Contract

1. Cài đặt Sui CLI
2. Deploy contract trong thư mục `contracts/`
3. Cập nhật `PACKAGE_ID`, `ADMIN_CAP`, `REGISTRY` trong `src/constants/contracts.js`

## Sử dụng

1. Cài đặt Sui Wallet extension
2. Kết nối wallet
3. Lấy testnet SUI từ faucet
4. Bắt đầu sử dụng app!

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- @mysten/sui.js
- @mysten/dapp-kit