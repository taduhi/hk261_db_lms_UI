/* LMS_UI - Phiên bản BK-LMS (Moodle 4 Boost), phân quyền theo vai trò và lưu trữ giả lập localStorage. */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const STORE_KEY = 'lms_hcmut_state_v1';
  const SESSION_KEY = 'lms_hcmut_session_v1';
  const FLASH_KEY = 'lms_hcmut_flash_v1';
  const VIEW_KEY = 'lms_hcmut_course_view_v1';
  const SORT_KEY = 'lms_hcmut_course_sort_v1';
  const MEM = {};

  function lsGet(k) {
    try { return window.localStorage.getItem(k); } catch (_) { return MEM[k] ?? null; }
  }
  function lsSet(k, v) {
    try { window.localStorage.setItem(k, v); } catch (_) { MEM[k] = v; }
  }
  function lsDel(k) {
    try { window.localStorage.removeItem(k); } catch (_) { delete MEM[k]; }
  }
  function ssGet(k) {
    try { return window.sessionStorage.getItem(k); } catch (_) { return MEM['s_' + k] ?? null; }
  }
  function ssSet(k, v) {
    try { window.sessionStorage.setItem(k, v); } catch (_) { MEM['s_' + k] = v; }
  }
  function ssDel(k) {
    try { window.sessionStorage.removeItem(k); } catch (_) { delete MEM['s_' + k]; }
  }

  function setFlash(msg) { ssSet(FLASH_KEY, msg); }
  function popFlash() {
    const m = ssGet(FLASH_KEY);
    if (m) ssDel(FLASH_KEY);
    return m;
  }

  function nowStr() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  /* ---------- Biểu tượng & Hình ảnh đại diện (chá dò) ---------- */
  const brandImg = (cls = 'bk-logo-img', alt = 'BK-LMS') =>
    `<img class="${cls}" src="${CTX.root}assets/cha-do.jpg" alt="${esc(alt)}">`;

  const ICONS = {
    bell: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    menu: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>',
    assign: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3-3 3 3"/></svg>',
    quiz: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    material: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    announce: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>',
    forum: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  };
  const actIcon = (type) => `<span class="bk-act-icon ic-${type}" aria-hidden="true">${ICONS[type] || ''}</span>`;

  /* ---------- 1. Dữ liệu mẫu gốc (bám sát lược đồ quan hệ LMS) ---------- */
  function createSeed() {
    return {
      admins: [
        { code: '00001', account: '00001', name: 'Quản trị viên 00001', email: 'admin1@hcmut.edu.vn', password: 'Admin@123', status: 'Active' },
        { code: '00002', account: '00002', name: 'Quản trị viên 00002', email: 'admin2@hcmut.edu.vn', password: 'Admin@123', status: 'Active' },
      ],
      khoa: [
        { code: 'MT', name: 'Khoa Khoa học và Kỹ thuật Máy tính' },
        { code: 'UD', name: 'Khoa Khoa học Ứng dụng' },
      ],
      subjects: [
        { code: 'MT2013', name: 'Cơ sở dữ liệu', khoa: 'MT', admins: ['00001'] },
        { code: 'MT2003', name: 'Cấu trúc dữ liệu và giải thuật', khoa: 'MT', admins: ['00001', '00002'] },
        { code: 'MT2039', name: 'Lập trình Web', khoa: 'MT', admins: ['00001'] },
        { code: 'UD1001', name: 'Giải tích 1', khoa: 'UD', admins: ['00002'] },
      ],
      users: [
        { account: 'a.nguyen', name: 'Nguyễn Văn A', role: 'Giảng viên', code: '00001', phones: ['0900000001'], status: 'Active', password: 'Lecturer@123' },
        { account: 'b.tran', name: 'Trần Thị B', role: 'Giảng viên', code: '00002', phones: ['0900000002'], status: 'Active', password: 'Lecturer@123' },
        { account: 'c.le', name: 'Lê Văn C', role: 'Sinh viên', code: '240001', phones: ['0900000011', '0900000012'], status: 'Active', password: 'Student@123' },
        { account: 'd.pham', name: 'Phạm Thị D', role: 'Sinh viên', code: '240002', phones: ['0900000013'], status: 'Active', password: 'Student@123' },
        { account: 'e.vo', name: 'Võ Văn E', role: 'Sinh viên', code: '240003', phones: ['0900000014'], status: 'Inactive', password: 'Student@123' },
        { account: 'f.do', name: 'Đỗ Thị F', role: 'Sinh viên', code: '240004', phones: ['0900000015'], status: 'Active', password: 'Student@123' },
      ],
      classes: [
        { code: '261A1', name: 'A1', subject: 'MT2013', term: '261', teacherCode: '00001', studentCodes: ['240001', '240002', '240003', '240004'] },
        { code: '261A2', name: 'A2', subject: 'MT2003', term: '261', teacherCode: '00002', studentCodes: ['240001', '240002', '240004'] },
        { code: '261A3', name: 'A3', subject: 'MT2039', term: '261', teacherCode: '00001', studentCodes: ['240001', '240004'] },
        { code: '251A1', name: 'A1', subject: 'UD1001', term: '251', teacherCode: '00002', studentCodes: ['240002', '240003'] },
      ],
      materials: [
        { code: '261A1HL1', classCode: '261A1', name: 'Đề cương môn học', content: 'File de-cuong.pdf' },
        { code: '261A1HL2', classCode: '261A1', name: 'Slide Chương 1 - Tổng quan CSDL', content: 'File chuong1.pdf' },
        { code: '261A1HL3', classCode: '261A1', name: 'Slide Chương 2 - Mô hình ER', content: 'File chuong2.pdf' },
        { code: '261A2HL1', classCode: '261A2', name: 'Đề cương Cấu trúc dữ liệu & Giải thuật', content: 'File ctdl-decuong.pdf' },
        { code: '261A2HL2', classCode: '261A2', name: 'Slide Chương 3 - Cây nhị phân & AVL', content: 'File cay-avl.pdf' },
        { code: '261A3HL1', classCode: '261A3', name: 'Slide Tuần 1 - HTML5 & CSS3', content: 'File web-w1.pdf' },
        { code: '261A3HL2', classCode: '261A3', name: 'Hướng dẫn thiết kế REST API', content: 'File rest-api.pdf' },
        { code: '251A1HL1', classCode: '251A1', name: 'Bài giảng Giải tích 1 - Giới hạn và Đạo hàm', content: 'File gt1-ch1.pdf' },
      ],
      announcements: [
        { code: '261A1TB1', classCode: '261A1', title: 'Lịch thi giữa kỳ', content: 'Lịch thi giữa kỳ đã được cập nhật. Vui lòng kiểm tra phòng thi trước ngày thi 3 ngày.' },
        { code: '261A1TB2', classCode: '261A1', title: 'Thay đổi phòng học tuần 12', content: 'Buổi học tuần 12 chuyển sang phòng B4-205.' },
        { code: '261A2TB1', classCode: '261A2', title: 'Thông báo lịch thực hành Lab 3', content: 'Các nhóm nộp bài Lab 3 trước 23:59 Chủ nhật trên hệ thống LMS.' },
        { code: '261A3TB1', classCode: '261A3', title: 'Đăng ký đề tài bài tập lớn Web', content: 'Sinh viên chốt nhóm (3-4 thành viên) và gửi tên đề tài trên diễn đàn lớp.' },
        { code: '251A1TB1', classCode: '251A1', title: 'Công bố điểm thành phần học kỳ 251', content: 'Điểm kiểm tra giữa kỳ đã được cập nhật trong mục Điểm.' },
      ],
      items: [
        {
          code: '261A1BT1', classCode: '261A1', kind: 'Quiz', name: 'Quiz 1 - Mô hình ER', desc: 'Kiểm tra chương 2 về mô hình Thực thể - Mối kết hợp.',
          posted: '2026-10-01 08:00', deadline: '2026-10-07 23:59',
          duration: 20, maxAttempts: 2, scoring: 'Lần cao nhất',
          content: 'Câu 1. Thực thể yếu (weak entity) được xác định bằng gì?\nCâu 2. Nêu ý nghĩa của ràng buộc khóa ngoại.\nCâu 3. Phát biểu điều kiện của dạng chuẩn BCNF.',
        },
        {
          code: '261A1BT2', classCode: '261A1', kind: 'Bài nộp', name: 'Bài tập 1 - Thiết kế EERD', desc: 'Thiết kế sơ đồ EERD hoàn chỉnh cho hệ thống LMS (nộp 1 tệp báo cáo PDF hoặc ZIP).',
          posted: '2026-11-10 08:00', deadline: '2026-11-30 23:59',
        },
        {
          code: '261A1BT3', classCode: '261A1', kind: 'Bài nộp', name: 'Bài tập 2 - Chuyển đổi sang lược đồ quan hệ', desc: 'Ánh xạ EERD sang lược đồ quan hệ và giải thích các bước mapping.',
          posted: '2026-11-20 08:00', deadline: '2026-12-10 23:59',
        },
        {
          code: '261A1BT4', classCode: '261A1', kind: 'Quiz', name: 'Quiz 2 - Đại số quan hệ', desc: 'Kiểm tra chương 4 về các phép toán đại số quan hệ.',
          posted: '2026-11-20 08:00', deadline: '2026-12-05 23:59',
          duration: 15, maxAttempts: 2, scoring: 'Trung bình',
          content: 'Câu 1. Viết biểu thức đại số quan hệ cho phép chọn (Selection).\nCâu 2. Phân biệt phép hợp (Union) và phép giao (Intersection).\nCâu 3. Cho biết điều kiện khả hợp của hai quan hệ.',
        },
        {
          code: '261A2BT1', classCode: '261A2', kind: 'Quiz', name: 'Quiz 1 - Độ phức tạp thuật toán', desc: 'Đánh giá độ phức tạp thời gian Big-O.',
          posted: '2026-10-15 08:00', deadline: '2026-12-15 23:59',
          duration: 15, maxAttempts: 2, scoring: 'Lần cao nhất',
          content: 'Câu 1. Độ phức tạp trung bình của QuickSort là bao nhiêu?\nCâu 2. So sánh tìm kiếm nhị phân và tìm kiếm tuyến tính.',
        },
        {
          code: '261A2BT2', classCode: '261A2', kind: 'Bài nộp', name: 'Lab 1 - Cài đặt Linked List & Stack', desc: 'Nộp mã nguồn C++ cài đặt danh sách liên kết đơn và ngăn xếp.',
          posted: '2026-11-12 08:00', deadline: '2026-12-12 23:59',
        },
        {
          code: '261A3BT1', classCode: '261A3', kind: 'Bài nộp', name: 'Assignment 1 - Dựng giao diện tĩnh HTML/CSS', desc: 'Thiết kế trang web đáp ứng (responsive) không dùng framework.',
          posted: '2026-11-18 08:00', deadline: '2026-12-18 23:59',
        },
        {
          code: '251A1BT1', classCode: '251A1', kind: 'Quiz', name: 'Kiểm tra giữa kỳ Giải tích 1', desc: 'Nội dung chương 1 và chương 2.',
          posted: '2025-10-20 08:00', deadline: '2025-10-25 23:59',
          duration: 45, maxAttempts: 1, scoring: 'Lần cao nhất',
          content: 'Câu 1. Tính giới hạn lim(x->0) sin(x)/x.\nCâu 2. Tìm đạo hàm cấp 1 của f(x) = x^2 * ln(x).',
        },
      ],
      records: [
        { itemCode: '261A1BT1', mssv: '240001', status: 'Đã làm', time: '2026-10-05 19:20', content: 'Đã hoàn thành 3 câu hỏi.', attempts: 1, attemptScores: [8.5], score: 8.5 },
        { itemCode: '261A1BT2', mssv: '240001', status: 'Đã nộp', time: '2026-11-28 20:15', content: 'bt1_240001.pdf', attempts: 1, attemptScores: [], score: 9.0 },
        { itemCode: '261A1BT1', mssv: '240002', status: 'Đã làm', time: '2026-10-06 14:10', content: 'Đã hoàn thành 3 câu hỏi.', attempts: 1, attemptScores: [7.0], score: 7.0 },
        { itemCode: '261A1BT2', mssv: '240002', status: 'Nộp trễ', time: '2026-12-01 09:00', content: 'bt1_240002.pdf', attempts: 1, attemptScores: [], score: null },
        { itemCode: '261A1BT1', mssv: '240004', status: 'Đã làm', time: '2026-10-04 10:05', content: 'Đã hoàn thành 3 câu hỏi.', attempts: 1, attemptScores: [9.0], score: 9.0 },
        { itemCode: '261A1BT2', mssv: '240004', status: 'Đã nộp', time: '2026-11-27 16:40', content: 'bt1_240004.pdf', attempts: 1, attemptScores: [], score: 8.0 },
        { itemCode: '261A2BT1', mssv: '240001', status: 'Đã làm', time: '2026-10-18 21:00', content: 'Bài làm Quiz 1 CTDL.', attempts: 1, attemptScores: [7.5], score: 7.5 },
        { itemCode: '261A2BT1', mssv: '240002', status: 'Đã làm', time: '2026-10-19 08:30', content: 'Bài làm Quiz 1 CTDL.', attempts: 1, attemptScores: [8.0], score: 8.0 },
        { itemCode: '261A2BT2', mssv: '240002', status: 'Đã nộp', time: '2026-11-20 15:10', content: 'lab1_240002.zip', attempts: 1, attemptScores: [], score: 8.5 },
        { itemCode: '261A2BT2', mssv: '240004', status: 'Đã nộp', time: '2026-11-22 11:25', content: 'lab1_240004.zip', attempts: 1, attemptScores: [], score: null },
        { itemCode: '261A3BT1', mssv: '240004', status: 'Đã nộp', time: '2026-11-25 18:00', content: 'assignment1_240004.zip', attempts: 1, attemptScores: [], score: 9.25 },
        { itemCode: '251A1BT1', mssv: '240002', status: 'Đã làm', time: '2025-10-22 09:45', content: 'Bài làm giữa kỳ.', attempts: 1, attemptScores: [8.25], score: 8.25 },
        { itemCode: '251A1BT1', mssv: '240003', status: 'Đã làm', time: '2025-10-23 10:15', content: 'Bài làm giữa kỳ.', attempts: 1, attemptScores: [6.5], score: 6.5 },
      ],
      forums: [
        { code: '261A1FR1', classCode: '261A1' },
        { code: '261A2FR1', classCode: '261A2' },
        { code: '261A3FR1', classCode: '261A3' },
        { code: '251A1FR1', classCode: '251A1' },
      ],
      posts: [
        { code: '261A1FR1_1', forum: '261A1FR1', classCode: '261A1', title: 'Thảo luận: chuẩn hóa BCNF', content: 'Có ai đã thử tách BCNF cho bài tập 2 không? Mình bị mất phụ thuộc hàm.', time: '2026-11-19 21:40', authorAccount: 'e.vo', author: 'Võ Văn E', parent: null },
        { code: '261A1FR1_2', forum: '261A1FR1', classCode: '261A1', title: 'Hỏi về khóa ngoại trong EERD', content: 'Khi chuyển quan hệ 1-n sang lược đồ, khóa ngoại nên đặt ở phía nào?', time: '2026-11-20 10:12', authorAccount: 'c.le', author: 'Lê Văn C', parent: null },
        { code: '261A1FR1_3', forum: '261A1FR1', classCode: '261A1', title: 'Re: Hỏi về khóa ngoại trong EERD', content: 'Khóa ngoại đặt ở phía bên nhiều (n) để tránh lặp dữ liệu.', time: '2026-11-20 15:00', authorAccount: 'a.nguyen', author: 'Nguyễn Văn A', parent: '261A1FR1_2' },
        { code: '261A1FR1_4', forum: '261A1FR1', classCode: '261A1', title: 'Re: Hỏi về khóa ngoại trong EERD', content: 'Mình cũng nghĩ vậy, cảm ơn thầy.', time: '2026-11-20 16:30', authorAccount: 'd.pham', author: 'Phạm Thị D', parent: '261A1FR1_2' },
        { code: '261A2FR1_1', forum: '261A2FR1', classCode: '261A2', title: 'Tài liệu ôn tập cây AVL và Heap', content: 'Các em xem thêm ví dụ phép xoay trái/phải trước khi làm Lab 3.', time: '2026-11-18 09:00', authorAccount: 'b.tran', author: 'Trần Thị B', parent: null },
        { code: '261A2FR1_2', forum: '261A2FR1', classCode: '261A2', title: 'Re: Tài liệu ôn tập cây AVL và Heap', content: 'Cảm ơn cô, em đã nắm rõ trường hợp xoay kép LR/RL.', time: '2026-11-18 14:20', authorAccount: 'c.le', author: 'Lê Văn C', parent: '261A2FR1_1' },
        { code: '261A3FR1_1', forum: '261A3FR1', classCode: '261A3', title: 'Chia nhóm làm đồ án môn Lập trình Web', content: 'Mỗi nhóm bình luận danh sách thành viên và chủ đề dự kiến tại đây.', time: '2026-11-21 08:30', authorAccount: 'a.nguyen', author: 'Nguyễn Văn A', parent: null },
      ],
      activity: [
        ['2026-11-21 09:10', '00001', 'Tạo lớp học', '261A1'],
        ['2026-11-20 14:02', '00001', 'Khóa tài khoản (Inactive)', 'e.vo'],
        ['2026-11-18 10:45', '00001', 'Tạo người dùng', 'b.tran'],
      ],
    };
  }

  /* ---------- 2. Store & Phiên đăng nhập ---------- */
  function loadDB() {
    const raw = lsGet(STORE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.classes) && Array.isArray(parsed.admins)) {
          return parsed;
        }
      } catch (_) {}
    }
    const seed = createSeed();
    lsSet(STORE_KEY, JSON.stringify(seed));
    return seed;
  }

  let DB = loadDB();
  function saveDB() { lsSet(STORE_KEY, JSON.stringify(DB)); }
  function resetDB() { DB = createSeed(); saveDB(); }
  function logActivity(action, target) {
    const s = getSession();
    const actor = s ? s.code : '00001';
    DB.activity.unshift([nowStr(), actor, action, target]);
    if (DB.activity.length > 50) DB.activity.length = 50;
  }

  function getSession() {
    const raw = lsGet(SESSION_KEY);
    if (!raw) return null;
    try {
      const s = JSON.parse(raw);
      if (!s || !s.role || !s.account) return null;
      if (s.role === 'admin') {
        const a = DB.admins.find((x) => x.account === s.account || x.code === s.code);
        return a ? { role: 'admin', account: a.account, code: a.code, name: a.name, user: a } : null;
      }
      const u = DB.users.find((x) => x.account === s.account);
      if (!u || u.status !== 'Active') return null;
      const expectedRole = u.role === 'Giảng viên' ? 'lecturer' : 'student';
      if (expectedRole !== s.role) return null;
      return { role: expectedRole, account: u.account, code: u.code, name: u.name, user: u };
    } catch (_) {
      return null;
    }
  }

  function setSession(s) { lsSet(SESSION_KEY, JSON.stringify({ role: s.role, account: s.account, code: s.code })); }
  function clearSession() { lsDel(SESSION_KEY); }

  function authenticate(identifier, password) {
    const id = String(identifier || '').trim().toLowerCase();
    const pass = String(password || '');
    if (!id) return { ok: false, error: 'Vui lòng nhập tên tài khoản hoặc mã cán bộ.' };
    if (!pass) return { ok: false, error: 'Vui lòng nhập mật khẩu.' };

    const adm = DB.admins.find(
      (a) => a.code.toLowerCase() === id || a.account.toLowerCase() === id || a.email.toLowerCase() === id
    );
    if (adm) {
      if (adm.password !== pass) return { ok: false, error: 'Mật khẩu không chính xác.' };
      const sess = { role: 'admin', account: adm.account, code: adm.code, name: adm.name };
      setSession(sess);
      return { ok: true, session: sess };
    }

    const u = DB.users.find(
      (x) => x.account.toLowerCase() === id || x.code.toLowerCase() === id || `${x.account.toLowerCase()}@hcmut.edu.vn` === id
    );
    if (!u) return { ok: false, error: `Không tìm thấy tài khoản "${identifier}".` };
    if (u.status !== 'Active') {
      return {
        ok: false,
        error: `Tài khoản "${u.account}" (${u.name}) hiện ở trạng thái Inactive (đã bị khóa). Vui lòng liên hệ quản trị viên để mở khóa.`,
      };
    }
    if (u.password !== pass) return { ok: false, error: 'Mật khẩu không chính xác.' };
    const role = u.role === 'Giảng viên' ? 'lecturer' : 'student';
    const sess = { role, account: u.account, code: u.code, name: u.name };
    setSession(sess);
    return { ok: true, session: sess };
  }

  /* ---------- 3. Helpers & Truy vấn quan hệ ---------- */
  const CTX = { role: '', root: '', session: null, classCode: '' };
  const state = { headUsed: false, back: '', key: '', nav: '' };

  const qp = (k, d = '') => new URLSearchParams(location.search).get(k) || d;
  const subjectOf = (c) => DB.subjects.find((s) => s.code === c) || { code: c, name: c, khoa: '', admins: [] };
  const khoaOf = (c) => DB.khoa.find((k) => k.code === c) || { code: c, name: c };
  const teacherOf = (c) => DB.users.find((u) => u.role === 'Giảng viên' && u.code === c) || { code: c, name: 'Chưa phân công', account: '' };
  const studentOf = (mssv) => DB.users.find((u) => u.role === 'Sinh viên' && u.code === mssv);
  const classOf = (c) => DB.classes.find((x) => x.code === c);
  const fmt = (v) => (v == null || v === '' ? '—' : Number(v).toFixed(2));
  const avgOf = (arr) => {
    const v = arr.filter((x) => x != null && !Number.isNaN(Number(x))).map(Number);
    return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(2) : '—';
  };
  const code = (c) => `<span class="code">${esc(c)}</span>`;

  function myClasses() {
    const s = CTX.session;
    if (!s) return [];
    if (s.role === 'student') return DB.classes.filter((c) => c.studentCodes.includes(s.code));
    if (s.role === 'lecturer') return DB.classes.filter((c) => c.teacherCode === s.code);
    return DB.classes;
  }

  function resolveCurrentClass() {
    const requested = qp('c', '');
    const mine = myClasses();
    if (requested) {
      const found = mine.find((c) => c.code === requested);
      if (found) return { cls: found, denied: false };
      return { cls: null, denied: true, requested };
    }
    return { cls: mine[0] || null, denied: false };
  }

  function cur() { return classOf(CTX.classCode) || myClasses()[0] || null; }
  function withClass(href, clsCode = CTX.classCode) {
    if (!clsCode) return href;
    return `${href}${href.includes('?') ? '&' : '?'}c=${encodeURIComponent(clsCode)}`;
  }

  const classItems = (cc) => DB.items.filter((i) => i.classCode === cc);
  const classMaterials = (cc) => DB.materials.filter((m) => m.classCode === cc);
  const classAnnouncements = (cc) => DB.announcements.filter((a) => a.classCode === cc);
  const classForums = (cc) => DB.forums.filter((f) => f.classCode === cc);
  const classPosts = (cc) => DB.posts.filter((p) => p.classCode === cc);
  const classStudents = (cls) => (cls ? cls.studentCodes : []).map((mssv) => studentOf(mssv)).filter(Boolean);

  function getRecord(item, mssv) {
    const r = DB.records.find((x) => x.itemCode === item.code && x.mssv === mssv);
    if (r) return r;
    return {
      itemCode: item.code, mssv,
      status: item.kind === 'Quiz' ? 'Chưa làm' : 'Chưa nộp',
      time: null, content: null, attempts: 0, attemptScores: [], score: null,
    };
  }

  function upsertRecord(itemCode, mssv, patch) {
    let r = DB.records.find((x) => x.itemCode === itemCode && x.mssv === mssv);
    if (!r) {
      r = { itemCode, mssv, status: 'Chưa nộp', time: null, content: null, attempts: 0, attemptScores: [], score: null };
      DB.records.push(r);
    }
    Object.assign(r, patch);
    return r;
  }

  function computeQuizScore(scoring, scores) {
    if (!scores || !scores.length) return null;
    if (scoring === 'Trung bình') return Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2));
    return Number(Math.max(...scores).toFixed(2));
  }

  function studentClassAvg(classCode, mssv) {
    return avgOf(classItems(classCode).map((it) => getRecord(it, mssv).score));
  }

  function nextSeq(prefix, existingCodes) {
    let max = 0;
    const re = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\d+)$`);
    existingCodes.forEach((c) => {
      const m = re.exec(c);
      if (m) max = Math.max(max, Number(m[1]));
    });
    return `${prefix}${max + 1}`;
  }

  function sortClasses(arr, mode) {
    const copy = arr.slice();
    if (mode === 'name') {
      return copy.sort((a, b) => subjectOf(a.subject).name.localeCompare(subjectOf(b.subject).name, 'vi'));
    }
    if (mode === 'code') {
      return copy.sort((a, b) => a.code.localeCompare(b.code));
    }
    return copy.sort((a, b) => b.term.localeCompare(a.term) || a.code.localeCompare(b.code));
  }

  /* ---------- 4. Helper dựng giao diện chuẩn BK-LMS ---------- */
  const btnCls = (cls) => {
    const t = String(cls).split(/\s+/).filter(Boolean);
    const sz = t.includes('sm') ? ' btn-sm' : '';
    if (t.includes('teal')) return 'btn btn-teal' + sz;
    if (t.includes('primary')) return 'btn btn-primary' + sz;
    if (t.includes('sm')) return 'btn btn-link btn-sm px-1' + (t.includes('danger') ? ' text-danger' : '');
    if (t.includes('danger')) return 'btn btn-outline-danger';
    return 'btn btn-secondary';
  };
  const badge = (t, k = 'bg-secondary') => `<span class="badge ${k}">${esc(t)}</span>`;
  const sbadge = (s) => {
    const ok = ['Active', 'Đang mở', 'Đã nộp', 'Đã làm', 'Đã chấm điểm'];
    const warn = ['Inactive', 'Chưa nộp', 'Chưa làm', 'Chưa chấm điểm'];
    return badge(s, ok.includes(s) ? 'bg-success' : warn.includes(s) ? 'bg-warning text-dark' : s === 'Nộp trễ' ? 'bg-danger' : 'bg-secondary');
  };

  const ROLES = {
    admin: {
      label: 'Quản trị viên',
      home: 'admin/dashboard.html',
      nav: [
        ['Bảng điều khiển', 'dashboard.html', 'dashboard'],
        ['Môn học & khoa', 'subjects.html', 'subjects'],
        ['Lớp học', 'courses.html', 'courses'],
        ['Tạo lớp học', 'course-create.html', 'course-create'],
        ['Người dùng', 'users.html', 'users'],
        ['Tạo người dùng', 'user-create.html', 'user-create'],
      ],
    },
    student: {
      label: 'Sinh viên',
      home: 'student/courses.html',
      nav: [
        ['Các khoá học của tôi', 'courses.html', 'courses'],
        ['Hồ sơ cá nhân', 'profile.html', 'profile'],
      ],
    },
    lecturer: {
      label: 'Giảng viên',
      home: 'lecturer/courses.html',
      nav: [['Các lớp đang dạy', 'courses.html', 'courses']],
    },
  };

  const COURSE_TABS = {
    student: [
      ['Khoá học', 'course.html', 'course'],
      ['Học liệu', 'materials.html', 'materials'],
      ['Thông báo', 'announcements.html', 'announcements'],
      ['Bài tập & Quiz', 'quizzes.html', 'quizzes'],
      ['Điểm số', 'grades.html', 'grades'],
      ['Diễn đàn', 'forum.html', 'forum'],
    ],
    lecturer: [
      ['Khoá học', 'course.html', 'course'],
      ['Thành viên', 'members.html', 'members'],
      ['Học liệu & thông báo', 'materials.html', 'materials'],
      ['Bài tập & Quiz', 'assignments.html', 'assignments'],
      ['Chấm điểm', 'submissions.html', 'submissions'],
      ['Bảng điểm', 'gradebook.html', 'gradebook'],
      ['Diễn đàn', 'forum.html', 'forum'],
    ],
  };

  const SITEMAP = [
    ['Quản trị viên', 'admin', [
      ['dashboard', 'Bảng điều khiển'], ['subjects', 'Môn học & khoa'], ['subject-create', 'Tạo / sửa môn học'],
      ['courses', 'Danh sách lớp học'], ['course-create', 'Tạo lớp học (2 bước)'], ['course-edit', 'Sửa lớp học'],
      ['users', 'Quản lý người dùng'], ['user-create', 'Tạo người dùng'], ['user-edit', 'Sửa người dùng'],
    ]],
    ['Sinh viên', 'student', [
      ['courses', 'Các khoá học của tôi'], ['course', 'Trang lớp học'], ['materials', 'Học liệu'],
      ['announcements', 'Thông báo'], ['quizzes', 'Bài tập & Quiz'], ['quiz-intro', 'Chi tiết quiz'], ['quiz', 'Làm bài quiz'],
      ['submit', 'Nộp bài tập'], ['submit-success', 'Nộp bài thành công'], ['grades', 'Điểm số'],
      ['forum', 'Diễn đàn'], ['forum-post', 'Chi tiết bài viết'], ['forum-post-edit', 'Sửa bài đăng'], ['profile', 'Hồ sơ cá nhân'],
    ]],
    ['Giảng viên', 'lecturer', [
      ['courses', 'Các lớp đang dạy'], ['course', 'Trang lớp học'], ['members', 'Thành viên lớp'],
      ['materials', 'Học liệu & thông báo'], ['material-form', 'Tạo / sửa học liệu & thông báo'],
      ['assignments', 'Bài tập & Quiz'], ['assignment-form', 'Tạo / sửa bài tập & quiz'],
      ['submissions', 'Chấm điểm bài nộp'], ['gradebook', 'Bảng điểm lớp'], ['grade-detail', 'Chi tiết điểm sinh viên'],
      ['forum', 'Diễn đàn (tạo forum)'], ['forum-post', 'Chi tiết bài viết'], ['forum-post-edit', 'Sửa bài đăng'],
    ]],
  ];

  // Breadcrumb mũi tên xanh kiểu BK-LMS
  const breadcrumb = (title, extraCrumbs = []) => {
    const role = CTX.role;
    if (!role || !ROLES[role]) return '';
    const home = role === 'admin' ? 'dashboard.html' : 'courses.html';
    const items = [[ROLES[role].label, home]];
    const inCourse = COURSE_TABS[role] && state.nav === 'courses' && state.key !== 'courses';
    const c = cur();
    if (inCourse && c) {
      const s = subjectOf(c.subject);
      const courseTitle = `${s.name} (${s.code}) [${c.code}]`;
      if (title !== courseTitle) items.push([`${c.code} · ${s.code}`, withClass('course.html', c.code)]);
    }
    extraCrumbs.forEach((ec) => items.push(ec));
    const plainTitle = String(title).replace(/<[^>]*>/g, '').trim();
    const lis = items.map(([t, h]) => `<li><a href="${h}">${esc(t)}</a></li>`).join('');
    return `<nav aria-label="Đường dẫn"><ol class="bk-breadcrumb">${lis}<li class="active" aria-current="page">${esc(plainTitle)}</li></ol></nav>`;
  };

  const head = (title, sub = '', actions = '', extraCrumbs = []) => {
    if (state.headUsed) {
      return `<div class="d-flex flex-wrap align-items-center mb-2 gap-2"><h2 class="h3 me-auto mb-0">${title}</h2>${actions ? `<div class="d-flex gap-2 flex-wrap">${actions}</div>` : ''}</div>${sub ? `<div class="text-muted mb-3">${sub}</div>` : ''}`;
    }
    state.headUsed = true;
    const back = state.back;
    state.back = '';
    return `<header id="page-header" class="header-maxwidth d-print-none"><div class="w-100">
      <div class="d-flex flex-wrap"><div id="page-navbar">${breadcrumb(title, extraCrumbs)}</div></div>
      <div class="d-flex flex-wrap align-items-center gap-2"><div class="me-auto d-flex flex-column">
        <div class="page-context-header d-flex flex-wrap align-items-center mb-1"><div class="page-header-headings"><h1 class="h2 mb-0">${title}</h1></div></div>
        ${sub ? `<div class="text-muted">${sub}</div>` : ''}${back}
      </div><div class="header-actions-container ms-auto d-flex gap-2 flex-wrap">${actions}</div></div></div></header><!--hdr-end-->`;
  };

  const card = (html, extra = '') => `<div class="card mb-3 ${extra}"><div class="card-body">${html}</div></div>`;
  const isScoreCol = (heads, rows, i) => {
    const txt = (c) => String(c).replace(/<[^>]*>/g, '').trim();
    if (/^(Điểm|Sĩ số|Số sinh viên|Số lần|Phản hồi|Số môn|Phần trăm)/.test(txt(heads[i]))) return true;
    const cells = rows.map((r) => txt(Array.isArray(r) ? r[i] : r.cells[i]));
    return cells.length > 0 && cells.every((c) => /^\d+\.\d{2}$|^—$/.test(c)) && cells.some((c) => c !== '—');
  };
  const table = (heads, rows, opts = {}) => {
    const num = heads.map((_, i) => isScoreCol(heads, rows, i));
    const idAttr = opts.id ? ` id="${opts.id}"` : '';
    const emptyText = opts.empty || 'Chưa có dữ liệu.';
    const body = rows.length
      ? rows
          .map((r) => {
            const cells = Array.isArray(r) ? r : r.cells;
            const attrs = Array.isArray(r) ? '' : r.attrs || '';
            return `<tr${attrs}>${cells
              .map((c, i) => `<td class="cell${num[i] ? ' text-end' : ''}${String(c).replace(/<[^>]*>/g, '').length <= 14 ? ' nowrap' : ''}">${c}</td>`)
              .join('')}</tr>`;
          })
          .join('')
      : `<tr><td colspan="${heads.length}" class="text-muted py-3">${esc(emptyText)}</td></tr>`;
    return `<div class="table-responsive"><table class="generaltable table table-hover"${idAttr}><thead><tr>${heads
      .map((h, i) => `<th class="header${num[i] ? ' text-end' : ''}" scope="col">${h}</th>`)
      .join('')}</tr></thead><tbody>${body}</tbody></table></div>`;
  };

  const meta = (pairs) => `<dl class="meta">${pairs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
  const btn = (label, cls = '', href = '') =>
    href ? `<a class="${btnCls(cls)}" href="${href}">${label}</a>` : `<button class="${btnCls(cls)}" type="button">${label}</button>`;
  const stat = (label, value) => `<div class="kv"><span>${label}</span><strong>${value}</strong></div>`;
  const statTile = (label, value) => `<div class="stat-tile"><span>${label}</span><strong>${value}</strong></div>`;
  const list = (items, empty = 'Chưa có mục nào.') =>
    items.length
      ? `<ul class="list-group list-group-flush">${items.map((i) => `<li class="list-group-item px-0">${i}</li>`).join('')}</ul>`
      : `<p class="text-muted mb-0">${esc(empty)}</p>`;
  const field = (label, control, hint = '') =>
    `<div class="mb-3 row fitem"><div class="col-md-3 col-form-label d-flex pb-0 pe-md-0"><label class="d-inline word-break">${label}</label></div><div class="col-md-9 felement">${control}${hint ? `<div class="form-text">${hint}</div>` : ''}</div></div>`;
  const backLink = (href, label) => `<div class="mt-2"><a href="${href}">← Quay lại: ${label}</a></div>`;
  const crumb = (href, label) => {
    if (!state.headUsed) { state.back = backLink(href, label); return ''; }
    return backLink(href, label);
  };

  const courseHead = () => {
    const c = cur();
    const s = subjectOf(c.subject);
    const t = teacherOf(c.teacherCode);
    return head(
      `${s.name} (${s.code}) [${c.code}]`,
      meta([
        ['Mã lớp', code(c.code)],
        ['Học kỳ', esc(c.term)],
        ['Giảng viên', esc(t.name)],
        ['Sĩ số', c.studentCodes.length],
      ])
    );
  };

  const tabs = (active) => {
    const c = cur();
    return `<div class="secondary-navigation d-print-none"><div class="secondarynav-tabbar navigation"><nav class="moremenu navigation"><ul class="nav more-nav nav-tabs">${COURSE_TABS[CTX.role]
      .map(([l, f, k]) => `<li class="nav-item"><a class="nav-link${k === active ? ' active' : ''}" href="${withClass(f, c ? c.code : '')}">${l}</a></li>`)
      .join('')}</ul></nav></div></div><!--nav-end-->`;
  };

  // Ngăn Mục lục khóa học (Course Index Drawer) kiểu BK-LMS
  function renderCourseDrawer() {
    const c = cur();
    if (!c || (CTX.role !== 'student' && CTX.role !== 'lecturer')) return '';
    const isLect = CTX.role === 'lecturer';
    const anns = classAnnouncements(c.code);
    const mats = classMaterials(c.code);
    const items = classItems(c.code);
    const forums = classForums(c.code);
    return `<button class="bk-drawer-btn" type="button" data-drawer-open title="Mở chỉ mục khóa học" aria-label="Mở chỉ mục khóa học">${ICONS.menu}</button>
      <div class="bk-drawer-backdrop hidden" id="bk-drawer-backdrop" data-drawer-close></div>
      <aside class="bk-drawer hidden" id="bk-drawer" aria-label="Chỉ mục khóa học">
        <div class="bk-drawer-head">
          <span>Chỉ mục ${esc(c.code)}</span>
          <button class="btn btn-link btn-sm p-0" type="button" data-drawer-close>Đóng ✕</button>
        </div>
        <div class="bk-drawer-body">
          <div class="bk-drawer-group">
            <div class="bk-drawer-group-title">Thông báo (${anns.length})</div>
            ${anns.length
              ? anns.map((a) => `<a class="bk-drawer-link" href="${withClass(isLect ? 'materials.html' : 'announcements.html', c.code)}">• ${esc(a.title)}</a>`).join('')
              : '<div class="muted px-2">Chưa có thông báo</div>'}
          </div>
          <div class="bk-drawer-group">
            <div class="bk-drawer-group-title">Học liệu (${mats.length})</div>
            ${mats.length
              ? mats.map((m) => `<a class="bk-drawer-link" href="${withClass('materials.html', c.code)}">• ${esc(m.name)}</a>`).join('')
              : '<div class="muted px-2">Chưa có học liệu</div>'}
          </div>
          <div class="bk-drawer-group">
            <div class="bk-drawer-group-title">Bài tập & Quiz (${items.length})</div>
            ${items.length
              ? items.map((it) => {
                  const target = isLect
                    ? withClass('submissions.html?i=' + encodeURIComponent(it.code), c.code)
                    : withClass((it.kind === 'Quiz' ? 'quiz-intro.html?i=' : 'submit.html?i=') + encodeURIComponent(it.code), c.code);
                  return `<a class="bk-drawer-link" href="${target}">• ${esc(it.name)}</a>`;
                }).join('')
              : '<div class="muted px-2">Chưa có bài tập</div>'}
          </div>
          <div class="bk-drawer-group">
            <div class="bk-drawer-group-title">Diễn đàn (${forums.length})</div>
            ${forums.map((f) => `<a class="bk-drawer-link" href="${withClass('forum.html?f=' + encodeURIComponent(f.code), c.code)}">• Diễn đàn ${esc(f.code)}</a>`).join('')}
          </div>
        </div>
      </aside>`;
  }

  // Thông báo nhanh trên chuông navbar theo từng vai trò
  function buildNotifications() {
    const s = CTX.session;
    if (!s) return [];
    const out = [];
    if (s.role === 'student') {
      const classes = myClasses();
      classes.forEach((c) => {
        classItems(c.code).forEach((it) => {
          const rec = getRecord(it, s.code);
          if (rec.status === 'Chưa nộp' || rec.status === 'Chưa làm') {
            out.push({
              title: `${it.name} (${c.code})`,
              sub: `Hạn nộp: ${it.deadline} · ${rec.status}`,
              href: `${CTX.root}student/${withClass((it.kind === 'Quiz' ? 'quiz-intro.html?i=' : 'submit.html?i=') + encodeURIComponent(it.code), c.code)}`,
            });
          }
        });
        classAnnouncements(c.code).slice(0, 1).forEach((a) => {
          out.push({
            title: `Thông báo: ${a.title} (${c.code})`,
            sub: a.content.slice(0, 68),
            href: `${CTX.root}student/${withClass('announcements.html', c.code)}`,
          });
        });
      });
    } else if (s.role === 'lecturer') {
      myClasses().forEach((c) => {
        classItems(c.code).forEach((it) => {
          const pending = classStudents(c).filter((st) => {
            const rec = getRecord(it, st.code);
            return rec.status !== 'Chưa nộp' && rec.status !== 'Chưa làm' && rec.score == null;
          });
          if (pending.length) {
            out.push({
              title: `${pending.length} bài chờ chấm — ${it.name}`,
              sub: `Lớp ${c.code} · Bấm để chấm điểm`,
              href: `${CTX.root}lecturer/${withClass('submissions.html?i=' + encodeURIComponent(it.code), c.code)}`,
            });
          }
        });
      });
    } else if (s.role === 'admin') {
      DB.activity.slice(0, 5).forEach(([time, actor, act, obj]) => {
        out.push({
          title: `${act}: ${obj}`,
          sub: `${time} · Mã cán bộ ${actor}`,
          href: `${CTX.root}admin/dashboard.html`,
        });
      });
    }
    return out;
  }

  /* ---------- 5. Đăng nhập & Diễn đàn dùng chung ---------- */
  function renderLoginView() {
    const existing = getSession();
    const nextUrl = qp('next', '');
    const err = qp('err', '');
    const existingBanner = existing
      ? `<div class="alert alert-info d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <span>Bạn đang đăng nhập với tài khoản <strong>${esc(existing.name)}</strong> (${esc(ROLES[existing.role].label)}).</span>
          <span class="d-flex gap-2">
            <a class="btn btn-primary btn-sm" href="${CTX.root}${ROLES[existing.role].home}">Vào trang chủ</a>
            <button class="btn btn-secondary btn-sm" type="button" data-logout>Đăng xuất</button>
          </span>
        </div>`
      : '';

    const demoRows = [
      ...DB.admins.map((a) => ({
        role: 'Quản trị viên', user: a.code, pass: a.password, name: a.name, status: a.status,
        note: 'Quản lý Khoa, Môn học, Lớp học, Tài khoản',
      })),
      ...DB.users.map((u) => {
        const clsList =
          u.role === 'Giảng viên'
            ? DB.classes.filter((c) => c.teacherCode === u.code).map((c) => c.code)
            : DB.classes.filter((c) => c.studentCodes.includes(u.code)).map((c) => c.code);
        const note =
          u.status !== 'Active'
            ? 'Tài khoản bị khóa — dùng để test chặn đăng nhập'
            : clsList.length
            ? `${u.role === 'Giảng viên' ? 'Phụ trách' : 'Đang học'}: ${clsList.join(', ')}`
            : 'Chưa có lớp học';
        return { role: u.role, user: u.account, pass: u.password, name: `${u.name} (${u.code})`, status: u.status, note };
      }),
    ];

    return `<div class="login-shell">
      ${existingBanner}
      <div class="login-box">
        <div class="login-logo-wrap">${brandImg('login-logo-img', 'BK-LMS')}</div>
        <h1>Đăng nhập hệ thống BK-LMS</h1>
        <p class="muted text-center mb-3">Nhập tên tài khoản (sinh viên, giảng viên) hoặc mã cán bộ (quản trị viên). Hệ thống tự nhận diện vai trò.</p>
        <div id="login-error" class="alert alert-danger${err ? '' : ' hidden'}" role="alert">${esc(err)}</div>
        <form data-login data-next="${esc(nextUrl)}">
          <div class="mb-3">
            <label class="form-label fw-medium" for="login-user">Tên tài khoản / Mã cán bộ</label>
            <input id="login-user" name="user" autocomplete="username" placeholder="VD: c.le, a.nguyen hoặc 00001" required>
          </div>
          <div class="mb-3">
            <label class="form-label fw-medium" for="login-pass">Mật khẩu</label>
            <input id="login-pass" type="password" name="pass" autocomplete="current-password" placeholder="Nhập mật khẩu" required>
          </div>
          <button class="btn primary" type="submit" style="width:100%">Đăng nhập</button>
        </form>
      </div>

      <section class="demo-panel">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
          <div>
            <h2 class="mb-0" style="border:0;padding:0">Tài khoản đăng nhập mẫu</h2>
            <div class="muted">Chọn <strong>Điền nhanh</strong> để điền sẵn thông tin hoặc <strong>Vào ngay</strong> để vào thẳng từng vai trò.</div>
          </div>
          <button class="btn btn-secondary btn-sm" type="button" data-reset-demo>Khôi phục dữ liệu mẫu</button>
        </div>
        ${table(
          ['Vai trò', 'Tài khoản', 'Mật khẩu', 'Họ tên', 'Trạng thái', 'Phạm vi', 'Thao tác'],
          demoRows.map((d) => [
            esc(d.role), code(d.user), code(d.pass), esc(d.name), sbadge(d.status),
            `<span class="muted">${esc(d.note)}</span>`,
            `<button class="btn btn-link btn-sm px-1" type="button" data-demo-fill="${esc(d.user)}" data-demo-pass="${esc(d.pass)}">Điền nhanh</button> ` +
              `<button class="btn btn-link btn-sm px-1" type="button" data-demo-login="${esc(d.user)}" data-demo-pass="${esc(d.pass)}">Vào ngay</button>`,
          ])
        )}
      </section>
    </div>`;
  }

  function forumPage() {
    const c = cur();
    const lect = CTX.role === 'lecturer';
    const forums = classForums(c.code);
    const activeForum = qp('f', forums[0] ? forums[0].code : '');
    const roots = classPosts(c.code).filter((p) => !p.parent && (!activeForum || p.forum === activeForum));

    return (
      courseHead() +
      tabs('forum') +
      head(
        `${actIcon('forum')} Diễn đàn thảo luận`,
        meta([['Forum đang xem', activeForum ? code(activeForum) : 'Chưa có'], ['Số diễn đàn', forums.length], ['Chủ đề', roots.length]])
      ) +
      `<div class="bk-info-box"><div class="muted">Các thành viên lớp ${code(c.code)} trao đổi câu hỏi về bài giảng, bài tập và bài tập lớn tại đây.</div></div>` +
      `<div class="filter-bar">
        <input data-filter-q="#tbl-forum-posts" placeholder="Tìm kiếm chủ đề thảo luận...">
        ${forums.length > 1
          ? `<select data-nav-select="${withClass('forum.html', c.code)}" data-nav-param="f">${forums
              .map((f) => `<option value="${esc(f.code)}"${f.code === activeForum ? ' selected' : ''}>Forum ${esc(f.code)}</option>`)
              .join('')}</select>`
          : ''}
        ${activeForum ? '<button class="btn btn-teal" type="button" data-show="#new-thread">Thêm một chủ đề thảo luận mới</button>' : ''}
        ${lect ? `<button class="btn btn-primary" type="button" data-create-forum="${esc(c.code)}">Tạo forum mới</button>` : ''}
      </div>` +
      (activeForum
        ? `<section class="card hidden" id="new-thread"><div class="card-body"><h2>Đăng chủ đề mới vào ${code(activeForum)}</h2><form id="form-new-thread" data-class="${esc(c.code)}" data-forum="${esc(activeForum)}">
            ${field('Tiêu đề', '<input name="title" required placeholder="Nhập tiêu đề thảo luận">')}
            ${field('Nội dung', '<textarea name="content" rows="4" required placeholder="Nội dung bài viết..."></textarea>', 'Văn bản, file hoặc hình ảnh')}
            ${field('Đính kèm', '<input type="file" name="file">')}
            <div class="form-actions"><button class="btn" type="button" data-hide="#new-thread">Hủy</button><button class="btn primary" type="submit">Đăng chủ đề</button></div>
          </form></div></section>`
        : '') +
      (roots.length
        ? card(
            table(
              ['Mã bài viết', 'Chủ đề thảo luận', 'Tác giả', 'Phản hồi', 'Thời gian đăng', ...(lect ? ['Thao tác'] : [])],
              roots.map((p) => {
                const replyCount = DB.posts.filter((x) => x.parent === p.code).length;
                const cells = [
                  code(p.code),
                  `<a class="fw-medium" href="${withClass('forum-post.html?p=' + encodeURIComponent(p.code), c.code)}">${esc(p.title)}</a>`,
                  esc(p.author),
                  replyCount,
                  p.time,
                ];
                if (lect) cells.push(`<button class="btn btn-link btn-sm px-1 text-danger" type="button" data-delete-post="${esc(p.code)}">Xóa</button>`);
                return { attrs: ` data-search="${esc(`${p.code} ${p.title} ${p.author}`.toLowerCase())}"`, cells };
              }),
              { id: 'tbl-forum-posts' }
            )
          )
        : '<div class="bk-info-banner">Chưa có chủ đề thảo luận nào trong diễn đàn này.</div>')
    );
  }

  function forumPostPage() {
    const c = cur();
    const postsInClass = classPosts(c.code);
    const roots = postsInClass.filter((p) => !p.parent);
    const pCode = qp('p', roots[0] ? roots[0].code : '');
    const root = postsInClass.find((p) => p.code === pCode) || roots[0];
    if (!root) {
      return courseHead() + tabs('forum') + crumb(withClass('forum.html', c.code), 'Diễn đàn') + card('<p class="empty-state">Không tìm thấy bài viết này trong lớp học.</p>');
    }
    const replies = postsInClass.filter((p) => p.parent === root.code);
    const ownAcc = CTX.session.account;
    const isLect = CTX.role === 'lecturer';
    const editLink = (p) =>
      p.authorAccount === ownAcc ? ` · <a href="${withClass('forum-post-edit.html?p=' + encodeURIComponent(p.code), c.code)}">Chỉnh sửa</a>` : '';
    const delLink = (p) =>
      isLect ? ` · <button class="btn btn-link btn-sm px-0 text-danger" type="button" data-delete-post="${esc(p.code)}">Xóa</button>` : '';

    return (
      head(
        `${actIcon('forum')} ${esc(root.title)}`,
        meta([['Mã', code(root.code)], ['Forum', code(root.forum)], ['Tác giả', esc(root.author)], ['Đăng lúc', root.time]]),
        (root.authorAccount === ownAcc ? btn('Chỉnh sửa bài viết', '', withClass('forum-post-edit.html?p=' + encodeURIComponent(root.code), c.code)) : '') +
          (isLect ? `<button class="btn btn-outline-danger" type="button" data-delete-post="${esc(root.code)}" data-after="${esc(withClass('forum.html', c.code))}">Xóa chủ đề</button>` : ''),
        [['Diễn đàn', withClass('forum.html?f=' + encodeURIComponent(root.forum), c.code)]]
      ) +
      card(
        `<div class="d-flex align-items-center gap-2 mb-2 pb-2 border-bottom">
          ${brandImg('profile-avatar-img xs', root.author)}
          <div><strong>${esc(root.author)}</strong><div class="muted" style="font-size:.78rem">Đăng lúc ${root.time}</div></div>
        </div>
        <p class="mb-0" style="white-space:pre-wrap">${esc(root.content)}</p>`
      ) +
      card(
        `<h2>Phản hồi (${replies.length})</h2>` +
          (replies.length
            ? replies
                .map(
                  (r) =>
                    `<div class="post"><div class="d-flex align-items-start gap-2">${brandImg('profile-avatar-img xs', r.author)}<div class="flex-grow-1"><strong>${esc(r.title)}</strong> ${code(r.code)}<div class="muted">${esc(r.author)} đăng lúc ${r.time}${editLink(r)}${delLink(r)}</div><p class="mb-0 mt-1" style="white-space:pre-wrap">${esc(r.content)}</p></div></div></div>`
                )
                .join('')
            : '<p class="text-muted mb-0">Chưa có phản hồi nào.</p>')
      ) +
      card(
        `<h2>Trả lời thảo luận</h2><form id="form-reply" data-class="${esc(c.code)}" data-forum="${esc(root.forum)}" data-parent="${esc(root.code)}">
          ${field('Tiêu đề', `<input name="title" required value="Re: ${esc(root.title)}">`)}
          ${field('Nội dung', '<textarea name="content" rows="3" required placeholder="Nhập nội dung phản hồi..."></textarea>', 'Văn bản, file hoặc hình ảnh')}
          <div class="form-actions"><button class="btn primary" type="submit">Gửi phản hồi</button></div>
        </form>`
      )
    );
  }

  function forumPostEditPage() {
    const c = cur();
    const p = classPosts(c.code).find((x) => x.code === qp('p', ''));
    if (!p) return courseHead() + tabs('forum') + card('<p class="empty-state">Không tìm thấy bài viết cần sửa.</p>');
    const targetPost = p.parent || p.code;
    const backHref = withClass('forum-post.html?p=' + encodeURIComponent(targetPost), c.code);
    if (p.authorAccount !== CTX.session.account) {
      return head('Chỉnh sửa bài viết', '', '', [['Diễn đàn', withClass('forum.html', c.code)]]) +
        card('<div class="alert alert-warning mb-0">Bạn chỉ được phép chỉnh sửa bài viết do chính mình đăng.</div>');
    }
    return (
      head('Chỉnh sửa bài viết', meta([['Mã', code(p.code)], ['Đăng lúc', p.time]]), '', [['Diễn đàn', withClass('forum.html', c.code)], ['Bài viết', backHref]]) +
      card(
        `<form id="form-edit-post" data-code="${esc(p.code)}" data-back="${esc(backHref)}">
          ${field('Tiêu đề', `<input name="title" required value="${esc(p.title)}">`)}
          ${field('Nội dung', `<textarea name="content" rows="4" required>${esc(p.content)}</textarea>`, 'Văn bản, file hoặc hình ảnh')}
          ${field('Đính kèm', '<input type="file" name="file">')}
          <div class="form-actions"><a class="btn" href="${backHref}">Hủy</a><button class="btn primary" type="submit">Lưu thay đổi</button></div>
        </form>`
      )
    );
  }

  /* ---------- 6. Các trang theo vai trò ---------- */
  const PAGES = {
    index: { public: true, render: renderLoginView },
    login: { public: true, render: renderLoginView },
    sitemap: {
      public: true,
      render: () => {
        const s = getSession();
        return (
          head(
            'Sơ đồ trang (Chế độ nhà phát triển)',
            s
              ? `Đang đăng nhập: <strong>${esc(s.name)}</strong> (${esc(ROLES[s.role].label)}). Lưu ý: mở trang khác vai trò đang đăng nhập sẽ kích hoạt màn hình chặn phân quyền.`
              : 'Chưa đăng nhập. Hãy đăng nhập ở trang Đăng nhập trước khi kiểm thử các trang theo vai trò.',
            btn('Trang đăng nhập', 'primary', 'login.html')
          ) +
          `<div class="grid-3">${SITEMAP.map(([label, role, items]) =>
            card(`<h2>${label} (${items.length})</h2>` + list(items.map(([f, t]) => `<a href="${role}/${f}.html">${t}</a>`)))
          ).join('')}</div>`
        );
      },
    },

    /* ==================== QUẢN TRỊ VIÊN ==================== */
    'admin/dashboard': {
      nav: 'dashboard',
      render: () =>
        head('Bảng điều khiển quản trị', `<span class="d-inline-flex align-items-center gap-2 mt-1">${brandImg('profile-avatar-img xs', CTX.session.name)}<span>Xin chào, <strong>${esc(CTX.session.name)}</strong> (${code(CTX.session.code)})</span></span>`, btn('Tạo lớp học', 'primary', 'course-create.html') + btn('Tạo người dùng', 'teal', 'user-create.html')) +
        `<div class="stats-grid">
          ${statTile('Khoa đào tạo', DB.khoa.length)}
          ${statTile('Môn học', DB.subjects.length)}
          ${statTile('Lớp học phần', DB.classes.length)}
          ${statTile('Giảng viên', DB.users.filter((u) => u.role === 'Giảng viên').length)}
          ${statTile('Sinh viên', DB.users.filter((u) => u.role === 'Sinh viên').length)}
          ${statTile('Tài khoản bị khóa', DB.users.filter((u) => u.status === 'Inactive').length)}
        </div>` +
        `<div class="grid-2">` +
          card(
            '<h2>Quản lý danh mục & tài khoản</h2>' +
              list([
                '<a class="fw-medium" href="courses.html">Quản lý Lớp học</a> — xem, lọc học kỳ, tạo mới 2 bước, phân công giảng viên và sinh viên',
                '<a class="fw-medium" href="users.html">Quản lý Người dùng</a> — tạo tài khoản, chỉnh sửa, khóa/mở khóa (Active/Inactive)',
                '<a class="fw-medium" href="subjects.html">Quản lý Môn học & Khoa</a> — thêm khoa, tạo và cập nhật môn học',
              ])
          ) +
          card('<h2>Hoạt động quản trị gần đây</h2>' + table(['Thời gian', 'Mã CB', 'Hành động', 'Đối tượng'], DB.activity.slice(0, 8))) +
        `</div>`,
    },

    'admin/subjects': {
      nav: 'subjects',
      render: () =>
        head(
          'Môn học & khoa',
          'Mỗi môn học thuộc đúng một khoa và do ít nhất một quản trị viên quản lý',
          btn('Tạo môn học', 'primary', 'subject-create.html') + '<button class="btn btn-teal" type="button" data-show="#new-khoa">+ Thêm khoa</button>'
        ) +
        `<section class="card hidden" id="new-khoa"><div class="card-body"><h2>Thêm khoa mới</h2><form id="form-new-khoa"><div class="form-grid">
          ${field('Mã khoa', '<input name="code" placeholder="VD: CK" pattern="[A-Z]{2}" required>', 'Viết tắt 2 chữ cái in hoa (MT, UD, CK...)')}
          ${field('Tên khoa', '<input name="name" placeholder="Tên khoa" required>')}
        </div><div class="form-actions"><button class="btn" type="button" data-hide="#new-khoa">Hủy</button><button class="btn primary" type="submit">Lưu khoa</button></div></form></div></section>` +
        card(
          '<h2>Danh sách môn học</h2>' +
            table(
              ['Mã môn', 'Tên môn', 'Khoa', 'Quản trị viên quản lý', 'Thao tác'],
              DB.subjects.map((s) => [
                code(s.code), esc(s.name), esc(khoaOf(s.khoa).name), s.admins.join(', '),
                btn('Sửa', 'sm', 'subject-create.html?mode=edit&s=' + encodeURIComponent(s.code)) +
                  ' ' +
                  `<button class="btn btn-link btn-sm px-1 text-danger" type="button" data-delete-subject="${esc(s.code)}">Xóa</button>`,
              ])
            )
        ) +
        card(
          '<h2>Danh sách khoa</h2>' +
            table(['Mã khoa', 'Tên khoa', 'Số môn học'], DB.khoa.map((k) => [code(k.code), esc(k.name), DB.subjects.filter((s) => s.khoa === k.code).length]))
        ),
    },

    'admin/subject-create': {
      nav: 'subjects',
      render: () => {
        const edit = qp('mode') === 'edit';
        const sub = edit ? DB.subjects.find((x) => x.code === qp('s')) : null;
        return (
          head(edit && sub ? `Chỉnh sửa môn học ${sub.code}` : 'Tạo môn học', '', '', [['Môn học & khoa', 'subjects.html']]) +
          card(
            `<form id="form-subject" data-edit="${edit && sub ? esc(sub.code) : ''}"><div class="form-grid">
              ${field('Mã môn học', `<input name="code" value="${sub ? esc(sub.code) : ''}" placeholder="VD: MT2013" pattern="[A-Z]{2}[0-9]{4}" required${sub ? ' readonly' : ''}>`, 'Mã khoa (2 chữ hoa) + 4 chữ số')}
              ${field('Tên môn học', `<input name="name" value="${sub ? esc(sub.name) : ''}" required placeholder="Tên môn học">`, 'Bắt buộc, không để trống')}
              ${field('Khoa', `<select name="khoa">${DB.khoa.map((k) => `<option value="${esc(k.code)}"${sub && sub.khoa === k.code ? ' selected' : ''}>${esc(k.code)} - ${esc(k.name)}</option>`).join('')}</select>`, 'Mỗi môn thuộc đúng một khoa')}
              ${field('Quản trị viên quản lý', `<select name="admins" multiple size="3" required>${DB.admins.map((a) => `<option value="${esc(a.code)}"${(sub ? sub.admins.includes(a.code) : a.code === CTX.session.code) ? ' selected' : ''}>${esc(a.code)} - ${esc(a.name)}</option>`).join('')}</select>`, 'Giữ Ctrl để chọn nhiều; bắt buộc ít nhất một quản trị viên')}
            </div><div class="form-actions"><a class="btn" href="subjects.html">Hủy</a><button class="btn primary" type="submit">${sub ? 'Lưu thay đổi' : 'Tạo môn học'}</button></div></form>`
          )
        );
      },
    },

    'admin/courses': {
      nav: 'courses',
      render: () => {
        const terms = Array.from(new Set(DB.classes.map((c) => c.term))).sort().reverse();
        return (
          head('Lớp học', 'Mỗi lớp thuộc một môn học và có đúng một giảng viên phụ trách', btn('Tạo lớp học', 'primary', 'course-create.html')) +
          card(
            `<div class="filter-bar">
              <input data-filter-q="#tbl-admin-courses" placeholder="Tìm theo mã lớp, môn học, giảng viên...">
              <select data-filter-attr="term" data-filter-target="#tbl-admin-courses"><option value="">Tất cả học kỳ</option>${terms.map((t) => `<option value="${esc(t)}">Học kỳ ${esc(t)}</option>`).join('')}</select>
            </div>` +
              table(
                ['Mã lớp', 'Tên lớp', 'Môn học', 'Học kỳ', 'Giảng viên phụ trách', 'Số sinh viên', 'Thao tác'],
                DB.classes.map((c) => {
                  const s = subjectOf(c.subject);
                  const t = teacherOf(c.teacherCode);
                  return {
                    attrs: ` data-term="${esc(c.term)}" data-search="${esc(`${c.code} ${c.name} ${s.code} ${s.name} ${t.name} ${t.code}`.toLowerCase())}"`,
                    cells: [
                      code(c.code), esc(c.name), `${code(c.subject)} ${esc(s.name)}`, esc(c.term),
                      `${esc(t.name)} (${esc(c.teacherCode)})`, c.studentCodes.length,
                      btn('Sửa', 'sm', 'course-edit.html?c=' + encodeURIComponent(c.code)) +
                        ' ' +
                        `<button class="btn btn-link btn-sm px-1 text-danger" type="button" data-delete-course="${esc(c.code)}">Xóa</button>`,
                    ],
                  };
                }),
                { id: 'tbl-admin-courses', empty: 'Chưa có lớp học nào.' }
              )
          )
        );
      },
    },

    'admin/course-create': {
      nav: 'course-create',
      render: () => {
        const lecturers = DB.users.filter((u) => u.role === 'Giảng viên');
        const students = DB.users.filter((u) => u.role === 'Sinh viên');
        return (
          head('Tạo lớp học', '', '', [['Lớp học', 'courses.html']]) +
          card(
            `<form id="form-course-create">
              <div id="step-1">
                <h2>Bước 1 / 2: Thông tin cơ bản</h2>
                <div class="form-grid">
                  <div class="full">${field('Môn học', `<select name="subject">${DB.subjects.map((s) => `<option value="${esc(s.code)}">${esc(s.code)} - ${esc(s.name)}</option>`).join('')}</select>`)}</div>
                  ${field('Học kỳ', '<input name="term" value="261" placeholder="VD: 261" pattern="[0-9]{3}" required>', '3 chữ số: 2 số cuối năm + số học kỳ (VD: 261)')}
                  ${field('Tên lớp', '<input name="name" placeholder="VD: A4" pattern="A[0-9]+" required>', 'Dạng "A" + số thứ tự, không để trống')}
                  ${field('Mã lớp (tự sinh)', '<input name="codePreview" placeholder="VD: 261A4" disabled>', 'Mã lớp = Học kỳ + Tên lớp')}
                </div>
                <div class="form-actions"><a class="btn" href="courses.html">Hủy</a><button class="btn primary" type="button" data-course-next>Tiếp theo →</button></div>
              </div>
              <div id="step-2" class="hidden">
                <h2>Bước 2 / 2: Giảng viên và sinh viên</h2>
                <div class="form-grid">
                  ${field('Giảng viên phụ trách', `<select name="teacherCode" required>${lecturers.map((u) => `<option value="${esc(u.code)}">${esc(u.code)} - ${esc(u.name)}</option>`).join('')}</select>`, 'Mỗi lớp có đúng một giảng viên phụ trách')}
                  ${field('Sinh viên được phân vào lớp', `<select name="studentCodes" multiple size="5">${students.map((u) => `<option value="${esc(u.code)}">${esc(u.code)} - ${esc(u.name)} (${u.status})</option>`).join('')}</select>`, 'Giữ Ctrl để chọn nhiều sinh viên')}
                </div>
                <div class="form-actions">
                  <button class="btn" type="button" data-show="#step-1" data-hide="#step-2">← Quay lại</button>
                  <button class="btn primary" type="submit">Tạo lớp học</button>
                </div>
              </div>
            </form>`
          )
        );
      },
    },

    'admin/course-edit': {
      nav: 'courses',
      render: () => {
        const c = classOf(qp('c', DB.classes[0] ? DB.classes[0].code : ''));
        if (!c) return head('Chỉnh sửa lớp học', '', '', [['Lớp học', 'courses.html']]) + card('<p class="empty-state">Không tìm thấy lớp học.</p>');
        const lecturers = DB.users.filter((u) => u.role === 'Giảng viên');
        const students = DB.users.filter((u) => u.role === 'Sinh viên');
        return (
          head(`Chỉnh sửa lớp ${c.code}`, meta([['Mã lớp', code(c.code)], ['Học kỳ', esc(c.term)]]), '', [['Lớp học', 'courses.html']]) +
          card(
            `<form id="form-course-edit" data-code="${esc(c.code)}">
              ${field('Môn học', `<select name="subject">${DB.subjects.map((x) => `<option value="${esc(x.code)}"${x.code === c.subject ? ' selected' : ''}>${esc(x.code)} - ${esc(x.name)}</option>`).join('')}</select>`)}
              ${field('Học kỳ', `<input value="${esc(c.term)}" disabled>`)}
              ${field('Tên lớp', `<input value="${esc(c.name)}" disabled>`)}
              ${field('Mã lớp', `<input value="${esc(c.code)}" disabled>`, 'Mã lớp = Học kỳ + Tên lớp')}
              ${field('Giảng viên phụ trách', `<select name="teacherCode">${lecturers.map((u) => `<option value="${esc(u.code)}"${u.code === c.teacherCode ? ' selected' : ''}>${esc(u.code)} - ${esc(u.name)}</option>`).join('')}</select>`)}
              ${field('Sinh viên trong lớp', `<select name="studentCodes" multiple size="5">${students.map((u) => `<option value="${esc(u.code)}"${c.studentCodes.includes(u.code) ? ' selected' : ''}>${esc(u.code)} - ${esc(u.name)}</option>`).join('')}</select>`, 'Giữ Ctrl để chọn hoặc bỏ chọn sinh viên')}
              <div class="form-actions"><a class="btn" href="courses.html">Hủy</a><button class="btn primary" type="submit">Lưu thay đổi</button></div>
            </form>`
          )
        );
      },
    },

    'admin/users': {
      nav: 'users',
      render: () =>
        head('Người dùng', 'Quản lý tài khoản Giảng viên và Sinh viên', btn('Tạo người dùng', 'primary', 'user-create.html')) +
        card(
          `<div class="filter-bar">
            <input data-filter-q="#tbl-admin-users" placeholder="Tìm theo tên tài khoản, họ tên, mã số...">
            <select data-filter-attr="role" data-filter-target="#tbl-admin-users"><option value="">Tất cả vai trò</option><option value="Giảng viên">Giảng viên</option><option value="Sinh viên">Sinh viên</option></select>
            <select data-filter-attr="status" data-filter-target="#tbl-admin-users"><option value="">Mọi trạng thái</option><option value="Active">Active</option><option value="Inactive">Inactive</option></select>
          </div>` +
            table(
              ['Tên tài khoản', 'Họ và tên', 'Email', 'Vai trò', 'Mã', 'Số điện thoại', 'Trạng thái', 'Thao tác'],
              DB.users.map((u) => ({
                attrs: ` data-role="${esc(u.role)}" data-status="${esc(u.status)}" data-search="${esc(`${u.account} ${u.name} ${u.code} ${u.account}@hcmut.edu.vn`.toLowerCase())}"`,
                cells: [
                  code(u.account), esc(u.name), `${esc(u.account)}@hcmut.edu.vn`, esc(u.role), code(u.code),
                  u.phones.map(esc).join('<br>'), sbadge(u.status),
                  btn('Sửa', 'sm', 'user-edit.html?u=' + encodeURIComponent(u.account)) +
                    ' ' +
                    `<button class="btn btn-link btn-sm px-1" type="button" data-toggle-user="${esc(u.account)}">${u.status === 'Active' ? 'Khóa' : 'Mở khóa'}</button> ` +
                    `<button class="btn btn-link btn-sm px-1 text-danger" type="button" data-delete-user="${esc(u.account)}">Xóa</button>`,
                ],
              })),
              { id: 'tbl-admin-users', empty: 'Không có người dùng nào.' }
            )
        ),
    },

    'admin/user-create': {
      nav: 'user-create',
      render: () =>
        head('Tạo người dùng', 'Chọn vai trò để hiện đúng trường mã định danh', '', [['Người dùng', 'users.html']]) +
        card(
          `<form id="form-user-create">
            <div class="form-grid">
              ${field('Vai trò', '<select name="role" data-switch><option value="student">Sinh viên</option><option value="lecturer">Giảng viên</option></select>')}
              ${field('Trạng thái', '<select name="status"><option value="Active">Active</option><option value="Inactive">Inactive</option></select>')}
              ${field('Họ và tên', '<input name="name" required placeholder="VD: Nguyễn Minh Khôi">')}
              ${field('Email', '<input name="email" required placeholder="khoi.nguyen@hcmut.edu.vn" pattern="[a-z]+[.][a-z]+[a-z0-9]*@hcmut[.]edu[.]vn">', 'Định dạng [tên].[họ][chuỗi]@hcmut.edu.vn')}
              ${field('Tên tài khoản (tự sinh)', '<input name="accountPreview" placeholder="Phần trước @ của email" disabled>', 'Lấy tự động từ email, bỏ phần @hcmut.edu.vn')}
              ${field('Mật khẩu', '<input type="password" name="password" required pattern="[!-~]{6,}" placeholder="Tối thiểu 6 ký tự ASCII">', 'Ký tự ASCII từ 33 đến 126, không khoảng trắng')}
              <div data-for="student">${field('MSSV', '<input name="mssv" pattern="[0-9]{6}" placeholder="6 chữ số (VD: 240005)">', '2 số năm nhập học + 4 số thứ tự')}</div>
              <div data-for="lecturer" class="hidden">${field('Mã giảng viên', '<input name="teacherCode" pattern="[0-9]{5}" placeholder="5 chữ số (VD: 00003)">', '5 chữ số theo thứ tự công tác')}</div>
              <div class="full">${field(
                'Số điện thoại',
                '<div id="phone-list"><div class="phone-row"><input name="phone[]" pattern="0[0-9]{9}" placeholder="VD: 0900000099" required></div></div><button class="btn btn-secondary btn-sm mt-1" type="button" data-add-phone="#phone-list">+ Thêm số điện thoại</button>',
                'Số điện thoại Việt Nam gồm 10 chữ số, bắt đầu bằng 0'
              )}</div>
            </div>
            <div class="form-actions"><a class="btn" href="users.html">Hủy</a><button class="btn primary" type="submit">Tạo tài khoản</button></div>
          </form>`
        ),
    },

    'admin/user-edit': {
      nav: 'users',
      render: () => {
        const u = DB.users.find((x) => x.account === qp('u', DB.users[0] ? DB.users[0].account : ''));
        if (!u) return head('Chỉnh sửa người dùng', '', '', [['Người dùng', 'users.html']]) + card('<p class="empty-state">Không tìm thấy người dùng.</p>');
        const phonesHtml = (u.phones.length ? u.phones : [''])
          .map(
            (p, idx) =>
              `<div class="phone-row"><input name="phone[]" value="${esc(p)}" pattern="0[0-9]{9}" placeholder="VD: 0900000099"${idx === 0 ? ' required' : ''}>${idx > 0 ? '<button class="btn btn-link btn-sm text-danger" type="button" data-remove-phone>Xóa</button>' : ''}</div>`
          )
          .join('');
        return (
          head(`Chỉnh sửa người dùng ${u.account}`, meta([['Tên tài khoản', code(u.account)], ['Vai trò', esc(u.role)]]), '', [['Người dùng', 'users.html']]) +
          card(
            `<form id="form-user-edit" data-account="${esc(u.account)}">
              ${field(u.role === 'Sinh viên' ? 'MSSV' : 'Mã giảng viên', `<input value="${esc(u.code)}" disabled>`)}
              ${field('Họ và tên', `<input name="name" required value="${esc(u.name)}">`)}
              ${field('Email', `<input value="${esc(u.account)}@hcmut.edu.vn" disabled>`, 'Tên tài khoản lấy từ email nên không đổi')}
              ${field('Trạng thái', `<select name="status"><option value="Active"${u.status === 'Active' ? ' selected' : ''}>Active</option><option value="Inactive"${u.status === 'Inactive' ? ' selected' : ''}>Inactive</option></select>`)}
              ${field('Số điện thoại', `<div id="phone-list">${phonesHtml}</div><button class="btn btn-secondary btn-sm mt-1" type="button" data-add-phone="#phone-list">+ Thêm số điện thoại</button>`)}
              ${field('Mật khẩu mới', '<input type="password" name="password" pattern="[!-~]{6,}" placeholder="Để trống nếu không đổi">', 'Ký tự ASCII từ 33 đến 126')}
              <div class="form-actions"><a class="btn" href="users.html">Hủy</a><button class="btn primary" type="submit">Lưu thay đổi</button></div>
            </form>`
          )
        );
      },
    },

    /* ==================== SINH VIÊN ==================== */
    'student/courses': {
      nav: 'courses',
      render: () => {
        const sortMode = ssGet(SORT_KEY) || 'term';
        const listCls = sortClasses(myClasses(), sortMode);
        const terms = Array.from(new Set(listCls.map((c) => c.term))).sort().reverse();
        const mssv = CTX.session.code;
        const viewMode = ssGet(VIEW_KEY) || 'card';

        // Mốc thời gian (Timeline) các bài chưa hoàn thành trên tất cả lớp
        const timeline = [];
        listCls.forEach((c) => {
          classItems(c.code).forEach((it) => {
            const rec = getRecord(it, mssv);
            if (rec.status === 'Chưa nộp' || rec.status === 'Chưa làm') {
              timeline.push({ cls: c, item: it, rec });
            }
          });
        });
        timeline.sort((a, b) => String(a.item.deadline).localeCompare(String(b.item.deadline)));

        const cardsHtml = listCls.length
          ? `<div class="course-grid" id="grid-student-courses">${listCls
              .map((c, idx) => {
                const s = subjectOf(c.subject);
                const t = teacherOf(c.teacherCode);
                const avg = studentClassAvg(c.code, mssv);
                return `<article class="course-card" data-term="${esc(c.term)}" data-search="${esc(`${c.code} ${s.code} ${s.name} ${t.name}`.toLowerCase())}">
                  <a class="course-banner pat-${idx % 4}" href="${withClass('course.html', c.code)}" style="text-decoration:none">
                    <span class="course-banner-tag">HK ${esc(c.term)} · ${esc(c.code)}</span>
                  </a>
                  <div class="course-card-body">
                    <div class="course-card-code">${esc(s.code)} · ${esc(t.name)}</div>
                    <a class="course-card-title" href="${withClass('course.html', c.code)}">${esc(s.name)} (${esc(s.code)}) [${esc(c.code)}]</a>
                    <div class="course-card-foot">
                      <span>Điểm TB: <strong>${avg}</strong></span>
                      <a href="${withClass('course.html', c.code)}">Vào lớp →</a>
                    </div>
                  </div>
                </article>`;
              })
              .join('')}</div>`
          : '<div class="bk-info-banner">Bạn chưa được phân vào lớp học nào.</div>';

        const listHtml = table(
          ['Mã lớp', 'Môn học', 'Học kỳ', 'Giảng viên', 'Điểm trung bình', ''],
          listCls.map((c) => {
            const s = subjectOf(c.subject);
            const t = teacherOf(c.teacherCode);
            return {
              attrs: ` data-term="${esc(c.term)}" data-search="${esc(`${c.code} ${s.code} ${s.name} ${t.name}`.toLowerCase())}"`,
              cells: [
                code(c.code), `${code(s.code)} ${esc(s.name)}`, esc(c.term), esc(t.name),
                studentClassAvg(c.code, mssv), btn('Vào lớp', 'sm', withClass('course.html', c.code)),
              ],
            };
          }),
          { id: 'tbl-student-courses', empty: 'Bạn chưa được phân vào lớp học nào.' }
        );

        const filterTarget = viewMode === 'card' ? '#grid-student-courses' : '#tbl-student-courses';

        return (
          head('Các khoá học của tôi', `Sinh viên ${esc(CTX.session.name)} · MSSV ${code(mssv)}`) +
          `<div class="dash-grid">
            ${card(
              `<h2>Tổng quan về khóa học</h2>
              <div class="filter-bar">
                <select data-filter-attr="term" data-filter-target="${filterTarget}"><option value="">Tất cả học kỳ</option>${terms.map((t) => `<option value="${esc(t)}">Học kỳ ${esc(t)}</option>`).join('')}</select>
                <input data-filter-q="${filterTarget}" placeholder="Tìm kiếm khóa học...">
                <select data-sort-mode><option value="term"${sortMode === 'term' ? ' selected' : ''}>Sắp xếp: Học kỳ mới nhất</option><option value="name"${sortMode === 'name' ? ' selected' : ''}>Sắp xếp: Tên môn học</option><option value="code"${sortMode === 'code' ? ' selected' : ''}>Sắp xếp: Mã lớp</option></select>
                <select data-view-mode><option value="card"${viewMode === 'card' ? ' selected' : ''}>Hiển thị: Thẻ (Card)</option><option value="list"${viewMode === 'list' ? ' selected' : ''}>Hiển thị: Bảng (List)</option></select>
              </div>
              ${viewMode === 'card' ? cardsHtml : listHtml}`
            )}
            ${card(
              `<h2>Mốc thời gian (${timeline.length})</h2>` +
                (timeline.length
                  ? timeline
                      .map(({ cls, item }) => {
                        const href = withClass((item.kind === 'Quiz' ? 'quiz-intro.html?i=' : 'submit.html?i=') + encodeURIComponent(item.code), cls.code);
                        return `<div class="bk-activity-row">
                          ${actIcon(item.kind === 'Quiz' ? 'quiz' : 'assign')}
                          <div class="bk-act-main">
                            <a class="bk-act-name" href="${href}">${esc(item.name)}</a>
                            <div class="bk-act-sub">${esc(cls.code)} · Hạn: ${esc(item.deadline)}</div>
                          </div>
                        </div>`;
                      })
                      .join('')
                  : '<p class="text-muted mb-0">Không có bài tập hay quiz nào sắp đến hạn.</p>')
            )}
          </div>`
        );
      },
    },

    'student/course': {
      nav: 'courses',
      courseScoped: true,
      render: () => {
        const c = cur();
        const mssv = CTX.session.code;
        const anns = classAnnouncements(c.code);
        const mats = classMaterials(c.code);
        const items = classItems(c.code);
        const forums = classForums(c.code);

        return (
          courseHead() +
          tabs('course') +
          `<div class="d-flex justify-content-end mb-2"><button class="btn btn-link btn-sm" type="button" data-toggle-all-sections>Thu gọn toàn bộ</button></div>` +
          `<section class="bk-section">
            <div class="bk-section-head" data-toggle-section><span class="bk-chevron">▾</span><h3 class="bk-section-title">Chung & Thông báo (${anns.length})</h3></div>
            <div class="bk-section-body">
              ${anns.length
                ? anns
                    .map(
                      (a) => `<div class="bk-activity-row">
                        ${actIcon('announce')}
                        <div class="bk-act-main">
                          <a class="bk-act-name" href="${withClass('announcements.html', c.code)}">${esc(a.title)}</a>
                          <div class="bk-act-sub">${esc(a.content)}</div>
                        </div>
                        ${code(a.code)}
                      </div>`
                    )
                    .join('')
                : '<p class="text-muted my-2">Chưa có thông báo nào.</p>'}
            </div>
          </section>` +
          `<section class="bk-section">
            <div class="bk-section-head" data-toggle-section><span class="bk-chevron">▾</span><h3 class="bk-section-title">Học liệu bài giảng (${mats.length})</h3></div>
            <div class="bk-section-body">
              ${mats.length
                ? mats
                    .map(
                      (m) => `<div class="bk-activity-row">
                        ${actIcon('material')}
                        <div class="bk-act-main">
                          <a class="bk-act-name" href="${withClass('materials.html', c.code)}">${esc(m.name)}</a>
                          <div class="bk-act-sub">${esc(m.content)} · ${code(m.code)}</div>
                        </div>
                        <button class="btn btn-link btn-sm" type="button" data-alert="${esc('Đang tải xuống ' + m.content + ' (mô phỏng)')}">Tải về</button>
                      </div>`
                    )
                    .join('')
                : '<p class="text-muted my-2">Chưa có học liệu nào.</p>'}
            </div>
          </section>` +
          `<section class="bk-section">
            <div class="bk-section-head" data-toggle-section><span class="bk-chevron">▾</span><h3 class="bk-section-title">Bài tập & Quiz (${items.length})</h3></div>
            <div class="bk-section-body">
              ${items.length
                ? items
                    .map((it) => {
                      const rec = getRecord(it, mssv);
                      const href = withClass((it.kind === 'Quiz' ? 'quiz-intro.html?i=' : 'submit.html?i=') + encodeURIComponent(it.code), c.code);
                      return `<div class="bk-activity-row">
                        ${actIcon(it.kind === 'Quiz' ? 'quiz' : 'assign')}
                        <div class="bk-act-main">
                          <a class="bk-act-name" href="${href}">${esc(it.name)}</a>
                          <div class="bk-act-sub">Hạn nộp: ${esc(it.deadline)} · Điểm: ${fmt(rec.score)}</div>
                        </div>
                        ${sbadge(rec.status)}
                      </div>`;
                    })
                    .join('')
                : '<p class="text-muted my-2">Chưa có bài tập hoặc quiz nào.</p>'}
            </div>
          </section>` +
          `<section class="bk-section">
            <div class="bk-section-head" data-toggle-section><span class="bk-chevron">▾</span><h3 class="bk-section-title">Diễn đàn thảo luận (${forums.length})</h3></div>
            <div class="bk-section-body">
              ${forums
                .map((f) => {
                  const cnt = classPosts(c.code).filter((p) => !p.parent && p.forum === f.code).length;
                  return `<div class="bk-activity-row">
                    ${actIcon('forum')}
                    <div class="bk-act-main">
                      <a class="bk-act-name" href="${withClass('forum.html?f=' + encodeURIComponent(f.code), c.code)}">Diễn đàn ${esc(f.code)}</a>
                      <div class="bk-act-sub">${cnt} chủ đề thảo luận</div>
                    </div>
                  </div>`;
                })
                .join('')}
            </div>
          </section>`
        );
      },
    },

    'student/materials': {
      nav: 'courses',
      courseScoped: true,
      render: () => {
        const c = cur();
        const mats = classMaterials(c.code);
        return (
          courseHead() +
          tabs('materials') +
          card(
            `<h2>Học liệu (${mats.length})</h2>` +
              table(
                ['Mã học liệu', 'Tên học liệu', 'Nội dung', ''],
                mats.map((m) => [
                  code(m.code), esc(m.name), esc(m.content),
                  `<button class="btn btn-link btn-sm px-1" type="button" data-alert="${esc('Đang tải xuống ' + m.content + ' (mô phỏng)')}">Tải về</button>`,
                ]),
                { empty: 'Lớp chưa có học liệu nào.' }
              )
          )
        );
      },
    },

    'student/announcements': {
      nav: 'courses',
      courseScoped: true,
      render: () => {
        const c = cur();
        const anns = classAnnouncements(c.code);
        return (
          courseHead() +
          tabs('announcements') +
          card(
            `<h2>Thông báo lớp học (${anns.length})</h2>` +
              (anns.length
                ? anns
                    .map((a) => `<div class="post"><strong>${esc(a.title)}</strong> ${code(a.code)}<p class="mb-0 mt-1" style="white-space:pre-wrap">${esc(a.content)}</p></div>`)
                    .join('')
                : '<div class="bk-info-banner">Lớp chưa có thông báo nào.</div>')
          )
        );
      },
    },

    'student/quizzes': {
      nav: 'courses',
      courseScoped: true,
      render: () => {
        const c = cur();
        const mssv = CTX.session.code;
        const items = classItems(c.code);
        return (
          courseHead() +
          tabs('quizzes') +
          card(
            `<h2>Danh sách Bài tập & Quiz (${items.length})</h2>` +
              table(
                ['Mã', 'Hoạt động', 'Loại', 'Mở từ', 'Hạn nộp', 'Trạng thái', 'Điểm', ''],
                items.map((i) => {
                  const rec = getRecord(i, mssv);
                  const href = withClass((i.kind === 'Quiz' ? 'quiz-intro.html?i=' : 'submit.html?i=') + encodeURIComponent(i.code), c.code);
                  return [
                    code(i.code), `<a class="fw-medium" href="${href}">${esc(i.name)}</a>`, esc(i.kind),
                    esc(i.posted), esc(i.deadline), sbadge(rec.status), fmt(rec.score), btn('Mở', 'sm', href),
                  ];
                }),
                { empty: 'Lớp chưa có bài tập hoặc quiz nào.' }
              )
          )
        );
      },
    },

    'student/quiz-intro': {
      nav: 'courses',
      courseScoped: true,
      render: () => {
        const c = cur();
        const mssv = CTX.session.code;
        const quizzes = classItems(c.code).filter((x) => x.kind === 'Quiz');
        const q = quizzes.find((x) => x.code === qp('i')) || quizzes[0];
        if (!q) return courseHead() + tabs('quizzes') + card('<p class="empty-state">Không tìm thấy bài quiz.</p>');
        const rec = getRecord(q, mssv);
        const attemptsLeft = Math.max(0, (q.maxAttempts || 1) - (rec.attempts || 0));
        const justDone = qp('done') === '1';
        return (
          head(
            `${actIcon('quiz')} ${esc(q.name)}`,
            meta([['Mã', code(q.code)], ['Opened', esc(q.posted)], ['Due', esc(q.deadline)]]),
            '',
            [['Bài tập & Quiz', withClass('quizzes.html', c.code)]]
          ) +
          (justDone ? `<div class="alert alert-success" role="status">Đã nộp bài quiz thành công! Điểm tổng hợp hiện tại: <strong>${fmt(rec.score)} / 10.00</strong>.</div>` : '') +
          `<div class="bk-info-box">
            <div class="bk-dates">
              <div><strong>Opened:</strong> ${esc(q.posted)}</div>
              <div><strong>Due:</strong> ${esc(q.deadline)}</div>
            </div>
            <hr>
            <p class="mb-2">${esc(q.desc)}</p>
            <div class="muted">
              • Thời gian làm bài: <strong>${q.duration ? q.duration + ' phút' : 'Không giới hạn'}</strong><br>
              • Số lần làm cho phép: <strong>${q.maxAttempts}</strong> (đã làm ${rec.attempts || 0} lần)<br>
              • Cách tính điểm: <strong>${esc(q.scoring)}</strong>
            </div>
          </div>` +
          `<div class="actions mb-3">${
            attemptsLeft > 0
              ? btn(rec.attempts > 0 ? 'Làm lại bài kiểm tra' : 'Bắt đầu làm bài', 'primary', withClass('quiz.html?i=' + encodeURIComponent(q.code), c.code))
              : `<button class="btn btn-secondary" type="button" disabled>Đã hết lượt làm bài</button>`
          }${btn('Trở về khóa học', '', withClass('course.html', c.code))}</div>` +
          card(
            `<h2>Tóm tắt các lần làm bài của bạn</h2>` +
              (rec.attemptScores && rec.attemptScores.length
                ? table(
                    ['Lần thử', 'Trạng thái', 'Thời gian nộp gần nhất', 'Điểm (thang 10)'],
                    rec.attemptScores.map((sc, idx) => [idx + 1, sbadge('Đã làm'), esc(rec.time ?? '—'), fmt(sc)])
                  ) + `<div class="mt-2"><strong>Điểm tổng hợp (${esc(q.scoring)}): ${fmt(rec.score)} / 10.00</strong></div>`
                : '<p class="text-muted mb-0">Bạn chưa thực hiện lần làm bài nào cho quiz này.</p>')
          )
        );
      },
    },

    'student/quiz': {
      nav: 'courses',
      courseScoped: true,
      render: () => {
        const c = cur();
        const mssv = CTX.session.code;
        const quizzes = classItems(c.code).filter((x) => x.kind === 'Quiz');
        const q = quizzes.find((x) => x.code === qp('i')) || quizzes[0];
        if (!q) return courseHead() + tabs('quizzes') + card('<p class="empty-state">Không tìm thấy bài quiz.</p>');
        const rec = getRecord(q, mssv);
        if ((rec.attempts || 0) >= (q.maxAttempts || 1)) {
          return head(`${actIcon('quiz')} ${esc(q.name)}`, '', '', [['Chi tiết quiz', withClass('quiz-intro.html?i=' + encodeURIComponent(q.code), c.code)]]) +
            card('<div class="alert alert-warning mb-0">Bạn đã sử dụng hết số lần làm bài tối đa cho quiz này.</div>');
        }
        return (
          head(
            `${actIcon('quiz')} ${esc(q.name)}`,
            meta([['Mã', code(q.code)], ['Lần thử thứ', (rec.attempts || 0) + 1], ['Hạn nộp', esc(q.deadline)]]),
            '',
            [['Bài tập & Quiz', withClass('quizzes.html', c.code)], ['Chi tiết quiz', withClass('quiz-intro.html?i=' + encodeURIComponent(q.code), c.code)]]
          ) +
          (q.duration
            ? card(`<h2>Thời gian còn lại</h2><span class="timer" data-countdown data-seconds="${q.duration * 60}" data-auto-submit="#form-quiz-submit">${String(q.duration).padStart(2, '0')}:00</span>`)
            : card('<h2>Thời gian</h2><p class="mb-0">Không giới hạn thời lượng</p>')) +
          card(`<h2>Nội dung câu hỏi</h2><p style="white-space:pre-wrap" class="mb-0">${esc(q.content)}</p>`) +
          card(
            `<form id="form-quiz-submit" data-class="${esc(c.code)}" data-item="${esc(q.code)}"><h2>Bài làm của bạn</h2>
              ${field('Nội dung bài làm', '<textarea name="answer" rows="5" placeholder="Nhập câu trả lời của bạn..."></textarea>', 'Văn bản, file hoặc hình ảnh')}
              ${field('Đính kèm', '<input type="file" name="file">')}
              <div class="form-actions"><a class="btn" href="${withClass('quiz-intro.html?i=' + encodeURIComponent(q.code), c.code)}">Hủy</a><button class="btn primary" type="submit">Kết thúc & Nộp bài</button></div>
            </form>`
          )
        );
      },
    },

    'student/submit': {
      nav: 'courses',
      courseScoped: true,
      render: () => {
        const c = cur();
        const mssv = CTX.session.code;
        const assigns = classItems(c.code).filter((x) => x.kind === 'Bài nộp');
        const a = assigns.find((x) => x.code === qp('i')) || assigns[0];
        if (!a) return courseHead() + tabs('quizzes') + card('<p class="empty-state">Không tìm thấy bài tập nộp file.</p>');
        const rec = getRecord(a, mssv);
        const done = rec.status !== 'Chưa nộp';
        const graded = rec.score != null;
        const statusCellClass = rec.status === 'Đã nộp' ? 'cell-ok' : rec.status === 'Nộp trễ' ? 'cell-ok' : 'cell-warn';
        const timeCellClass = rec.status === 'Nộp trễ' ? 'cell-late' : '';

        return (
          head(
            `${actIcon('assign')} ${esc(a.name)}`,
            '',
            '',
            [['Bài tập & Quiz', withClass('quizzes.html', c.code)]]
          ) +
          `<div class="bk-info-box">
            <div class="bk-dates">
              <div><strong>Opened:</strong> ${esc(a.posted)}</div>
              <div><strong>Due:</strong> ${esc(a.deadline)}</div>
            </div>
            <hr>
            <p class="mb-0">${esc(a.desc)}</p>
          </div>` +
          `<div class="actions mb-3">
            <button class="btn btn-primary" type="button" data-show="#submit-form-card">${done ? 'Sửa bài làm' : 'Thêm bài nộp'}</button>
            ${done && !graded ? `<button class="btn btn-primary" type="button" data-remove-submission="${esc(a.code)}" data-class="${esc(c.code)}">Loại bỏ bài nộp</button>` : ''}
            ${btn('Quay về danh sách', '', withClass('quizzes.html', c.code))}
          </div>` +
          `<h2 class="h3 mb-2" style="color:var(--bk-cobalt)">Trạng thái bài nộp</h2>
          <table class="bk-status-table mb-4">
            <tbody>
              <tr><th>Mã bài tập</th><td>${code(a.code)}</td></tr>
              <tr><th>Trạng thái bài nộp</th><td class="${statusCellClass}">${done ? 'Đã nộp để chấm điểm' : 'Chưa nộp bài'}</td></tr>
              <tr><th>Trạng thái chấm điểm</th><td class="${graded ? 'cell-ok' : ''}">${graded ? `Đã chấm điểm (${fmt(rec.score)} / 10.00)` : 'Chưa chấm điểm'}</td></tr>
              <tr><th>Tình trạng hạn nộp</th><td class="${timeCellClass}">${rec.status === 'Nộp trễ' ? 'Bài tập đã nộp muộn sau Deadline' : done ? 'Đã nộp đúng hạn' : `Hạn cuối: ${esc(a.deadline)}`}</td></tr>
              <tr><th>Chỉnh sửa lần cuối</th><td>${esc(rec.time ?? '—')}</td></tr>
              <tr><th>Nội dung / Tập tin đã nộp</th><td>${esc(rec.content ?? '—')}</td></tr>
            </tbody>
          </table>` +
          `<section class="card${done ? ' hidden' : ''}" id="submit-form-card"><div class="card-body">
            <h2>${done ? 'Cập nhật bài nộp' : 'Nộp bài tập'}</h2>
            <form id="form-file-submit" data-class="${esc(c.code)}" data-item="${esc(a.code)}">
              ${field('Nội dung bài nộp', `<textarea name="content" rows="4" placeholder="Nhập nội dung hoặc ghi chú bài nộp...">${done && rec.content ? esc(rec.content) : ''}</textarea>`, 'Văn bản, file hoặc hình ảnh')}
              ${field('Đính kèm tệp', '<input type="file" name="file">')}
              <p class="muted">Lưu ý: nộp sau Deadline (${esc(a.deadline)}) sẽ tự động ghi nhận trạng thái "Nộp trễ".</p>
              <div class="form-actions">
                ${done ? '<button class="btn" type="button" data-hide="#submit-form-card">Hủy</button>' : ''}
                <button class="btn primary" type="submit">${done ? 'Lưu thay đổi' : 'Nộp bài'}</button>
              </div>
            </form>
          </div></section>`
        );
      },
    },

    'student/submit-success': {
      nav: 'courses',
      courseScoped: true,
      render: () => {
        const c = cur();
        const mssv = CTX.session.code;
        const assigns = classItems(c.code).filter((x) => x.kind === 'Bài nộp');
        const a = assigns.find((x) => x.code === qp('i')) || assigns[0];
        if (!a) return courseHead() + tabs('quizzes') + card('<p class="empty-state">Không tìm thấy bài tập.</p>');
        const rec = getRecord(a, mssv);
        return (
          head(`${actIcon('assign')} Nộp bài thành công`, esc(a.name), '', [['Bài tập & Quiz', withClass('quizzes.html', c.code)]]) +
          `<div class="alert alert-success" role="status">Bài nộp của bạn đã được lưu và đồng bộ tới giảng viên phụ trách lớp ${code(c.code)}.</div>` +
          `<table class="bk-status-table mb-3"><tbody>
            <tr><th>Mã bài tập</th><td>${code(a.code)}</td></tr>
            <tr><th>Trạng thái</th><td class="${rec.status === 'Nộp trễ' ? 'cell-late' : 'cell-ok'}">${esc(rec.status)}</td></tr>
            <tr><th>Thời gian nộp</th><td>${esc(rec.time ?? nowStr())}</td></tr>
            <tr><th>Nội dung / tệp</th><td>${esc(rec.content ?? '—')}</td></tr>
            <tr><th>Deadline</th><td>${esc(a.deadline)}</td></tr>
          </tbody></table>` +
          `<div class="actions">${btn('Về danh sách bài tập', 'primary', withClass('quizzes.html', c.code))}${btn('Xem trạng thái bài nộp', '', withClass('submit.html?i=' + encodeURIComponent(a.code), c.code))}</div>`
        );
      },
    },

    'student/grades': {
      nav: 'courses',
      courseScoped: true,
      render: () => {
        const c = cur();
        const s = subjectOf(c.subject);
        const mssv = CTX.session.code;
        const items = classItems(c.code);
        const avg = studentClassAvg(c.code, mssv);
        const avgPct = avg !== '—' ? `${(Number(avg) * 10).toFixed(1)} %` : '—';

        const rows = items.map((i) => {
          const rec = getRecord(i, mssv);
          const href = withClass((i.kind === 'Quiz' ? 'quiz-intro.html?i=' : 'submit.html?i=') + encodeURIComponent(i.code), c.code);
          const pct = rec.score != null ? `${(Number(rec.score) * 10).toFixed(1)} %` : '—';
          return [
            `<div class="d-flex align-items-center gap-2">${actIcon(i.kind === 'Quiz' ? 'quiz' : 'assign')}<div><div class="muted" style="font-size:.72rem;text-transform:uppercase">${esc(i.kind)}</div><a class="fw-medium" href="${href}">${esc(i.name)}</a></div></div>`,
            sbadge(rec.status),
            fmt(rec.score),
            '0–10',
            pct,
          ];
        });
        if (items.length) {
          rows.push({
            attrs: ' class="row-total"',
            cells: [`Σ Tổng khóa học — ${esc(s.name)} (${esc(c.code)})`, '', avg, '0–10', avgPct],
          });
        }

        return (
          courseHead() +
          tabs('grades') +
          `<div class="d-flex align-items-center gap-3 mb-3">
            ${brandImg('profile-avatar-img sm', CTX.session.name)}
            <div>
              <div class="fw-bold" style="color:var(--bk-teal);font-size:1.08rem">${esc(CTX.session.name)}</div>
              <div class="muted">Báo cáo người dùng · MSSV ${code(mssv)}</div>
            </div>
          </div>` +
          card(
            table(['Mục điểm', 'Trạng thái', 'Điểm', 'Khoảng', 'Phần trăm'], rows, { empty: 'Chưa có đầu điểm nào trong lớp này.' }) +
              '<p class="muted mt-2 mb-0">Điểm trung bình khóa học được tính từ trung bình các mục đã có điểm (thang 10, làm tròn 2 chữ số thập phân).</p>'
          )
        );
      },
    },

    'student/forum': { nav: 'courses', courseScoped: true, render: forumPage },
    'student/forum-post': { nav: 'courses', courseScoped: true, render: forumPostPage },
    'student/forum-post-edit': { nav: 'courses', courseScoped: true, render: forumPostEditPage },

    'student/profile': {
      nav: 'profile',
      render: () => {
        const u = CTX.session.user;
        const classes = myClasses();
        const avgs = classes.map((c) => studentClassAvg(c.code, u.code)).filter((x) => x !== '—');
        const gpa = avgs.length ? avgOf(avgs) : '—';
        const phonesHtml = (u.phones.length ? u.phones : [''])
          .map(
            (p, idx) =>
              `<div class="phone-row"><input name="phone[]" value="${esc(p)}" pattern="0[0-9]{9}" placeholder="VD: 0900000011"${idx === 0 ? ' required' : ''}>${idx > 0 ? '<button class="btn btn-link btn-sm text-danger" type="button" data-remove-phone>Xóa</button>' : ''}</div>`
          )
          .join('');
        return (
          breadcrumb('Hồ sơ cá nhân') +
          `<div class="profile-hero">
            ${brandImg('profile-avatar-img', u.name)}
            <div class="me-auto">
              <h1 class="h2 mb-0" style="color:var(--bk-cobalt)">${esc(u.name)}</h1>
              <div class="muted">Sinh viên · MSSV ${code(u.code)} · ${sbadge(u.status)}</div>
            </div>
            <button class="btn btn-primary" type="button" data-show="#edit-profile" data-hide="#view-profile">Chỉnh sửa hồ sơ</button>
          </div>` +
          `<div id="view-profile" class="grid-2">
            ${card(
              '<h2>Chi tiết người dùng</h2>' +
                list([
                  `<strong>Địa chỉ thư điện tử:</strong> ${esc(u.account)}@hcmut.edu.vn`,
                  `<strong>Tên tài khoản:</strong> ${code(u.account)}`,
                  `<strong>Mã số sinh viên (MSSV):</strong> ${code(u.code)}`,
                  `<strong>Số điện thoại:</strong> ${u.phones.map(esc).join(', ')}`,
                  `<strong>Múi giờ:</strong> Asia/Ho_Chi_Minh`,
                ])
            )}
            ${card(
              '<h2>Chi tiết khóa học</h2>' +
                list(
                  classes.map((c) => {
                    const s = subjectOf(c.subject);
                    return `<a class="fw-medium" href="${withClass('course.html', c.code)}">${esc(s.name)} (${esc(c.code)})</a> <span class="muted">· Điểm TB: ${studentClassAvg(c.code, u.code)}</span>`;
                  }),
                  'Chưa tham gia khóa học nào.'
                ) +
                `<div class="mt-3 pt-2 border-top d-flex justify-content-between"><span class="muted">Điểm trung bình các lớp đã có điểm</span><strong>${gpa} / 10.00</strong></div>`
            )}
          </div>` +
          `<section class="card hidden" id="edit-profile"><div class="card-body"><h2>Chỉnh sửa hồ sơ cá nhân</h2><form id="form-profile">
            <div class="form-grid">
              ${field('Tên tài khoản', `<input value="${esc(u.account)}" disabled>`)}
              ${field('MSSV', `<input value="${esc(u.code)}" disabled>`)}
              ${field('Email', `<input value="${esc(u.account)}@hcmut.edu.vn" disabled>`)}
              ${field('Họ và tên', `<input name="name" required value="${esc(u.name)}">`)}
              ${field('Số điện thoại', `<div id="phone-list">${phonesHtml}</div><button class="btn btn-secondary btn-sm mt-1" type="button" data-add-phone="#phone-list">+ Thêm số điện thoại</button>`)}
              <div class="full">${field('Mật khẩu mới', '<input type="password" name="password" pattern="[!-~]{6,}" placeholder="Để trống nếu không đổi">', 'Ký tự ASCII từ 33 đến 126, áp dụng ngay cho lần đăng nhập kế tiếp')}</div>
            </div>
            <div class="form-actions">
              <button class="btn" type="button" data-show="#view-profile" data-hide="#edit-profile">Hủy</button>
              <button class="btn primary" type="submit">Lưu thay đổi</button>
            </div>
          </form></div></section>`
        );
      },
    },

    /* ==================== GIẢNG VIÊN ==================== */
    'lecturer/courses': {
      nav: 'courses',
      render: () => {
        const sortMode = ssGet(SORT_KEY) || 'term';
        const listCls = sortClasses(myClasses(), sortMode);
        const terms = Array.from(new Set(listCls.map((c) => c.term))).sort().reverse();
        const viewMode = ssGet(VIEW_KEY) || 'card';

        // Danh sách bài nộp chờ chấm trên tất cả các lớp đang dạy
        const pendingQueue = [];
        listCls.forEach((c) => {
          classItems(c.code).forEach((it) => {
            const cnt = classStudents(c).filter((st) => {
              const rec = getRecord(it, st.code);
              return rec.status !== 'Chưa nộp' && rec.status !== 'Chưa làm' && rec.score == null;
            }).length;
            if (cnt > 0) pendingQueue.push({ cls: c, item: it, count: cnt });
          });
        });

        const cardsHtml = listCls.length
          ? `<div class="course-grid" id="grid-lect-courses">${listCls
              .map((c, idx) => {
                const s = subjectOf(c.subject);
                return `<article class="course-card" data-term="${esc(c.term)}" data-search="${esc(`${c.code} ${s.code} ${s.name}`.toLowerCase())}">
                  <a class="course-banner pat-${idx % 4}" href="${withClass('course.html', c.code)}" style="text-decoration:none">
                    <span class="course-banner-tag">HK ${esc(c.term)} · ${esc(c.code)}</span>
                  </a>
                  <div class="course-card-body">
                    <div class="course-card-code">${esc(s.code)} · Sĩ số: ${c.studentCodes.length} SV</div>
                    <a class="course-card-title" href="${withClass('course.html', c.code)}">${esc(s.name)} (${esc(s.code)}) [${esc(c.code)}]</a>
                    <div class="course-card-foot">
                      <a href="${withClass('submissions.html', c.code)}">Chấm điểm</a>
                      <a href="${withClass('course.html', c.code)}">Quản lý lớp →</a>
                    </div>
                  </div>
                </article>`;
              })
              .join('')}</div>`
          : '<div class="bk-info-banner">Bạn chưa được phân công phụ trách lớp học nào.</div>';

        const listHtml = table(
          ['Mã lớp', 'Môn học', 'Học kỳ', 'Sĩ số', ''],
          listCls.map((c) => {
            const s = subjectOf(c.subject);
            return {
              attrs: ` data-term="${esc(c.term)}" data-search="${esc(`${c.code} ${s.code} ${s.name}`.toLowerCase())}"`,
              cells: [code(c.code), `${code(s.code)} ${esc(s.name)}`, esc(c.term), c.studentCodes.length, btn('Vào lớp', 'sm', withClass('course.html', c.code))],
            };
          }),
          { id: 'tbl-lect-courses', empty: 'Bạn chưa được phân công phụ trách lớp học nào.' }
        );

        const filterTarget = viewMode === 'card' ? '#grid-lect-courses' : '#tbl-lect-courses';

        return (
          head('Các lớp đang dạy', `Giảng viên ${esc(CTX.session.name)} · Mã GV ${code(CTX.session.code)}`) +
          `<div class="dash-grid">
            ${card(
              `<h2>Tổng quan lớp giảng dạy</h2>
              <div class="filter-bar">
                <select data-filter-attr="term" data-filter-target="${filterTarget}"><option value="">Tất cả học kỳ</option>${terms.map((t) => `<option value="${esc(t)}">Học kỳ ${esc(t)}</option>`).join('')}</select>
                <input data-filter-q="${filterTarget}" placeholder="Tìm kiếm lớp học...">
                <select data-sort-mode><option value="term"${sortMode === 'term' ? ' selected' : ''}>Sắp xếp: Học kỳ mới nhất</option><option value="name"${sortMode === 'name' ? ' selected' : ''}>Sắp xếp: Tên môn học</option><option value="code"${sortMode === 'code' ? ' selected' : ''}>Sắp xếp: Mã lớp</option></select>
                <select data-view-mode><option value="card"${viewMode === 'card' ? ' selected' : ''}>Hiển thị: Thẻ (Card)</option><option value="list"${viewMode === 'list' ? ' selected' : ''}>Hiển thị: Bảng (List)</option></select>
              </div>
              ${viewMode === 'card' ? cardsHtml : listHtml}`
            )}
            ${card(
              `<h2>Bài nộp chờ chấm (${pendingQueue.reduce((s, x) => s + x.count, 0)})</h2>` +
                (pendingQueue.length
                  ? pendingQueue
                      .map(
                        ({ cls, item, count }) => `<div class="bk-activity-row">
                          ${actIcon(item.kind === 'Quiz' ? 'quiz' : 'assign')}
                          <div class="bk-act-main">
                            <a class="bk-act-name" href="${withClass('submissions.html?i=' + encodeURIComponent(item.code), cls.code)}">${esc(item.name)}</a>
                            <div class="bk-act-sub">Lớp ${esc(cls.code)} · <strong>${count}</strong> bài chờ chấm</div>
                          </div>
                        </div>`
                      )
                      .join('')
                  : '<p class="text-muted mb-0">Tất cả bài nộp đã được chấm điểm.</p>')
            )}
          </div>`
        );
      },
    },

    'lecturer/course': {
      nav: 'courses',
      courseScoped: true,
      render: () => {
        const c = cur();
        const anns = classAnnouncements(c.code);
        const mats = classMaterials(c.code);
        const items = classItems(c.code);
        const students = classStudents(c);
        const pendingCount = items.reduce(
          (acc, it) =>
            acc +
            students.filter((st) => {
              const rec = getRecord(it, st.code);
              return rec.status !== 'Chưa nộp' && rec.status !== 'Chưa làm' && rec.score == null;
            }).length,
          0
        );

        return (
          courseHead() +
          tabs('course') +
          `<div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <div class="actions">
              ${btn('+ Học liệu / thông báo', 'primary', withClass('material-form.html', c.code))}
              ${btn('+ Bài tập / quiz', 'teal', withClass('assignment-form.html', c.code))}
              ${btn(`Chấm điểm (${pendingCount} chờ)`, '', withClass('submissions.html', c.code))}
              ${btn('Bảng điểm lớp', '', withClass('gradebook.html', c.code))}
            </div>
            <button class="btn btn-link btn-sm" type="button" data-toggle-all-sections>Thu gọn toàn bộ</button>
          </div>` +
          `<section class="bk-section">
            <div class="bk-section-head" data-toggle-section><span class="bk-chevron">▾</span><h3 class="bk-section-title">Chung & Thông báo (${anns.length})</h3></div>
            <div class="bk-section-body">
              ${anns.length
                ? anns
                    .map(
                      (a) => `<div class="bk-activity-row">
                        ${actIcon('announce')}
                        <div class="bk-act-main">
                          <strong>${esc(a.title)}</strong> ${code(a.code)}
                          <div class="bk-act-sub">${esc(a.content)}</div>
                        </div>
                        ${btn('Sửa', 'sm', withClass(`material-form.html?mode=edit&type=announcement&id=${encodeURIComponent(a.code)}`, c.code))}
                      </div>`
                    )
                    .join('')
                : '<p class="text-muted my-2">Chưa có thông báo nào.</p>'}
            </div>
          </section>` +
          `<section class="bk-section">
            <div class="bk-section-head" data-toggle-section><span class="bk-chevron">▾</span><h3 class="bk-section-title">Học liệu (${mats.length})</h3></div>
            <div class="bk-section-body">
              ${mats.length
                ? mats
                    .map(
                      (m) => `<div class="bk-activity-row">
                        ${actIcon('material')}
                        <div class="bk-act-main">
                          <strong>${esc(m.name)}</strong> ${code(m.code)}
                          <div class="bk-act-sub">${esc(m.content)}</div>
                        </div>
                        ${btn('Sửa', 'sm', withClass(`material-form.html?mode=edit&type=material&id=${encodeURIComponent(m.code)}`, c.code))}
                      </div>`
                    )
                    .join('')
                : '<p class="text-muted my-2">Chưa có học liệu nào.</p>'}
            </div>
          </section>` +
          `<section class="bk-section">
            <div class="bk-section-head" data-toggle-section><span class="bk-chevron">▾</span><h3 class="bk-section-title">Bài tập & Quiz (${items.length})</h3></div>
            <div class="bk-section-body">
              ${items.length
                ? items
                    .map((it) => {
                      const subCnt = students.filter((st) => {
                        const r = getRecord(it, st.code);
                        return r.status !== 'Chưa nộp' && r.status !== 'Chưa làm';
                      }).length;
                      return `<div class="bk-activity-row">
                        ${actIcon(it.kind === 'Quiz' ? 'quiz' : 'assign')}
                        <div class="bk-act-main">
                          <a class="bk-act-name" href="${withClass('submissions.html?i=' + encodeURIComponent(it.code), c.code)}">${esc(it.name)}</a>
                          <div class="bk-act-sub">Hạn: ${esc(it.deadline)} · Đã nộp/làm: <strong>${subCnt}/${students.length}</strong> SV</div>
                        </div>
                        ${btn('Chấm', 'sm', withClass('submissions.html?i=' + encodeURIComponent(it.code), c.code))}
                        ${btn('Sửa', 'sm', withClass('assignment-form.html?mode=edit&i=' + encodeURIComponent(it.code), c.code))}
                      </div>`;
                    })
                    .join('')
                : '<p class="text-muted my-2">Chưa có bài tập hoặc quiz nào.</p>'}
            </div>
          </section>`
        );
      },
    },

    'lecturer/members': {
      nav: 'courses',
      courseScoped: true,
      render: () => {
        const c = cur();
        const students = classStudents(c);
        return (
          courseHead() +
          tabs('members') +
          card(
            `<h2>Danh sách sinh viên (${students.length})</h2>` +
              table(
                ['MSSV', 'Họ tên', 'Email', 'Trạng thái', 'Điểm trung bình', ''],
                students.map((m) => [
                  code(m.code), esc(m.name), `${esc(m.account)}@hcmut.edu.vn`, sbadge(m.status),
                  studentClassAvg(c.code, m.code), btn('Xem điểm', 'sm', withClass('grade-detail.html?s=' + encodeURIComponent(m.code), c.code)),
                ]),
                { empty: 'Lớp chưa có sinh viên nào.' }
              )
          )
        );
      },
    },

    'lecturer/materials': {
      nav: 'courses',
      courseScoped: true,
      render: () => {
        const c = cur();
        const mats = classMaterials(c.code);
        const anns = classAnnouncements(c.code);
        return (
          courseHead() +
          tabs('materials') +
          head('Học liệu & thông báo', 'Chỉ giảng viên phụ trách được đăng, sửa, xóa', btn('+ Tạo học liệu / thông báo', 'primary', withClass('material-form.html', c.code))) +
          card(
            `<h2>Học liệu (${mats.length})</h2>` +
              table(
                ['Mã học liệu', 'Tên', 'Nội dung', 'Thao tác'],
                mats.map((m) => [
                  code(m.code), esc(m.name), esc(m.content),
                  btn('Sửa', 'sm', withClass(`material-form.html?mode=edit&type=material&id=${encodeURIComponent(m.code)}`, c.code)) +
                    ' ' +
                    `<button class="btn btn-link btn-sm px-1 text-danger" type="button" data-delete-material="${esc(m.code)}">Xóa</button>`,
                ]),
                { empty: 'Chưa có học liệu nào.' }
              )
          ) +
          card(
            `<h2>Thông báo (${anns.length})</h2>` +
              table(
                ['Mã thông báo', 'Tiêu đề', 'Nội dung', 'Thao tác'],
                anns.map((a) => [
                  code(a.code), esc(a.title), esc(a.content),
                  btn('Sửa', 'sm', withClass(`material-form.html?mode=edit&type=announcement&id=${encodeURIComponent(a.code)}`, c.code)) +
                    ' ' +
                    `<button class="btn btn-link btn-sm px-1 text-danger" type="button" data-delete-announcement="${esc(a.code)}">Xóa</button>`,
                ]),
                { empty: 'Chưa có thông báo nào.' }
              )
          )
        );
      },
    },

    'lecturer/material-form': {
      nav: 'courses',
      courseScoped: true,
      render: () => {
        const c = cur();
        const edit = qp('mode') === 'edit';
        const kind = qp('type', 'material');
        const id = qp('id', '');
        const existing = edit
          ? kind === 'announcement'
            ? DB.announcements.find((x) => x.code === id && x.classCode === c.code)
            : DB.materials.find((x) => x.code === id && x.classCode === c.code)
          : null;
        const isAnn = kind === 'announcement';
        return (
          head(
            existing ? `Chỉnh sửa ${isAnn ? 'thông báo' : 'học liệu'} ${existing.code}` : 'Tạo học liệu / thông báo',
            'Sinh viên chỉ xem và tải về, không chỉnh sửa',
            '',
            [['Học liệu & thông báo', withClass('materials.html', c.code)]]
          ) +
          card(
            `<form id="form-material" data-class="${esc(c.code)}" data-edit-id="${existing ? esc(existing.code) : ''}" data-edit-type="${existing ? esc(kind) : ''}"><div class="form-grid">
              ${field('Loại', `<select name="type"${existing ? ' disabled' : ''}><option value="material"${!isAnn ? ' selected' : ''}>Học liệu</option><option value="announcement"${isAnn ? ' selected' : ''}>Thông báo</option></select>`)}
              ${field('Mã (tự sinh)', `<input value="${existing ? esc(existing.code) : ''}" placeholder="VD: ${esc(c.code)}HL... hoặc ${esc(c.code)}TB..." disabled>`, 'Mã lớp + HL/TB + số thứ tự')}
              <div class="full">${field('Tiêu đề / Tên', `<input name="title" required value="${existing ? esc(existing.name || existing.title) : ''}" placeholder="Nhập tên học liệu hoặc tiêu đề thông báo">`)}</div>
              <div class="full">${field('Nội dung', `<textarea name="content" rows="4" required placeholder="Nhập mô tả, nội dung hoặc tên tệp...">${existing ? esc(existing.content) : ''}</textarea>`, 'Văn bản, file hoặc hình ảnh')}</div>
              <div class="full">${field('Đính kèm file (tùy chọn)', '<input type="file" name="file">')}</div>
            </div>
            <div class="form-actions"><a class="btn" href="${withClass('materials.html', c.code)}">Hủy</a><button class="btn primary" type="submit">${existing ? 'Lưu thay đổi' : 'Đăng'}</button></div>
            </form>`
          )
        );
      },
    },

    'lecturer/assignments': {
      nav: 'courses',
      courseScoped: true,
      render: () => {
        const c = cur();
        const items = classItems(c.code);
        return (
          courseHead() +
          tabs('assignments') +
          head('Bài tập & Quiz', 'Chỉ giảng viên phụ trách được giao, sửa và xóa bài', btn('+ Tạo bài tập / quiz', 'primary', withClass('assignment-form.html', c.code))) +
          card(
            table(
              ['Mã', 'Tên', 'Loại', 'Mở từ', 'Deadline', 'Cấu hình quiz', 'Thao tác'],
              items.map((i) => [
                code(i.code), esc(i.name), esc(i.kind), esc(i.posted), esc(i.deadline),
                i.kind === 'Quiz'
                  ? `${i.duration ? i.duration + ' phút' : 'Không giới hạn'}, ${i.maxAttempts} lần, ${i.scoring.toLowerCase()}`
                  : '—',
                btn('Chấm', 'sm', withClass('submissions.html?i=' + encodeURIComponent(i.code), c.code)) +
                  ' ' +
                  btn('Sửa', 'sm', withClass('assignment-form.html?mode=edit&i=' + encodeURIComponent(i.code), c.code)) +
                  ' ' +
                  `<button class="btn btn-link btn-sm px-1 text-danger" type="button" data-delete-item="${esc(i.code)}">Xóa</button>`,
              ]),
              { empty: 'Lớp chưa có bài tập hoặc quiz nào.' }
            )
          )
        );
      },
    },

    'lecturer/assignment-form': {
      nav: 'courses',
      courseScoped: true,
      render: () => {
        const c = cur();
        const edit = qp('mode') === 'edit';
        const it = edit ? DB.items.find((x) => x.code === qp('i') && x.classCode === c.code) : null;
        const isQuiz = !!it && it.kind === 'Quiz';
        const dt = (v) => (v ? v.replace(' ', 'T') : '');
        const defaultPosted = nowStr().replace(' ', 'T');
        return (
          head(
            it ? `Chỉnh sửa ${it.code}` : 'Tạo bài tập / quiz',
            '',
            '',
            [['Bài tập & Quiz', withClass('assignments.html', c.code)]]
          ) +
          card(
            `<form id="form-assignment" data-class="${esc(c.code)}" data-edit-code="${it ? esc(it.code) : ''}">
              <div class="form-grid">
                ${field('Loại', `<select name="kind" data-switch${it ? ' disabled' : ''}><option value="file"${isQuiz ? '' : ' selected'}>Bài nộp</option><option value="quiz"${isQuiz ? ' selected' : ''}>Quiz</option></select>`, it ? 'Không đổi được loại sau khi đã tạo' : '')}
                ${field('Mã (tự sinh)', `<input value="${it ? esc(it.code) : ''}" placeholder="VD: ${esc(c.code)}BT..." disabled>`)}
                <div class="full">${field('Tên', `<input name="name" required placeholder="VD: Bài tập 3" value="${it ? esc(it.name) : ''}">`)}</div>
                <div class="full">${field('Mô tả', `<textarea name="desc" rows="3">${it ? esc(it.desc) : ''}</textarea>`)}</div>
                ${field('Thời gian đăng', `<input type="datetime-local" name="posted" required value="${it ? dt(it.posted) : defaultPosted}">`)}
                ${field('Deadline', `<input type="datetime-local" name="deadline" required value="${it ? dt(it.deadline) : ''}">`, 'Phải sau thời gian đăng')}
              </div>
              <div data-for="file" class="${isQuiz ? 'hidden' : ''}"><p class="muted">Sinh viên nộp nội dung bài nộp (văn bản, file, hình ảnh). Trạng thái: Chưa nộp, Đã nộp hoặc Nộp trễ.</p></div>
              <div data-for="quiz" class="${isQuiz ? '' : 'hidden'}">
                <div class="form-grid">
                  ${field('Thời lượng (phút)', `<input type="number" name="duration" min="1" max="180" placeholder="Để trống = không giới hạn" value="${isQuiz && it.duration ? it.duration : ''}">`, 'Số nguyên dương hoặc để trống = không giới hạn')}
                  ${field('Số lần làm bài tối đa', `<input type="number" name="maxAttempts" min="1" value="${isQuiz ? it.maxAttempts : 1}">`)}
                  ${field('Cách tính điểm', `<select name="scoring"><option value="Lần cao nhất"${isQuiz && it.scoring === 'Lần cao nhất' ? ' selected' : ''}>Lần cao nhất</option><option value="Trung bình"${isQuiz && it.scoring === 'Trung bình' ? ' selected' : ''}>Trung bình</option></select>`)}
                </div>
                ${field('Nội dung quiz', `<textarea name="content" rows="4" placeholder="Nhập các câu hỏi quiz...">${isQuiz ? esc(it.content) : ''}</textarea>`, 'Văn bản, file hoặc hình ảnh')}
                ${field('Đính kèm', '<input type="file" name="file">')}
              </div>
              <div class="form-actions"><a class="btn" href="${withClass('assignments.html', c.code)}">Hủy</a><button class="btn primary" type="submit">${it ? 'Lưu thay đổi' : 'Tạo bài'}</button></div>
            </form>`
          )
        );
      },
    },

    'lecturer/submissions': {
      nav: 'courses',
      courseScoped: true,
      render: () => {
        const c = cur();
        const items = classItems(c.code);
        if (!items.length) return courseHead() + tabs('submissions') + card('<p class="empty-state">Lớp chưa có bài tập hoặc quiz nào để chấm điểm.</p>');
        const defaultItem = items.find((x) => x.kind === 'Bài nộp') || items[0];
        const selected = items.find((x) => x.code === qp('i')) || defaultItem;
        const students = classStudents(c);

        return (
          courseHead() +
          tabs('submissions') +
          head('Chấm điểm', meta([['Bài tập', esc(selected.name)], ['Mã', code(selected.code)], ['Loại', esc(selected.kind)], ['Deadline', esc(selected.deadline)]])) +
          `<div class="filter-bar"><label class="muted mb-0">Chọn bài cần chấm:</label><select data-nav-select="${withClass('submissions.html', c.code)}" data-nav-param="i">${items
            .map((it) => `<option value="${esc(it.code)}"${it.code === selected.code ? ' selected' : ''}>${esc(it.code)} — ${esc(it.name)} (${esc(it.kind)})</option>`)
            .join('')}</select></div>` +
          card(
            `<form id="form-grades" data-class="${esc(c.code)}" data-item="${esc(selected.code)}">${table(
              ['MSSV', 'Họ tên', 'Trạng thái', 'Thời gian nộp', 'Nội dung bài nộp', 'Điểm (0–10)', ''],
              students.map((st) => {
                const rec = getRecord(selected, st.code);
                return [
                  code(st.code), esc(st.name), sbadge(rec.status), esc(rec.time ?? '—'),
                  rec.content ? `<span title="${esc(rec.content)}">${esc(rec.content.length > 42 ? rec.content.slice(0, 42) + '…' : rec.content)}</span>` : '—',
                  `<input type="number" name="grade_${esc(st.code)}" min="0" max="10" step="0.01" value="${rec.score ?? ''}" style="width:104px">`,
                  btn('Chi tiết', 'sm', withClass('grade-detail.html?s=' + encodeURIComponent(st.code), c.code)),
                ];
              }),
              { empty: 'Lớp chưa có sinh viên.' }
            )}
            <p class="muted mt-2">Điểm theo thang 10, làm tròn 2 chữ số thập phân. Bấm Lưu điểm để đồng bộ tức thì sang bảng điểm lớp và trang điểm sinh viên.</p>
            <div class="form-actions"><button class="btn primary" type="submit">Lưu điểm</button></div></form>`
          )
        );
      },
    },

    'lecturer/gradebook': {
      nav: 'courses',
      courseScoped: true,
      render: () => {
        const c = cur();
        const items = classItems(c.code);
        const students = classStudents(c);
        return (
          courseHead() +
          tabs('gradebook') +
          card(
            `<h2>Bảng điểm lớp ${code(c.code)}</h2>` +
              table(
                ['MSSV', 'Họ tên', ...items.map((i) => esc(i.name)), 'Điểm trung bình', ''],
                students.map((m) => [
                  code(m.code), esc(m.name), ...items.map((it) => fmt(getRecord(it, m.code).score)),
                  `<strong>${studentClassAvg(c.code, m.code)}</strong>`,
                  btn('Chi tiết', 'sm', withClass('grade-detail.html?s=' + encodeURIComponent(m.code), c.code)),
                ]),
                { empty: 'Chưa có sinh viên trong lớp.' }
              )
          )
        );
      },
    },

    'lecturer/grade-detail': {
      nav: 'courses',
      courseScoped: true,
      render: () => {
        const c = cur();
        const students = classStudents(c);
        const m = students.find((x) => x.code === qp('s')) || students[0];
        if (!m) return courseHead() + tabs('gradebook') + card('<p class="empty-state">Không tìm thấy sinh viên trong lớp này.</p>');
        const items = classItems(c.code);
        const avg = studentClassAvg(c.code, m.code);
        const rows = items.map((i) => {
          const rec = getRecord(i, m.code);
          return [code(i.code), esc(i.name), esc(i.kind), sbadge(rec.status), esc(rec.time ?? '—'), fmt(rec.score)];
        });
        if (items.length) {
          rows.push({ attrs: ' class="row-total"', cells: ['', `Σ Điểm trung bình lớp ${c.code}`, '', '', '', avg] });
        }
        return (
          head(
            `Chi tiết điểm của ${esc(m.name)}`,
            `<span class="d-inline-flex align-items-center gap-2 mt-1">${brandImg('profile-avatar-img xs', m.name)}<span>MSSV ${code(m.code)} · ${esc(m.account)}@hcmut.edu.vn</span></span>`,
            '',
            [['Bảng điểm', withClass('gradebook.html', c.code)]]
          ) +
          card(table(['Mã', 'Tên', 'Loại', 'Trạng thái', 'Thời gian nộp', 'Điểm'], rows, { empty: 'Chưa có bài tập nào.' }))
        );
      },
    },

    'lecturer/forum': { nav: 'courses', courseScoped: true, render: forumPage },
    'lecturer/forum-post': { nav: 'courses', courseScoped: true, render: forumPostPage },
    'lecturer/forum-post-edit': { nav: 'courses', courseScoped: true, render: forumPostEditPage },
  };

  /* ---------- 7. Mount, Route Guard & Layout BK-LMS ---------- */
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
    t._h = setTimeout(() => t.classList.remove('show'), 2800);
  }

  const decorate = (html) =>
    html
      .replace(/<(input|select|textarea)(?![^>]*\bclass=)([^>]*)>/g, (m, t, rest) => {
        if (/type="(checkbox|radio)"/.test(rest)) return `<${t} class="form-check-input"${rest}>`;
        return `<${t} class="${t === 'select' ? 'form-select' : 'form-control'}"${rest}>`;
      })
      .replace(/<form(?![^>]*\bclass=)/g, '<form class="mform"')
      .replace(/class="btn((?: (?:primary|teal|danger|sm))*)"/g, (m, rest) => `class="${btnCls(rest)}"`);

  const wrapRegion = (html) => {
    const i = Math.max(html.lastIndexOf('<!--hdr-end-->'), html.lastIndexOf('<!--nav-end-->'));
    const cut = i < 0 ? 0 : i + 14;
    return `${html.slice(0, cut)}<div id="page-content" class="pb-3 d-print-block"><div id="region-main-box"><section id="region-main" aria-label="Nội dung">${html.slice(cut)}</section></div></div>`;
  };

  function renderAccessDenied(requiredRole, session) {
    return `<div class="access-denied">
      <h1>Không có quyền truy cập</h1>
      <p class="mb-2">Trang này thuộc khu vực <strong>${esc(ROLES[requiredRole].label)}</strong>. Bạn đang đăng nhập với tài khoản <strong>${esc(session.name)}</strong> (${esc(ROLES[session.role].label)}).</p>
      <p class="muted mb-3">Vui lòng quay về trang chủ của bạn hoặc đăng xuất để chuyển sang tài khoản phù hợp.</p>
      <div class="actions">
        <a class="btn btn-primary" href="${CTX.root}${ROLES[session.role].home}">Về trang chủ ${esc(ROLES[session.role].label)}</a>
        <button class="btn btn-secondary" type="button" data-logout>Đăng xuất & đổi tài khoản</button>
      </div>
    </div>`;
  }

  function renderShell(innerHtml, activeNav, withDrawer = false) {
    const s = CTX.session;
    const role = s ? s.role : '';
    const R = role ? ROLES[role] : null;
    const brandHref = R ? `${CTX.root}${R.home}` : `${CTX.root}login.html`;
    const items = R
      ? R.nav
          .map(
            ([label, file, k]) =>
              `<li class="nav-item"><a class="nav-link${k === activeNav && CTX.role === role ? ' active' : ''}" href="${CTX.root}${role}/${file}">${label}</a></li>`
          )
          .join('')
      : '';

    const notifs = s ? buildNotifications() : [];
    const notifMenu = s
      ? `<div class="dropdown d-flex align-items-center me-1">
          <button class="nav-icon-btn" type="button" data-menu-toggle aria-label="Thông báo" title="Thông báo">
            ${ICONS.bell}
            ${notifs.length ? `<span class="nav-badge-count">${notifs.length}</span>` : ''}
          </button>
          <div class="dropdown-menu dropdown-menu-end notif-menu">
            <div class="notif-head"><span>Thông báo (${notifs.length})</span></div>
            <div class="notif-list">
              ${notifs.length
                ? notifs.map((n) => `<a class="notif-item" href="${n.href}"><div>${esc(n.title)}</div><div class="notif-sub">${esc(n.sub)}</div></a>`).join('')
                : '<div class="p-3 muted">Không có thông báo mới.</div>'}
            </div>
          </div>
        </div>`
      : '';

    const userMenu = s
      ? `${notifMenu}<div class="d-flex align-items-stretch usermenu-container"><div class="usermenu"><div class="dropdown">
          <a href="#" role="button" id="user-menu-toggle" class="btn dropdown-toggle" data-menu-toggle>
            <span class="role-chip d-none d-md-inline">${esc(R.label)}</span>
            <span class="userbutton"><span class="avatars"><span class="avatar current">${brandImg('bk-nav-avatar', s.name)}</span></span></span>
            <span class="userfirstname d-none d-xl-block">${esc(s.name)}</span>
          </a>
          <div id="user-action-menu" class="dropdown-menu dropdown-menu-end">
            <div class="dropdown-header">${esc(s.name)} (${esc(s.account)})</div>
            ${role === 'student' ? `<a class="dropdown-item" href="${CTX.root}student/profile.html">Hồ sơ cá nhân</a>` : ''}
            <a class="dropdown-item" href="${CTX.root}login.html">Chuyển tài khoản</a>
            <button class="dropdown-item" type="button" data-reset-demo>Khôi phục dữ liệu mẫu</button>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item text-danger" type="button" data-logout>Thoát (Đăng xuất)</button>
          </div></div></div></div>`
      : `<span class="navbar-text">Chưa đăng nhập</span>`;

    document.body.className = 'limitedwidth uses-drawers theme pagelayout-standard path-lms';
    document.body.innerHTML = decorate(`<div id="page-wrapper" class="d-print-block">
      <nav class="navbar fixed-top bg-body navbar-expand"><div class="container-fluid navbar-content">
        <a href="${brandHref}" class="navbar-brand d-flex align-items-center m-0 me-3 p-0 aabtn">${brandImg('bk-logo-img', 'BK-LMS')}<span>BK-LMS</span></a>
        <div class="primary-navigation"><div class="primarynav-navbar navigation"><nav class="moremenu observed navigation"><ul class="nav more-nav navbar-nav">${items}</ul></nav></div></div>
        <div id="usernavigation" class="navbar-nav ms-auto h-100 align-items-center">${userMenu}</div>
      </div></nav>
      ${withDrawer ? renderCourseDrawer() : ''}
      <div id="page" class="drawers">
        <div id="topofscroll" class="main-inner">${innerHtml}</div>
        <footer id="page-footer" class="bk-footer">
          <div class="footer-inner">
            <span>BK-LMS · Hệ thống quản lý học tập, Trường Đại học Bách khoa — ĐHQG-HCM</span>
            <div class="footer-links">
              <button type="button" data-reset-demo>Khôi phục dữ liệu mẫu</button>
              <a href="${CTX.root}sitemap.html">Sơ đồ trang (Dev)</a>
            </div>
          </div>
        </footer>
      </div>
      <button class="bk-scroll-top" type="button" data-scroll-top title="Lên đầu trang" aria-label="Lên đầu trang">^</button>
    </div>`);
  }

  let countdownTimers = [];
  function clearTimers() {
    countdownTimers.forEach((h) => clearInterval(h));
    countdownTimers = [];
  }

  function mount() {
    clearTimers();
    const b = document.body;
    const role = b.dataset.role || '';
    const key = b.dataset.page || 'index';
    CTX.role = role;
    CTX.root = b.dataset.root || '';
    CTX.session = getSession();
    CTX.classCode = '';

    if (!role && key === 'index' && CTX.session) {
      location.replace(CTX.root + ROLES[CTX.session.role].home);
      return;
    }

    const page = PAGES[role ? `${role}/${key}` : key];
    if (!page) {
      renderShell('<main class="p-4">Không tìm thấy trang.</main>', '');
      return;
    }

    if (role && !page.public) {
      if (!CTX.session) {
        const next = encodeURIComponent(`${role}/${key}.html${location.search}`);
        location.replace(`${CTX.root}login.html?next=${next}`);
        return;
      }
      if (CTX.session.role !== role) {
        renderShell(wrapRegion(renderAccessDenied(role, CTX.session)), '');
        return;
      }
    }

    if (page.courseScoped) {
      const resolved = resolveCurrentClass();
      if (resolved.denied) {
        renderShell(
          wrapRegion(
            `<div class="access-denied">
              <h1>Không thuộc lớp học ${esc(resolved.requested)}</h1>
              <p class="mb-3">Tài khoản <strong>${esc(CTX.session.name)}</strong> không nằm trong danh sách của lớp này.</p>
              <a class="btn btn-primary" href="courses.html">Quay về danh sách lớp của tôi</a>
            </div>`
          ),
          'courses'
        );
        return;
      }
      if (!resolved.cls) {
        renderShell(
          wrapRegion(head('Chưa có lớp học') + card('<p class="mb-2">Tài khoản hiện tại chưa được phân vào lớp học nào.</p><a class="btn btn-primary" href="courses.html">Quay lại</a>')),
          'courses'
        );
        return;
      }
      CTX.classCode = resolved.cls.code;
    }

    state.headUsed = false;
    state.back = '';
    state.key = key;
    state.nav = page.nav || '';

    const inner = wrapRegion(page.render());
    renderShell(inner, page.nav || '', Boolean(page.courseScoped));

    $$('select[data-switch]').forEach(applySwitch);
    syncCourseCreatePreview();
    syncUserCreatePreview();

    $$('[data-countdown]').forEach((el) => {
      let s = Number(el.dataset.seconds) || 0;
      const autoSel = el.dataset.autoSubmit;
      const show = () => {
        el.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
        if (s <= 0) {
          clearTimers();
          if (autoSel) {
            const f = $(autoSel);
            if (f) {
              toast('Hết giờ làm bài — hệ thống tự động nộp bài.');
              f.requestSubmit();
            }
          }
          return;
        }
        s -= 1;
      };
      show();
      countdownTimers.push(setInterval(show, 1000));
    });

    const flash = popFlash();
    if (flash) toast(flash);
  }

  function syncCourseCreatePreview() {
    const f = $('#form-course-create');
    if (!f) return;
    const term = f.querySelector('[name="term"]');
    const name = f.querySelector('[name="name"]');
    const prev = f.querySelector('[name="codePreview"]');
    if (term && name && prev) prev.value = `${term.value.trim()}${name.value.trim()}`;
  }

  function syncUserCreatePreview() {
    const f = $('#form-user-create');
    if (!f) return;
    const email = f.querySelector('[name="email"]');
    const prev = f.querySelector('[name="accountPreview"]');
    if (email && prev) {
      const v = email.value.trim();
      prev.value = v.includes('@') ? v.split('@')[0] : v;
    }
  }

  function applyFilter(targetSelector) {
    const container = $(targetSelector);
    if (!container) return;
    const qEl = $(`[data-filter-q="${targetSelector}"]`);
    const q = qEl ? qEl.value.trim().toLowerCase() : '';
    const selects = $$(`[data-filter-target="${targetSelector}"]`);
    const nodes = container.tagName === 'TABLE' ? $$('tbody tr', container) : $$(`:scope > [data-search]`, container);
    nodes.forEach((node) => {
      if (container.tagName === 'TABLE' && !node.dataset.search && node.children.length === 1) return;
      let ok = true;
      if (q && !(node.dataset.search || node.textContent.toLowerCase()).includes(q)) ok = false;
      selects.forEach((sel) => {
        const val = sel.value;
        if (val && node.dataset[sel.dataset.filterAttr] !== val) ok = false;
      });
      node.classList.toggle('hidden', !ok);
    });
  }

  function doLogin(user, pass, nextUrl) {
    const res = authenticate(user, pass);
    if (!res.ok) {
      const box = $('#login-error');
      if (box) { box.textContent = res.error; box.classList.remove('hidden'); }
      else toast(res.error);
      return;
    }
    setFlash(`Đăng nhập thành công: ${res.session.name}`);
    if (nextUrl && nextUrl.startsWith(res.session.role + '/')) {
      location.href = CTX.root + nextUrl;
      return;
    }
    location.href = CTX.root + ROLES[res.session.role].home;
  }

  /* ---------- 8. Sự kiện tương tác toàn cục ---------- */
  document.addEventListener('click', (e) => {
    const tog = e.target.closest('[data-menu-toggle]');
    if (tog) {
      e.preventDefault();
      const dd = tog.closest('.dropdown');
      const wasOpen = dd.classList.contains('show');
      $$('.dropdown.show').forEach((d) => { d.classList.remove('show'); $('.dropdown-menu', d).classList.remove('show'); });
      if (!wasOpen) { dd.classList.add('show'); $('.dropdown-menu', dd).classList.add('show'); }
      return;
    }
    if (!e.target.closest('.dropdown-menu')) {
      $$('.dropdown.show').forEach((d) => { d.classList.remove('show'); $('.dropdown-menu', d).classList.remove('show'); });
    }

    if (e.target.closest('[data-scroll-top]')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (e.target.closest('[data-drawer-open]')) {
      const d = $('#bk-drawer');
      const bd = $('#bk-drawer-backdrop');
      if (d) d.classList.remove('hidden');
      if (bd) bd.classList.remove('hidden');
      return;
    }
    if (e.target.closest('[data-drawer-close]')) {
      const d = $('#bk-drawer');
      const bd = $('#bk-drawer-backdrop');
      if (d) d.classList.add('hidden');
      if (bd) bd.classList.add('hidden');
      return;
    }

    const secHead = e.target.closest('[data-toggle-section]');
    if (secHead) {
      secHead.closest('.bk-section').classList.toggle('collapsed');
      return;
    }

    const toggleAllBtn = e.target.closest('[data-toggle-all-sections]');
    if (toggleAllBtn) {
      const secs = $$('.bk-section');
      const anyOpen = secs.some((s) => !s.classList.contains('collapsed'));
      secs.forEach((s) => s.classList.toggle('collapsed', anyOpen));
      toggleAllBtn.textContent = anyOpen ? 'Mở rộng toàn bộ' : 'Thu gọn toàn bộ';
      return;
    }

    const logoutBtn = e.target.closest('[data-logout]');
    if (logoutBtn) {
      e.preventDefault();
      clearSession();
      setFlash('Bạn đã đăng xuất.');
      location.href = CTX.root + 'login.html';
      return;
    }

    const resetBtn = e.target.closest('[data-reset-demo]');
    if (resetBtn) {
      e.preventDefault();
      if (!window.confirm('Khôi phục toàn bộ dữ liệu mẫu về trạng thái ban đầu? Mọi thay đổi thử nghiệm hiện tại sẽ bị xóa.')) return;
      resetDB();
      setFlash('Đã khôi phục toàn bộ dữ liệu mẫu ban đầu.');
      if (CTX.role && !getSession()) {
        clearSession();
        location.href = CTX.root + 'login.html';
      } else {
        mount();
      }
      return;
    }

    const demoFill = e.target.closest('[data-demo-fill]');
    if (demoFill) {
      const u = $('#login-user');
      const p = $('#login-pass');
      if (u && p) {
        u.value = demoFill.dataset.demoFill;
        p.value = demoFill.dataset.demoPass;
        const box = $('#login-error');
        if (box) box.classList.add('hidden');
        u.focus();
        toast(`Đã điền tài khoản mẫu: ${u.value}`);
      }
      return;
    }

    const demoLogin = e.target.closest('[data-demo-login]');
    if (demoLogin) {
      const u = $('#login-user');
      const p = $('#login-pass');
      if (u && p) { u.value = demoLogin.dataset.demoLogin; p.value = demoLogin.dataset.demoPass; }
      const f = $('form[data-login]');
      doLogin(demoLogin.dataset.demoLogin, demoLogin.dataset.demoPass, f ? f.dataset.next : '');
      return;
    }

    const remSub = e.target.closest('[data-remove-submission]');
    if (remSub) {
      const itemCode = remSub.dataset.removeSubmission;
      if (!window.confirm('Loại bỏ bài nộp hiện tại của bạn?')) return;
      DB.records = DB.records.filter((r) => !(r.itemCode === itemCode && r.mssv === CTX.session.code));
      saveDB();
      toast('Đã loại bỏ bài nộp.');
      mount();
      return;
    }

    const addPhone = e.target.closest('[data-add-phone]');
    if (addPhone) {
      const listEl = $(addPhone.dataset.addPhone);
      if (listEl) {
        const div = document.createElement('div');
        div.className = 'phone-row';
        div.innerHTML =
          '<input class="form-control" name="phone[]" pattern="0[0-9]{9}" placeholder="VD: 0900000099"><button class="btn btn-link btn-sm text-danger" type="button" data-remove-phone>Xóa</button>';
        listEl.appendChild(div);
        $('input', div).focus();
      }
      return;
    }

    const remPhone = e.target.closest('[data-remove-phone]');
    if (remPhone) {
      const row = remPhone.closest('.phone-row');
      if (row) row.remove();
      return;
    }

    const courseNext = e.target.closest('[data-course-next]');
    if (courseNext) {
      const f = $('#form-course-create');
      if (!f) return;
      const term = f.querySelector('[name="term"]');
      const name = f.querySelector('[name="name"]');
      if (!term.reportValidity() || !name.reportValidity()) return;
      const newCode = `${term.value.trim()}${name.value.trim()}`;
      if (DB.classes.some((c) => c.code === newCode)) {
        toast(`Mã lớp ${newCode} đã tồn tại!`);
        return;
      }
      $('#step-1', f).classList.add('hidden');
      $('#step-2', f).classList.remove('hidden');
      return;
    }

    const delSub = e.target.closest('[data-delete-subject]');
    if (delSub) {
      const sc = delSub.dataset.deleteSubject;
      if (DB.classes.some((c) => c.subject === sc)) { toast(`Không thể xóa môn ${sc} vì đang có lớp học trực thuộc.`); return; }
      if (!window.confirm(`Xóa môn học ${sc}?`)) return;
      DB.subjects = DB.subjects.filter((s) => s.code !== sc);
      logActivity('Xóa môn học', sc);
      saveDB();
      toast(`Đã xóa môn học ${sc}.`);
      mount();
      return;
    }

    const delCourse = e.target.closest('[data-delete-course]');
    if (delCourse) {
      const cc = delCourse.dataset.deleteCourse;
      if (!window.confirm(`Xóa lớp học ${cc} cùng toàn bộ học liệu, thông báo, bài tập và diễn đàn của lớp?`)) return;
      const itemCodes = DB.items.filter((i) => i.classCode === cc).map((i) => i.code);
      DB.classes = DB.classes.filter((c) => c.code !== cc);
      DB.materials = DB.materials.filter((m) => m.classCode !== cc);
      DB.announcements = DB.announcements.filter((a) => a.classCode !== cc);
      DB.items = DB.items.filter((i) => i.classCode !== cc);
      DB.records = DB.records.filter((r) => !itemCodes.includes(r.itemCode));
      DB.forums = DB.forums.filter((f) => f.classCode !== cc);
      DB.posts = DB.posts.filter((p) => p.classCode !== cc);
      logActivity('Xóa lớp học', cc);
      saveDB();
      toast(`Đã xóa lớp học ${cc}.`);
      mount();
      return;
    }

    const toggleUser = e.target.closest('[data-toggle-user]');
    if (toggleUser) {
      const acc = toggleUser.dataset.toggleUser;
      const u = DB.users.find((x) => x.account === acc);
      if (!u) return;
      u.status = u.status === 'Active' ? 'Inactive' : 'Active';
      logActivity(u.status === 'Inactive' ? 'Khóa tài khoản (Inactive)' : 'Mở khóa tài khoản (Active)', acc);
      saveDB();
      toast(`Đã chuyển trạng thái "${acc}" sang ${u.status}.`);
      mount();
      return;
    }

    const delUser = e.target.closest('[data-delete-user]');
    if (delUser) {
      const acc = delUser.dataset.deleteUser;
      const u = DB.users.find((x) => x.account === acc);
      if (!u) return;
      if (u.role === 'Giảng viên' && DB.classes.some((c) => c.teacherCode === u.code)) {
        toast(`Không thể xóa giảng viên ${u.name} vì đang phụ trách lớp học.`);
        return;
      }
      if (!window.confirm(`Xóa tài khoản ${acc} (${u.name})?`)) return;
      DB.users = DB.users.filter((x) => x.account !== acc);
      if (u.role === 'Sinh viên') {
        DB.classes.forEach((c) => { c.studentCodes = c.studentCodes.filter((s) => s !== u.code); });
        DB.records = DB.records.filter((r) => r.mssv !== u.code);
      }
      logActivity('Xóa người dùng', acc);
      saveDB();
      toast(`Đã xóa người dùng ${acc}.`);
      mount();
      return;
    }

    const delMat = e.target.closest('[data-delete-material]');
    if (delMat) {
      const mc = delMat.dataset.deleteMaterial;
      if (!window.confirm(`Xóa học liệu ${mc}?`)) return;
      DB.materials = DB.materials.filter((m) => m.code !== mc);
      saveDB();
      toast(`Đã xóa học liệu ${mc}.`);
      mount();
      return;
    }

    const delAnn = e.target.closest('[data-delete-announcement]');
    if (delAnn) {
      const ac = delAnn.dataset.deleteAnnouncement;
      if (!window.confirm(`Xóa thông báo ${ac}?`)) return;
      DB.announcements = DB.announcements.filter((a) => a.code !== ac);
      saveDB();
      toast(`Đã xóa thông báo ${ac}.`);
      mount();
      return;
    }

    const delItem = e.target.closest('[data-delete-item]');
    if (delItem) {
      const ic = delItem.dataset.deleteItem;
      if (!window.confirm(`Xóa bài tập/quiz ${ic} cùng toàn bộ bài nộp và điểm liên quan?`)) return;
      DB.items = DB.items.filter((i) => i.code !== ic);
      DB.records = DB.records.filter((r) => r.itemCode !== ic);
      saveDB();
      toast(`Đã xóa ${ic}.`);
      mount();
      return;
    }

    const createForum = e.target.closest('[data-create-forum]');
    if (createForum) {
      const cc = createForum.dataset.createForum;
      const newCode = nextSeq(cc + 'FR', DB.forums.filter((f) => f.classCode === cc).map((f) => f.code));
      DB.forums.push({ code: newCode, classCode: cc });
      saveDB();
      setFlash(`Đã tạo forum mới ${newCode}.`);
      location.href = withClass('forum.html?f=' + encodeURIComponent(newCode), cc);
      return;
    }

    const delPost = e.target.closest('[data-delete-post]');
    if (delPost) {
      const pc = delPost.dataset.deletePost;
      if (!window.confirm(`Xóa bài viết ${pc}?`)) return;
      DB.posts = DB.posts.filter((p) => p.code !== pc && p.parent !== pc);
      saveDB();
      if (delPost.dataset.after) {
        setFlash(`Đã xóa bài viết ${pc}.`);
        location.href = delPost.dataset.after;
      } else {
        toast(`Đã xóa bài viết ${pc}.`);
        mount();
      }
      return;
    }

    const el = e.target.closest('[data-show],[data-hide],[data-alert]');
    if (!el) return;
    if (el.dataset.alert) toast(el.dataset.alert);
    if (el.dataset.show) $$(el.dataset.show).forEach((x) => x.classList.remove('hidden'));
    if (el.dataset.hide) $$(el.dataset.hide).forEach((x) => x.classList.add('hidden'));
  });

  document.addEventListener('input', (e) => {
    if (e.target.closest('#form-course-create')) syncCourseCreatePreview();
    if (e.target.closest('#form-user-create')) syncUserCreatePreview();
    if (e.target.matches('[data-filter-q]')) applyFilter(e.target.dataset.filterQ);
  });

  document.addEventListener('change', (e) => {
    if (e.target.matches('select[data-switch]')) applySwitch(e.target);
    if (e.target.matches('[data-filter-target]')) applyFilter(e.target.dataset.filterTarget);
    if (e.target.matches('[data-view-mode]')) {
      ssSet(VIEW_KEY, e.target.value);
      mount();
      return;
    }
    if (e.target.matches('[data-sort-mode]')) {
      ssSet(SORT_KEY, e.target.value);
      mount();
      return;
    }
    if (e.target.matches('[data-nav-select]')) {
      const base = e.target.dataset.navSelect;
      const param = e.target.dataset.navParam;
      location.href = `${base}${base.includes('?') ? '&' : '?'}${param}=${encodeURIComponent(e.target.value)}`;
    }
  });

  document.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;

    if (f.hasAttribute('data-login')) {
      doLogin(f.querySelector('[name="user"]').value, f.querySelector('[name="pass"]').value, f.dataset.next || '');
      return;
    }

    if (f.id === 'form-new-khoa') {
      const kCode = f.querySelector('[name="code"]').value.trim().toUpperCase();
      const kName = f.querySelector('[name="name"]').value.trim();
      if (DB.khoa.some((k) => k.code === kCode)) { toast(`Mã khoa ${kCode} đã tồn tại.`); return; }
      DB.khoa.push({ code: kCode, name: kName });
      logActivity('Thêm khoa', kCode);
      saveDB();
      toast(`Đã thêm khoa ${kCode}.`);
      mount();
      return;
    }

    if (f.id === 'form-subject') {
      const editCode = f.dataset.edit;
      const sCode = f.querySelector('[name="code"]').value.trim().toUpperCase();
      const sName = f.querySelector('[name="name"]').value.trim();
      const sKhoa = f.querySelector('[name="khoa"]').value;
      const admins = Array.from(f.querySelector('[name="admins"]').selectedOptions).map((o) => o.value);
      if (!admins.length) { toast('Cần chọn ít nhất một quản trị viên quản lý.'); return; }
      if (editCode) {
        const sub = DB.subjects.find((x) => x.code === editCode);
        if (sub) { sub.name = sName; sub.khoa = sKhoa; sub.admins = admins; }
        logActivity('Cập nhật môn học', editCode);
        saveDB();
        setFlash(`Đã cập nhật môn học ${editCode}.`);
      } else {
        if (DB.subjects.some((x) => x.code === sCode)) { toast(`Mã môn ${sCode} đã tồn tại.`); return; }
        DB.subjects.push({ code: sCode, name: sName, khoa: sKhoa, admins });
        logActivity('Tạo môn học', sCode);
        saveDB();
        setFlash(`Đã tạo môn học ${sCode}.`);
      }
      location.href = 'subjects.html';
      return;
    }

    if (f.id === 'form-course-create') {
      const subject = f.querySelector('[name="subject"]').value;
      const term = f.querySelector('[name="term"]').value.trim();
      const name = f.querySelector('[name="name"]').value.trim();
      const clsCode = `${term}${name}`;
      const teacherCode = f.querySelector('[name="teacherCode"]').value;
      const studentCodes = Array.from(f.querySelector('[name="studentCodes"]').selectedOptions).map((o) => o.value);
      if (DB.classes.some((c) => c.code === clsCode)) { toast(`Mã lớp ${clsCode} đã tồn tại.`); return; }
      DB.classes.push({ code: clsCode, name, subject, term, teacherCode, studentCodes });
      DB.forums.push({ code: `${clsCode}FR1`, classCode: clsCode });
      logActivity('Tạo lớp học', clsCode);
      saveDB();
      setFlash(`Đã tạo lớp học ${clsCode}.`);
      location.href = 'courses.html';
      return;
    }

    if (f.id === 'form-course-edit') {
      const cls = classOf(f.dataset.code);
      if (!cls) return;
      cls.subject = f.querySelector('[name="subject"]').value;
      cls.teacherCode = f.querySelector('[name="teacherCode"]').value;
      cls.studentCodes = Array.from(f.querySelector('[name="studentCodes"]').selectedOptions).map((o) => o.value);
      logActivity('Cập nhật lớp học', cls.code);
      saveDB();
      setFlash(`Đã cập nhật lớp học ${cls.code}.`);
      location.href = 'courses.html';
      return;
    }

    if (f.id === 'form-user-create') {
      const roleVal = f.querySelector('[name="role"]').value;
      const role = roleVal === 'lecturer' ? 'Giảng viên' : 'Sinh viên';
      const status = f.querySelector('[name="status"]').value;
      const name = f.querySelector('[name="name"]').value.trim();
      const email = f.querySelector('[name="email"]').value.trim().toLowerCase();
      const account = email.split('@')[0];
      const password = f.querySelector('[name="password"]').value;
      const uCode = (roleVal === 'lecturer' ? f.querySelector('[name="teacherCode"]') : f.querySelector('[name="mssv"]')).value.trim();
      const phones = $$('input[name="phone[]"]', f).map((i) => i.value.trim()).filter(Boolean);
      if (!uCode) { toast(`Vui lòng nhập ${roleVal === 'lecturer' ? 'Mã giảng viên (5 số)' : 'MSSV (6 số)'}.`); return; }
      if (DB.users.some((u) => u.account.toLowerCase() === account)) { toast(`Tên tài khoản "${account}" đã tồn tại.`); return; }
      if (DB.users.some((u) => u.role === role && u.code === uCode)) { toast(`Mã ${uCode} đã tồn tại.`); return; }
      DB.users.push({ account, name, role, code: uCode, phones, status, password });
      logActivity('Tạo người dùng', account);
      saveDB();
      setFlash(`Đã tạo tài khoản ${account} (${role}).`);
      location.href = 'users.html';
      return;
    }

    if (f.id === 'form-user-edit') {
      const u = DB.users.find((x) => x.account === f.dataset.account);
      if (!u) return;
      u.name = f.querySelector('[name="name"]').value.trim();
      u.status = f.querySelector('[name="status"]').value;
      u.phones = $$('input[name="phone[]"]', f).map((i) => i.value.trim()).filter(Boolean);
      const pw = f.querySelector('[name="password"]').value;
      if (pw) u.password = pw;
      logActivity('Cập nhật người dùng', u.account);
      saveDB();
      setFlash(`Đã lưu thông tin người dùng ${u.account}.`);
      location.href = 'users.html';
      return;
    }

    if (f.id === 'form-material') {
      const cc = f.dataset.class;
      const editId = f.dataset.editId;
      const type = editId ? f.dataset.editType : f.querySelector('[name="type"]').value;
      const title = f.querySelector('[name="title"]').value.trim();
      let content = f.querySelector('[name="content"]').value.trim();
      const fileInput = f.querySelector('[name="file"]');
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const fn = fileInput.files[0].name;
        if (!content.includes(fn)) content = content ? `${content} (${fn})` : `File ${fn}`;
      }
      if (type === 'announcement') {
        if (editId) {
          const a = DB.announcements.find((x) => x.code === editId);
          if (a) { a.title = title; a.content = content; }
          setFlash(`Đã cập nhật thông báo ${editId}.`);
        } else {
          const newCode = nextSeq(cc + 'TB', classAnnouncements(cc).map((x) => x.code));
          DB.announcements.push({ code: newCode, classCode: cc, title, content });
          setFlash(`Đã đăng thông báo ${newCode}.`);
        }
      } else {
        if (editId) {
          const m = DB.materials.find((x) => x.code === editId);
          if (m) { m.name = title; m.content = content; }
          setFlash(`Đã cập nhật học liệu ${editId}.`);
        } else {
          const newCode = nextSeq(cc + 'HL', classMaterials(cc).map((x) => x.code));
          DB.materials.push({ code: newCode, classCode: cc, name: title, content });
          setFlash(`Đã tạo học liệu ${newCode}.`);
        }
      }
      saveDB();
      location.href = withClass('materials.html', cc);
      return;
    }

    if (f.id === 'form-assignment') {
      const cc = f.dataset.class;
      const editCode = f.dataset.editCode;
      const kind = f.querySelector('[name="kind"]').value === 'quiz' ? 'Quiz' : 'Bài nộp';
      const name = f.querySelector('[name="name"]').value.trim();
      const desc = f.querySelector('[name="desc"]').value.trim();
      const posted = f.querySelector('[name="posted"]').value.replace('T', ' ');
      const deadline = f.querySelector('[name="deadline"]').value.replace('T', ' ');
      if (deadline <= posted) { toast('Deadline phải diễn ra sau thời gian đăng!'); return; }
      const quizProps =
        kind === 'Quiz'
          ? {
              duration: f.querySelector('[name="duration"]').value ? Number(f.querySelector('[name="duration"]').value) : null,
              maxAttempts: Math.max(1, Number(f.querySelector('[name="maxAttempts"]').value) || 1),
              scoring: f.querySelector('[name="scoring"]').value,
              content: f.querySelector('[name="content"]').value.trim() || 'Câu 1. Trả lời câu hỏi theo yêu cầu môn học.',
            }
          : {};
      if (editCode) {
        const it = DB.items.find((x) => x.code === editCode);
        if (it) Object.assign(it, { name, desc, posted, deadline, ...quizProps });
        setFlash(`Đã cập nhật ${editCode}.`);
      } else {
        const newCode = nextSeq(cc + 'BT', classItems(cc).map((x) => x.code));
        DB.items.push({ code: newCode, classCode: cc, kind, name, desc, posted, deadline, ...quizProps });
        setFlash(`Đã tạo ${kind.toLowerCase()} ${newCode}.`);
      }
      saveDB();
      location.href = withClass('assignments.html', cc);
      return;
    }

    if (f.id === 'form-grades') {
      const cc = f.dataset.class;
      const itemCode = f.dataset.item;
      const item = DB.items.find((x) => x.code === itemCode);
      const cls = classOf(cc);
      if (!item || !cls) return;
      cls.studentCodes.forEach((mssv) => {
        const inp = f.querySelector(`[name="grade_${mssv}"]`);
        if (!inp) return;
        const raw = inp.value.trim();
        if (raw === '') {
          const existing = DB.records.find((r) => r.itemCode === itemCode && r.mssv === mssv);
          if (existing) existing.score = null;
          return;
        }
        const rounded = Number(Math.max(0, Math.min(10, Number(raw))).toFixed(2));
        const existing = DB.records.find((r) => r.itemCode === itemCode && r.mssv === mssv);
        if (existing) existing.score = rounded;
        else {
          upsertRecord(itemCode, mssv, {
            status: item.kind === 'Quiz' ? 'Đã làm' : 'Đã nộp',
            time: nowStr(),
            content: 'Chấm trực tiếp',
            attempts: 1,
            attemptScores: item.kind === 'Quiz' ? [rounded] : [],
            score: rounded,
          });
        }
      });
      saveDB();
      toast('Đã lưu bảng điểm và đồng bộ tới sinh viên.');
      mount();
      return;
    }

    if (f.id === 'form-quiz-submit') {
      const cc = f.dataset.class;
      const itemCode = f.dataset.item;
      const q = DB.items.find((x) => x.code === itemCode);
      if (!q) return;
      const mssv = CTX.session.code;
      const ans = f.querySelector('[name="answer"]').value.trim();
      const fileInput = f.querySelector('[name="file"]');
      const fn = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0].name : '';
      const content = [ans, fn ? `File: ${fn}` : ''].filter(Boolean).join(' | ') || '(Nộp bài trống)';
      const prev = getRecord(q, mssv);
      const nextAttempts = (prev.attempts || 0) + 1;
      const simScore = !ans && !fn ? 0 : Math.min(10, Number((7 + Math.min(3, ans.length / 40)).toFixed(2)));
      const attemptScores = [...(prev.attemptScores || []), simScore];
      const finalScore = computeQuizScore(q.scoring, attemptScores);
      upsertRecord(itemCode, mssv, {
        status: 'Đã làm', time: nowStr(), content, attempts: nextAttempts, attemptScores, score: finalScore,
      });
      saveDB();
      clearTimers();
      setFlash(`Đã nộp bài quiz! Điểm lượt này: ${simScore.toFixed(2)}.`);
      location.href = withClass(`quiz-intro.html?i=${encodeURIComponent(itemCode)}&done=1`, cc);
      return;
    }

    if (f.id === 'form-file-submit') {
      const cc = f.dataset.class;
      const itemCode = f.dataset.item;
      const a = DB.items.find((x) => x.code === itemCode);
      if (!a) return;
      const mssv = CTX.session.code;
      const text = f.querySelector('[name="content"]').value.trim();
      const fileInput = f.querySelector('[name="file"]');
      const fn = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0].name : '';
      if (!text && !fn) { toast('Vui lòng nhập nội dung bài nộp hoặc đính kèm tệp.'); return; }
      const tNow = nowStr();
      const status = tNow <= a.deadline ? 'Đã nộp' : 'Nộp trễ';
      const content = [fn, text].filter(Boolean).join(' — ');
      const prev = getRecord(a, mssv);
      upsertRecord(itemCode, mssv, { status, time: tNow, content, attempts: (prev.attempts || 0) + 1, score: prev.score });
      saveDB();
      location.href = withClass(`submit-success.html?i=${encodeURIComponent(itemCode)}`, cc);
      return;
    }

    if (f.id === 'form-profile') {
      const u = DB.users.find((x) => x.account === CTX.session.account);
      if (!u) return;
      u.name = f.querySelector('[name="name"]').value.trim();
      u.phones = $$('input[name="phone[]"]', f).map((i) => i.value.trim()).filter(Boolean);
      const pw = f.querySelector('[name="password"]').value;
      if (pw) u.password = pw;
      saveDB();
      toast(pw ? 'Đã cập nhật hồ sơ và mật khẩu mới.' : 'Đã cập nhật hồ sơ cá nhân.');
      mount();
      return;
    }

    if (f.id === 'form-new-thread') {
      const cc = f.dataset.class;
      const forumCode = f.dataset.forum;
      const title = f.querySelector('[name="title"]').value.trim();
      let content = f.querySelector('[name="content"]').value.trim();
      const fileInput = f.querySelector('[name="file"]');
      if (fileInput && fileInput.files && fileInput.files[0]) content += `\n[Đính kèm: ${fileInput.files[0].name}]`;
      const newCode = nextSeq(forumCode + '_', DB.posts.filter((p) => p.forum === forumCode).map((p) => p.code));
      DB.posts.push({
        code: newCode, forum: forumCode, classCode: cc, title, content, time: nowStr(),
        authorAccount: CTX.session.account, author: CTX.session.name, parent: null,
      });
      saveDB();
      toast(`Đã đăng chủ đề ${newCode}.`);
      mount();
      return;
    }

    if (f.id === 'form-reply') {
      const cc = f.dataset.class;
      const forumCode = f.dataset.forum;
      const parentCode = f.dataset.parent;
      const title = f.querySelector('[name="title"]').value.trim();
      const content = f.querySelector('[name="content"]').value.trim();
      const newCode = nextSeq(forumCode + '_', DB.posts.filter((p) => p.forum === forumCode).map((p) => p.code));
      DB.posts.push({
        code: newCode, forum: forumCode, classCode: cc, title, content, time: nowStr(),
        authorAccount: CTX.session.account, author: CTX.session.name, parent: parentCode,
      });
      saveDB();
      toast('Đã gửi phản hồi.');
      mount();
      return;
    }

    if (f.id === 'form-edit-post') {
      const p = DB.posts.find((x) => x.code === f.dataset.code);
      if (!p || p.authorAccount !== CTX.session.account) return;
      p.title = f.querySelector('[name="title"]').value.trim();
      p.content = f.querySelector('[name="content"]').value.trim();
      const fileInput = f.querySelector('[name="file"]');
      if (fileInput && fileInput.files && fileInput.files[0]) p.content += `\n[Đính kèm: ${fileInput.files[0].name}]`;
      saveDB();
      setFlash('Đã lưu chỉnh sửa bài viết.');
      location.href = f.dataset.back;
      return;
    }
  });

  document.addEventListener('DOMContentLoaded', mount);
})();
