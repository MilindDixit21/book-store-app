Book Store App — Hybrid Cart with JWT Authentication

Welcome to the Book Store App! This project blends secure authentication with a persistent, guest-friendly cart system powered by Angular and Node.js.

Whether you're refactoring, extending features, or just browsing, this README will give you the architectural roadmap and key implementation notes.



🧩 Tech Stack

| Layer | Tools | 

| Frontend | Angular 15+, TypeScript, RxJS, SCSS | 

| Backend | Node.js, Express, MongoDB, Mongoose | 

| Auth | JWT, role-based access | 

| Cart Sync | LocalStorage, MongoDB, BehaviorSubject | 

| Creative | Custom branding, modals, toasts, UI polish | 







🔐 Authentication Flow

\- Users log in via JWT-based authentication (/api/auth/login)

\- Token and user profile are stored as:

\- auth\_token → JWT

\- user\_session → full user object (ID, role, email)

\- AuthService exposes:

\- isLoggedIn$: reactive auth state

\- getUserId(): returns current user ID

\- logout(): clears session + emits logout state



🛒 Hybrid Cart System

\- ✅ Guests use cart\_guest in localStorage

\- ✅ Logged-in users fetch and sync cart from MongoDB

\- 🔄 On login:

\- Guest cart + server cart are merged (combineGuestCart())

\- Synced back to server

\- UI is hydrated via loadCart()

\- 🔥 Cart operations trigger updateCartState() which:

\- Emits reactive stream via BehaviorSubject

\- Updates cart badge, total, and optionally localStorage



📦 CartService Highlights

loadCart(items: CartItem\[])     // hydrate reactive streams

syncCartToServer(payload)       // push to MongoDB with token

getUserCartFromServer()         // fetch using secure headers

combineGuestCart(server, guest) // merge logic with deduplication

updateCartState(save = true)    // emit + optionally save







🚀 App Initialization (Hybrid-Aware)

In app.component.ts:

\- Subscribes to authService.isLoggedIn$

\- On authenticated session:

\- Fetches server cart

\- Loads into reactive streams

\- Cleans up any leftover cart\_guest from previous guest use



🛡️ Route Protection \& Role Awareness

🔐 Currently working on integrating route guards

Guards will:



\- Protect /books/:id/edit for Admin and Editor roles

\- Redirect unauthorized users to /login



🧪 Dev Notes

\- Use .env for backend secrets — not committed!

\- Guest cart remains local until login or merge

\- All cart actions debounce updates for smoother UX

\- Login sync includes conflict resolution and fallback behaviors



🤝 Contributor Tips

\- Use authService.isLoggedIn$ over manual token checks

\- CartService is reactive — avoid mutating items\[] directly

\- Keep login/session logic centralized in auth.service.ts

\- Sync calls should only fire if authenticated (check first!)



Want this stylized with emojis, collapsible sections, or Markdown badges? Or want a separate Dev Setup guide? Just say the word — I’ve got templates and creativity to spare 🔧🧑‍🎨📄



