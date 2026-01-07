# 🎯 Semester Project 2 – Auction House Front-End (Noroff API v2)

This repository contains my **Semester Project 2 (SP2)** for the Front-End Development course.  
The project is a fully functional **Auction House web application**, built using **Vanilla TypeScript**, **Tailwind CSS**, and **modern ES2025+ JavaScript features**.

The goal is to create a responsive, accessible, and user-friendly interface that integrates with the **Noroff Auction House API (v2)** — supporting features like authentication, listing management, and bidding.

---

## 🚀 Live Project & Resources

- **Live Demo:** [https://your-project-name.netlify.app](https://your-project-name.netlify.app)
- **API Docs:** [Noroff Auction House API v2](https://docs.noroff.dev/docs/v2/auction/overview)
- **Auth API Docs:** [Noroff Auth API v2](https://docs.noroff.dev/docs/v2/auth/overview)
- **Design File (Figma):** [View Design](https://www.figma.com/)
- **Project Planning:** [Trello Board](https://trello.com/)

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

## Testing

### Run unit tests

```bash
npm test
```

### Run e2e tests

```bash
npm run e2e
```

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Author 👨‍💻​

• Nirushan Rajamanoharan (@Nirush4)

**Happy coding!**
