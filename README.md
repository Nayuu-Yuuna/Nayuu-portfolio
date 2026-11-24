# 🛡️ Blue Team & CTF Writeups Portfolio

Trang web Portfolio chuyên nghiệp dành riêng cho **Blue Team Analyst / DFIR Researcher / CTF Forensics Player**, tối ưu để đăng bài phân tích labs (**CyberDefenders, HTB Sherlocks, TryHackMe**) và writeups thi đấu CTF.

Được xây dựng bằng **Astro + TailwindCSS**, giao diện tối Cyber/Terminal, tốc độ tải tức thì, tích hợp Shiki Code Syntax Highlighting và bộ lọc tìm kiếm theo MITRE ATT&CK / Artifacts.

---

## 🚀 Khởi chạy trên máy tính

Mở Terminal (PowerShell hoặc Command Prompt) trong thư mục này:

```bash
# Cài đặt thư viện (nếu chưa cài)
npm install

# Chạy server xem trước ở chế độ phát triển
npm run dev
```

Truy cập: `http://localhost:4321` trên trình duyệt.

Để build ra thư mục tĩnh (`dist/`):
```bash
npm run build
```

---

## 📝 Cách thêm bài viết Writeup / Lab mới (Chỉ 1 phút)

Mỗi bài viết là một file Markdown (`.md`) nằm trong thư mục `src/content/writeups/`.

Ví dụ tạo file: `src/content/writeups/my-new-investigation.md`:

```markdown
---
title: "CyberDefenders - Lab Name: Title Here"
description: "Mô tả ngắn gọn về tình huống tấn công và mục tiêu điều tra."
publishDate: "2026-03-20"
category: "Memory Forensics"       # Chọn: DFIR | Memory Forensics | Network Forensics | Threat Hunting | Malware Analysis | SOC Labs | CTF Challenge | Active Directory Defense
platform: "CyberDefenders"          # Chọn: CyberDefenders | HackTheBox | TryHackMe | LetsDefend | CTF Event | Custom Lab
difficulty: "Medium"                # Chọn: Easy | Medium | Hard | Insane
tags: ["volatility", "pcap", "cve-xxxx"]
artifacts: ["memory.raw", "traffic.pcap"]
mitreAttck: ["T1055 (Process Injection)", "T1071 (Web Protocols)"]
verdict: "Mã độc C2 giao tiếp với IP 192.168.1.50"
flag: "FLAG{sample_flag_here}"      # Có hiệu ứng làm mờ spoiler click để xem
featured: false                     # Đặt true nếu muốn hiện ở trang chủ
---

## 1. Tóm tắt tình huống (Scenario Brief)
Nội dung phân tích...

## 2. Quá trình điều tra (Investigation Steps)
\`\`\`bash
# Chạy lệnh Volatility hoặc Wireshark
python3 vol.py -f memory.raw windows.pstree
\`\`\`

## 3. Bằng chứng số & IOCs (Indicators of Compromise)
| Loại | Giá trị |
| :--- | :--- |
| IP | 192.168.1.50 |
| SHA256 | e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 |

## 4. Quy tắc phát hiện (Sigma / YARA)
\`\`\`yaml
title: Detect Cobalt Strike
...
\`\`\`
```

Lưu file lại, Astro sẽ **tự động phân loại, tạo trang riêng và cập nhật vào danh mục tìm kiếm**!

---

## 🌐 Triển khai lên GitHub Pages (Miễn phí 100%)

Dự án đã có sẵn file workflow tự động `.github/workflows/deploy.yml`:

1. Tạo một repository mới trên GitHub (ví dụ: `my-portfolio` hoặc `<username>.github.io`).
2. Đẩy toàn bộ mã nguồn lên repository:
   ```bash
   git init
   git add .
   git commit -m "Initial Blue Team Portfolio"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo-name>.git
   git push -u origin main
   ```
3. Trên GitHub, vào mục **Settings -> Pages**:
   - Ở mục **Build and deployment -> Source**, chọn **GitHub Actions**.
4. GitHub Actions sẽ tự động build và cấp domain `https://<username>.github.io` miễn phí!

---

## 📁 Cấu trúc thư mục

- `src/content/writeups/`: Nơi chứa toàn bộ bài viết writeups và lab reports.
- `src/pages/index.astro`: Trang chủ với giao diện Terminal SOC, thống kê số lượng lab, bài viết nổi bật.
- `src/pages/writeups/`: Trang danh mục bài viết kèm bộ lọc tìm kiếm theo TTP, Artifact, Platform, Category.
- `src/pages/cheatsheet.astro`: Trang cẩm nang câu lệnh nhanh (Volatility 3, Wireshark, Sysmon, Event IDs, MFT).
- `src/pages/about.astro`: Trang giới thiệu bản thân, chứng chỉ (BTL1, CCD, Sec+, OSCP), xếp hạng CyberDefenders / HTB.
