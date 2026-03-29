# NextDNS Blocklist Automator 🛡️

A sleek, modern, and fault-tolerant tool to automatically sync external domain blocklists to your NextDNS Denylist using the NextDNS API. 

This project provides a 100% client-side, secure, and blazing-fast way to process massive raw text lists (like Hagezi, OISD, StevenBlack) and push them directly to your NextDNS profile.

## ✨ Key Features

* **"Bulldozer" Fault-Tolerant Parsers:** Built to handle real-world, messy data. It silently ignores comments, preamble text, empty lines, and broken formatting, surgically extracting only the valid domains.
* **Broad Format Support:** Seamlessly parses 9 different list formats:
  * Adblock / uBlock Origin (`||example.com^`)
  * Hosts (`0.0.0.0 example.com`)
  * Hosts Compressed (`0.0.0.0 domain1.com domain2.com`)
  * Dnsmasq (`address=/example.com/` or `local=/example.com/`)
  * RPZ, Domains, Subdomains, Wildcard Asterisk, and Wildcard Domains.
* **Premium UI / UX:** Designed with a modern aesthetic inspired by the NextDNS brand. Features a responsive layout, a macOS-style terminal log window, and smooth animations.
* **Dark Mode & i18n:** Fully supports Dark/Light mode and comes with built-in translations for English (EN), Turkish (TR), Russian (RU), Chinese (ZH), and Spanish (ES).
* **Privacy First (Client-Side):** Your NextDNS API key and Profile ID are never stored on any server. All processing and API calls happen directly within your browser.

## 🚀 Getting Started (Local Development)

First, install the dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🛠️ Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
* **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
* **Typography:** Mulish (Primary) & Geist Mono (Terminal)
* **Theming:** next-themes

## ☕ Support the Project

If you find this open-source tool useful for managing your network privacy, consider supporting the development. You can buy me a coffee via crypto:

* **USDT (BEP20 / BSC):** `0xd8F29d8F4f2346b14C78Fe36Eaebb5A434B890B6`
* **USDT (Solana / SPL):** `7kitvtMt6Ep3dz3UqexPPR4JzJBPfm28QtfTkK3LeSMU`

*(Note: Please ensure you are sending on the correct network to avoid loss of funds.)*

## ⚠️ Disclaimer

This is an independent open-source project and is **not** officially affiliated with, maintained, or endorsed by NextDNS Inc. Always review the blocklists you are adding to avoid breaking legitimate websites.
