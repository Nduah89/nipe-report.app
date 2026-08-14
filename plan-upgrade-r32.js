(() => {
  "use strict";
  const BUILD = "7.4.0-r32-dedicated-plan-upgrade-navigation";
  window.RCE_PLAN_UPGRADE_BUILD = BUILD;
  const config = window.RCE_CONFIG || window.NIS_CONFIG || {};
  if (!config.generatedSchoolPackage) return;

  let client = null;
  let active = false;
  let currentConsole = null;
  let currentPreview = null;
  let currentCode = "";
  let rendering = false;

  const byId = (id) => document.getElementById(id);
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (ch) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[ch]);
  const number = (value, digits = 0) => Number(value || 0).toLocaleString("en-GH", {minimumFractionDigits:digits, maximumFractionDigits:digits});
  const isoDateTime = (value) => value ? new Date(value).toLocaleString("en-GH", {year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}) : "—";
  const planLabel = (value) => String(value || "").replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

  function getClient() {
    if (client) return client;
    if (!window.supabase?.createClient || !/^https:\/\//.test(String(config.supabaseUrl || "")) || !config.supabaseAnonKey) {
      throw new Error("The school Supabase client configuration is unavailable.");
    }
    client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
    });
    return client;
  }

  async function requireSession() {
    const c = getClient();
    const { data: { session }, error } = await c.auth.getSession();
    if (error) throw error;
    if (!session?.access_token) throw new Error("Your administrator session is no longer active. Sign in again.");
    return c;
  }

  async function rpc(name, args = {}) {
    const c = await requireSession();
    const { data, error } = await c.rpc(name, args);
    if (error) throw new Error(error.message || String(error));
    return data;
  }

  async function edgeError(error, data) {
    if (data?.error) return String(data.error);
    try {
      const response = error?.context;
      if (response && typeof response.clone === "function") {
        const parsed = await response.clone().json();
        if (parsed?.error) return String(parsed.error);
        if (parsed?.message) return String(parsed.message);
      }
    } catch {}
    return error?.message || String(error || "Licence verification operation failed");
  }

  async function invokeVerifier(action, payload = {}) {
    const c = await requireSession();
    const { data, error } = await c.functions.invoke("license-verifier", { body: { action, ...payload } });
    if (error) throw new Error(await edgeError(error, data));
    if (!data?.ok) throw new Error(data?.error || "Licence verification operation failed");
    return data;
  }

  function setMessage(message, kind = "") {
    const node = byId("r32UpgradeMessage");
    if (!node) return;
    node.textContent = message || "";
    node.className = `form-message ${kind}`.trim();
  }

  function capacityValue(value, unit) {
    if (value === null || value === undefined || value === "") return "Unlimited";
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "Unlimited";
    return unit === "MB" ? `${number(numeric, 2)} MB` : number(numeric);
  }

  function normalizeCode(input) {
    let value = String(input || "").toUpperCase().replace(/[^A-Z2-9]/g, "");
    if (value.startsWith("RCEUPG")) value = value.slice(6);
    else if (value.startsWith("RCE")) value = value.slice(3);
    const chunks = value.match(/.{1,4}/g) || [];
    return `RCE-UPG-${chunks.slice(0, 5).join("-")}`.replace(/-$/, "");
  }

  function statusBadge(value) {
    const label = String(value || "unknown").replaceAll("_", " ");
    return `<span class="status approved">${esc(label)}</span>`;
  }

  function renderPreview(preview, plan) {
    const target = preview?.target_plan || {};
    const rows = [
      ["Students", "max_students", "records"],
      ["Teachers", "max_teachers", "records"],
      ["System Administrators", "max_system_admins", "accounts"],
      ["Guardians", "max_guardians", "accounts"],
      ["Storage", "max_storage_mb", "MB"]
    ];
    const currentFeatures = plan?.feature_flags || {};
    const targetFeatures = target?.feature_flags || {};
    const added = Object.entries(targetFeatures).filter(([key, enabled]) => enabled === true && currentFeatures[key] !== true).map(([key]) => key);
    return `<section class="panel pad" id="r32UpgradePreview" style="margin-top:18px">
      <div class="section-title"><div><h4>Verified Upgrade Preview</h4><p>Review the signed authority result before activation.</p></div></div>
      <div class="template-information success"><strong>${esc(planLabel(preview?.from_plan_code || plan?.code || "Current"))} → ${esc(target.name || planLabel(preview?.to_plan_code || target.code || "Upgrade"))}</strong><span>This code changes only the signed plan entitlement. Licence reference, deployment binding and existing licence dates remain unchanged.</span><small>Authorization expires ${esc(isoDateTime(preview?.expires_at))}</small></div>
      <div class="table-wrap" style="margin-top:14px"><table><thead><tr><th>Capacity</th><th>Current</th><th>After upgrade</th></tr></thead><tbody>${rows.map(([label,key,unit]) => `<tr><td>${esc(label)}</td><td>${esc(capacityValue(plan?.[key], unit))}</td><td><strong>${esc(capacityValue(target?.[key], unit))}</strong></td></tr>`).join("")}</tbody></table></div>
      <div style="margin-top:14px"><strong>Newly enabled features</strong>${added.length ? `<div class="chip-grid" style="margin-top:8px">${added.map((key) => `<span class="chip success">${esc(planLabel(key))}</span>`).join("")}</div>` : `<p class="muted">No additional feature flags are required; this upgrade may increase capacity or support entitlement.</p>`}</div>
      <div class="page-actions" style="margin-top:16px"><button class="button success" id="r32ActivateUpgrade" type="button">Activate ${esc(target.name || planLabel(target.code || "upgrade"))}</button></div>
    </section>`;
  }

  async function loadConsole(force = false) {
    if (!force && currentConsole) return currentConsole;
    currentConsole = await rpc("get_school_license_capacity_console");
    return currentConsole;
  }

  async function renderPlanUpgrade(force = false) {
    if (rendering) return;
    rendering = true;
    try {
      const content = byId("content");
      if (!content || !active) return;
      content.innerHTML = `<div class="panel pad"><div class="skeleton"></div></div>`;
      const data = await loadConsole(force);
      if (!active) return;
      const snapshot = data?.snapshot || {}, plan = data?.plan || {};
      const code = String(plan.code || "").toLowerCase();
      const enterprise = code === "enterprise";
      const path = code === "starter" ? "Starter → Professional or Enterprise" : code === "professional" ? "Professional → Enterprise" : enterprise ? "Enterprise is the highest available plan" : "No code-based upgrade path available";
      currentPreview = null; currentCode = "";
      content.innerHTML = `
        <div class="page-head"><div><h3>Plan Upgrade</h3><p>Activate a Platform-authorized one-time licence upgrade for this school installation.</p></div><div class="page-actions"><button class="button secondary" id="r32UpgradeRefresh" type="button">Refresh licence</button></div></div>
        <section class="panel pad">
          <div class="section-title"><div><h4>Current signed licence</h4><p>${esc(snapshot.license_reference || "No licence reference")}</p></div><div>${statusBadge(snapshot.computed_status)}</div></div>
          <div class="metric-row wrap" style="margin-top:14px">
            <div class="metric"><span>Current plan</span><strong>${esc(plan.name || planLabel(plan.code || "Unknown"))}</strong><small>Signed revision ${esc(String(plan.revision || snapshot.plan_revision || "—"))}</small></div>
            <div class="metric"><span>Upgrade path</span><strong>${esc(path)}</strong><small>Plan-only activation</small></div>
            <div class="metric"><span>Tenant</span><strong>${esc(snapshot.tenant_code || config.tenantCode || "—")}</strong><small>Installation-bound</small></div>
            <div class="metric"><span>Project</span><strong>${esc(snapshot.project_ref || config.projectRef || "—")}</strong><small>Project-bound</small></div>
          </div>
        </section>
        ${enterprise ? `<section class="panel pad" style="margin-top:18px"><div class="template-information success"><strong>Highest plan active</strong><span>This school is already on the Enterprise plan. No higher code-based plan upgrade is available.</span><small>Renewals, expiry changes and binding changes remain under the signed replacement licence workflow.</small></div></section>` : `<section class="panel pad" style="margin-top:18px"><div class="section-title"><div><h4>One-time Upgrade Activation</h4><p>Enter the activation code issued by the Platform Super Administrator for this exact school installation.</p></div></div><div class="form-stack"><label class="field"><span>Upgrade activation code</span><input id="r32UpgradeCode" maxlength="34" autocomplete="off" spellcheck="false" placeholder="RCE-UPG-XXXX-XXXX-XXXX-XXXX-XXXX"><small>Single-use, time-limited and installation-bound. MFA/AAL2 is required for verification and activation.</small></label><div class="page-actions"><button class="button primary" id="r32VerifyUpgrade" type="button">Verify upgrade</button></div><p id="r32UpgradeMessage" class="form-message" role="alert"></p></div></section><div id="r32UpgradePreviewHost"></div>`}
        <section class="panel pad" style="margin-top:18px"><div class="section-title"><div><h4>Protected fields</h4><p>Activation codes cannot rewrite school identity or lifecycle data.</p></div></div><div class="detail-grid"><div><span>Licence reference</span><strong>Unchanged</strong></div><div><span>Expiry / grace dates</span><strong>Unchanged</strong></div><div><span>Package / installation</span><strong>Unchanged</strong></div><div><span>Tenant / project</span><strong>Unchanged</strong></div><div><span>Student / report data</span><strong>Unchanged</strong></div><div><span>Authorization</span><strong>Central Platform Authority</strong></div></div></section>`;

      const refresh = byId("r32UpgradeRefresh");
      if (refresh) refresh.onclick = async () => { refresh.disabled = true; refresh.textContent = "Refreshing"; try { currentConsole = null; await renderPlanUpgrade(true); } catch (error) { setMessage(error.message || String(error), "error"); } };
      const input = byId("r32UpgradeCode");
      if (input) input.addEventListener("input", () => { input.value = normalizeCode(input.value); currentPreview = null; const host = byId("r32UpgradePreviewHost"); if (host) host.innerHTML = ""; });
      const verify = byId("r32VerifyUpgrade");
      if (verify) verify.onclick = async () => {
        const codeValue = String(input?.value || "").trim().toUpperCase();
        if (!/^RCE-UPG-[A-Z2-9]{4}(?:-[A-Z2-9]{4}){4}$/.test(codeValue)) { setMessage("Enter a valid RCE upgrade activation code.", "error"); return; }
        verify.disabled = true; verify.textContent = "Verifying"; setMessage("");
        try {
          const result = await invokeVerifier("preview_upgrade", { upgrade_code: codeValue });
          currentPreview = result.preview || {}; currentCode = codeValue;
          const host = byId("r32UpgradePreviewHost"); if (host) host.innerHTML = renderPreview(currentPreview, plan);
          setMessage("Upgrade code verified. Review the signed changes below before activation.", "success");
          const activate = byId("r32ActivateUpgrade");
          if (activate) activate.onclick = async () => {
            if (!currentPreview || !currentCode) return;
            if (!confirm(`Activate the verified ${currentPreview?.target_plan?.name || planLabel(currentPreview?.to_plan_code || "upgraded")} licence plan now?`)) return;
            activate.disabled = true; activate.textContent = "Activating securely"; setMessage("");
            try {
              const result = await invokeVerifier("activate_upgrade", { upgrade_code: currentCode });
              const target = result.target_plan?.name || currentPreview?.target_plan?.name || planLabel(currentPreview?.to_plan_code || "upgraded");
              setMessage(`Licence plan upgraded successfully to ${target}. Reloading the signed entitlement…`, "success");
              setTimeout(() => location.reload(), 1200);
            } catch (error) {
              setMessage(error.message || String(error), "error");
              activate.disabled = false; activate.textContent = `Activate ${currentPreview?.target_plan?.name || "upgrade"}`;
            }
          };
        } catch (error) {
          setMessage(error.message || String(error), "error");
        } finally {
          verify.disabled = false; verify.textContent = "Verify upgrade";
        }
      };
    } catch (error) {
      const content = byId("content");
      if (content && active) content.innerHTML = `<div class="panel pad empty"><strong>Plan Upgrade unavailable</strong><span>${esc(error.message || String(error))}</span></div>`;
    } finally {
      rendering = false;
    }
  }

  function activatePage() {
    active = true;
    const title = byId("pageTitle"), subtitle = byId("pageSubtitle"), sidebar = byId("sidebar");
    if (title) title.textContent = "Plan Upgrade";
    if (subtitle) subtitle.textContent = "Activate a Platform-authorized one-time licence plan upgrade";
    sidebar?.classList.remove("open");
    document.querySelectorAll("#mainNav .nav-item").forEach((node) => {
      const on = node.dataset.view === "plan_upgrade";
      node.classList.toggle("active", on);
      node.setAttribute("aria-current", on ? "page" : "false");
    });
    renderPlanUpgrade(true);
  }

  function ensureNav() {
    const nav = byId("mainNav");
    if (!nav) return;
    const licence = nav.querySelector('[data-view="license_capacity"]');
    if (!licence) {
      nav.querySelector('[data-view="plan_upgrade"]')?.remove();
      return;
    }
    let button = nav.querySelector('[data-view="plan_upgrade"]');
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "nav-item";
      button.dataset.view = "plan_upgrade";
      button.setAttribute("aria-label", "Open Plan Upgrade");
      button.title = "Activate a Platform-authorized one-time licence plan upgrade";
      button.innerHTML = '<span class="nav-icon" aria-hidden="true">⇧</span><span class="nav-label">Plan Upgrade</span><span class="nav-active-dot" aria-hidden="true"></span>';
      const settings = nav.querySelector('[data-view="settings"]');
      if (settings) nav.insertBefore(button, settings); else licence.insertAdjacentElement("afterend", button);
      button.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); activatePage(); });
    }
    button.classList.toggle("active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  }

  function start() {
    const nav = byId("mainNav");
    if (!nav) { setTimeout(start, 250); return; }
    nav.addEventListener("click", (event) => {
      const target = event.target?.closest?.(".nav-item");
      if (target && target.dataset.view !== "plan_upgrade") active = false;
    }, true);
    new MutationObserver(() => ensureNav()).observe(nav, { childList: true });
    const role = byId("userRole");
    if (role) new MutationObserver(() => ensureNav()).observe(role, { childList: true, characterData: true, subtree: true });
    ensureNav();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
