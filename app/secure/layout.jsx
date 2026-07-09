export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function SecureLayout({ children }) {
  return <>{children}</>;
}
