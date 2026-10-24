const loadedScripts = new Map();

// Loads an external <script> tag exactly once per src, returning a promise
// that resolves once it's ready. Safe to call repeatedly (e.g. from
// multiple components that both need Google Identity Services).
export const loadScript = (src) => {
  if (loadedScripts.has(src)) return loadedScripts.get(src);

  const promise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error(`Failed to load script: ${src}`)));
      if (existing.dataset.loaded === "true") resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });

  loadedScripts.set(src, promise);
  return promise;
};
