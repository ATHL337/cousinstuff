(() => {
  "use strict";
  if (!("serviceWorker" in navigator) || !window.isSecureContext) return;
  window.addEventListener("load", async () => {
    try {
      const hadController = Boolean(navigator.serviceWorker.controller);
      const notice = document.getElementById("pwaUpdate");
      const reload = document.getElementById("pwaReload");
      let shown = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!hadController || shown || !notice || !reload) return;
        shown = true;
        notice.hidden = false;
        reload.addEventListener("click", () => window.location.reload(), { once:true });
      });
      const registration = await navigator.serviceWorker.register("/sw.js", { scope:"/" });
      await registration.update();
    } catch (error) {
      console.warn("Offline support unavailable:", error);
    }
  }, { once:true });
})();
