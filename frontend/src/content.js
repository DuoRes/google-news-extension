const BACKEND_URL = "http://localhost:5000/api/v1/collect/contents";
const article = document.querySelector("article");
const link = document.querySelector("link");

const getGoogleNewsRecommendation = () => {
  if (!document.URL.includes("news.google.com")) {
    console.log("This is not a google news page");
    return;
  }

  const contents = [];
  // get all components of the section wrapper
  const sections = document.querySelectorAll(".Ccj79");
  sections.forEach((section, s_idx) => {
    const prominentArticle = section.querySelector(".IBr9hb");
    const articles = section.querySelectorAll(".UwIKyb");
    if (prominentArticle) {
      const title = prominentArticle.querySelector(".WwrzSb").ariaLabel;
      const link = prominentArticle.querySelector(".WwrzSb").href;
      const timestamp = prominentArticle.querySelector(".hvbAAd").innerText;
      const press = prominentArticle.querySelector(".vr1PYe").innerText;
      contents.push({
        index: s_idx + 1 + ".1",
        title,
        link,
        timestamp,
        press,
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
    console.log("Here are the contents to send to Backend", contents);
    return sendToBackend(contents);
  });
};

const sendToBackend = (contents) => {
  fetch(BACKEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(contents),
  })
    .then((res) => res.json())
    .then((data) => console.log(data))
    .catch((err) => console.log(err));
};

getGoogleNewsRecommendation();
