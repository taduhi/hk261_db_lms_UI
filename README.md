# LMS_UI

Giao diện web cho hệ thống quản lý học tập (LMS) môn Hệ cơ sở dữ liệu (CO2013), Trường Đại học Bách khoa - ĐHQG-HCM. Giao diện dựa trên theme Boost của Moodle 4, phân quyền đầy đủ theo 3 vai trò (**Quản trị viên**, **Giảng viên**, **Sinh viên**) và hỗ trợ tương tác giả lập lưu tạm trên `localStorage`.

## Chạy thử ở local

Không cần cài đặt hay build. Chạy một server tĩnh trong thư mục này:

```bash
python -m http.server 8080
# mở http://127.0.0.1:8080/
```

- Mở `/` (`index.html`) sẽ vào thẳng màn hình **Đăng nhập** (hoặc tự chuyển về trang chủ vai trò nếu đang có phiên đăng nhập).
- Sơ đồ trang dành cho nhà phát triển được chuyển sang `sitemap.html`.
- Có nút **Khôi phục dữ liệu mẫu** ở menu tài khoản và chân trang để reset toàn bộ thay đổi trên `localStorage`.

## Tài khoản đăng nhập mẫu

Hệ thống tự nhận diện vai trò từ tên tài khoản / mã cán bộ:

| Vai trò | Tài khoản / Mã cán bộ | Mật khẩu | Họ tên | Trạng thái & Phạm vi |
|---|---|---|---|---|
| Quản trị viên | `00001` | `Admin@123` | Quản trị viên 00001 | Active — Quản trị toàn hệ thống |
| Quản trị viên | `00002` | `Admin@123` | Quản trị viên 00002 | Active — Quản trị toàn hệ thống |
| Giảng viên | `a.nguyen` | `Lecturer@123` | Nguyễn Văn A (`00001`) | Active — Phụ trách `261A1`, `261A3` |
| Giảng viên | `b.tran` | `Lecturer@123` | Trần Thị B (`00002`) | Active — Phụ trách `261A2`, `251A1` |
| Sinh viên | `c.le` | `Student@123` | Lê Văn C (`240001`) | Active — Học `261A1`, `261A2`, `261A3` |
| Sinh viên | `d.pham` | `Student@123` | Phạm Thị D (`240002`) | Active — Học `261A1`, `261A2`, `251A1` |
| Sinh viên | `f.do` | `Student@123` | Đỗ Thị F (`240004`) | Active — Học `261A1`, `261A2`, `261A3` |
| Sinh viên | `e.vo` | `Student@123` | Võ Văn E (`240003`) | **Inactive** — Dùng test chặn đăng nhập (có thể vào Admin mở khóa) |

## Cấu trúc

```
index.html, login.html     cổng đăng nhập (vào thẳng login / chuyển trang chủ theo role)
sitemap.html               sơ đồ toàn bộ trang cho nhà phát triển
admin/      9 trang        quản trị viên
student/   14 trang        sinh viên
lecturer/  13 trang        giảng viên
assets/
  app.js                   dữ liệu mẫu, store localStorage, xác thực/phân quyền, nội dung từng trang
  lms.css                  hệ thống giao diện BK-LMS đặt trên theme Boost
  cha-do.jpg               ảnh logo hệ thống và avatar người dùng các vai trò
  moodle/boost.css         CSS rút gọn từ theme Boost của Moodle
  fonts/                   Be Vietnam Pro (hỗ trợ đủ dấu tiếng Việt)
```

Mỗi file HTML chỉ chứa thẻ `<body data-role="..." data-page="..." data-root="...">` và nạp `assets/app.js`.

## Tính năng theo vai trò & Phân quyền

- **Phân quyền (Route Guard)**: Chưa đăng nhập tự chuyển về `login.html`; truy cập sai vai trò hiển thị thông báo *Không có quyền truy cập*; truy cập lớp học không thuộc phạm vi của tài khoản sẽ bị chặn.
- **Quản trị viên**: Dashboard thống kê động + nhật ký hoạt động, thêm khoa, tạo/sửa/xóa môn học, tạo lớp 2 bước / sửa / xóa lớp, tạo/sửa/khóa–mở khóa/xóa người dùng, tìm kiếm & lọc trực tiếp.
- **Giảng viên**: Xem đúng các lớp phụ trách (`?c=<MaLop>`), quản lý học liệu & thông báo, tạo/sửa/xóa bài tập & quiz, chọn bài để chấm điểm (đồng bộ tức thì sang bảng điểm & điểm sinh viên), xem thành viên & chi tiết điểm từng sinh viên, tạo forum mới và quản lý bài viết.
- **Sinh viên**: Xem đúng các lớp đang theo học kèm điểm trung bình động, xem thông báo & học liệu, làm bài quiz (đếm ngược tự nộp, kiểm tra số lần làm tối đa, tính điểm theo lần cao nhất/trung bình), nộp/nộp lại bài tập (tự xác định Đã nộp / Nộp trễ), xem bảng điểm, đăng/phản hồi/sửa bài diễn đàn của mình, cập nhật hồ sơ & đổi mật khẩu.

## Giấy phép và nguồn

- `assets/moodle/boost.css` được rút gọn từ theme Boost của [Moodle](https://github.com/moodle/moodle) (GPL-3.0-or-later, xem `assets/moodle/COPYING.txt`) và Bootstrap 5.3 (MIT).
- Font [Be Vietnam Pro](https://fonts.google.com/specimen/Be+Vietnam+Pro) theo SIL Open Font License 1.1.
- Nhật ký các lần chỉnh sửa nằm ở `WORKLOG.md`.
