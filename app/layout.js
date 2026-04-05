import "./globals.css";
import { TestProvider } from "@/components/TestContext";

export const metadata = {
  title: "CELPIP Reading Simulator",
  description: "Reading practice with timed parts and CELPIP-level scoring",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <TestProvider>
          <main className="layoutMain">{children}</main>
        </TestProvider>
      </body>
    </html>
  );
}
