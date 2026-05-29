(() => {
  const selector = document.querySelector("[data-guides-version-selector]");
  selector?.addEventListener("change", (event) => {
    const select = event.currentTarget;
    if (select instanceof HTMLSelectElement && select.value) {
      window.location.href = select.value;
    }
  });
})();
