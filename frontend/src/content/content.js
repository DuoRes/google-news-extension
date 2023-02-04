const article = document.querySelector("article");
const link = document.querySelector("link");

const getGoogleNewsRecommendation = () => {
  if (!document.URL.includes("news.google.com")) {
    return;
  }

  const contents = [];
  // get all components of the section wrapper
  const sections = document.querySelectorAll(".Ccj79");
  sections.forEach((article) => {
    const prominentArticle = article.querySelector(".IBr9hb");
    const articles = article.querySelectorAll(".UwIKyb");
    if (prominentArticle) {
    }
  });
};
