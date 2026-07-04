(function () {
  var script = document.currentScript;
  if (!script) return;
  var slug = script.getAttribute("data-form");
  if (!slug) return;
  var origin = script.src.replace(/\/embed\.js.*$/, "");
  var target =
    document.querySelector('[data-edinform-form="' + slug + '"]') || script.parentNode;
  if (!target) return;
  var iframe = document.createElement("iframe");
  iframe.src = origin + "/forms/" + encodeURIComponent(slug) + "?embed=1";
  iframe.title = "EdinForm";
  iframe.style.cssText =
    "width:100%;min-height:480px;height:600px;border:none;border-radius:12px;display:block";
  iframe.setAttribute("allow", "clipboard-write");
  target.appendChild(iframe);
})();
