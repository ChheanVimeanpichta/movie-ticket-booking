import { Link } from "react-router-dom";

const columns = [
  {
    heading: "Experience",
    links: [
      { label: "Now Showing", to: "/" },
      { label: "Coming Soon", to: "/coming-soon" },
      { label: "Cinemas", to: "/theaters" },
      { label: "Gift Cards", to: "/gift-cards" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help Center", to: "/help" },
      { label: "Refund Policy", to: "/refunds" },
      { label: "Contact Us", to: "/contact" },
      { label: "Accessibility", to: "/accessibility" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-cine-border bg-cine-bg">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.5fr_1fr_1fr_1.5fr]">
          <div>
            <span className="text-xl font-black tracking-tight text-cine-red">
              CINE<span className="text-cine-white">STAR</span>
            </span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-cine-text">
              Experience cinema the way it was meant to be. Premium screens,
              crystal-clear sound, and the latest blockbusters in the heart of
              London.
            </p>
            <div className="mt-5 flex gap-4">
              <a href="#" aria-label="Instagram" className="text-cine-text hover:text-cine-pink transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="#" aria-label="Facebook" className="text-cine-text hover:text-cine-pink transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" aria-label="Twitter" className="text-cine-text hover:text-cine-pink transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" aria-label="YouTube" className="text-cine-text hover:text-cine-pink transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="font-body text-sm font-semibold text-cine-white">
                {col.heading}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-cine-text transition-colors hover:text-cine-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="font-body text-sm font-semibold text-cine-white">
              Newsletter
            </h3>
            <p className="mt-2 text-sm text-cine-text">
              Get showtimes and early-access tickets in your inbox.
            </p>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded border border-cine-border bg-cine-card px-3 py-2 text-sm text-cine-white placeholder:text-cine-text/70 focus:outline-none focus:border-cine-red"
              />
              <button
                type="submit"
                className="shrink-0 rounded bg-cine-red px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cine-red/90"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-cine-border pt-6 text-xs text-cine-text sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} CineStar Cinemas. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-cine-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/cookies" className="hover:text-cine-white transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
