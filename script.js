const filters = document.querySelectorAll(".filter");
const posts = document.querySelectorAll(".post-card");

filters.forEach((filter) => {
  filter.addEventListener("click", () => {
    const topic = filter.dataset.filter;

    filters.forEach((item) => item.classList.remove("active"));
    filter.classList.add("active");

    posts.forEach((post) => {
      const shouldShow = topic === "all" || post.dataset.topic === topic;
      post.hidden = !shouldShow;
    });
  });
});
