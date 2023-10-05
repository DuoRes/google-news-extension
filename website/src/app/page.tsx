import "./globals.css";
import Navbar from "../components/Navbar";
import Instructions from "../components/Instructions";

import Link from "next/link";

function MyApp() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Navbar />
      <div className="container mx-auto">
        <Instructions />
      </div>
      <footer className="flex justify-center w-full text-gray-600 font-extralight">
        <Link href="https://github.com/MingduoResearch/google-news-extension">
          @mingduo 2023
        </Link>{" "}
        - all rights reserved
      </footer>
    </div>
  );
}
export default MyApp;
