const article = document.querySelector("article");
const link = document.querySelector("link");

const getGoogleNewsContent = () => {
  if (!document.URL.includes("news.google.com")) {
    return;
  }
};
