import "./globals.css";

export const metadata = {
  title: "StoryVerse — Your story, your choices",
  description: "An AI-powered interactive storytelling experience.",
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
