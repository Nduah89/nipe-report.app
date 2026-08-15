(() => {
  "use strict";
  const config = window.RCE_CONFIG || window.NIS_CONFIG || {};
  if (config.masterEdition) return;
  const school = String(config.schoolName || "School").trim() || "School";
  const expectedTitle = `${school} | Edusentia`;
  let applying = false;
  const apply = () => {
    if (applying || document.title === expectedTitle) return;
    applying = true;
    document.title = expectedTitle;
    applying = false;
  };
  apply();
  const titleNode = document.querySelector("title");
  if (titleNode) new MutationObserver(apply).observe(titleNode, { childList: true, subtree: true, characterData: true });
  window.addEventListener("pageshow", apply);
})();
