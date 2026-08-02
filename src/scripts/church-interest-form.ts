/**
 * Church interest form (src/components/ChurchInterestForm.astro): directory
 * typeahead over Here's My Church (via netlify/functions/church-search.mts),
 * plus the pre-existing role/interests/submit behavior.
 */
import { HMC_COUNTRIES, getHmcRegionsForCountry, type HmcRegionOption } from "../lib/hmc-directory";
import { resolveDefaultHmcCountry, setLastHmcPickerCountry } from "../lib/hmc-default-country";

type ChurchResult = {
  id: string;
  shortId: string;
  name: string;
  city: string;
  state: string;
  country: string;
  address?: string | null;
  denomination?: string | null;
  locationLabel: string;
};

const SEARCH_DEBOUNCE_MS = 280;
const MIN_QUERY_LENGTH = 2;
const SEARCH_LIMIT = 8;

/** Matches the option-label rule used by the app's HmcChurchPicker. */
function regionOptionLabel(code: string, label: string): string {
  return code.length <= 3 ? `${code} — ${label}` : label;
}

function titleCase(word: string): string {
  return word.length ? word[0]!.toUpperCase() + word.slice(1) : word;
}

(function () {
  const root = document.querySelector<HTMLElement>("[data-church-interest]");
  if (!root || root.dataset.bound === "true") return;
  root.dataset.bound = "true";

  const form = root.querySelector<HTMLFormElement>("[data-church-interest-form]");
  const formPanel = root.querySelector<HTMLElement>("[data-church-interest-form-panel]");
  const success = root.querySelector<HTMLElement>("[data-church-interest-success]");
  const errorEl = root.querySelector<HTMLElement>("[data-church-interest-error]");
  const submitBtn = root.querySelector<HTMLButtonElement>("[data-church-interest-submit]");
  const fieldset = document.getElementById("church-interest-interests");
  const hint = document.getElementById("church-interest-interests-hint");
  const roleSelect = document.getElementById("church-interest-role") as HTMLSelectElement | null;
  const roleOtherWrap = document.getElementById("church-interest-role-other-wrap");
  const roleOtherInput = document.getElementById("church-interest-roleOther") as HTMLInputElement | null;

  function showSuccess() {
    if (formPanel) formPanel.hidden = true;
    if (success) {
      success.hidden = false;
      success.focus?.();
    }
    try {
      history.replaceState(null, "", "/for/churches/?submitted=1#interest");
    } catch (e) {}
    root!.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function syncRoleOther() {
    if (!roleSelect || !roleOtherWrap || !roleOtherInput) return;
    const isOther = roleSelect.value === "other";
    if (isOther) {
      roleOtherWrap.removeAttribute("hidden");
      roleOtherInput.setAttribute("required", "required");
    } else {
      roleOtherWrap.setAttribute("hidden", "");
      roleOtherInput.removeAttribute("required");
      roleOtherInput.value = "";
    }
  }

  // Static pages can't read ?submitted=1 at build time — check on the client.
  if (new URLSearchParams(window.location.search).get("submitted") === "1") {
    showSuccess();
    return;
  }

  if (!form) return;

  roleSelect?.addEventListener("change", syncRoleOther);
  syncRoleOther();

  fieldset?.addEventListener("change", function () {
    const checked = form.querySelectorAll('input[name="interests"]:checked');
    if (checked.length > 0 && fieldset && hint) {
      fieldset.classList.remove("is-invalid");
      hint.textContent = "Select at least one.";
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const checked = form.querySelectorAll('input[name="interests"]:checked');
    if (checked.length === 0) {
      if (fieldset && hint) {
        fieldset.classList.add("is-invalid");
        hint.textContent = "Select at least one option.";
        const first = fieldset.querySelector<HTMLElement>('input[name="interests"]');
        if (first) first.focus();
      }
      return;
    }
    if (fieldset && hint) {
      fieldset.classList.remove("is-invalid");
      hint.textContent = "Select at least one.";
    }

    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = "";
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }

    const body = new URLSearchParams(new FormData(form) as any).toString();

    fetch("/for/churches/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body,
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Submit failed");
        showSuccess();
      })
      .catch(function () {
        if (errorEl) {
          errorEl.hidden = false;
          errorEl.textContent = "Something went wrong. Please try again.";
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Share interest";
        }
      });
  });

  // ── Here's My Church directory picker ──

  const countrySelect = root.querySelector<HTMLSelectElement>("[data-church-country]");
  const nameInput = root.querySelector<HTMLInputElement>("[data-church-name-input]");
  const listbox = root.querySelector<HTMLUListElement>("[data-church-listbox]");
  const statusEl = root.querySelector<HTMLElement>("[data-church-status]");
  const chosenEl = root.querySelector<HTMLElement>("[data-church-chosen]");
  const chosenNameEl = root.querySelector<HTMLElement>("[data-church-chosen-name]");
  const chosenLocationEl = root.querySelector<HTMLElement>("[data-church-chosen-location]");
  const chosenChangeBtn = root.querySelector<HTMLButtonElement>("[data-church-chosen-change]");
  const unlistedToggleBtn = root.querySelector<HTMLButtonElement>("[data-church-unlisted-toggle]");
  const cityWrap = root.querySelector<HTMLElement>("[data-church-city-wrap]");
  const cityInput = root.querySelector<HTMLInputElement>("[data-church-city]");
  const stateSelectWrap = root.querySelector<HTMLElement>("[data-church-state-select-wrap]");
  const stateSelect = root.querySelector<HTMLSelectElement>("[data-church-state-select]");
  const stateNounEl = root.querySelector<HTMLElement>("[data-church-state-noun]");
  const stateManualWrap = root.querySelector<HTMLElement>("[data-church-state-manual-wrap]");
  const stateManualInput = root.querySelector<HTMLInputElement>("[data-church-state-manual]");
  const otherWrap = root.querySelector<HTMLElement>("[data-church-other-wrap]");
  const otherCountryInput = document.getElementById(
    "church-interest-churchCountryOther",
  ) as HTMLInputElement | null;
  const hmcIdInput = root.querySelector<HTMLInputElement>("[data-church-hmc-id]");
  const hmcShortIdInput = root.querySelector<HTMLInputElement>("[data-church-hmc-short-id]");
  const denominationInput = root.querySelector<HTMLInputElement>("[data-church-denomination]");
  const comboboxInputWrap = nameInput?.closest<HTMLElement>(".church-interest-form__combobox-input-wrap") ?? null;

  if (
    !countrySelect ||
    !nameInput ||
    !listbox ||
    !statusEl ||
    !chosenEl ||
    !chosenNameEl ||
    !chosenLocationEl ||
    !chosenChangeBtn ||
    !unlistedToggleBtn ||
    !cityWrap ||
    !cityInput ||
    !stateSelectWrap ||
    !stateSelect ||
    !stateNounEl ||
    !stateManualWrap ||
    !stateManualInput ||
    !otherWrap ||
    !otherCountryInput ||
    !hmcIdInput ||
    !hmcShortIdInput ||
    !denominationInput ||
    !comboboxInputWrap
  ) {
    return;
  }

  let mode: "directory" | "unlisted" = "directory";
  let hasChosen = false;
  let results: ChurchResult[] = [];
  let activeIndex = -1;
  let debounceHandle: number | undefined;
  let requestController: AbortController | null = null;

  // Re-shown instantly on refocus (e.g. tab away and back) instead of forcing
  // a retype — invalidated whenever the search scope itself changes.
  let lastQuery: string | null = null;
  let lastResults: ChurchResult[] = [];

  function invalidateSearchCache() {
    lastQuery = null;
    lastResults = [];
  }

  function isOtherCountry(): boolean {
    return countrySelect!.value === "other";
  }

  function isUnlisted(): boolean {
    return mode === "unlisted" || isOtherCountry();
  }

  function clearListbox() {
    results = [];
    activeIndex = -1;
    listbox!.replaceChildren();
    listbox!.hidden = true;
    nameInput!.setAttribute("aria-expanded", "false");
    nameInput!.removeAttribute("aria-activedescendant");
  }

  /** Single source of truth for which controls are shown/enabled/required. */
  function syncFieldVisibility() {
    const other = isOtherCountry();
    const unlisted = isUnlisted();

    otherWrap!.hidden = !other;
    otherCountryInput!.disabled = !other;
    otherCountryInput!.required = other;
    if (!other) otherCountryInput!.value = "";

    // Directory region select only makes sense in directory-search mode.
    const showSelect = !unlisted;
    stateSelectWrap!.hidden = !showSelect;
    stateSelect!.disabled = !showSelect;
    stateManualWrap!.hidden = showSelect;
    stateManualInput!.disabled = showSelect;
    stateManualInput!.required = !showSelect;

    cityWrap!.hidden = !unlisted;
    cityInput!.type = unlisted ? "text" : "hidden";
    cityInput!.required = unlisted;

    unlistedToggleBtn!.hidden = other || hasChosen;
    unlistedToggleBtn!.textContent = mode === "unlisted" ? "Search the directory instead" : "My church isn’t listed";

    // Search is scoped to one region — gate the name field on a real pick.
    const searchReady = unlisted || !!stateSelect!.value;
    nameInput!.disabled = !searchReady;
    nameInput!.placeholder = searchReady
      ? "Start typing your church’s name"
      : `Select a ${currentNoun().toLowerCase()} first`;
  }

  function currentNoun(): string {
    return stateNounEl!.textContent?.trim() || "state";
  }

  function gatingMessage(): string {
    return `Select a ${currentNoun().toLowerCase()} above, then start typing your church’s name.`;
  }

  function rebuildStateSelect(countryCode: string) {
    const countryConfig = HMC_COUNTRIES.find((c) => c.code === countryCode);
    const noun = countryConfig ? titleCase(countryConfig.regionNoun.one) : "State / region";
    stateNounEl!.textContent = noun;

    const regions: ReadonlyArray<HmcRegionOption> = getHmcRegionsForCountry(countryCode);
    stateSelect!.replaceChildren();
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.selected = true;
    placeholder.textContent = `Select a ${noun.toLowerCase()}`;
    stateSelect!.appendChild(placeholder);
    for (const region of regions) {
      const opt = document.createElement("option");
      opt.value = region.code;
      opt.textContent = regionOptionLabel(region.code, region.label);
      stateSelect!.appendChild(opt);
    }
  }

  function clearChosen() {
    hasChosen = false;
    hmcIdInput!.value = "";
    hmcShortIdInput!.value = "";
    denominationInput!.value = "";
    cityInput!.value = "";
    chosenEl!.hidden = true;
    comboboxInputWrap!.hidden = false;
    invalidateSearchCache();
    syncFieldVisibility();
  }

  function pick(result: ChurchResult) {
    hasChosen = true;
    hmcIdInput!.value = result.id;
    hmcShortIdInput!.value = result.shortId;
    denominationInput!.value = result.denomination ?? "";
    nameInput!.value = result.name;
    cityInput!.value = result.city ?? "";
    if (result.state && Array.from(stateSelect!.options).some((o) => o.value === result.state)) {
      stateSelect!.value = result.state;
    }

    clearListbox();
    statusEl!.textContent = "";
    chosenNameEl!.textContent = result.name;
    chosenLocationEl!.textContent = result.locationLabel;
    chosenEl!.hidden = false;
    comboboxInputWrap!.hidden = true;
    syncFieldVisibility();
  }

  function renderResults(list: ChurchResult[]) {
    results = list;
    activeIndex = -1;
    listbox!.replaceChildren();

    if (list.length === 0) {
      const empty = document.createElement("li");
      empty.className = "church-interest-form__option-empty";
      empty.setAttribute("role", "presentation");
      empty.textContent = "No matches — you can still enter it manually.";
      listbox!.appendChild(empty);
      statusEl!.textContent = `No matches for "${nameInput!.value.trim()}".`;
    } else {
      list.forEach((result, index) => {
        const li = document.createElement("li");
        li.id = `church-interest-option-${index}`;
        li.className = "church-interest-form__option";
        li.setAttribute("role", "option");
        li.setAttribute("aria-selected", "false");
        li.dataset.index = String(index);

        const nameSpan = document.createElement("span");
        nameSpan.className = "church-interest-form__option-name";
        nameSpan.textContent = result.name;
        li.appendChild(nameSpan);

        const locationSpan = document.createElement("span");
        locationSpan.className = "church-interest-form__option-location";
        locationSpan.textContent = result.locationLabel;
        li.appendChild(locationSpan);

        li.addEventListener("mousedown", (event) => event.preventDefault());
        li.addEventListener("click", () => pick(result));

        listbox!.appendChild(li);
      });
      statusEl!.textContent = `${list.length} match${list.length === 1 ? "" : "es"} found.`;
    }

    listbox!.hidden = false;
    nameInput!.setAttribute("aria-expanded", "true");
  }

  function setActiveIndex(next: number) {
    if (results.length === 0) return;
    activeIndex = Math.max(0, Math.min(next, results.length - 1));
    const options = listbox!.querySelectorAll<HTMLLIElement>('[role="option"]');
    options.forEach((opt, i) => {
      const active = i === activeIndex;
      opt.setAttribute("aria-selected", active ? "true" : "false");
    });
    nameInput!.setAttribute("aria-activedescendant", `church-interest-option-${activeIndex}`);
  }

  async function runSearch(query: string) {
    const country = countrySelect!.value;
    if (country === "other") return;

    requestController?.abort();
    const controller = new AbortController();
    requestController = controller;

    const params = new URLSearchParams({ q: query, country, limit: String(SEARCH_LIMIT) });
    if (stateSelect!.value) params.set("state", stateSelect!.value);

    try {
      const res = await fetch(`/api/church-search?${params.toString()}`, { signal: controller.signal });
      if (!res.ok) throw new Error(`Search failed (${res.status})`);
      const data = (await res.json()) as { results?: ChurchResult[] };
      if (controller.signal.aborted) return;
      lastQuery = query;
      lastResults = data.results ?? [];
      renderResults(lastResults);
    } catch (err) {
      if (controller.signal.aborted) return;
      statusEl!.textContent = "Couldn't load matches — you can still enter your church manually.";
      clearListbox();
    }
  }

  function scheduleSearch() {
    if (isUnlisted()) return;

    window.clearTimeout(debounceHandle);

    if (!stateSelect!.value) {
      requestController?.abort();
      clearListbox();
      statusEl!.textContent = gatingMessage();
      return;
    }

    const query = nameInput!.value.trim();
    if (query.length < MIN_QUERY_LENGTH) {
      requestController?.abort();
      clearListbox();
      statusEl!.textContent =
        query.length === 0 ? "Start typing your church’s name." : "Keep typing — at least 2 characters.";
      return;
    }

    debounceHandle = window.setTimeout(() => runSearch(query), SEARCH_DEBOUNCE_MS);
  }

  nameInput.addEventListener("input", () => {
    if (mode === "unlisted") return;
    scheduleSearch();
  });

  nameInput.addEventListener("keydown", (event) => {
    if (mode === "unlisted") return;
    const expanded = !listbox!.hidden;

    switch (event.key) {
      case "ArrowDown":
        if (!expanded || results.length === 0) return;
        event.preventDefault();
        setActiveIndex(activeIndex + 1);
        return;
      case "ArrowUp":
        if (!expanded || results.length === 0) return;
        event.preventDefault();
        setActiveIndex(activeIndex - 1);
        return;
      case "Home":
        if (!expanded || results.length === 0) return;
        event.preventDefault();
        setActiveIndex(0);
        return;
      case "End":
        if (!expanded || results.length === 0) return;
        event.preventDefault();
        setActiveIndex(results.length - 1);
        return;
      case "Enter":
        if (!expanded) return;
        event.preventDefault();
        if (activeIndex >= 0 && results[activeIndex]) pick(results[activeIndex]!);
        else clearListbox();
        return;
      case "Escape":
        if (!expanded) return;
        event.preventDefault();
        clearListbox();
        return;
      default:
        return;
    }
  });

  nameInput.addEventListener("blur", () => {
    // Click-tolerant: let a pointerdown/click on a listbox option register
    // first. Cache is left intact so refocusing re-shows results instantly —
    // and if focus already came back (e.g. a fast tab-away-and-back), don't
    // wipe the list this same tick just restored.
    window.setTimeout(() => {
      if (document.activeElement === nameInput) return;
      clearListbox();
    }, 100);
  });

  nameInput.addEventListener("focus", () => {
    if (isUnlisted() || !stateSelect!.value) return;
    const query = nameInput!.value.trim();
    if (query.length < MIN_QUERY_LENGTH) return;
    if (lastQuery !== null && query === lastQuery) {
      renderResults(lastResults);
    } else {
      scheduleSearch();
    }
  });

  chosenChangeBtn.addEventListener("click", () => {
    clearChosen();
    stateSelect!.value = "";
    syncFieldVisibility();
    (nameInput!.disabled ? stateSelect! : nameInput!).focus();
  });

  unlistedToggleBtn.addEventListener("click", () => {
    if (mode === "directory") {
      mode = "unlisted";
      requestController?.abort();
      clearListbox();
      clearChosen();
      statusEl!.textContent = "No problem — enter your church’s name, city, and state below.";
    } else {
      mode = "directory";
      statusEl!.textContent = "";
      scheduleSearch();
    }
    syncFieldVisibility();
  });

  stateSelect.addEventListener("change", () => {
    invalidateSearchCache();
    clearListbox();
    syncFieldVisibility();
    scheduleSearch();
  });

  countrySelect.addEventListener("change", () => {
    const country = countrySelect!.value;
    requestController?.abort();
    clearChosen();
    clearListbox();
    rebuildStateSelect(country);
    syncFieldVisibility();
    setLastHmcPickerCountry(country === "other" ? null : country);

    if (country === "other") {
      statusEl!.textContent = "";
    } else {
      scheduleSearch();
    }
  });

  // Init: resolve starting country (last-used → device locale/timezone → US),
  // falling back to whatever the server rendered if resolution disagrees.
  const initialCountry = resolveDefaultHmcCountry(countrySelect.value);
  if (Array.from(countrySelect.options).some((o) => o.value === initialCountry)) {
    countrySelect.value = initialCountry;
  }
  rebuildStateSelect(countrySelect.value);
  syncFieldVisibility();
})();
