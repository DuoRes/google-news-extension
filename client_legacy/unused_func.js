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
