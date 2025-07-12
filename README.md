# keytune

# 🔑🎶 KeyTune — Secure & Smart Music Sharing

> **KeyTune is a secure music-sharing platform that allows users to create time-limited, watermark-protected audio links with optional premium access and detailed listener analytics.**

## 🚀 Live Demo

👉 [View Deployed Project](#)  
_Replace `#` with your deployed URL_

---

## 📖 Project Overview

KeyTune is built for **independent artists, podcasters, and creators** who want to securely share unreleased audio content. Instead of sending risky download links, users can generate **temporary streaming links** with advanced protections:

- ⏳ Time-limited or one-time playback access  
- 💧 Watermarking to help prevent leaks  
- 💰 Stripe-powered pay-to-access content  
- 📊 Listener analytics (plays, location, browser)  

---

## 👥 Who It's For

- 🎧 Musicians sharing demos with collaborators or record labels  
- 🎙️ Podcasters providing early access to subscribers  
- 🧠 Creators monetizing previews of unreleased content  
- 🛡️ Anyone needing controlled, secure audio sharing  

---

## 🧠 What We Learned

During this hackathon, we deep-dived into:

- ✅ Supabase for authentication and real-time database interactions  
- ✅ Stripe Checkout and Webhooks for monetized audio unlocks  
- ✅ Next.js App Router with client/server component boundaries  
- ✅ Shadcn/UI and Tailwind CSS for clean, fast styling  
- ✅ Avoiding hydration errors and SSR pitfalls  
- ✅ Secure environment variable management across platforms  

This experience solidified our understanding of **modern full-stack development** with secure backend logic and dynamic frontend behavior.

---

## 📁 Project Structure

```bash
keytune/
├── app/                # App Router pages and API routes
│   ├── api/            # Upload, Stripe, links endpoints
│   ├── dashboard/      # Authenticated user dashboard
│   ├── link/[id]/      # Public audio playback page
│   └── page.tsx        # Landing page
├── components/         # UI components (AudioPlayer, FileUpload, etc.)
├── lib/                # Supabase & Stripe logic
├── public/             # Static assets
└── .env.local          # API keys and secrets


## 🛠️ Built With

- **Next.js 14+ (App Router)**
- **Supabase** (Auth & DB)
- **Stripe** (Payments & Webhooks)
- **shadcn/ui** + **Tailwind CSS**
- **TypeScript**
- **Vercel** (Deployment)

---

## 🧪 How to Use

1. Upload a `.mp3` or audio file
2. Generate a secure link
3. Share the link — control how it's accessed
4. View analytics like playback count, IP, or location
