# 🎯 Semester Project 2 – Auction House Front-End (Noroff API v2)

This repository contains my **Semester Project 2 (SP2)** for the Front-End Development course.  
The project is a fully functional **Auction House web application**, built using **Vanilla TypeScript**, **Tailwind CSS**, and **modern ES2025+ JavaScript features**.

The goal is to create a responsive, accessible, and user-friendly interface that integrates with the **Noroff Auction House API (v2)** — supporting features like authentication, listing management, and bidding.

---

## 📸 Preview

<img width="1496" height="828" alt="Screenshot 2026-06-03 at 4 17 26 PM" src="https://github.com/user-attachments/assets/6da64143-aea0-4000-8880-f3d20a68f37a" />
<img width="1498" height="829" alt="image" src="https://github.com/user-attachments/assets/d4321579-2536-46f5-add7-0439616a2a1c" />
<img width="1497" height="829" alt="Screenshot 2026-06-03 at 4 18 40 PM" src="https://github.com/user-attachments/assets/643555b1-9fa6-45b9-90e2-d9c5624fdb88" />
<img width="1496" height="829" alt="image" src="https://github.com/user-attachments/assets/532c38a8-bac1-4693-baf4-24a2165611dd" />
<img width="1498" height="827" alt="image" src="https://github.com/user-attachments/assets/11694eb1-f22a-485e-a041-5188f50ca61d" />

---

## 🚀 Live Project & Resources

- **Live Demo:** [Live](https://auctionn-house.netlify.app/)
- **Design File (Figma):** [View Design](https://www.figma.com/design/24nEKpFa9DxvuXji5oADrA/Auction-House?node-id=0-1&t=Y3NHqNFoxxfqlW0W-1)
- **Project Planning:** [Kanban Board](https://github.com/users/Nirush4/projects/12)

---

## 🧩 Features

- **Authentication System**
  - User Registration and Login (via Noroff Auth API)
  - JWT Token handling and secure storage
- **Listings**
  - Browse, search, and view active listings
  - Create, edit, and delete listings (authenticated users)
- **Bidding System**
  - Place and view bids on listings
  - Real-time updates for bid information
- **Profile Management**
  - Display user profile data and owned listings
  - Update avatar and view total credits
- **UX Enhancements**
  - Tailwind-powered responsive layout
  - Dynamic DOM updates (no reloads)
  - Error messages and success notifications
- **API Integration**
  - Modular API handling with TypeScript
  - Full CRUD implementation for Auction endpoints

---

## 🧠 Tech Stack

| Category   | Technology                          |
| ---------- | ----------------------------------- |
| Language   | **TypeScript (ES2025)**             |
| Styling    | **Tailwind CSS**                    |
| Build Tool | **Vite**                            |
| API        | **Noroff API v2 (Auction + Auth)**  |
| Hosting    | **Netlify / GitHub Pages / Vercel** |
| Planning   | **Trello / GitHub Projects**        |
| Design     | **Figma**                           |

## 🗂️ Project Structure

```auction-house
project-root/
├── index.html
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── README.md
│
├── styles/
│   ├── index.css
│   └── styles.css # built by Tailwind
│
└── src/
    ├── main.ts
    ├── router.ts
    │
    ├── assets/
    │   ├── images/
    │   └── icons/
    │
    ├── types/
    │   ├── listing.ts
    │   └── profile.ts
    │
    ├── api/
    │   ├── auth.ts
    │   ├── bids.ts
    │   ├── listings.ts
    │   └── profile.ts
    │
    ├── views/
    │   ├── home.ts
    │   ├── login.ts
    │   ├── register.ts
    │   ├── profile.ts
    │   ├── createListing.ts
    │   └── listingDetails.ts
    │
    ├── components/
    │   ├── navbar.ts
    │   └── footer.ts
    │
    └── utils/
        ├── storage.ts
        └── validation.ts

```

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Nirush4/Semester-Project-2
```

```bash
npm install
```

### Create a `.env` file

Copy the example below and adjust as needed:

```env
# .env
VITE_API_BASE_URL=https://api.noroff.dev/api/v2
VITE_API_AUCTION_URL=https://api.noroff.dev/api/v2/auction
VITE_API_AUTH_URL=https://api.noroff.dev/api/v2/auth
```

```bash
npm run dev
```

```bash
npm run build
```

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Author 👨‍💻​

• Nirushan Rajamanoharan (@Nirush4)

**Happy coding!**
