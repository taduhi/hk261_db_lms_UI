# WORKLOG - LMS_UI (mẫu giao diện, chưa kết nối backend)

## Lần 1 (2026-11-22) - dựng khung
- Clone Moodle về `BTL/moodle`; lấy màu và bố cục từ theme Boost (`#0f6cbf`, sidebar + nội dung).
- Tạo `LMS_UI/` gồm `assets/style.css`, `assets/app.js` (dữ liệu mẫu + các trang) và các file HTML mỏng gọi `app.js`.

## Lần 2 (2026-11-22) - đối chiếu với lược đồ CSDL trong PDF (EERD trang 14, lược đồ quan hệ trang 15)
Chỉ thay phần dữ liệu mẫu, điều hướng và nội dung các trang trong `app.js`; phần khung (helper, mount, sự kiện) giữ nguyên.

Sửa cho khớp lược đồ:
- Bỏ các trường không có trong CSDL: trạng thái lớp, sĩ số tối đa, thời gian học, ngày bắt đầu/kết thúc, mô tả lớp, địa chỉ, ngày đăng và dung lượng của học liệu/thông báo, lịch sử từng lần làm quiz, câu hỏi trắc nghiệm có cấu trúc (quiz chỉ có một trường nội dung), số lần nộp tối đa, định dạng file.
- Mã theo ràng buộc 1.3: MSSV 6 số, mã giảng viên / mã cán bộ 5 số, mã môn `MT2013`, mã lớp = học kỳ + tên lớp (`261A1`), `261A1TB1`, `261A1HL1`, `261A1FR1`, `261A1FR1_1`.
- Người dùng: tên tài khoản sinh từ email, số điện thoại đa trị, trạng thái Active/Inactive, mật khẩu ASCII 33–126. Quản trị viên là thực thể riêng (mã cán bộ + mật khẩu), nên không tạo qua form người dùng.
- Môn học tách khỏi lớp học: thêm `admin/subjects`, `admin/subject-create` (môn thuộc một khoa, do ít nhất một quản trị viên quản lý). Tạo lớp học: bước 1 chọn môn + học kỳ + tên lớp, bước 2 chọn giảng viên và sinh viên được phân vào lớp.
- Sinh viên thấy điểm trung bình theo từng lớp (thuộc tính dẫn xuất của "được phân vào").
- Quiz: thời lượng (hoặc không giới hạn), số lần làm tối đa, cách tính điểm (lần cao nhất / trung bình), nội dung quiz. Bài nộp: thời gian đăng, deadline, trạng thái Chưa nộp / Đã nộp / Nộp trễ.
- Giảng viên thêm: `materials` (danh sách + sửa/xóa), `assignments`, `gradebook`, `forum` (tạo forum), `forum-post`.
- Điểm theo thang 10, hiển thị 2 chữ số thập phân.

Kiểm tra: `node --check` đạt; render thử 32/32 trang không có `undefined`/`NaN`; 296 liên kết nội bộ đều tồn tại. Chưa xem trên trình duyệt.

## Điểm lệch trong lược đồ PDF (cần nhóm quyết định, UI đang chiều theo nhu cầu sử dụng)
1. `BAI_VIET` không có cột người đăng, nhưng UI hiển thị "Tác giả". Cần thêm khóa ngoại tới `NGUOI_DUNG`.
2. Quan hệ "Thực hiện" (sinh viên - bài tập) có thuộc tính Điểm, nhưng lược đồ chỉ để `MSSV_1` trong `BAI_TAP` và mất cột Điểm. Cần bảng riêng `THUC_HIEN(MSSV, MaBaiTap, Diem)`.
3. `BAI_NOP` chỉ khóa theo `MaBaiTap`, không biết sinh viên nào nộp. Cần thêm `MSSV` vào khóa.
4. Quiz không có bảng lần làm bài, nên số lần đã làm của sinh viên không lưu được (ràng buộc 20).
5. Báo cáo không quy định mã bài tập; UI tạm dùng `261A1BT1`.
6. `FORUM` không có tên/tiêu đề; UI chỉ hiển thị mã forum.
7. Giả định: sinh viên được sửa Họ và tên, số điện thoại, mật khẩu; tên tài khoản, email, MSSV chỉ đọc.

## Lần 3 (2026-11-22) - dùng giao diện thật của Moodle (chỉ bản web)
- Dựng Moodle thật bằng Docker (`BTL/moodle_docker/docker-compose.yml`, cổng 8081, PostgreSQL 17) để lấy giao diện gốc. Tài khoản quản trị chỉ dùng cục bộ; có thể tắt bằng `docker compose down` trong thư mục đó.
- Lấy CSS đã biên dịch của theme Boost từ Moodle đang chạy: `assets/moodle/boost.css` + font Font Awesome và Noto Sans. Đã bỏ font tiếng Nhật/Cyrillic, VideoJS và các rule liên quan ứng dụng di động.
- `app.js` (phần helper và khung) sinh đúng markup Moodle: navbar + user menu, `#page-header` + breadcrumb, thanh tab `secondary-navigation`, card, `generaltable`, form `mform`/`fitem`, badge Bootstrap. Dữ liệu và nội dung các trang giữ nguyên.
- `assets/lms.css` chỉ chứa phần bổ sung nhỏ (lưới, thanh tab, toast). Đã xóa `style.css` cũ.
- Bỏ hẳn phần ứng dụng di động: không có liên kết tải app, mã QR hay giao diện riêng cho app.
- Không lấy: khóa học, hoạt động, khối, lịch, tin nhắn, thông báo đẩy, drawer chỉ mục khóa học và mọi trang quản trị Moodle không có trong lược đồ của nhóm.
- Kiểm tra: render 32/32 trang, 373 liên kết nội bộ hợp lệ, chụp ảnh bằng Chrome để đối chiếu bố cục.

