import React, { useEffect, useState } from "react";
import { GiTrophyCup } from "react-icons/gi";
import { FaArrowLeftLong } from "react-icons/fa6";
import { FaArrowRightLong } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import UserLayout from "../../../components/Layout/UserLayout";

const dummy = [
  {
    address: "Đà Nẵng, Ngũ Hành Sơn, Hòa Hải",
    avatarUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756335/organizations/lbp4o5miqa6elhl2eycg.jpg",
    backgroundUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756239/organizations/stqlqwcjrecf0ym9epzz.jpg",
    ceoId: "d3b77b59-b475-45d4-8bc5-65f93f1f4d15",
    email: "troinang@gmail.com",
    organizationDescription:
      "Hỗ trợ cộng đồng trong các hoạt động từ thiện và phát triển bền vững.",
    organizationId: "5ca96c5b-2788-4e00-845b-589770fad3bd",
    organizationName: "Trời Nắng Chang Chang",
    organizationStatus: "ACTIVE",
    phoneNumber: "0912345678",
    shutdownDay: null,
    startTime: "2023-01-15T00:00:00Z",
    walletId: "8608bde4-db17-4278-a724-0dbcf25694fc",
    numberOfProjects: 15,
    numberOfMembers: 120,
    totalFunding: 2500000,
  },
  {
    address: "Hà Nội, Hoàn Kiếm, Hàng Trống",
    avatarUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756335/organizations/lbp4o5miqa6elhl2eycg.jpg",
    backgroundUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756239/organizations/stqlqwcjrecf0ym9epzz.jpg",
    ceoId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    email: "bautroi@gmail.com",
    organizationDescription:
      "Tập trung vào giáo dục và hỗ trợ trẻ em có hoàn cảnh khó khăn.",
    organizationId: "6db87d6c-3899-5f11-956c-690871gbe4ce",
    organizationName: "Bầu Trời Trong Xanh",
    organizationStatus: "ACTIVE",
    phoneNumber: "0987654321",
    shutdownDay: null,
    startTime: "2022-06-20T00:00:00Z",
    walletId: "9709cef5-ec28-5389-b835-1ecd0377050d",
    numberOfProjects: 8,
    numberOfMembers: 80,
    totalFunding: 1800000,
  },
  {
    address: "TP. Hồ Chí Minh, Quận 1, Bến Nghé",
    avatarUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756335/organizations/lbp4o5miqa6elhl2eycg.jpg",
    backgroundUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756239/organizations/stqlqwcjrecf0ym9epzz.jpg",
    ceoId: "b2c3d4e5-f6g7-8901-bcde-fg2345678901",
    email: "mattroi@gmail.com",
    organizationDescription: "Bảo vệ môi trường và thúc đẩy lối sống xanh.",
    organizationId: "7ec98e7d-49aa-6012-a67d-7a0982hcf5df",
    organizationName: "Mặt Trời Rực Rỡ",
    organizationStatus: "PENDING",
    phoneNumber: "0932145678",
    shutdownDay: null,
    startTime: "2023-03-10T00:00:00Z",
    walletId: "a80adff6-fd39-649a-c946-2fde1488161e",
    numberOfProjects: 12,
    numberOfMembers: 150,
    totalFunding: 3200000,
  },
  {
    address: "Huế, Phú Nhuận, Tây Lộc",
    avatarUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756335/organizations/lbp4o5miqa6elhl2eycg.jpg",
    backgroundUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756239/organizations/stqlqwcjrecf0ym9epzz.jpg",
    ceoId: "c3d4e5f6-g7h8-9012-cdef-gh3456789012",
    email: "canhchim@gmail.com",
    organizationDescription: "Cung cấp hỗ trợ y tế cho các khu vực khó khăn.",
    organizationId: "8fd09f8e-5abb-7113-b78e-8b1a93idg6eg",
    organizationName: "Cánh Chim Tự Do",
    organizationStatus: "ACTIVE",
    phoneNumber: "0943214567",
    shutdownDay: null,
    startTime: "2021-11-25T00:00:00Z",
    walletId: "b91be0g7-ge4a-75ab-d057-3gef2599272f",
    numberOfProjects: 5,
    numberOfMembers: 60,
    totalFunding: 900000,
  },
  {
    address: "Nha Trang, Vĩnh Nguyên, Vĩnh Nghi",
    avatarUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756335/organizations/lbp4o5miqa6elhl2eycg.jpg",
    backgroundUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756239/organizations/stqlqwcjrecf0ym9epzz.jpg",
    ceoId: "d4e5f6g7-h8i9-0123-defg-hi4567890123",
    email: "tuthien@gmail.com",
    organizationDescription:
      "Hỗ trợ người nghèo và người vô gia cư với các chương trình thiết thực.",
    organizationId: "90e1a09f-6bcc-8214-c89f-9c2b04jeh7fh",
    organizationName: "Hội Từ Thiện Ánh Sáng",
    organizationStatus: "ACTIVE",
    phoneNumber: "0921345678",
    shutdownDay: null,
    startTime: "2022-09-05T00:00:00Z",
    walletId: "ca2cf1h8-hf5b-86bc-e168-4hfg36aa3830",
    numberOfProjects: 20,
    numberOfMembers: 200,
    totalFunding: 4500000,
  },
  {
    address: "Cần Thơ, Ninh Kiều, Cái Khế",
    avatarUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756335/organizations/lbp4o5miqa6elhl2eycg.jpg",
    backgroundUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756239/organizations/stqlqwcjrecf0ym9epzz.jpg",
    ceoId: "e5f6g7h8-i9j0-1234-efgh-ij5678901234",
    email: "hoahuongduong@gmail.com",
    organizationDescription: "Thúc đẩy văn hóa và nghệ thuật trong cộng đồng.",
    organizationId: "a1f2b1a0-7cdd-9315-d90a-ad3c15kfi8gi",
    organizationName: "Tổ Chức Hoa Hướng Dương",
    organizationStatus: "PENDING",
    phoneNumber: "0971234567",
    shutdownDay: null,
    startTime: "2023-07-12T00:00:00Z",
    walletId: "db3dg2i9-ig6c-97cd-f279-5igh47bb4941",
    numberOfProjects: 3,
    numberOfMembers: 40,
    totalFunding: 500000,
  },
  {
    address: "Hải Phòng, Hồng Bàng, Hạ Lý",
    avatarUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756335/organizations/lbp4o5miqa6elhl2eycg.jpg",
    backgroundUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756239/organizations/stqlqwcjrecf0ym9epzz.jpg",
    ceoId: "f6g7h8i9-j0k1-2345-fghi-jk6789012345",
    email: "quycongdong@gmail.com",
    organizationDescription:
      "Hỗ trợ phụ nữ và trẻ em gái trong việc tiếp cận giáo dục và việc làm.",
    organizationId: "b2g3c2b1-8dee-a416-ea1b-be4d26lgj9hj",
    organizationName: "Quỹ Hỗ Trợ Cộng Đồng",
    organizationStatus: "ACTIVE",
    phoneNumber: "0962345678",
    shutdownDay: null,
    startTime: "2021-05-18T00:00:00Z",
    walletId: "ec4eh3j0-jh7d-a8de-g38a-6jih58cc5a52",
    numberOfProjects: 18,
    numberOfMembers: 180,
    totalFunding: 3800000,
  },
  {
    address: "Quy Nhơn, Nhơn Bình, Nhơn Phú",
    avatarUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756335/organizations/lbp4o5miqa6elhl2eycg.jpg",
    backgroundUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756239/organizations/stqlqwcjrecf0ym9epzz.jpg",
    ceoId: "g7h8i9j0-k1l2-3456-ghij-kl7890123456",
    email: "thiennguyen@gmail.com",
    organizationDescription:
      "Tổ chức các chương trình thiện nguyện tại miền Trung Việt Nam.",
    organizationId: "c3h4d3c2-9eff-b517-fb2c-cf5e37mhk0ik",
    organizationName: "Nhóm Thiện Nguyện Miền Trung",
    organizationStatus: "ACTIVE",
    phoneNumber: "0953456789",
    shutdownDay: null,
    startTime: "2022-02-22T00:00:00Z",
    walletId: "fd5fi4k1-ki8e-b9ef-h49b-7kji69dd6b63",
    numberOfProjects: 7,
    numberOfMembers: 90,
    totalFunding: 1200000,
  },
  {
    address: "Vũng Tàu, Phường 2, Thắng Tam",
    avatarUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756335/organizations/lbp4o5miqa6elhl2eycg.jpg",
    backgroundUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756239/organizations/stqlqwcjrecf0ym9epzz.jpg",
    ceoId: "h8i9j0k1-l2m3-4567-hijk-lm8901234567",
    email: "baovemoitruong@gmail.com",
    organizationDescription: "Bảo vệ môi trường và thúc đẩy lối sống xanh.",
    organizationId: "d4i5e4d3-af00-c618-0c3d-dg6f48nil1jl",
    organizationName: "Tổ Chức Bảo Vệ Môi Trường",
    organizationStatus: "PENDING",
    phoneNumber: "0944567890",
    shutdownDay: null,
    startTime: "2023-04-30T00:00:00Z",
    walletId: "0e6gj5l2-lj9f-caf0-i5ac-8lkj7aee7c74",
    numberOfProjects: 10,
    numberOfMembers: 110,
    totalFunding: 2000000,
  },
  {
    address: "Đà Lạt, Phường 1, Trại Mát",
    avatarUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756335/organizations/lbp4o5miqa6elhl2eycg.jpg",
    backgroundUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756239/organizations/stqlqwcjrecf0ym9epzz.jpg",
    ceoId: "i9j0k1l2-m3n4-5678-ijkl-mn9012345678",
    email: "cuutrotreem@gmail.com",
    organizationDescription:
      "Hỗ trợ trẻ em có hoàn cảnh khó khăn tiếp cận giáo dục.",
    organizationId: "e5j6f5e4-b011-d719-1d4e-eh7g59ojm2km",
    organizationName: "Hội Cứu Trợ Trẻ Em",
    organizationStatus: "ACTIVE",
    phoneNumber: "0935678901",
    shutdownDay: null,
    startTime: "2021-08-15T00:00:00Z",
    walletId: "1f7hk6m3-mk0g-dbg1-j6bd-9mlk8bff8d85",
    numberOfProjects: 6,
    numberOfMembers: 70,
    totalFunding: 800000,
  },
  {
    address: "Đà Nẵng, Thanh Khê, Xuân Hà",
    avatarUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756335/organizations/lbp4o5miqa6elhl2eycg.jpg",
    backgroundUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756239/organizations/stqlqwcjrecf0ym9epzz.jpg",
    ceoId: "j0k1l2m3-n4o5-6789-jklm-no0123456789",
    email: "phattriengiaoduc@gmail.com",
    organizationDescription: "Hỗ trợ giáo dục cho trẻ em vùng sâu vùng xa.",
    organizationId: "f6k7g6f5-c122-e81a-2e5f-fi8h6apkn3ln",
    organizationName: "Quỹ Phát Triển Giáo Dục",
    organizationStatus: "ACTIVE",
    phoneNumber: "0926789012",
    shutdownDay: null,
    startTime: "2022-12-01T00:00:00Z",
    walletId: "2g8il7n4-nl1h-ech2-k7ce-0nmj9cgg9e96",
    numberOfProjects: 14,
    numberOfMembers: 130,
    totalFunding: 2700000,
  },
  {
    address: "Hà Nội, Ba Đình, Đội Cấn",
    avatarUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756335/organizations/lbp4o5miqa6elhl2eycg.jpg",
    backgroundUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756239/organizations/stqlqwcjrecf0ym9epzz.jpg",
    ceoId: "k1l2m3n4-o5p6-7890-klmn-op1234567890",
    email: "hotroyte@gmail.com",
    organizationDescription: "Cung cấp hỗ trợ y tế cho các khu vực khó khăn.",
    organizationId: "g7l8h7g6-d233-f91b-3f60-gj9i7bqln4mo",
    organizationName: "Tổ Chức Hỗ Trợ Y Tế",
    organizationStatus: "PENDING",
    phoneNumber: "0917890123",
    shutdownDay: null,
    startTime: "2023-02-14T00:00:00Z",
    walletId: "3h9jm8o5-om2i-fdi3-l8df-1onk0dhh0f07",
    numberOfProjects: 9,
    numberOfMembers: 95,
    totalFunding: 1500000,
  },
  {
    address: "TP. Hồ Chí Minh, Quận 7, Tân Phong",
    avatarUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756335/organizations/lbp4o5miqa6elhl2eycg.jpg",
    backgroundUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756239/organizations/stqlqwcjrecf0ym9epzz.jpg",
    ceoId: "l2m3n4o5-p6q7-8901-lmno-pq2345678901",
    email: "baovedongvat@gmail.com",
    organizationDescription:
      "Bảo vệ động vật hoang dã và thúc đẩy nhận thức về quyền động vật.",
    organizationId: "h8m9i8h7-e344-0a2c-4061-hk0j8crmo5np",
    organizationName: "Hội Bảo Vệ Động Vật",
    organizationStatus: "ACTIVE",
    phoneNumber: "0908901234",
    shutdownDay: null,
    startTime: "2021-03-20T00:00:00Z",
    walletId: "4i0kn9p6-pn3j-gej4-m9eg-2pol1eii1g18",
    numberOfProjects: 11,
    numberOfMembers: 105,
    totalFunding: 2200000,
  },
  {
    address: "Huế, Hương Thủy, Thủy Vân",
    avatarUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756335/organizations/lbp4o5miqa6elhl2eycg.jpg",
    backgroundUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756239/organizations/stqlqwcjrecf0ym9epzz.jpg",
    ceoId: "m3n4o5p6-q7r8-9012-mnop-qr3456789012",
    email: "nangruc@gmail.com",
    organizationDescription:
      "Tổ chức các chương trình thiện nguyện tại miền Trung Việt Nam.",
    organizationId: "i9n0j9i8-f455-1b3d-5172-il1k9dsnp6oq",
    organizationName: "Nhóm Thiện Nguyện Nắng Rực",
    organizationStatus: "ACTIVE",
    phoneNumber: "0899012345",
    shutdownDay: null,
    startTime: "2022-10-10T00:00:00Z",
    walletId: "5j1lo0q7-qo4k-hfk5-n0fh-3qpm2fjj2h29",
    numberOfProjects: 4,
    numberOfMembers: 50,
    totalFunding: 600000,
  },
  {
    address: "Nha Trang, Vĩnh Hải, Vĩnh Phước",
    avatarUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756335/organizations/lbp4o5miqa6elhl2eycg.jpg",
    backgroundUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756239/organizations/stqlqwcjrecf0ym9epzz.jpg",
    ceoId: "n4o5p6q7-r8s9-0123-nopq-rs4567890123",
    email: "hotrongheo@gmail.com",
    organizationDescription:
      "Hỗ trợ người nghèo và người vô gia cư với các chương trình thiết thực.",
    organizationId: "j0o1k0j9-g566-2c4e-6283-jm2l0etpq7pr",
    organizationName: "Tổ Chức Hỗ Trợ Người Nghèo",
    organizationStatus: "PENDING",
    phoneNumber: "0880123456",
    shutdownDay: null,
    startTime: "2023-06-25T00:00:00Z",
    walletId: "6k2mp1r8-rp5l-igl6-o1gi-4rqn3gkk3i30",
    numberOfProjects: 16,
    numberOfMembers: 140,
    totalFunding: 3000000,
  },
  {
    address: "Cần Thơ, Bình Thủy, Trà Nóc",
    avatarUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756335/organizations/lbp4o5miqa6elhl2eycg.jpg",
    backgroundUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756239/organizations/stqlqwcjrecf0ym9epzz.jpg",
    ceoId: "o5p6q7r8-s9t0-1234-opqr-st5678901234",
    email: "hotrophunu@gmail.com",
    organizationDescription:
      "Hỗ trợ phụ nữ và trẻ em gái trong việc tiếp cận giáo dục và việc làm.",
    organizationId: "k1p2l1k0-h677-3d5f-7394-kn3m1fuqr8qs",
    organizationName: "Quỹ Hỗ Trợ Phụ Nữ",
    organizationStatus: "ACTIVE",
    phoneNumber: "0871234567",
    shutdownDay: null,
    startTime: "2021-09-30T00:00:00Z",
    walletId: "7l3nq2s9-sq6m-jhm7-p2hj-5sro4hll4j41",
    numberOfProjects: 13,
    numberOfMembers: 125,
    totalFunding: 2600000,
  },
  {
    address: "Hải Phòng, Lê Chân, Nghiêm Xuân Yêm",
    avatarUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756335/organizations/lbp4o5miqa6elhl2eycg.jpg",
    backgroundUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756239/organizations/stqlqwcjrecf0ym9epzz.jpg",
    ceoId: "p6q7r8s9-t0u1-2345-pqrs-tu6789012345",
    email: "thucdayvanhoa@gmail.com",
    organizationDescription: "Thúc đẩy văn hóa và nghệ thuật trong cộng đồng.",
    organizationId: "l2q3m2l1-i788-4e60-84a5-lo4n2gvsr9rt",
    organizationName: "Hội Thúc Đẩy Văn Hóa",
    organizationStatus: "ACTIVE",
    phoneNumber: "0862345678",
    shutdownDay: null,
    startTime: "2022-04-05T00:00:00Z",
    walletId: "8m4or3t0-tr7n-kjn8-q3ik-6tsp5imm5k52",
    numberOfProjects: 2,
    numberOfMembers: 30,
    totalFunding: 400000,
  },
  {
    address: "Quy Nhơn, Nhơn Hội, Nhơn Lý",
    avatarUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756335/organizations/lbp4o5miqa6elhl2eycg.jpg",
    backgroundUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756239/organizations/stqlqwcjrecf0ym9epzz.jpg",
    ceoId: "q7r8s9t0-u1v2-3456-qrst-uv7890123456",
    email: "phattrienbenvung@gmail.com",
    organizationDescription:
      "Tổ chức phát triển bền vững và bảo vệ môi trường.",
    organizationId: "m3r4n3m2-j899-5f71-95b6-mp5o3hwts0su",
    organizationName: "Tổ Chức Phát Triển Bền Vững",
    organizationStatus: "PENDING",
    phoneNumber: "0853456789",
    shutdownDay: null,
    startTime: "2023-01-20T00:00:00Z",
    walletId: "9n5ps4u1-us8o-lko9-r4jl-7utq6jnn6l63",
    numberOfProjects: 17,
    numberOfMembers: 160,
    totalFunding: 3400000,
  },
  {
    address: "Vũng Tàu, Phường 8, Long Hương",
    avatarUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756335/organizations/lbp4o5miqa6elhl2eycg.jpg",
    backgroundUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756239/organizations/stqlqwcjrecf0ym9epzz.jpg",
    ceoId: "r8s9t0u1-v2w3-4567-rstu-vw8901234567",
    email: "hotrokhuyettat@gmail.com",
    organizationDescription: "Hỗ trợ người khuyết tật hòa nhập cộng đồng.",
    organizationId: "n4s5o4n3-k9aa-6072-a6c7-nq6p4ixut1tv",
    organizationName: "Nhóm Hỗ Trợ Người Khuyết Tật",
    organizationStatus: "ACTIVE",
    phoneNumber: "0844567890",
    shutdownDay: null,
    startTime: "2021-12-15T00:00:00Z",
    walletId: "0o6qt5v2-vt9p-mlp0-s5km-8vur7koo7m74",
    numberOfProjects: 8,
    numberOfMembers: 85,
    totalFunding: 1300000,
  },
  {
    address: "Đà Lạt, Phường 3, Tà Nung",
    avatarUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756335/organizations/lbp4o5miqa6elhl2eycg.jpg",
    backgroundUrl:
      "https://res.cloudinary.com/dfoq1dvce/image/upload/v1743756239/organizations/stqlqwcjrecf0ym9epzz.jpg",
    ceoId: "s9t0u1v2-w3x4-5678-stuv-wx9012345678",
    email: "khuenhoc@gmail.com",
    organizationDescription: "Hỗ trợ học bổng cho học sinh nghèo vượt khó.",
    organizationId: "o5t6p5o4-labb-7173-b7d8-or7q5jyvu2uw",
    organizationName: "Hội Khuyến Học Việt Nam",
    organizationStatus: "ACTIVE",
    phoneNumber: "0835678901",
    shutdownDay: null,
    startTime: "2022-07-30T00:00:00Z",
    walletId: "1p7ru6w3-wu0q-nmq1-t6ln-9wvs8lpp8n85",
    numberOfProjects: 19,
    numberOfMembers: 190,
    totalFunding: 4100000,
  },
];

