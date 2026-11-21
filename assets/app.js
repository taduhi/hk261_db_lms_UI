/* LMS_UI - giao diện mẫu tĩnh. Dữ liệu là mock trong file này; chưa kết nối backend. */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const CTX = { role: '', root: '' };

  /* ---------- Dữ liệu mẫu (bám theo lược đồ quan hệ trong báo cáo) ---------- */
  // KHOA(MaKhoa, TenKhoa)
  const KHOA = [
    { code: 'MT', name: 'Khoa Khoa học và Kỹ thuật Máy tính' },
    { code: 'UD', name: 'Khoa Khoa học Ứng dụng' },
  ];
  // MON_HOC(MaMon, TenMon, MaKhoa) + QUAN_LY_MON(MaCanBo, MaMon)
  const SUBJECTS = [
    { code: 'MT2013', name: 'Cơ sở dữ liệu', khoa: 'MT', admins: ['00001'] },
    { code: 'MT2003', name: 'Cấu trúc dữ liệu và giải thuật', khoa: 'MT', admins: ['00001', '00002'] },
    { code: 'MT2039', name: 'Lập trình Web', khoa: 'MT', admins: ['00001'] },
    { code: 'UD1001', name: 'Giải tích 1', khoa: 'UD', admins: ['00002'] },
  ];
  // LOP_HOC(MaLop, MaMon, TenLop, HocKy, MaGiangVien); MaLop = HocKy + TenLop
  const CLASSES = [
    { code: '261A1', name: 'A1', subject: 'MT2013', term: '261', teacher: 'Nguyễn Văn A', teacherCode: '00001', students: 48 },
    { code: '261A2', name: 'A2', subject: 'MT2003', term: '261', teacher: 'Trần Thị B', teacherCode: '00002', students: 52 },
    { code: '261A3', name: 'A3', subject: 'MT2039', term: '261', teacher: 'Nguyễn Văn A', teacherCode: '00001', students: 40 },
    { code: '251A1', name: 'A1', subject: 'UD1001', term: '251', teacher: 'Trần Thị B', teacherCode: '00002', students: 45 },
  ];
  // NGUOI_DUNG(TenTaiKhoan, HoVaTen, Email, TrangThai, MatKhau) + SO_DIEN_THOAI (đa trị) + SINH_VIEN(MSSV) / GIANG_VIEN(MaGiangVien)
  const USERS = [
    { account: 'a.nguyen', name: 'Nguyễn Văn A', role: 'Giảng viên', code: '00001', phones: ['0900000001'], status: 'Active' },
    { account: 'b.tran', name: 'Trần Thị B', role: 'Giảng viên', code: '00002', phones: ['0900000002'], status: 'Active' },
    { account: 'c.le', name: 'Lê Văn C', role: 'Sinh viên', code: '240001', phones: ['0900000011', '0900000012'], status: 'Active' },
    { account: 'd.pham', name: 'Phạm Thị D', role: 'Sinh viên', code: '240002', phones: ['0900000013'], status: 'Active' },
    { account: 'e.vo', name: 'Võ Văn E', role: 'Sinh viên', code: '240003', phones: ['0900000014'], status: 'Inactive' },
  ];
  // DUOC_PHAN_VAO(MSSV, MaLop) + DiemTrungBinh (thuộc tính dẫn xuất) của sinh viên đang đăng nhập
  const MY_CLASSES = [
    { code: '261A1', avg: 8.75 },
    { code: '261A2', avg: 7.5 },
    { code: '261A3', avg: null },
  ];
  // BAI_TAP(MaBaiTap, MaLop, Ten, MoTa, ThoiGianDang, Deadline) chuyên biệt hóa thành QUIZ / BAI_NOP; score = Điểm của quan hệ "Thực hiện"
  const ITEMS = [
    { code: '261A1BT1', kind: 'Quiz', name: 'Quiz 1 - Mô hình ER', desc: 'Kiểm tra chương 2', posted: '2026-10-01 08:00', deadline: '2026-10-07 23:59',
      duration: 20, maxAttempts: 2, scoring: 'Lần cao nhất',
      content: 'Câu 1. Thực thể yếu (weak entity) được xác định bằng gì?\nCâu 2. Nêu ý nghĩa của ràng buộc khóa ngoại.\nCâu 3. Phát biểu điều kiện của dạng chuẩn BCNF.',
      score: 8.5 },
    { code: '261A1BT2', kind: 'Bài nộp', name: 'Bài tập 1 - Thiết kế EERD', desc: 'Thiết kế EERD cho hệ thống LMS.', posted: '2026-11-10 08:00', deadline: '2026-11-30 23:59',
      submission: { status: 'Đã nộp', time: '2026-11-28 20:15', content: 'bt1_240001.pdf' }, score: 9.0 },
    { code: '261A1BT3', kind: 'Bài nộp', name: 'Bài tập 2 - Chuyển đổi sang lược đồ quan hệ', desc: 'Ánh xạ EERD sang lược đồ quan hệ.', posted: '2026-11-20 08:00', deadline: '2026-12-10 23:59',
      submission: { status: 'Chưa nộp', time: null, content: null }, score: null },
    { code: '261A1BT4', kind: 'Quiz', name: 'Quiz 2 - Đại số quan hệ', desc: 'Kiểm tra chương 4', posted: '2026-11-20 08:00', deadline: '2026-12-05 23:59',
      duration: 15, maxAttempts: 1, scoring: 'Trung bình',
      content: 'Câu 1. Viết biểu thức đại số quan hệ cho phép chọn.\nCâu 2. Phân biệt phép hợp và phép giao.',
      score: null },
  ];
  // HOC_LIEU(MaHocLieu, MaLop, Ten, NoiDungHocLieu) - MaHocLieu = MaLop + HL + số thứ tự
  const MATERIALS = [
    { code: '261A1HL1', name: 'Đề cương môn học', content: 'File de-cuong.pdf' },
    { code: '261A1HL2', name: 'Slide Chương 1 - Tổng quan CSDL', content: 'File chuong1.pdf' },
    { code: '261A1HL3', name: 'Slide Chương 2 - Mô hình ER', content: 'File chuong2.pdf' },
  ];
  // THONG_BAO(MaThongBao, MaLop, TieuDe, NoiDungThongBao) - MaThongBao = MaLop + TB + số thứ tự
  const ANNOUNCEMENTS = [
    { code: '261A1TB1', title: 'Lịch thi giữa kỳ', content: 'Lịch thi giữa kỳ đã được cập nhật. Vui lòng kiểm tra phòng thi.' },
    { code: '261A1TB2', title: 'Thay đổi phòng học tuần 12', content: 'Buổi học tuần 12 chuyển sang phòng B4-205.' },
  ];
  // FORUM(MaForum, MaLop) - MaForum = MaLop + FR + số thứ tự
  const FORUMS = ['261A1FR1'];
  // BAI_VIET(MaBaiViet, MaForum, TieuDe, NoiDung, ThoiGianDang) + PHAN_HOI_BAI_VIET(MaBaiViet_Goc, MaBaiViet_PhanHoi)
  // Lưu ý: lược đồ chưa có cột người đăng; "author" chỉ để hiển thị mẫu.
  const POSTS = [
    { code: '261A1FR1_1', forum: '261A1FR1', title: 'Thảo luận: chuẩn hóa BCNF', content: 'Có ai đã thử tách BCNF cho bài tập 2 không? Mình bị mất phụ thuộc hàm.', time: '2026-11-19 21:40', author: 'Võ Văn E', parent: null },
    { code: '261A1FR1_2', forum: '261A1FR1', title: 'Hỏi về khóa ngoại trong EERD', content: 'Khi chuyển quan hệ 1-n sang lược đồ, khóa ngoại nên đặt ở phía nào?', time: '2026-11-20 10:12', author: 'Lê Văn C', parent: null },
    { code: '261A1FR1_3', forum: '261A1FR1', title: 'Re: Hỏi về khóa ngoại trong EERD', content: 'Khóa ngoại đặt ở phía bên nhiều (n) để tránh lặp dữ liệu.', time: '2026-11-20 15:00', author: 'Nguyễn Văn A', parent: '261A1FR1_2' },
    { code: '261A1FR1_4', forum: '261A1FR1', title: 'Re: Hỏi về khóa ngoại trong EERD', content: 'Mình cũng nghĩ vậy, cảm ơn thầy.', time: '2026-11-20 16:30', author: 'Phạm Thị D', parent: '261A1FR1_2' },
  ];
  // Sinh viên trong lớp 261A1 và điểm theo thứ tự ITEMS (BT1..BT4)
  const MEMBERS = [
    { mssv: '240001', name: 'Lê Văn C', scores: [8.5, 9.0, null, null] },
    { mssv: '240002', name: 'Phạm Thị D', scores: [7.0, null, null, null] },
    { mssv: '240003', name: 'Võ Văn E', scores: [null, null, null, null] },
    { mssv: '240004', name: 'Đỗ Thị F', scores: [9.0, 8.0, null, null] },
  ];
  // BAI_NOP của bài tập 261A1BT2
  const SUBMISSIONS = [
    { mssv: '240001', name: 'Lê Văn C', status: 'Đã nộp', time: '2026-11-28 20:15', content: 'bt1_240001.pdf', grade: 9.0 },
    { mssv: '240002', name: 'Phạm Thị D', status: 'Nộp trễ', time: '2026-12-01 09:00', content: 'bt1_240002.pdf', grade: null },
    { mssv: '240003', name: 'Võ Văn E', status: 'Chưa nộp', time: null, content: null, grade: null },
  ];
  const ACTIVITY = [
    ['2026-11-21 09:10', '00001', 'Tạo lớp học', '261A1'],
    ['2026-11-20 14:02', '00001', 'Khóa tài khoản (Inactive)', 'e.vo'],
    ['2026-11-18 10:45', '00001', 'Tạo người dùng', 'b.tran'],
  ];

  /* ---------- Helper (xuất đúng markup/class của theme Boost) ---------- */
  const state = { headUsed: false, back: '', key: '', nav: '' };
  const qp = (k, d) => new URLSearchParams(location.search).get(k) || d;
  const cur = () => CLASSES[0];
  const subjectOf = (c) => SUBJECTS.find((s) => s.code === c);
  const khoaOf = (c) => KHOA.find((k) => k.code === c);
  const fmt = (v) => (v == null ? '—' : Number(v).toFixed(2));
  const itemStatus = (i) => (i.kind === 'Quiz' ? (i.score != null ? 'Đã làm' : 'Chưa làm') : i.submission.status);
  const avgOf = (arr) => {
    const v = arr.filter((x) => x != null);
    return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(2) : '—';
  };
  const btnCls = (cls) => {
    const t = String(cls).split(/\s+/).filter(Boolean);
    const sz = t.includes('sm') ? ' btn-sm' : '';
    if (t.includes('primary')) return 'btn btn-primary' + sz;
    if (t.includes('sm')) return 'btn btn-link btn-sm px-1' + (t.includes('danger') ? ' text-danger' : '');
    if (t.includes('danger')) return 'btn btn-outline-danger';
    return 'btn btn-secondary';
  };
  const badge = (t, k = 'bg-secondary') => `<span class="badge ${k}">${esc(t)}</span>`;
  const sbadge = (s) => {
    const ok = ['Active', 'Đang mở', 'Đã nộp', 'Đã làm'];
    const warn = ['Inactive', 'Chưa nộp', 'Chưa làm'];
    return badge(s, ok.includes(s) ? 'bg-success' : warn.includes(s) ? 'bg-warning text-dark' : s === 'Nộp trễ' ? 'bg-danger' : 'bg-secondary');
  };
  const breadcrumb = (title) => {
    const role = CTX.role;
    if (!role) return '';
    const home = role === 'admin' ? 'dashboard.html' : 'courses.html';
    const items = [[ROLES[role].label, home]];
    const inCourse = COURSE_TABS[role] && state.nav === 'courses' && state.key !== 'courses';
    const c = cur();
    const courseTitle = `${c.subject} - ${subjectOf(c.subject).name}`;
    if (inCourse && title !== courseTitle) items.push([subjectOf(c.subject).name, 'course.html']);
    const lis = items.map(([t, h]) => `<li class="breadcrumb-item"><a href="${h}">${esc(t)}</a></li>`).join('');
    return `<nav aria-label="Đường dẫn"><ol class="breadcrumb">${lis}<li class="breadcrumb-item active" aria-current="page">${title}</li></ol></nav>`;
  };
  // Tiêu đề đầu tiên của trang = #page-header của Moodle; các tiêu đề sau = tiêu đề nhỏ trong vùng nội dung.
  const head = (title, sub = '', actions = '') => {
    if (state.headUsed) {
      return `<div class="d-flex flex-wrap align-items-center mb-2"><h2 class="h3 me-auto mb-0">${title}</h2>${actions ? `<div class="d-flex gap-2 flex-wrap">${actions}</div>` : ''}</div>${sub ? `<div class="text-muted mb-3">${sub}</div>` : ''}`;
    }
    state.headUsed = true;
    const back = state.back;
    state.back = '';
    return `<header id="page-header" class="header-maxwidth d-print-none"><div class="w-100">
      <div class="d-flex flex-wrap"><div id="page-navbar">${breadcrumb(title)}</div></div>
      <div class="d-flex align-items-center"><div class="me-auto d-flex flex-column">
        <div class="page-context-header d-flex flex-wrap align-items-center mb-2"><div class="page-header-headings"><h1 class="h2 mb-0">${title}</h1></div></div>
        ${sub ? `<div class="text-muted">${sub}</div>` : ''}${back}
      </div><div class="header-actions-container ms-auto d-flex gap-2 flex-wrap">${actions}</div></div></div></header><!--hdr-end-->`;
  };
  const card = (html, extra = '') => `<div class="card mb-3 ${extra}"><div class="card-body">${html}</div></div>`;
  // Cột điểm/số lượng canh phải; mã định danh (MSSV, số điện thoại) giữ canh trái
  const isScoreCol = (heads, rows, i) => {
    const txt = (c) => String(c).replace(/<[^>]*>/g, '').trim();
    if (/^(Điểm|Sĩ số|Số sinh viên|Số lần|Phản hồi)/.test(txt(heads[i]))) return true;
    const cells = rows.map((r) => txt(r[i]));
    return cells.length > 0 && cells.every((c) => /^\d+\.\d{2}$|^—$/.test(c)) && cells.some((c) => c !== '—');
  };
  const table = (heads, rows) => {
    const num = heads.map((_, i) => isScoreCol(heads, rows, i));
    return `<div class="table-responsive"><table class="generaltable table table-hover"><thead><tr>${heads
      .map((h, i) => `<th class="header${num[i] ? ' text-end' : ''}" scope="col">${h}</th>`)
      .join('')}</tr></thead><tbody>${rows
      .map((r) => `<tr>${r.map((c, i) => `<td class="cell${num[i] ? ' text-end' : ''}${String(c).replace(/<[^>]*>/g, '').length <= 14 ? ' nowrap' : ''}">${c}</td>`).join('')}</tr>`)
      .join('')}</tbody></table></div>`;
  };
  const meta = (pairs) => `<dl class="meta">${pairs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
  const btn = (label, cls = '', href = '') =>
    href ? `<a class="${btnCls(cls)}" href="${href}">${label}</a>` : `<button class="${btnCls(cls)}" type="button">${label}</button>`;
  const act = (label, msg, cls = 'sm') => `<button class="${btnCls(cls)}" type="button" data-alert="${esc(msg)}">${label}</button>`;
  const stat = (label, value) => `<div class="kv"><span>${label}</span><strong>${value}</strong></div>`;
  const list = (items) => `<ul class="list-group list-group-flush">${items.map((i) => `<li class="list-group-item px-0">${i}</li>`).join('')}</ul>`;
  const field = (label, control, hint = '') =>
    `<div class="mb-3 row fitem"><div class="col-md-3 col-form-label d-flex pb-0 pe-md-0"><label class="d-inline word-break">${label}</label></div><div class="col-md-9 felement">${control}${hint ? `<div class="form-text">${hint}</div>` : ''}</div></div>`;
  const backLink = (href, label) => `<div class="mt-2"><a href="${href}">Quay lại: ${label}</a></div>`;
  const crumb = (href, label) => {
    if (!state.headUsed) {
      state.back = backLink(href, label);
      return '';
    }
    return backLink(href, label);
  };
  const courseHead = () => {
    const c = cur();
    const s = subjectOf(c.subject);
    return head(`${s.code} - ${s.name}`, meta([['Mã lớp', c.code], ['Tên lớp', c.name], ['Học kỳ', c.term], ['Giảng viên', esc(c.teacher)]]));
  };
  const tabs = (active) =>
    `<div class="secondary-navigation d-print-none"><div class="secondarynav-tabbar navigation"><nav class="moremenu navigation"><ul class="nav more-nav nav-tabs">${COURSE_TABS[CTX.role]
      .map(([l, f, k]) => `<li class="nav-item"><a class="nav-link${k === active ? ' active' : ''}" href="${f}">${l}</a></li>`)
      .join('')}</ul></nav></div></div><!--nav-end-->`;

  /* ---------- Khung điều hướng ---------- */
  const ROLES = {
    admin: {
      label: 'Quản trị viên', name: 'Quản trị viên 00001',
      nav: [
        ['Tổng quan', 'dashboard.html', 'dashboard'],
        ['Môn học & khoa', 'subjects.html', 'subjects'],
        ['Lớp học', 'courses.html', 'courses'],
        ['Tạo lớp học', 'course-create.html', 'course-create'],
        ['Người dùng', 'users.html', 'users'],
        ['Tạo người dùng', 'user-create.html', 'user-create'],
      ],
    },
    student: {
      label: 'Sinh viên', name: 'Lê Văn C',
      nav: [
        ['Lớp học của tôi', 'courses.html', 'courses'],
        ['Hồ sơ cá nhân', 'profile.html', 'profile'],
      ],
    },
    lecturer: {
      label: 'Giảng viên', name: 'Nguyễn Văn A',
      nav: [['Lớp đang dạy', 'courses.html', 'courses']],
    },
  };

  const COURSE_TABS = {
    student: [
      ['Tổng quan', 'course.html', 'course'],
      ['Học liệu', 'materials.html', 'materials'],
      ['Thông báo', 'announcements.html', 'announcements'],
      ['Bài tập & Quiz', 'quizzes.html', 'quizzes'],
      ['Điểm', 'grades.html', 'grades'],
      ['Diễn đàn', 'forum.html', 'forum'],
    ],
    lecturer: [
      ['Tổng quan', 'course.html', 'course'],
      ['Thành viên', 'members.html', 'members'],
      ['Học liệu & thông báo', 'materials.html', 'materials'],
      ['Bài tập & Quiz', 'assignments.html', 'assignments'],
      ['Chấm điểm', 'submissions.html', 'submissions'],
      ['Bảng điểm', 'gradebook.html', 'gradebook'],
      ['Diễn đàn', 'forum.html', 'forum'],
    ],
  };

  const LOGIN_TARGETS = {
    admin: 'admin/dashboard.html',
    lecturer: 'lecturer/courses.html',
    student: 'student/courses.html',
  };

  const SITEMAP = [
    ['Quản trị viên', 'admin', [
      ['dashboard', 'Tổng quan'], ['subjects', 'Môn học & khoa'], ['subject-create', 'Tạo môn học'],
      ['courses', 'Danh sách lớp học'], ['course-create', 'Tạo lớp học (2 bước)'],
      ['users', 'Quản lý người dùng'], ['user-create', 'Tạo người dùng'],
      ['course-edit', 'Sửa lớp học'], ['user-edit', 'Sửa người dùng'],
    ]],
    ['Sinh viên', 'student', [
      ['courses', 'Lớp học của tôi'], ['course', 'Trang lớp học'], ['materials', 'Học liệu'],
      ['announcements', 'Thông báo'], ['quizzes', 'Bài tập & Quiz'], ['quiz-intro', 'Chi tiết quiz'], ['quiz', 'Làm bài quiz'],
      ['submit', 'Nộp bài tập'], ['submit-success', 'Nộp bài thành công'], ['forum-post-edit', 'Sửa bài đăng'], ['grades', 'Điểm số'], ['forum', 'Diễn đàn'],
      ['forum-post', 'Chi tiết bài viết'], ['profile', 'Hồ sơ cá nhân'],
    ]],
    ['Giảng viên', 'lecturer', [
      ['courses', 'Lớp đang dạy'], ['course', 'Trang lớp học'], ['members', 'Thành viên lớp'],
      ['materials', 'Học liệu & thông báo'], ['material-form', 'Tạo / sửa học liệu & thông báo'],
      ['assignments', 'Bài tập & Quiz'], ['assignment-form', 'Tạo bài tập / quiz'],
      ['submissions', 'Chấm điểm bài nộp'], ['gradebook', 'Bảng điểm lớp'], ['grade-detail', 'Chi tiết điểm sinh viên'],
      ['forum', 'Diễn đàn (tạo forum)'], ['forum-post', 'Chi tiết bài viết'], ['forum-post-edit', 'Sửa bài đăng'],
    ]],
  ];

  /* ---------- Thành phần dùng chung giữa các vai trò ---------- */
  const code = (c) => `<span class="code">${esc(c)}</span>`;

  function forumPage() {
    const lect = CTX.role === 'lecturer';
    const roots = POSTS.filter((p) => !p.parent);
    return courseHead() + tabs('forum') +
      head('Diễn đàn', meta([['Forum', code(FORUMS[0])], ['Bài viết', roots.length]]),
        (lect ? act('Tạo forum mới', 'Mẫu: sẽ tạo forum 261A1FR2 (chỉ giảng viên được tạo forum)', 'primary') : '') +
        '<button class="btn primary" type="button" data-show="#new-thread">Đăng bài mới</button>') +
      `<section class="card hidden" id="new-thread"><h2>Đăng bài mới</h2><form>
        ${field('Tiêu đề', '<input>')}
        ${field('Nội dung', '<textarea></textarea>', 'Văn bản, file hoặc hình ảnh')}
        ${field('Đính kèm', '<input type="file">')}
        <div class="form-actions"><button class="btn" type="button" data-hide="#new-thread">Hủy</button><button class="btn primary" type="submit">Đăng</button></div>
      </form></section>` +
      card(table(['Mã bài viết', 'Tiêu đề', 'Tác giả', 'Phản hồi', 'Thời gian đăng'],
        roots.map((p) => [code(p.code), `<a href="forum-post.html">${esc(p.title)}</a>`, esc(p.author),
          POSTS.filter((x) => x.parent === p.code).length, p.time])));
  }

  function forumPostPage() {
    const root = POSTS[1];
    const replies = POSTS.filter((p) => p.parent === root.code);
    const own = ROLES[CTX.role].name;
    const editLink = (p) => (p.author === own ? ` <a href="forum-post-edit.html?p=${p.code}">Chỉnh sửa</a>` : '');
    return crumb('forum.html', 'Diễn đàn') + head(esc(root.title), meta([['Mã', code(root.code)], ['Tác giả', esc(root.author)], ['Đăng lúc', root.time]]), root.author === own ? btn('Chỉnh sửa bài viết', '', 'forum-post-edit.html?p=' + root.code) : '') +
      card(`<p>${esc(root.content)}</p>`) +
      card('<h2>Phản hồi</h2>' + replies.map((r) =>
        `<div class="post"><strong>${esc(r.title)}</strong> ${code(r.code)}<div class="muted">${esc(r.author)} đăng lúc ${r.time}${editLink(r)}</div><p>${esc(r.content)}</p></div>`).join('')) +
      card(`<h2>Trả lời</h2><form>
        ${field('Tiêu đề', `<input value="Re: ${esc(root.title)}">`)}
        ${field('Nội dung', '<textarea></textarea>', 'Văn bản, file hoặc hình ảnh')}
        <div class="form-actions"><button class="btn primary" type="submit">Gửi phản hồi</button></div></form>`);
  }

  function forumPostEditPage() {
    const p = POSTS.find((x) => x.code === qp('p', '261A1FR1_2'));
    return crumb('forum-post.html', 'Bài viết') + head('Chỉnh sửa bài viết', meta([['Mã', code(p.code)], ['Đăng lúc', p.time]])) +
      card(`<form data-goto="forum-post.html">
        ${field('Tiêu đề', `<input value="${esc(p.title)}">`)}
        ${field('Nội dung', `<textarea>${esc(p.content)}</textarea>`, 'Văn bản, file hoặc hình ảnh')}
        ${field('Đính kèm', '<input type="file">')}
        <div class="form-actions"><a class="btn" href="forum-post.html">Hủy</a><button class="btn primary" type="submit">Lưu thay đổi</button></div></form>`);
  }

  /* ---------- Các trang ---------- */
  const PAGES = {
    /* Trang chung */
    'index': {
      render: () =>
        head('Mẫu giao diện LMS', 'Chọn trang để xem. Dữ liệu là mẫu tĩnh, chưa kết nối backend.') +
        `<div class="grid-3">${SITEMAP.map(([label, role, items]) =>
          card(`<h2>${label}</h2>` + list(items.map(([f, t]) => `<a href="${role}/${f}.html">${t}</a>`)))
        ).join('')}</div>` +
        card(`<h2>Đăng nhập</h2><a href="login.html">Trang đăng nhập mẫu</a>`),
    },
    'login': {
      render: () =>
        card(
          `<h2>Đăng nhập LMS</h2><p class="muted">Sinh viên và giảng viên nhập tên tài khoản. Quản trị viên nhập mã cán bộ.</p>
          <form data-login>
            ${field('Vai trò', '<select name="role"><option value="student">Sinh viên</option><option value="lecturer">Giảng viên</option><option value="admin">Quản trị viên</option></select>')}
            ${field('Tên tài khoản / mã cán bộ', '<input name="user" placeholder="Tên tài khoản hoặc mã cán bộ">')}
            ${field('Mật khẩu', '<input type="password" name="pass">')}
            <button class="btn primary" type="submit" style="width:100%">Đăng nhập</button>
          </form>`
        ),
    },

    /* Quản trị viên */
    'admin/dashboard': {
      nav: 'dashboard',
      render: () =>
        head('Tổng quan', '', btn('Tạo lớp học', 'primary', 'course-create.html')) +
        card('<h2>Quản lý</h2>' + list([
          '<a href="courses.html">Lớp học</a>: xem, tạo mới và sửa lớp',
          '<a href="users.html">Người dùng</a>: xem, tạo mới và sửa tài khoản',
          '<a href="subjects.html">Môn học và khoa</a>',
        ])) +
        `<h2>Tổng hợp</h2><div class="stats">${stat('Môn học', SUBJECTS.length)}${stat('Lớp học', CLASSES.length)}${stat('Giảng viên', USERS.filter((u) => u.role === 'Giảng viên').length)}${stat('Sinh viên', USERS.filter((u) => u.role === 'Sinh viên').length)}</div>` +
        card('<h2>Hoạt động gần đây</h2>' + table(['Thời gian', 'Mã cán bộ', 'Hành động', 'Đối tượng'], ACTIVITY)),
    },
    'admin/subjects': {
      nav: 'subjects',
      render: () =>
        head('Môn học & khoa', 'Mỗi môn học thuộc đúng một khoa và do ít nhất một quản trị viên quản lý',
          btn('Tạo môn học', 'primary', 'subject-create.html') + '<button class="btn" type="button" data-show="#new-khoa">Thêm khoa</button>') +
        `<section class="card hidden" id="new-khoa"><h2>Thêm khoa</h2><form><div class="form-grid">
          ${field('Mã khoa', '<input placeholder="VD: MT" pattern="[A-Z]{2}">', 'Viết tắt theo tên khoa (MT, UD...)')}
          ${field('Tên khoa', '<input placeholder="Tên khoa" required>')}
        </div><div class="form-actions"><button class="btn" type="button" data-hide="#new-khoa">Hủy</button><button class="btn primary" type="submit">Lưu</button></div></form></section>` +
        card('<h2>Môn học</h2>' + table(['Mã môn', 'Tên môn', 'Khoa', 'Quản trị viên quản lý', 'Thao tác'],
          SUBJECTS.map((s) => [code(s.code), esc(s.name), esc(khoaOf(s.khoa).name), s.admins.join(', '),
            act('Sửa', 'Mẫu: chức năng sửa chưa kết nối') + ' ' + act('Xóa', 'Mẫu: chưa xóa dữ liệu', 'sm danger')]))) +
        card('<h2>Khoa</h2>' + table(['Mã khoa', 'Tên khoa', 'Số môn học'],
          KHOA.map((k) => [code(k.code), esc(k.name), SUBJECTS.filter((s) => s.khoa === k.code).length]))),
    },
    'admin/subject-create': {
      nav: 'subjects',
      render: () =>
        crumb('subjects.html', 'Môn học & khoa') + head('Tạo môn học') +
        card(`<form><div class="form-grid">
          ${field('Mã môn học', '<input placeholder="VD: MT2013" pattern="[A-Z]{2}[0-9]{4}">', 'Mã khoa (2 ký tự) + 1 số đại diện năm học + 3 số')}
          ${field('Tên môn học', '<input required placeholder="Tên môn học">', 'Bắt buộc, không để trống')}
          ${field('Khoa', `<select>${KHOA.map((k) => `<option>${esc(k.code)} - ${esc(k.name)}</option>`).join('')}</select>`, 'Mỗi môn thuộc đúng một khoa')}
          ${field('Quản trị viên quản lý', '<select multiple><option selected>00001</option><option>00002</option></select>', 'Ít nhất một quản trị viên')}
        </div><div class="form-actions"><a class="btn" href="subjects.html">Hủy</a><button class="btn primary" type="submit">Tạo môn học</button></div></form>`),
    },
    'admin/courses': {
      nav: 'courses',
      render: () =>
        head('Lớp học', 'Mỗi lớp thuộc một môn học và có đúng một giảng viên phụ trách', btn('Tạo lớp học', 'primary', 'course-create.html')) +
        card(
          `<div class="actions" style="margin-bottom:12px">
            <input placeholder="Tìm theo mã lớp, môn học..." style="max-width:320px">
            <select style="max-width:180px"><option>Tất cả học kỳ</option><option>261</option><option>251</option></select>
          </div>` +
            table(['Mã lớp', 'Tên lớp', 'Môn học', 'Học kỳ', 'Giảng viên phụ trách', 'Số sinh viên', 'Thao tác'],
              CLASSES.map((c) => [code(c.code), c.name, `${code(c.subject)} ${esc(subjectOf(c.subject).name)}`, c.term,
                `${esc(c.teacher)} (${c.teacherCode})`, c.students,
                btn('Sửa', 'sm', 'course-edit.html?c=' + c.code) + ' ' + act('Xóa', 'Mẫu: chưa xóa dữ liệu', 'sm danger')]))
        ),
    },
    'admin/course-create': {
      nav: 'course-create',
      render: () =>
        head('Tạo lớp học') +
        card(
          `<form>
            <div id="step-1">
              <h2>Bước 1 trên 2: Thông tin cơ bản</h2>
              <div class="form-grid">
                <div class="full">${field('Môn học', `<select>${SUBJECTS.map((s) => `<option>${esc(s.code)} - ${esc(s.name)}</option>`).join('')}</select>`)}</div>
                ${field('Học kỳ', '<input placeholder="VD: 261" pattern="[0-9]{3}">', '3 chữ số: 2 số cuối của năm + số học kỳ (VD 261 = học kỳ 1 năm 2026)')}
                ${field('Tên lớp', '<input placeholder="VD: A1" pattern="A[0-9]+" required>', 'Dạng "A" + số thứ tự, không để trống')}
                ${field('Mã lớp (tự sinh)', '<input placeholder="VD: 261A1" disabled>', 'Mã lớp = Học kỳ + Tên lớp')}
              </div>
              <div class="form-actions"><button class="btn primary" type="button" data-show="#step-2" data-hide="#step-1">Tiếp theo</button></div>
            </div>
            <div id="step-2" class="hidden">
              <h2>Bước 2 trên 2: Giảng viên và sinh viên</h2>
              <div class="form-grid">
                ${field('Giảng viên phụ trách', `<select>${USERS.filter((u) => u.role === 'Giảng viên').map((u) => `<option>${u.code} - ${esc(u.name)}</option>`).join('')}</select>`, 'Mỗi lớp có đúng một giảng viên phụ trách')}
                ${field('Sinh viên được phân vào lớp', `<select multiple size="4">${USERS.filter((u) => u.role === 'Sinh viên').map((u) => `<option>${u.code} - ${esc(u.name)}</option>`).join('')}</select>`, 'Có thể chọn nhiều sinh viên')}
              </div>
              <div class="form-actions">
                <button class="btn" type="button" data-show="#step-1" data-hide="#step-2">Quay lại</button>
                <button class="btn primary" type="submit">Tạo lớp học</button>
              </div>
            </div>
          </form>`
        ),
    },
    'admin/course-edit': {
      nav: 'courses',
      render: () => {
        const c = CLASSES.find((x) => x.code === qp('c', '261A1'));
        const sel = (cond) => (cond ? ' selected' : '');
        return crumb('courses.html', 'Lớp học') + head('Chỉnh sửa lớp học', meta([['Mã lớp', code(c.code)]])) +
          card(`<form data-goto="courses.html">
            ${field('Môn học', `<select>${SUBJECTS.map((x) => `<option${sel(x.code === c.subject)}>${esc(x.code)} - ${esc(x.name)}</option>`).join('')}</select>`)}
            ${field('Học kỳ', `<input value="${esc(c.term)}" pattern="[0-9]{3}">`, '3 chữ số')}
            ${field('Tên lớp', `<input value="${esc(c.name)}" pattern="A[0-9]+" required>`, 'Dạng "A" + số thứ tự, không để trống')}
            ${field('Mã lớp', `<input value="${esc(c.code)}" disabled>`, 'Mã lớp = Học kỳ + Tên lớp')}
            ${field('Giảng viên phụ trách', `<select>${USERS.filter((u) => u.role === 'Giảng viên').map((u) => `<option${sel(u.code === c.teacherCode)}>${u.code} - ${esc(u.name)}</option>`).join('')}</select>`, 'Mỗi lớp có đúng một giảng viên phụ trách')}
            ${field('Sinh viên trong lớp', `<select multiple size="4">${USERS.filter((u) => u.role === 'Sinh viên').map((u) => `<option selected>${u.code} - ${esc(u.name)}</option>`).join('')}</select>`)}
            <div class="form-actions"><a class="btn" href="courses.html">Hủy</a><button class="btn primary" type="submit">Lưu thay đổi</button></div>
          </form>`);
      },
    },
    'admin/user-edit': {
      nav: 'users',
      render: () => {
        const u = USERS.find((x) => x.account === qp('u', 'c.le'));
        const sel = (v) => (u.status === v ? ' selected' : '');
        return crumb('users.html', 'Người dùng') + head('Chỉnh sửa người dùng', meta([['Tên tài khoản', code(u.account)], ['Vai trò', u.role]])) +
          card(`<form data-goto="users.html">
            ${field(u.role === 'Sinh viên' ? 'MSSV' : 'Mã giảng viên', `<input value="${esc(u.code)}" disabled>`)}
            ${field('Họ và tên', `<input value="${esc(u.name)}">`)}
            ${field('Email', `<input value="${esc(u.account)}@hcmut.edu.vn" disabled>`, 'Tên tài khoản lấy từ email nên không đổi')}
            ${field('Trạng thái', `<select><option${sel('Active')}>Active</option><option${sel('Inactive')}>Inactive</option></select>`)}
            ${field('Số điện thoại 1', `<input value="${esc(u.phones[0])}" pattern="0[0-9]{9}">`)}
            ${field('Số điện thoại 2', `<input value="${esc(u.phones[1] || '')}" pattern="0[0-9]{9}">`)}
            ${field('Mật khẩu mới', '<input type="password" pattern="[!-~]+" placeholder="Để trống nếu không đổi">', 'Ký tự ASCII từ 33 đến 126')}
            <div class="form-actions"><a class="btn" href="users.html">Hủy</a><button class="btn primary" type="submit">Lưu thay đổi</button></div>
          </form>`);
      },
    },
    'admin/users': {
      nav: 'users',
      render: () =>
        head('Người dùng', 'Quản lý tài khoản Giảng viên và Sinh viên', btn('Tạo người dùng', 'primary', 'user-create.html')) +
        card(
          `<div class="actions" style="margin-bottom:12px">
            <input placeholder="Tìm theo tên tài khoản, họ tên, email..." style="max-width:320px">
            <select style="max-width:200px"><option>Tất cả vai trò</option><option>Giảng viên</option><option>Sinh viên</option></select>
            <select style="max-width:200px"><option>Mọi trạng thái</option><option>Active</option><option>Inactive</option></select>
          </div>` +
            table(['Tên tài khoản', 'Họ và tên', 'Email', 'Vai trò', 'Mã', 'Số điện thoại', 'Trạng thái', 'Thao tác'],
              USERS.map((u) => [code(u.account), esc(u.name), `${esc(u.account)}@hcmut.edu.vn`, u.role, code(u.code), u.phones.join('<br>'), sbadge(u.status),
                btn('Sửa', 'sm', 'user-edit.html?u=' + u.account) + ' ' +
                  act(u.status === 'Active' ? 'Khóa' : 'Mở khóa', 'Mẫu: chưa thay đổi trạng thái') + ' ' +
                  act('Xóa', 'Mẫu: chưa xóa dữ liệu', 'sm danger')])))
        ,
    },
    'admin/user-create': {
      nav: 'user-create',
      render: () =>
        head('Tạo người dùng', 'Chọn vai trò để hiện đúng trường mã định danh') +
        card(
          `<form>
            <div class="form-grid">
              ${field('Vai trò', '<select data-switch><option value="student">Sinh viên</option><option value="lecturer">Giảng viên</option></select>')}
              ${field('Trạng thái', '<select><option>Active</option><option>Inactive</option></select>')}
              ${field('Họ và tên', '<input placeholder="Họ và tên">')}
              ${field('Email', '<input placeholder="ten.ho@hcmut.edu.vn" pattern="[a-z]+[.][a-z]+[a-z0-9]*@hcmut[.]edu[.]vn">', 'Định dạng [tên].[họ][chuỗi]@hcmut.edu.vn')}
              ${field('Tên tài khoản (tự sinh)', '<input placeholder="Phần trước @ của email" disabled>', 'Lấy từ email, bỏ phần @...')}
              ${field('Mật khẩu', '<input type="password" pattern="[!-~]+">', 'Ký tự ASCII từ 33 đến 126, không có khoảng trắng')}
              <div data-for="student" class="hidden">${field('MSSV', '<input pattern="[0-9]{6}" placeholder="6 chữ số">', '2 số năm nhập học + 4 số thứ tự trong danh sách nhập học')}</div>
              <div data-for="lecturer" class="hidden">${field('Mã giảng viên', '<input pattern="[0-9]{5}" placeholder="5 chữ số">', 'Theo thứ tự thời gian chính thức tại trường')}</div>
              <div class="full">${field('Số điện thoại', '<input pattern="0[0-9]{9}" placeholder="VD: 0900000000">', 'Số điện thoại Việt Nam hợp lệ; có thể thêm nhiều số')}
                ${act('Thêm số điện thoại', 'Mẫu: chưa thêm số điện thoại')}</div>
            </div>
            <div class="form-actions"><a class="btn" href="users.html">Hủy</a><button class="btn primary" type="submit">Tạo tài khoản</button></div>
          </form>`
        ),
    },

    /* Sinh viên */
    'student/courses': {
      nav: 'courses',
      render: () =>
        head('Lớp học của tôi', 'Học kỳ 261') +
        table(['Mã lớp', 'Môn học', 'Học kỳ', 'Giảng viên', 'Điểm trung bình', ''],
          MY_CLASSES.map((m) => {
            const c = CLASSES.find((x) => x.code === m.code);
            return [code(c.code), esc(subjectOf(c.subject).name), c.term, esc(c.teacher), avgOf([m.avg]), btn('Vào lớp', 'sm', 'course.html')];
          })),
    },
    'student/course': {
      nav: 'courses',
      render: () =>
        courseHead() + tabs('course') +
        `<div class="grid-2">` +
          card('<h2>Thông báo</h2>' + list(ANNOUNCEMENTS.map((a) => `<strong>${esc(a.title)}</strong><div class="muted">${code(a.code)}</div>`))) +
          card('<h2>Bài tập & Quiz chưa hoàn thành</h2>' + list(
            ITEMS.filter((i) => ['Chưa nộp', 'Chưa làm'].includes(itemStatus(i))).map((i) =>
              `<strong>${esc(i.name)}</strong> ${sbadge(itemStatus(i))}<div class="muted">Deadline: ${i.deadline}</div>`)
          )) +
        `</div>` +
        card('<h2>Học liệu</h2>' + list(MATERIALS.map((m) => `${esc(m.name)} <span class="muted">· ${code(m.code)}</span>`))),
    },
    'student/materials': {
      nav: 'courses',
      render: () =>
        courseHead() + tabs('materials') +
        card(table(['Mã học liệu', 'Tên', 'Nội dung', ''],
          MATERIALS.map((m) => [code(m.code), esc(m.name), esc(m.content), act('Tải về', 'Mẫu: tải file chưa kết nối backend')]))),
    },
    'student/announcements': {
      nav: 'courses',
      render: () =>
        courseHead() + tabs('announcements') +
        card(ANNOUNCEMENTS.map((a) => `<div class="post"><h2>${esc(a.title)}</h2><div class="muted">${code(a.code)}</div><p>${esc(a.content)}</p></div>`).join('')),
    },
    'student/quizzes': {
      nav: 'courses',
      render: () =>
        courseHead() + tabs('quizzes') +
        card(table(['Mã', 'Tên', 'Loại', 'Thời gian đăng', 'Deadline', 'Trạng thái', 'Điểm', ''],
          ITEMS.map((i) => [code(i.code), esc(i.name), i.kind, i.posted, i.deadline, sbadge(itemStatus(i)), fmt(i.score),
            btn('Mở', 'sm', (i.kind === 'Quiz' ? 'quiz-intro.html?i=' : 'submit.html?i=') + i.code)]))),
    },
    'student/quiz-intro': {
      nav: 'courses',
      render: () => {
        const q = ITEMS.find((x) => x.code === qp('i', '261A1BT4'));
        return crumb('quizzes.html', 'Bài tập & Quiz') +
          head(esc(q.name), meta([['Mã', code(q.code)], ['Thời gian đăng', q.posted], ['Deadline', q.deadline]])) +
          card(`<p>${esc(q.desc)}</p>`) +
          card('<h2>Thông tin quiz</h2>' + list([
            `Thời lượng: ${q.duration ? q.duration + ' phút (tự kết thúc khi hết giờ)' : 'Không giới hạn'}`,
            `Số lần làm bài tối đa: ${q.maxAttempts}`,
            `Cách tính điểm: ${q.scoring}`,
            `Điểm hiện tại: ${fmt(q.score)}`,
          ])) +
          `<div class="actions">${btn('Bắt đầu làm bài', 'primary', 'quiz.html?i=' + q.code)}${btn('Quay lại', '', 'quizzes.html')}</div>`;
      },
    },
    'student/quiz': {
      nav: 'courses',
      render: () => {
        const q = ITEMS.find((x) => x.code === qp('i', '261A1BT4'));
        return crumb('quiz-intro.html?i=' + q.code, 'Chi tiết quiz') +
          head(esc(q.name), meta([['Mã', code(q.code)], ['Deadline', q.deadline]])) +
          (q.duration
            ? card(`<h2>Thời gian còn lại</h2><span class="timer" data-countdown data-seconds="${q.duration * 60 - 5}">${q.duration}:00</span>`)
            : card('<h2>Thời gian</h2><p>Không giới hạn</p>')) +
          card(`<h2>Nội dung quiz</h2><p style="white-space:pre-wrap">${esc(q.content)}</p>`) +
          card(`<form data-goto="quizzes.html"><h2>Bài làm</h2>
            ${field('Nội dung bài làm', '<textarea></textarea>', 'Văn bản, file hoặc hình ảnh')}
            ${field('Đính kèm', '<input type="file">')}
            <div class="form-actions"><button class="btn primary" type="submit">Nộp bài</button></div></form>`);
      },
    },
    'student/submit': {
      nav: 'courses',
      render: () => {
        const a = ITEMS.find((x) => x.code === qp('i', '261A1BT3'));
        const done = a.submission.status !== 'Chưa nộp';
        return crumb('quizzes.html', 'Bài tập & Quiz') +
          head(esc(a.name), meta([['Mã', code(a.code)], ['Thời gian đăng', a.posted], ['Deadline', a.deadline]])) +
          card(`<p>${esc(a.desc)}</p>`) +
          `<div class="grid-2">` +
            card('<h2>Bài nộp của tôi</h2>' + list([
              `Trạng thái: ${sbadge(a.submission.status)}`,
              `Thời gian nộp: ${a.submission.time ?? '—'}`,
              `Nội dung bài nộp: ${esc(a.submission.content ?? '—')}`,
              `Điểm: ${fmt(a.score)}`,
            ])) +
            card(`<h2>${done ? 'Nộp lại' : 'Nộp bài'}</h2><form data-goto="submit-success.html?i=${a.code}">
              ${field('Nội dung bài nộp', '<textarea></textarea>', 'Văn bản, file hoặc hình ảnh')}
              ${field('Đính kèm', '<input type="file">')}
              <p class="muted">Nộp sau Deadline sẽ được ghi nhận là "Nộp trễ".</p>
              <div class="form-actions"><button class="btn primary" type="submit">Nộp bài</button></div>
            </form>`) +
          `</div>`;
      },
    },
    'student/submit-success': {
      nav: 'courses',
      render: () => {
        const a = ITEMS.find((x) => x.code === qp('i', '261A1BT3'));
        return head('Nộp bài thành công', esc(a.name)) +
          `<div class="alert alert-success" role="status">Bài nộp của bạn đã được ghi nhận.</div>` +
          card('<h2>Chi tiết bài nộp</h2>' + list([
            `Mã bài tập: ${code(a.code)}`,
            `Thời gian nộp: 2026-12-02 08:30`,
            `Trạng thái: ${sbadge('Đã nộp')}`,
            `Deadline: ${a.deadline}`,
          ])) +
          `<div class="actions">${btn('Về danh sách bài tập', 'primary', 'quizzes.html')}${btn('Xem bài nộp', '', 'submit.html?i=' + a.code)}</div>`;
      },
    },
    'student/grades': {
      nav: 'courses',
      render: () =>
        courseHead() + tabs('grades') +
        `<div class="grid-2">` +
          card(table(['Mã', 'Tên', 'Loại', 'Điểm (thang 10)'], ITEMS.map((i) => [code(i.code), esc(i.name), i.kind, fmt(i.score)]))) +
          card(stat(`Điểm trung bình lớp ${cur().code}`, avgOf(ITEMS.map((i) => i.score))) +
            '<p class="muted">Điểm trung bình là trung bình các điểm thành phần trong lớp. Điểm theo thang 10, làm tròn 2 chữ số thập phân.</p>') +
        `</div>`,
    },
    'student/forum': { nav: 'courses', render: forumPage },
    'student/forum-post': { nav: 'courses', render: forumPostPage },
    'student/forum-post-edit': { nav: 'courses', render: forumPostEditPage },
    'student/profile': {
      nav: 'profile',
      render: () => {
        const u = USERS[2];
        return head('Hồ sơ cá nhân', 'Tên tài khoản, email và MSSV không chỉnh sửa được', '<button class="btn" type="button" data-show="#edit-profile" data-hide="#view-profile">Chỉnh sửa</button>') +
          `<section class="card" id="view-profile">${list([
            `Tên tài khoản: ${code(u.account)}`, `MSSV: ${code(u.code)}`, `Họ và tên: ${esc(u.name)}`,
            `Email: ${esc(u.account)}@hcmut.edu.vn`, `Số điện thoại: ${u.phones.join(', ')}`, `Trạng thái: ${sbadge(u.status)}`,
          ])}</section>` +
          `<section class="card hidden" id="edit-profile"><form>
            <div class="form-grid">
              ${field('Tên tài khoản', `<input value="${esc(u.account)}" disabled>`)}
              ${field('MSSV', `<input value="${esc(u.code)}" disabled>`)}
              ${field('Email', `<input value="${esc(u.account)}@hcmut.edu.vn" disabled>`)}
              ${field('Họ và tên', `<input value="${esc(u.name)}">`)}
              ${field('Số điện thoại 1', `<input value="${esc(u.phones[0])}" pattern="0[0-9]{9}">`)}
              ${field('Số điện thoại 2', `<input value="${esc(u.phones[1])}" pattern="0[0-9]{9}">`)}
              <div class="full">${field('Mật khẩu mới', '<input type="password" pattern="[!-~]+" placeholder="Để trống nếu không đổi">', 'Ký tự ASCII từ 33 đến 126')}</div>
            </div>
            <div class="form-actions">
              <button class="btn" type="button" data-show="#view-profile" data-hide="#edit-profile">Hủy</button>
              <button class="btn primary" type="submit">Lưu</button>
            </div>
          </form></section>`;
      },
    },

    /* Giảng viên */
    'lecturer/courses': {
      nav: 'courses',
      render: () =>
        head('Lớp đang dạy', 'Học kỳ 261') +
        table(['Mã lớp', 'Môn học', 'Học kỳ', 'Sĩ số', ''],
          CLASSES.filter((c) => c.teacherCode === '00001').map((c) =>
            [code(c.code), esc(subjectOf(c.subject).name), c.term, c.students, btn('Vào lớp', 'sm', 'course.html')])),
    },
    'lecturer/course': {
      nav: 'courses',
      render: () =>
        courseHead() + tabs('course') +
        card('<h2>Cần xử lý</h2>' + list([
          `<a href="submissions.html">${SUBMISSIONS.filter((x) => x.grade == null && x.status !== 'Chưa nộp').length} bài nộp chờ chấm</a>`,
          `Lớp có ${cur().students} sinh viên, ${ANNOUNCEMENTS.length} thông báo và ${FORUMS.length} forum`,
        ])) +
        card('<h2>Thao tác nhanh</h2><div class="actions">' +
          btn('Tạo học liệu / thông báo', 'primary', 'material-form.html') +
          btn('Tạo bài tập / quiz', '', 'assignment-form.html') +
          btn('Chấm điểm', '', 'submissions.html') +
          btn('Bảng điểm', '', 'gradebook.html') + '</div>') +
        card('<h2>Bài nộp gần đây</h2>' + table(['MSSV', 'Họ tên', 'Trạng thái', 'Thời gian nộp'],
          SUBMISSIONS.map((s) => [s.mssv, esc(s.name), sbadge(s.status), s.time ?? '—']))),
    },
    'lecturer/members': {
      nav: 'courses',
      render: () =>
        courseHead() + tabs('members') +
        card(table(['MSSV', 'Họ tên', 'Điểm trung bình', ''],
          MEMBERS.map((m) => [m.mssv, esc(m.name), avgOf(m.scores), btn('Xem điểm', 'sm', 'grade-detail.html')]))),
    },
    'lecturer/materials': {
      nav: 'courses',
      render: () =>
        courseHead() + tabs('materials') +
        head('Học liệu & thông báo', 'Chỉ giảng viên được đăng, sửa, xóa', btn('Tạo học liệu / thông báo', 'primary', 'material-form.html')) +
        card('<h2>Học liệu</h2>' + table(['Mã học liệu', 'Tên', 'Nội dung', 'Thao tác'],
          MATERIALS.map((m) => [code(m.code), esc(m.name), esc(m.content),
            btn('Sửa', 'sm', 'material-form.html?mode=edit') + ' ' + act('Xóa', 'Mẫu: chưa xóa dữ liệu', 'sm danger')]))) +
        card('<h2>Thông báo</h2>' + table(['Mã thông báo', 'Tiêu đề', 'Nội dung', 'Thao tác'],
          ANNOUNCEMENTS.map((a) => [code(a.code), esc(a.title), esc(a.content),
            btn('Sửa', 'sm', 'material-form.html?mode=edit') + ' ' + act('Xóa', 'Mẫu: chưa xóa dữ liệu', 'sm danger')]))),
    },
    'lecturer/material-form': {
      nav: 'courses',
      render: () => {
        const edit = location.search.includes('mode=edit');
        return courseHead() + tabs('materials') +
          head(edit ? 'Chỉnh sửa học liệu / thông báo' : 'Tạo học liệu / thông báo', 'Sinh viên chỉ xem và tải về, không chỉnh sửa') +
          card(`<form><div class="form-grid">
            ${field('Loại', '<select><option>Học liệu</option><option>Thông báo</option></select>')}
            ${field('Mã (tự sinh)', `<input value="${edit ? '261A1HL3' : ''}" placeholder="VD: 261A1HL4 hoặc 261A1TB3" disabled>`, 'Mã lớp + HL/TB + số thứ tự, không vượt quá số đã đăng')}
            <div class="full">${field('Tiêu đề', `<input value="${edit ? 'Slide Chương 2 - Mô hình ER' : ''}">`)}</div>
            <div class="full">${field('Nội dung', `<textarea>${edit ? 'File chuong2.pdf' : ''}</textarea>`, 'Văn bản, file hoặc hình ảnh')}</div>
            <div class="full">${field('Đính kèm file', '<input type="file">')}</div>
          </div>
          <div class="form-actions"><a class="btn" href="materials.html">Hủy</a><button class="btn primary" type="submit">Lưu</button></div>
          </form>`);
      },
    },
    'lecturer/assignments': {
      nav: 'courses',
      render: () =>
        courseHead() + tabs('assignments') +
        head('Bài tập & Quiz', 'Chỉ giảng viên được giao bài', btn('Tạo bài tập / quiz', 'primary', 'assignment-form.html')) +
        card(table(['Mã', 'Tên', 'Loại', 'Thời gian đăng', 'Deadline', 'Cấu hình quiz', 'Thao tác'],
          ITEMS.map((i) => [code(i.code), esc(i.name), i.kind, i.posted, i.deadline,
            i.kind === 'Quiz' ? `${i.duration ? i.duration + ' phút' : 'Không giới hạn'}, ${i.maxAttempts} lần làm, tính ${i.scoring.toLowerCase()}` : '—',
            btn('Sửa', 'sm', 'assignment-form.html?mode=edit&i=' + i.code) + ' ' + act('Xóa', 'Mẫu: chưa xóa dữ liệu', 'sm danger')]))),
    },
    'lecturer/assignment-form': {
      nav: 'courses',
      render: () => {
        const edit = location.search.includes('mode=edit');
        const it = edit ? ITEMS.find((x) => x.code === qp('i', '261A1BT2')) : null;
        const isQuiz = !!it && it.kind === 'Quiz';
        const dt = (v) => (v ? v.replace(' ', 'T') : '');
        return courseHead() + tabs('assignments') +
          head(edit ? 'Chỉnh sửa bài tập / quiz' : 'Tạo bài tập / quiz') +
          card(`<form data-goto="assignments.html">
            <div class="form-grid">
              ${field('Loại', `<select data-switch${edit ? ' disabled' : ''}><option value="file"${isQuiz ? '' : ' selected'}>Bài nộp</option><option value="quiz"${isQuiz ? ' selected' : ''}>Quiz</option></select>`, edit ? 'Không đổi được loại sau khi đã tạo' : '')}
              ${field('Mã (tự sinh)', `<input value="${it ? esc(it.code) : ''}" placeholder="VD: 261A1BT5" disabled>`)}
              <div class="full">${field('Tên', `<input required placeholder="VD: Bài tập 3" value="${it ? esc(it.name) : ''}">`)}</div>
              <div class="full">${field('Mô tả', `<textarea>${it ? esc(it.desc) : ''}</textarea>`)}</div>
              ${field('Thời gian đăng', `<input type="datetime-local" value="${it ? dt(it.posted) : ''}">`)}
              ${field('Deadline', `<input type="datetime-local" value="${it ? dt(it.deadline) : ''}">`, 'Phải sau thời gian đăng')}
            </div>
            <div data-for="file" class="hidden"><p class="muted">Sinh viên nộp nội dung bài nộp (văn bản, file, hình ảnh). Trạng thái: Chưa nộp, Đã nộp hoặc Nộp trễ.</p></div>
            <div data-for="quiz" class="hidden">
              <div class="form-grid">
                ${field('Thời lượng (phút)', `<input type="number" min="1" placeholder="Để trống = không giới hạn" value="${isQuiz && it.duration ? it.duration : ''}">`, 'Số nguyên dương hoặc không giới hạn; hết giờ tự kết thúc bài')}
                ${field('Số lần làm bài tối đa', `<input type="number" min="1" value="${isQuiz ? it.maxAttempts : 1}">`)}
                ${field('Cách tính điểm', `<select><option${isQuiz && it.scoring === 'Lần cao nhất' ? ' selected' : ''}>Lần cao nhất</option><option${isQuiz && it.scoring === 'Trung bình' ? ' selected' : ''}>Trung bình</option></select>`)}
              </div>
              ${field('Nội dung quiz', `<textarea>${isQuiz ? esc(it.content) : ''}</textarea>`, 'Văn bản, file hoặc hình ảnh')}
              ${field('Đính kèm', '<input type="file">')}
            </div>
            <div class="form-actions"><a class="btn" href="assignments.html">Hủy</a><button class="btn primary" type="submit">${edit ? 'Lưu thay đổi' : 'Tạo'}</button></div>
          </form>`);
      },
    },
    'lecturer/submissions': {
      nav: 'courses',
      render: () =>
        courseHead() + tabs('submissions') +
        head('Chấm điểm', meta([['Bài tập', esc(ITEMS[1].name)], ['Mã', code(ITEMS[1].code)], ['Deadline', ITEMS[1].deadline]])) +
        card(`<form>${table(['MSSV', 'Họ tên', 'Trạng thái', 'Thời gian nộp', 'Nội dung bài nộp', 'Điểm (0–10)', ''],
          SUBMISSIONS.map((s) => [
            s.mssv, esc(s.name), sbadge(s.status), s.time ?? '—', s.content ? `<a href="#">${esc(s.content)}</a>` : '—',
            `<input type="number" min="0" max="10" step="0.01" value="${s.grade ?? ''}" style="width:100px">`,
            btn('Chi tiết', 'sm', 'grade-detail.html'),
          ]))}
          <p class="muted">Điểm theo thang 10, tối đa 2 chữ số thập phân.</p>
          <div class="form-actions"><button class="btn primary" type="submit">Lưu điểm</button></div></form>`),
    },
    'lecturer/gradebook': {
      nav: 'courses',
      render: () =>
        courseHead() + tabs('gradebook') +
        card(table(['MSSV', 'Họ tên', ...ITEMS.map((i) => esc(i.name)), 'Điểm trung bình', ''],
          MEMBERS.map((m) => [m.mssv, esc(m.name), ...m.scores.map(fmt), `<strong>${avgOf(m.scores)}</strong>`, btn('Chi tiết', 'sm', 'grade-detail.html')]))),
    },
    'lecturer/grade-detail': {
      nav: 'courses',
      render: () => {
        const m = MEMBERS[0];
        return courseHead() + tabs('gradebook') + crumb('gradebook.html', 'Bảng điểm') +
          head(`Chi tiết điểm của ${esc(m.name)}`, meta([['MSSV', m.mssv]])) +
          card(table(['Mã', 'Tên', 'Loại', 'Điểm'], ITEMS.map((i, k) => [code(i.code), esc(i.name), i.kind, fmt(m.scores[k])]))) +
          card(stat(`Điểm trung bình lớp ${cur().code}`, avgOf(m.scores)));
      },
    },
    'lecturer/forum': { nav: 'courses', render: forumPage },
    'lecturer/forum-post': { nav: 'courses', render: forumPostPage },
    'lecturer/forum-post-edit': { nav: 'courses', render: forumPostEditPage },
  };

  /* ---------- Gắn giao diện ---------- */
  function applySwitch(select) {
    const scope = select.form || document;
    $$('[data-for]', scope).forEach((el) => el.classList.toggle('hidden', el.dataset.for !== select.value));
  }

  function toast(msg) {
    let t = $('#toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove('show'), 2600);
  }

  // Thêm class Bootstrap/Moodle cho các control thô và form
  const decorate = (html) =>
    html
      .replace(/<(input|select|textarea)(?![^>]*\bclass=)([^>]*)>/g, (m, t, rest) => {
        if (/type="(checkbox|radio)"/.test(rest)) return `<${t} class="form-check-input"${rest}>`;
        return `<${t} class="${t === 'select' ? 'form-select' : 'form-control'}"${rest}>`;
      })
      .replace(/<form(?![^>]*\bclass=)/g, '<form class="mform"')
      .replace(/class="btn((?: (?:primary|danger|sm))*)"/g, (m, rest) => `class="${btnCls(rest)}"`);

  // Bọc phần thân trang trong #page-content > #region-main-box > #region-main như Moodle
  const wrapRegion = (html) => {
    const i = Math.max(html.lastIndexOf('<!--hdr-end-->'), html.lastIndexOf('<!--nav-end-->'));
    const cut = i < 0 ? 0 : i + 14;
    return `${html.slice(0, cut)}<div id="page-content" class="pb-3 d-print-block"><div id="region-main-box"><section id="region-main" aria-label="Nội dung">${html.slice(cut)}</section></div></div>`;
  };

  function mount() {
    const b = document.body;
    const role = b.dataset.role || '';
    const key = b.dataset.page || 'index';
    CTX.role = role;
    CTX.root = b.dataset.root || '';

    const page = PAGES[role ? `${role}/${key}` : key];
    if (!page) {
      b.innerHTML = '<main class="p-4">Không tìm thấy trang.</main>';
      return;
    }
    state.headUsed = false;
    state.back = '';
    state.key = key;
    state.nav = page.nav || '';

    let inner = wrapRegion(page.render());
    if (key === 'login') inner = `<div class="mx-auto" style="max-width:620px">${inner}</div>`;

    const R = role ? ROLES[role] : null;
    const items = R
      ? R.nav.map(([label, file, k]) => `<li class="nav-item"><a class="nav-link${k === page.nav ? ' active' : ''}" href="${CTX.root}${role}/${file}">${label}</a></li>`).join('')
      : '';
    const initials = R ? R.name.split(' ').slice(-2).map((w) => w[0]).join('').toUpperCase() : '';
    const userMenu = R
      ? `<div class="d-flex align-items-stretch usermenu-container"><div class="usermenu"><div class="dropdown">
          <a href="#" role="button" id="user-menu-toggle" class="btn dropdown-toggle" data-menu-toggle><span class="userbutton"><span class="avatars"><span class="avatar current"><span class="userinitials size-35" role="img">${esc(initials)}</span></span></span></span><span class="userfirstname d-none d-xl-block">${esc(R.name)}</span></a>
          <div id="user-action-menu" class="dropdown-menu dropdown-menu-end">
            ${role === 'student' ? `<a class="dropdown-item" href="${CTX.root}student/profile.html">Hồ sơ</a>` : ''}
            <a class="dropdown-item" href="${CTX.root}login.html">Đăng xuất</a>
          </div></div></div></div>`
      : `<span class="navbar-text">Bạn chưa đăng nhập</span>`;

    b.className = 'limitedwidth uses-drawers theme pagelayout-standard path-lms';
    b.innerHTML = decorate(`<div id="page-wrapper" class="d-print-block">
      <nav class="navbar fixed-top bg-body navbar-expand"><div class="container-fluid navbar-content">
        <a href="${CTX.root}index.html" class="navbar-brand d-flex align-items-center m-0 me-4 p-0 aabtn">LMS</a>
        <div class="primary-navigation"><div class="primarynav-navbar navigation"><nav class="moremenu observed navigation"><ul class="nav more-nav navbar-nav">${items}</ul></nav></div></div>
        <div id="usernavigation" class="navbar-nav ms-auto h-100">${userMenu}</div>
      </div></nav>
      <div id="page" class="drawers"><div id="topofscroll" class="main-inner">${inner}</div>
        <footer id="page-footer" class="footer-popover bg-white"><div class="footer-content-popover container text-muted small py-3">Hệ thống quản lý học tập, Trường Đại học Bách khoa - ĐHQG-HCM</div></footer>
      </div></div>`);

    $$('select[data-switch]').forEach(applySwitch);

    $$('[data-countdown]').forEach((el) => {
      let s = Number(el.dataset.seconds) || 0;
      const show = () => {
        el.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
        if (s > 0) s -= 1;
      };
      show();
      setInterval(show, 1000);
    });
  }

  /* Sự kiện dùng chung */
  document.addEventListener('click', (e) => {
    const tog = e.target.closest('[data-menu-toggle]');
    if (tog) {
      e.preventDefault();
      const dd = tog.closest('.dropdown');
      dd.classList.toggle('show');
      $('.dropdown-menu', dd).classList.toggle('show');
      return;
    }
    $$('.dropdown.show').forEach((d) => { d.classList.remove('show'); $('.dropdown-menu', d).classList.remove('show'); });
    const el = e.target.closest('[data-show],[data-hide],[data-alert]');
    if (!el) return;
    if (el.dataset.alert) toast(el.dataset.alert);
    if (el.dataset.show) $$(el.dataset.show).forEach((x) => x.classList.remove('hidden'));
    if (el.dataset.hide) $$(el.dataset.hide).forEach((x) => x.classList.add('hidden'));
  });

  document.addEventListener('change', (e) => {
    if (e.target.matches('select[data-switch]')) applySwitch(e.target);
  });

  document.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    if (f.hasAttribute('data-login')) {
      const role = f.querySelector('[name="role"]').value;
      location.href = (CTX.root || '') + LOGIN_TARGETS[role];
      return;
    }
    if (f.dataset.goto) { location.href = f.dataset.goto; return; }
    toast('Mẫu giao diện: dữ liệu chưa được lưu (chờ kết nối backend)');
  });

  document.addEventListener('DOMContentLoaded', mount);
})();
