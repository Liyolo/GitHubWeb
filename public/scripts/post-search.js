const initPostSearch = () => {
  const filterBar = document.querySelector(".filter-bar");
  const filters = [...document.querySelectorAll(".filter")];
  const searchInput = document.querySelector("#postSearch");
  const posts = [...document.querySelectorAll(".post-card")];
  const count = document.querySelector("[data-search-count]");
  const empty = document.querySelector(".search-empty");
  const searchData = document.querySelector("#post-search-data");

  if (!filterBar || filters.length === 0 || !searchInput || posts.length === 0 || !searchData) {
    return;
  }

  const index = new Map(
    JSON.parse(searchData.textContent || "[]").map((entry) => [entry.slug, entry])
  );

  const getActiveFilter = () =>
    filters.find((filter) => filter.classList.contains("active"))?.dataset.filter || "all";

  const updatePosts = () => {
    const activeFilter = getActiveFilter();
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    posts.forEach((post) => {
      const entry = index.get(post.dataset.slug);
      const matchesCategory = activeFilter === "all" || post.dataset.topic === activeFilter;
      const matchesSearch = !query || entry?.text.includes(query);
      const shouldShow = matchesCategory && matchesSearch;

      post.hidden = !shouldShow;
      if (shouldShow) visibleCount += 1;
    });

    if (count) count.textContent = String(visibleCount);
    if (empty) empty.hidden = visibleCount > 0;
  };

  filterBar.addEventListener("click", (event) => {
    const filter = event.target.closest(".filter");
    if (!filter) return;

    filters.forEach((item) => {
      const isActive = item === filter;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    updatePosts();
  });

  searchInput.addEventListener("input", updatePosts);
  updatePosts();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPostSearch, { once: true });
} else {
  initPostSearch();
}