const OrganizationRankings = () => {
  const organizationsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const [sortBy, setSortBy] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

  const totalPages = Math.ceil(dummy.length / organizationsPerPage);

  const startIndex = (currentPage - 1) * organizationsPerPage;
  const endIndex = startIndex + organizationsPerPage;
  const [organizations, setOrganizations] = useState(dummy);

  useEffect(() => {
    const calculateScores = (orgs) => {
      const members = orgs.map((org) => org.numberOfMembers);
      const projects = orgs.map((org) => org.numberOfProjects);
      const funding = orgs.map((org) => org.totalFunding);

      const minMembers = Math.min(...members);
      const maxMembers = Math.max(...members);

      const minProjects = Math.min(...projects);
      const maxProjects = Math.max(...projects);

      const minFunding = Math.min(...funding);
      const maxFunding = Math.max(...funding);

      return orgs.map((org) => {
        const normalizedMembers =
          (org.numberOfMembers - minMembers) / (maxMembers - minMembers);
        const normalizedProjects =
          (org.numberOfProjects - minProjects) / (maxProjects - minProjects);
        const normalizedFunding =
          (org.totalFunding - minFunding) / (maxFunding - minFunding);

        const score =
          0.2 * normalizedMembers +
          0.3 * normalizedProjects +
          0.5 * normalizedFunding;
        return { ...org, score };
      });
    };

    const rankedOrganizations = calculateScores(organizations)
      .sort((a, b) => b.score - a.score)
      .map((org, index) => ({
        ...org,
        rank: index + 1,
      }));

    setOrganizations(rankedOrganizations);
  }, []);

  const currentOrganizations = organizations
    .sort((a, b) => {
      if (sortBy === "member") {
        return sortOrder === "asc"
          ? a.numberOfMembers - b.numberOfMembers
          : b.numberOfMembers - a.numberOfMembers;
      } else if (sortBy === "project") {
        return sortOrder === "asc"
          ? a.numberOfProjects - b.numberOfProjects
          : b.numberOfProjects - a.numberOfProjects;
      } else if (sortBy === "funding") {
        return sortOrder === "asc"
          ? a.totalFunding - b.totalFunding
          : b.totalFunding - a.totalFunding;
      }
      return 0;
    })
    .slice(startIndex, endIndex)
    .filter((organization) => {
      if (
        searchTerm === "" ||
        organization.organizationName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        organization.email.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return true;
      }
      return false;
    });

  return (
    <div className="flex flex-col gap-2 w-full p-3 mb-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Organization Rankings
        </h1>
        <p className="text-gray-600 mt-2">
          Top organizations ranked by FCharity.
        </p>
      </div>
      <div className="flex justify-between items-center gap-3">
        <div className="flex items-center justify-between ml-3">
          <label htmlFor="searchTerm" className="z-10 -mr-6 inline-block">
            <FaSearch style={{ fontSize: "12px", color: "gray" }} />
          </label>
          <input
            type="text"
            name="searchTerm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="w-[250px] pl-8 p-1 bg-gray-50 border border-gray-300 rounded-md text-gray-600 placeholder-gray-500 focus:outline-none"
            style={{ color: "#303030" }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="sortBy" className="z-10 inline-block w-[70px]">
              Sort By
            </label>
            <select
              className="w-[170px] p-1 bg-gray-50 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none"
              name="sortBy"
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="all">All</option>
              <option value="member">Member</option>
              <option value="project">Project</option>
              <option value="funding">Funding</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sortOrder" className="z-10 inline-block w-[70px]">
              Order
            </label>
            <select
              className="w-[80px] p-1 bg-gray-50 border border-gray-300 rounded-md text-gray-800 placeholder-gray-500 focus:outline-none"
              name="sortOrder"
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">asc</option>
              <option value="desc">desc</option>
            </select>
          </div>
        </div>
      </div>
      <table className="table-auto grow-1">
        <thead>
          <tr className="bg-gray-200 text-gray-600 text-sm font-semibold uppercase">
            <td className="px-8 py-6">RANK</td>
            <td className="px-8 py-6">ORGANIZATION</td>
            <td className="px-8 py-6">MEMBERS (0.2%)</td>
            <td className="px-8 py-6">PROJECTS (0.3%)</td>
            <td className="px-8 py-6">TOTAL FUNDING (0.5%)</td>
          </tr>
        </thead>
        <tbody className="">
          {currentOrganizations.map((organization, index) => (
            <tr
              key={index}
              className=" hover:bg-gray-100 hover:cursor-pointer transition duration-200"
            >
              <td className="center px-8 py-6">
                {organization.rank == 1 && (
                  <GiTrophyCup className="size-8 text-yellow-500" />
                )}
                {organization.rank == 2 && (
                  <GiTrophyCup className="size-8 text-gray-500" />
                )}
                {organization.rank == 3 && (
                  <GiTrophyCup className="size-8 text-orange-300" />
                )}
                {organization.rank > 3 && (
                  <p className="ml-3" style={{ marginBottom: 0, padding: 0 }}>
                    {organization.rank}
                  </p>
                )}
              </td>
              <td className="flex items-center gap-8 px-8 py-6">
                <img
                  src={organization.avatarUrl}
                  alt="avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex flex-col gap-1">
                  <p
                    className="text-gray-800 font-semibold"
                    style={{ margin: 0, padding: 0 }}
                  >
                    {organization.organizationName}
                  </p>
                  <p
                    className="text-gray-500"
                    style={{ margin: 0, padding: 0 }}
                  >
                    {organization.email}
                  </p>
                </div>
              </td>
              <td className="px-8 py-6">{organization.numberOfMembers}</td>
              <td className="px-8 py-6">{organization.numberOfProjects}</td>
              <td className="px-8 py-6">${organization.totalFunding}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-end mt-6">
        <div className="flex justify-center items-center gap-2">
          <button
            className={`px-3 py-1 ${
              currentPage > 1 && "hover:cursor-pointer"
            } ${currentPage == 1 && "hover:cursor-not-allowed"}`}
            onClick={() => {
              if (currentPage > 1) setCurrentPage(currentPage - 1);
            }}
          >
            <FaArrowLeftLong
              className={`${currentPage == 1 && "text-gray-500"}`}
            />
          </button>
          {Array.from({ length: totalPages }, (_, index) => {
            if (
              index + 1 < 3 ||
              index + 1 > totalPages - 2 ||
              (index + 1 >= currentPage - 2 && index + 1 <= currentPage + 2)
            )
              return (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-3 py-1 rounded-xs font-semibold hover:cursor-pointer ${
                    currentPage === index + 1
                      ? "bg-gray-200 border border-gray-400 text-white"
                      : " hover:bg-gray-100"
                  } transition`}
                >
                  {index + 1}
                </button>
              );
            return <div className="font-semibold">.</div>;
          })}
          <button
            className={`px-3 py-1 ${
              currentPage < totalPages && "hover:cursor-pointer"
            } ${currentPage == totalPages && "hover:cursor-not-allowed"}`}
            onClick={() => {
              if (currentPage < totalPages) setCurrentPage(currentPage + 1);
            }}
          >
            <FaArrowRightLong
              className={`${currentPage == totalPages && "text-gray-500"}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationRankings;
