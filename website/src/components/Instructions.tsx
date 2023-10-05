"use client";

const Instructions = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 h-screen px-4 -mb-9">
      <h1 className="text-3xl font-extrabold text-center text-blue-700">
        Welcome to Google News Research
      </h1>
      <p className="w-3/4 text-center text-gray-700">
        Thank you for agreeing to take part in this study conducted by UC
        Berkeley. Please review the following action items.
      </p>
      <div className="instructions p-6 bg-white rounded-lg shadow-lg w-3/4">
        <h2 className="text-xl font-semibold text-blue-600 mb-2">
          Google Form Survey
        </h2>
        <p className="mb-4 text-gray-600">
          Please complete{" "}
          <a
            href="https://www.notion.so/Email-Google-Recruiter-masters-bfc7d9d3e7724affac11d71e3769a6be"
            target="_blank"
            className="text-blue-500 underline"
          >
            this Google Form
          </a>{" "}
          and enter your unique identification number at the end.
        </p>

        <h2 className="text-xl font-semibold text-blue-600 mb-2">
          Download Chrome Plugin
        </h2>
        <ul className="list-disc list-inside mb-4 text-gray-600">
          <li className="mb-2">
            If you don’t have Chrome installed on your computer, please{" "}
            <a
              href="https://www.google.com/chrome/dr/download/"
              target="_blank"
              className="text-blue-500 underline"
            >
              install Google Chrome from the official link
            </a>
            .
          </li>
          <li className="mb-2">
            After Chrome is installed please open a new profile (
            <a
              href="https://support.google.com/chrome/answer/2364824?hl=en&co=GENIE.Platform%3DDesktop"
              target="_blank"
              className="text-blue-500 underline"
            >
              see how to open a new profile
            </a>
            ) and enter the credentials you received from the Google form survey
            earlier.
          </li>
          <li className="mb-2">
            Please download the Plugin from the{" "}
            <a
              href="https://www.notion.so/Webpages-5b09c043a6bc44a498ea4ede7d6f3f8a"
              target="_blank"
              className="text-blue-500 underline"
            >
              Chrome Web Store
            </a>{" "}
            and grant it the necessary permissions. The plugin would only be
            effective in the profile you created and would have no access to any
            information in any of your other profiles (
            <a
              href="https://superuser.com/questions/791327/do-chrome-extensions-for-one-user-have-any-access-to-other-users#:~:text=In%20conclusion%2C%20a%20Chrome%20extension,user%20has%20explicitly%20granted%20the"
              target="_blank"
              className="text-blue-500 underline"
            >
              see this SuperUser post for details
            </a>
            ).
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-blue-600 mb-2">
          Browse Google News
        </h2>
        <p className="text-gray-600">TODO[Mingduo]: add instructions</p>
      </div>
    </div>
  );
};

export default Instructions;
