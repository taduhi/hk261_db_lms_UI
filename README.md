# LMS_UI

Giao diện web tĩnh cho hệ thống quản lý học tập (LMS) của bài tập lớn 1, môn Hệ cơ sở dữ liệu (CO2013), Trường Đại học Bách khoa - ĐHQG-HCM. Giao diện dựa trên theme Boost của Moodle và bám theo lược đồ CSDL trong báo cáo của nhóm. Chưa có backend: dữ liệu là dữ liệu mẫu nằm trong `assets/app.js`.

## Chạy thử

Không cần cài đặt hay build. Mở trực tiếp `index.html` (sơ đồ tất cả trang) hoặc chạy một server tĩnh:

```bash
python -m http.server 8080
# mở http://127.0.0.1:8080/index.html
```

Đăng nhập mẫu ở `login.html`: chọn vai trò rồi bấm Đăng nhập, không kiểm tra mật khẩu.

## Cấu trúc

```
index.html, login.html     sơ đồ trang, đăng nhập
admin/      9 trang        quản trị viên
student/   14 trang        sinh viên
lecturer/  13 trang        giảng viên
assets/
  app.js                   dữ liệu mẫu, khung trang, nội dung từng trang
  lms.css                  kiểu dáng riêng (màu, chữ, bảng, form)
  moodle/boost.css         CSS rút gọn từ theme Boost của Moodle
  fonts/                   Be Vietnam Pro (hỗ trợ đủ dấu tiếng Việt)
```

Mỗi file HTML chỉ có thẻ `<body data-role="..." data-page="...">` và nạp `assets/app.js`. `app.js` dựng trang theo khóa `vai trò/trang`.

## Các trang

| Vai trò | Trang |
|---|---|
| Quản trị viên | `dashboard`, `subjects`, `subject-create`, `courses`, `course-create`, `course-edit`, `users`, `user-create`, `user-edit` |
| Sinh viên | `courses`, `course`, `materials`, `announcements`, `quizzes`, `quiz-intro`, `quiz`, `submit`, `submit-success`, `grades`, `forum`, `forum-post`, `forum-post-edit`, `profile` |
| Giảng viên | `courses`, `course`, `members`, `materials`, `material-form`, `assignments`, `assignment-form`, `submissions`, `gradebook`, `grade-detail`, `forum`, `forum-post`, `forum-post-edit` |

## Đối chiếu với lược đồ CSDL

Trường và mã trong giao diện lấy từ lược đồ quan hệ của báo cáo (`NGUOI_DUNG`, `SINH_VIEN`, `GIANG_VIEN`, `SO_DIEN_THOAI`, `KHOA`, `MON_HOC`, `LOP_HOC`, `DUOC_PHAN_VAO`, `HOC_LIEU`, `THONG_BAO`, `FORUM`, `BAI_VIET`, `BAI_TAP`, `QUIZ`, `BAI_NOP`). Quy ước mã theo ràng buộc ngữ nghĩa: MSSV 6 số, mã giảng viên 5 số, mã môn `MT2013`, mã lớp `261A1`, thông báo `261A1TB1`, học liệu `261A1HL1`, forum `261A1FR1`, bài viết `261A1FR1_1`.

Một vài chỗ lược đồ chưa đủ cho giao diện, nhóm cần chốt khi làm backend:

- `BAI_VIET` chưa có cột người đăng, nhưng giao diện hiển thị tác giả.
- Điểm của quan hệ "Thực hiện" (sinh viên - bài tập) chưa có chỗ lưu; cần bảng riêng `THUC_HIEN(MSSV, MaBaiTap, Diem)`.
- `BAI_NOP` chưa biết sinh viên nào nộp; cần thêm `MSSV` vào khóa.
- Chưa có nơi lưu số lần làm quiz của từng sinh viên.
- Báo cáo chưa quy định mã bài tập; giao diện tạm dùng `261A1BT1`.

## Nối backend

- Dữ liệu mẫu nằm ở các hằng đầu `app.js` (`KHOA`, `SUBJECTS`, `CLASSES`, `USERS`, `ITEMS`, `MATERIALS`, `ANNOUNCEMENTS`, `POSTS`, `MEMBERS`, `SUBMISSIONS`). Thay bằng dữ liệu từ API.
- Các trang chọn đối tượng qua tham số địa chỉ, ví dụ `student/submit.html?i=261A1BT3`, `admin/user-edit.html?u=c.le`.
- Form có `data-goto` chuyển trang sau khi bấm lưu; các form và nút khác chỉ hiện thông báo vì chưa lưu dữ liệu. Gắn xử lý gửi dữ liệu ở sự kiện `submit` và `click` ở cuối `app.js`.

## Giấy phép và nguồn

- `assets/moodle/boost.css` được rút gọn từ theme Boost của [Moodle](https://github.com/moodle/moodle) (GPL-3.0-or-later, xem `assets/moodle/COPYING.txt`) và Bootstrap 5.3 (MIT). Vì vậy kho này nên được phát hành theo giấy phép tương thích GPL.
- Font [Be Vietnam Pro](https://fonts.google.com/specimen/Be+Vietnam+Pro) theo SIL Open Font License 1.1.
- Nhật ký các lần chỉnh sửa nằm ở `WORKLOG.md`.
