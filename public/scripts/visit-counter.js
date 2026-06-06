const initVisitCounter = () => {
  const counterSelector = "#busuanzi_value_site_pv, #busuanzi_value_page_pv";
  const hasCounter = document.querySelector(counterSelector);
  const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

  if (!hasCounter || isLocalHost || document.querySelector("[data-visit-counter-script]")) {
    return;
  }

  const script = document.createElement("script");
  script.defer = true;
  script.src = "https://cn.vercount.one/js";
  script.dataset.visitCounterScript = "true";

  script.addEventListener("error", () => {
    document.querySelectorAll(counterSelector).forEach((counter) => {
      counter.textContent = "暂不可用";
    });
  });

  document.head.append(script);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initVisitCounter, { once: true });
} else {
  initVisitCounter();
}
