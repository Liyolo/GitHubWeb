(() => {
  const progressBar = document.querySelector("[data-reading-progress-bar]");
  const backToTop = document.querySelector("[data-back-to-top]");

  if (!progressBar || !backToTop) return;

  const updateProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / scrollableHeight) * 100)) : 0;

    progressBar.style.width = `${progress}%`;
    backToTop.toggleAttribute("data-visible", scrollTop > 480);
  };

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
})();
