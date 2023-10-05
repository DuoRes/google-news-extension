import Link from "next/link";
import Navbar from "@/components/Navbar";

const About = () => {
  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center justify-center h-screen space-y-4 -mt-14">
        <h1 className="text-2xl font-bold">About Google News Research</h1>
        <p className="w-2/3 text-center">
          Google News Research is a Chrome Extension. TODO: Write more about the
          extension.
        </p>
        <Link href="/" className="mt-4 text-blue-500">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default About;
