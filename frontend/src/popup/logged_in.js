document.getElementById("redirect").addEventListener("click", async (event) => {
  event.preventDefault();

  console.log("redirecting");

  // redirect chrome to google news page
  chrome.runtime.sendMessage(
    {
      type: "redirect",
      redirect: "https://news.google.com/foryou?hl=en-US&gl=US&ceid=US:en",
    },
    function (response) {
      console.log(response);
    }
  );
});