## Lần 4 (2026-11-22) - tinh chỉnh thiết kế theo skill frontend-design
- Màu: navbar navy `#0b3a6f`, xanh `#0b5cab` chỉ cho nút chính và tab đang chọn, nền xám lạnh `#f3f5f8`. Không dùng nền kem, gradient hay bóng đổ.
- Chữ: Be Vietnam Pro (đủ dấu tiếng Việt, lưu cục bộ trong `assets/fonts/`). Mã định danh dùng số cùng độ rộng thay cho chữ đơn cách.
- Bỏ các kiểu trình bày mang dấu hiệu "do AI sinh": thẻ bo tròn giống nhau (đổi thành khối phẳng ngăn bằng đường kẻ), số lớn kèm nhãn nhỏ ở trang tổng quan (đổi thành dòng nhãn và giá trị), chuỗi thông tin nối bằng dấu chấm giữa (đổi thành cặp nhãn và giá trị), nút trong bảng (đổi thành liên kết chữ), nhãn trạng thái màu bão hòa (đổi thành nền nhạt).
- Danh sách lớp của sinh viên và giảng viên đổi từ thẻ sang bảng; cột điểm canh phải.
- Bỏ câu phụ đề mang tính giải thích thừa; footer chỉ còn tên hệ thống và trường.
- Một độ bo góc 4px, hiển thị focus bàn phím, tôn trọng giảm chuyển động.

## Lần 5 (2026-11-22) - đối chiếu bảng 32 công việc của nhóm
Thiếu 7 mục nên đã bổ sung (thêm 6 trang mới, tổng 38 trang): chi tiết quiz có nút "Bắt đầu làm bài" (#6), trang chưa nộp và trang nộp thành công (#8, #10), sửa bài đăng diễn đàn (#15), sửa bài tập/quiz (#22), sửa lớp (#29), sửa người dùng (#31), lối vào chọn Lớp hoặc Người dùng ở trang tổng quan quản trị (#26).
Kiểm tra: render 38/38 trang, 451 liên kết nội bộ hợp lệ.

## Lần 6 (2026-11-27) - phiên bản theo vai trò, nâng cấp chuẩn BK-LMS thật và lưu trữ giả lập localStorage
- Tách view sơ đồ nhà phát triển sang `sitemap.html`; `index.html` mở thẳng trang Đăng nhập (hoặc tự chuyển về trang chủ vai trò đang đăng nhập).
- Xác thực tự nhận diện vai trò (Admin / Giảng viên / Sinh viên) kèm bảng tài khoản mẫu 1-click (`00001`, `00002`, `a.nguyen`, `b.tran`, `c.le`, `d.pham`, `f.do`, và `e.vo` ở trạng thái `Inactive` để test khóa tài khoản).
- Phân quyền chặt (Route Guard) chặn chưa đăng nhập, chặn truy cập chéo vai trò và chặn truy cập lớp không thuộc tài khoản.
- Toàn bộ CRUD, lọc, sắp xếp, chấm điểm, nộp bài/loại bỏ bài nộp, làm quiz đếm ngược, diễn đàn và đổi mật khẩu hồ sơ đều hoạt động thật qua `localStorage` kèm nút Khôi phục dữ liệu mẫu.
- Nâng cấp giao diện & workflow bám sát BK-LMS (`lms.hcmut.edu.vn`): navbar xanh ngọc `#0388b4` + tab cobalt `#034ea2`, chuông thông báo động, ngăn Mục lục khóa học (Course Index Drawer), breadcrumb mũi tên xanh, tab khối bo góc, lưới 3 cột Course Card + chuyển đổi Thẻ/Bảng + sắp xếp, section thu gọn/mở rộng trong khóa học, hộp `Opened/Due` và bảng Trạng thái bài nộp pastel, báo cáo điểm kèm `Khoảng / Phần trăm / Σ Tổng khóa học`, hồ sơ multi-card.
- Thay toàn bộ logo và avatar của cả 3 vai trò bằng ảnh `assets/cha-do.jpg` (từ `chá dò.jpg`).
- Xóa thư mục rỗng thừa `hk261_db_lms_UI/hk261_db_lms_UI/`.
- Kiểm tra: `node --check` đạt; render 39/39 trang, 929+ liên kết và kiểm tra toàn bộ ảnh nội bộ hợp lệ, 5/5 bài test phân quyền đạt (`0` lỗi).
