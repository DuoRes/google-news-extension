const BACKEND_URL = "http://localhost:8080/";

// Keep track of the current article being read
var currentArticle = null;

// Listen for messages from everything
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log(message);
  switch (message.type) {
    case "trackArticle":
      // track a new article
      currentArticle = {
        url: message.url,
        startTime: new Date(),
      };
      break;
    case "redirect":
      // redirect to a specific url
      await chrome.tabs.query(
        { active: true, currentWindow: true },
        function (tabs) {
          var currentTabId = tabs[0].id;
          chrome.tabs.update(currentTabId, { url: message.redirect });
        }
      );

      sendResponse({ redirect: "success" });
      break;
    case "logPageContents":
      console.log(message.contents);
      const result = await fetch(BACKEND_URL + "collect/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: message.contents,
          user_id: message.user_id,
        }),
      });

      console.log(result);

      sendResponse({ result: result });
      break;
  }
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (
    currentArticle &&
    tabId === tab.id &&
    changeInfo.status === "complete" &&
    tab.url === currentArticle.url
  ) {
    // The user finished loading the article, let's track their reading progress
    var endTime = new Date();
    var readingTime = endTime - currentArticle.startTime;
    // You can do something with the reading time here, like send it to an analytics service
    console.log(
      "User spent " + readingTime + " ms reading " + currentArticle.url
    );
    // Reset the current article
    currentArticle = null;
  }
});

/******************************************************************************
 *                           Helper Functions                                 *
 ******************************************************************************/

const getToken = async () => {
  const token = await chrome.storage.local.get(
    ["identifier"],
    function (result) {
      return result.identifier;
    }
  );
  return token;
};
