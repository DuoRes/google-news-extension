const article = document.querySelector("article");
const link = document.querySelector("link");

const redirectToForYou = () => {
  window.location.href =
    "https://news.google.com/foryou?hl=en-US&gl=US&ceid=US%3Aen";
};

const logPageContents = async () => {
  const contents = [];
  // get all components of the section wrapper
  const sections = document.querySelectorAll(".Ccj79");
  if (sections.length === 0) {
    console.log("No sections found.");
    redirectToForYou();
  }
  sections.forEach((section, s_idx) => {
    const prominentArticle = section.querySelector(".IBr9hb");
    const articles = section.querySelectorAll(".UwIKyb");
    if (prominentArticle) {
      const title = prominentArticle.querySelector(".WwrzSb").ariaLabel;
      const link = prominentArticle.querySelector(".WwrzSb").href;
      const timestamp = prominentArticle.querySelector(".hvbAAd").innerText;
      const press = prominentArticle.querySelector(".vr1PYe").innerText;
      const img = prominentArticle.querySelector("img").src;
      contents.push({
        index: s_idx + 1 + ".1",
        title,
        link,
        timestamp,
        press,
        img,
      });
    }
    articles.forEach((article, a_idx) => {
      const title = article.querySelector(".WwrzSb").ariaLabel;
      const link = article.querySelector(".WwrzSb").href;
      const timestamp = article.querySelector(".hvbAAd").innerText;
      const press = article.querySelector(".vr1PYe").innerText;
      contents.push({
        index: s_idx + 1 + "." + (a_idx + 2),
        title,
        link,
        timestamp,
        press,
      });
    });
  });
  console.log(contents);

  const result = await chrome.runtime.sendMessage({
    type: "logPageContents",
    contents: JSON.stringify(contents),
  });

  console.log(result);
};

const logReadingProgress = () => {
  document.addEventListener("scroll", () => {
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const scrollTop = document.documentElement.scrollTop;
    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
    console.log(scrollPercentage);
  });
};

const redirectPopup = () => {
  console.log("This is not a Google News page.");
  document.body.prepend(
    new DOMParser().parseFromString(
      `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5);
      z-index: 999
      ">
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 400px; height: 300px; background-color: white; border-radius: 10px; padding: 20px">
          <h1>Google News Recommendation</h1>
          <p>This is not a Google News page.</p>
          <p>Do you want to go to Google News?</p>
          <div style="display: flex; justify-content: space-between; margin-top: 20px">
            <button id="cancel" style="width: 100px; height: 40px; border-radius: 5px; background-color: #f44336; color: white; border: none">Cancel</button>
            <button id="go" style="width: 100px; height: 40px; border-radius: 5px; background-color: #4caf50; color: white; border: none">Go</button>
          </div>
        </div>
      </div>
    `,
      "text/html"
    ).body.firstChild
  );
  document.getElementById("cancel").addEventListener("click", () => {
    document.body.removeChild(document.body.firstChild);
  });
  document.getElementById("go").addEventListener("click", () => {
    window.location.href =
      "https://news.google.com/foryou?hl=en-US&gl=US&ceid=US%3Aen";
  });
  return;
};

chrome.storage.local.get(["user_id"], (result) => {
  if (result.user_id) {
    console.log("User ID: " + result.user_id);
    if (
      document.URL.includes("news.google.com") &&
      document.URL.includes("foryou")
    ) {
      logPageContents();
      // Listen for clicks on news articles
      document.addEventListener("click", function (event) {
        if (event.target.closest(".ipQwMb")) {
          // This is a news article, let's track it
          var articleUrl = event.target.closest("a").href;
          chrome.runtime.sendMessage({ type: "trackArticle", url: articleUrl });
        }
      });
    } else {
      redirectPopup();
    }
  } else {
    console.log("User ID not found.");
  }
});
