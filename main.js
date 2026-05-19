const { Plugin, PluginSettingTab, Setting, normalizePath } = require("obsidian");

const BODY_CLASS = "material-icon-theme-for-obsidian-enabled";

const DEFAULT_SETTINGS = {
  enableFileIcons: true,
  enableFolderIcons: true,
  enableFolderArrows: true,
  showFileExtensions: true,
  hideNativeFileTags: true,
  iconSize: 16,
  opacity: 1,
  grayscale: false
};

const COMMON_FILE_ICONS = {
  md: "markdown.svg",
  markdown: "markdown.svg",
  json: "json.svg",
  html: "html.svg",
  htm: "html.svg",
  css: "css.svg",
  js: "javascript.svg",
  mjs: "javascript.svg",
  cjs: "javascript.svg",
  ts: "typescript.svg",
  tsx: "react_ts.svg",
  jsx: "react.svg",
  vue: "vue.svg",
  png: "image.svg",
  jpg: "image.svg",
  jpeg: "image.svg",
  gif: "image.svg",
  svg: "svg.svg",
  pdf: "pdf.svg",
  txt: "document.svg",
  yml: "yaml.svg",
  yaml: "yaml.svg"
};

const COMMON_FILE_NAMES = {
  "readme.md": "readme.svg",
  "license": "license.svg",
  "license.md": "license.svg",
  "package.json": "nodejs.svg",
  "tsconfig.json": "tsconfig.svg",
  ".gitignore": "git.svg"
};

const EXTENSION_LANGUAGE_IDS = {
  c: "c",
  cc: "cpp",
  cpp: "cpp",
  cs: "csharp",
  css: "css",
  dart: "dart",
  go: "go",
  h: "c",
  hpp: "cpp",
  html: "html",
  htm: "html",
  java: "java",
  js: "javascript",
  jsx: "javascriptreact",
  lua: "lua",
  php: "php",
  py: "python",
  rb: "ruby",
  rs: "rust",
  sh: "shellscript",
  sql: "sql",
  svelte: "svelte",
  swift: "swift",
  ts: "typescript",
  tsx: "typescriptreact",
  vue: "vue",
  xml: "xml",
  yaml: "yaml",
  yml: "yaml"
};

module.exports = class MaterialFileTreeIconsPlugin extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.pluginDir = this.manifest.dir || `${this.app.vault.configDir}/plugins/${this.manifest.id}`;
    this.scanTimer = null;

    await this.loadIconTheme();
    this.restoreFileExplorer();
    this.applyBodyState();
    this.addSettingTab(new MaterialFileTreeIconsSettingTab(this.app, this));

    this.registerEvent(this.app.workspace.on("layout-change", () => this.scheduleScan()));
    this.registerEvent(this.app.workspace.on("file-open", () => this.scheduleScan()));
    this.registerEvent(this.app.vault.on("create", () => this.scheduleScan()));
    this.registerEvent(this.app.vault.on("rename", () => this.scheduleScan()));
    this.registerEvent(this.app.vault.on("delete", () => this.scheduleScan()));
    this.registerDomEvent(document, "click", (event) => this.handleFolderTitleInteraction(event));
    this.registerDomEvent(document, "keydown", (event) => this.handleFolderTitleInteraction(event));
    this.register(() => this.clearScanTimer());

    this.app.workspace.onLayoutReady(() => this.scheduleScan());
  }

  onunload() {
    this.clearScanTimer();
    this.restoreFileExplorer();
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.applyBodyState();
    this.restoreFileExplorer({ keepBodyState: true });
    this.scheduleScan();
  }

  applyBodyState() {
    document.body.classList.add(BODY_CLASS);
    document.body.classList.toggle("mfti-icon-grayscale", this.settings.grayscale);
    document.body.classList.toggle("mfti-folder-arrows-enabled", this.settings.enableFolderArrows);
    document.body.classList.toggle("mfti-hide-native-file-tags", this.settings.hideNativeFileTags);
    document.body.style.setProperty("--mfti-icon-size", `${this.settings.iconSize}px`);
    document.body.style.setProperty("--mfti-icon-opacity", String(this.settings.opacity));
  }

  clearScanTimer() {
    if (this.scanTimer !== null) {
      window.clearTimeout(this.scanTimer);
      this.scanTimer = null;
    }
  }

  scheduleScan() {
    this.clearScanTimer();
    this.scanTimer = window.setTimeout(() => {
      this.scanTimer = null;
      this.decorateFileExplorer();
    }, 150);
  }

  decorateFileExplorer() {
    const explorers = document.querySelectorAll('.workspace-leaf-content[data-type="file-explorer"]');
    explorers.forEach((explorer) => {
      if (this.settings.enableFolderIcons) {
        explorer.querySelectorAll(".nav-folder-title").forEach((titleEl) => this.decorateTitle(titleEl, "folder"));
      }

      if (this.settings.enableFileIcons) {
        explorer.querySelectorAll(".nav-file-title").forEach((titleEl) => this.decorateTitle(titleEl, "file"));
      }
    });
  }

  decorateTitle(titleEl, type) {
    if (isRenamingTitle(titleEl)) {
      this.restoreTitle(titleEl);
      return;
    }

    const contentEl = titleEl.querySelector(type === "folder" ? ".nav-folder-title-content" : ".nav-file-title-content");
    if (!contentEl) {
      this.restoreTitle(titleEl);
      return;
    }

    const path = getPath(titleEl, contentEl);
    if (!path) {
      this.restoreTitle(titleEl);
      return;
    }

    if (type === "folder") {
      this.ensureFolderArrow(titleEl, contentEl);
    }

    const icon = type === "folder" ? this.getFolderIcon(path, titleEl) : this.getFileIcon(path);
    this.ensureIcon(titleEl, contentEl, icon);
    this.ensureFileExtension(contentEl, path, type);
    titleEl.classList.add("mfti-title-decorated");
    titleEl.classList.toggle("mfti-folder-decorated", type === "folder");
    titleEl.classList.toggle("mfti-file-decorated", type === "file");

    if (type === "folder") {
      window.requestAnimationFrame(() => this.repairFolderChildrenFlow(titleEl));
    }
  }

  ensureFolderArrow(titleEl, contentEl) {
    if (!this.settings.enableFolderArrows) {
      titleEl.querySelectorAll(":scope > .mfti-folder-arrow").forEach((el) => el.remove());
      return;
    }

    let arrowEl = titleEl.querySelector(":scope > .mfti-folder-arrow");
    if (!arrowEl) {
      arrowEl = createFolderArrowElement();
      const iconEl = titleEl.querySelector(":scope > .mfti-row-icon");
      titleEl.insertBefore(arrowEl, iconEl || contentEl);
      arrowEl.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.toggleFolder(titleEl);
      });
    }

    arrowEl.classList.toggle("is-open", isFolderOpen(titleEl));
    arrowEl.setAttribute("aria-label", isFolderOpen(titleEl) ? "Collapse folder" : "Expand folder");
  }

  ensureIcon(titleEl, contentEl, iconFileName) {
    let iconEl = titleEl.querySelector(":scope > .mfti-row-icon");
    if (!iconEl) {
      iconEl = createIconElement();
      titleEl.insertBefore(iconEl, contentEl);
    }

    if (iconEl.dataset.icon !== iconFileName) {
      const img = iconEl.querySelector("img");
      img.src = this.getIconUrl(iconFileName);
      img.alt = "";
      iconEl.dataset.icon = iconFileName;
    }
  }

  repairFolderChildrenFlow(titleEl) {
    const folderEl = titleEl.closest(".nav-folder, .tree-item");
    if (!(folderEl instanceof HTMLElement)) {
      return;
    }

    const childrenEl = folderEl.querySelector(":scope > .nav-folder-children, :scope > .tree-item-children");
    if (!(childrenEl instanceof HTMLElement) || folderEl.classList.contains("is-collapsed")) {
      this.clearFolderChildrenFlowRepair(folderEl);
      return;
    }

    const childItems = childrenEl.querySelectorAll(":scope > .nav-folder, :scope > .nav-file, :scope > .tree-item");
    if (!childItems.length) {
      this.clearFolderChildrenFlowRepair(folderEl);
      return;
    }

    const rowHeight = Number.parseFloat(getComputedStyle(document.body).getPropertyValue("--mfti-row-min-height")) || 24;
    const expectedMinHeight = childItems.length * Math.max(16, rowHeight * 0.6);
    const actualHeight = childrenEl.getBoundingClientRect().height;

    if (actualHeight < expectedMinHeight) {
      folderEl.classList.add("mfti-children-out-of-flow");
      childrenEl.classList.add("mfti-children-flow-repaired");
      childrenEl.style.setProperty("--mfti-out-of-flow-child-count", String(childItems.length));
    } else {
      this.clearFolderChildrenFlowRepair(folderEl);
    }
  }

  clearFolderChildrenFlowRepair(folderEl) {
    folderEl.classList.remove("mfti-children-out-of-flow");
    folderEl.style.removeProperty("--mfti-out-of-flow-child-count");
    const childrenEl = folderEl.querySelector(":scope > .nav-folder-children, :scope > .tree-item-children");
    if (childrenEl instanceof HTMLElement) {
      childrenEl.classList.remove("mfti-children-flow-repaired");
      childrenEl.style.removeProperty("--mfti-out-of-flow-child-count");
    }
  }

  ensureFileExtension(contentEl, path, type) {
    contentEl.querySelectorAll(":scope > .mfti-extension").forEach((el) => el.remove());
    if (type !== "file" || !this.settings.showFileExtensions) {
      return;
    }

    const ext = fileExtensionSuffix(path);
    if (!ext) {
      return;
    }

    if (contentEl.textContent.trim().toLowerCase().endsWith(ext.toLowerCase())) {
      return;
    }

    const extensionEl = document.createElement("span");
    extensionEl.className = "mfti-extension";
    extensionEl.textContent = ext;
    contentEl.appendChild(extensionEl);
  }

  toggleFolder(titleEl) {
    const nativeToggle = titleEl.querySelector(":scope > .collapse-icon, :scope > .nav-folder-collapse-indicator");
    if (nativeToggle instanceof HTMLElement) {
      nativeToggle.click();
    } else {
      titleEl.click();
    }
    window.setTimeout(() => this.scheduleScan(), 60);
  }

  handleFolderTitleInteraction(event) {
    if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.closest(".mfti-folder-arrow")) {
      return;
    }

    const titleEl = target.closest('.workspace-leaf-content[data-type="file-explorer"] .nav-folder-title');
    if (!titleEl || isRenamingTitle(titleEl)) {
      return;
    }

    window.setTimeout(() => this.scheduleScan(), 60);
  }

  restoreTitle(titleEl) {
    titleEl.querySelectorAll(":scope > .mfti-row-icon").forEach((el) => el.remove());
    titleEl.querySelectorAll(":scope > .mfti-folder-arrow").forEach((el) => el.remove());
    titleEl.querySelectorAll(".mfti-extension").forEach((el) => el.remove());
    titleEl.classList.remove("mfti-title-decorated", "mfti-folder-decorated", "mfti-file-decorated");
    const folderEl = titleEl.closest(".nav-folder, .tree-item");
    if (folderEl instanceof HTMLElement) {
      this.clearFolderChildrenFlowRepair(folderEl);
    }
  }

  restoreFileExplorer(options = {}) {
    document.querySelectorAll(".mfti-row-icon, [data-mfti-icon]").forEach((el) => el.remove());
    document.querySelectorAll(".mfti-folder-arrow, [data-mfti-folder-arrow]").forEach((el) => el.remove());
    document.querySelectorAll(".mfti-extension").forEach((el) => el.remove());
    document.querySelectorAll(".mfti-hidden-foreign-icon").forEach((el) => el.classList.remove("mfti-hidden-foreign-icon"));
    document.querySelectorAll(".mfti-title-decorated").forEach((el) => {
      el.classList.remove("mfti-title-decorated", "mfti-folder-decorated", "mfti-file-decorated", "mfti-renaming");
    });
    document.querySelectorAll(".mfti-children-out-of-flow").forEach((el) => {
      el.classList.remove("mfti-children-out-of-flow");
      el.style.removeProperty("--mfti-out-of-flow-child-count");
    });
    document.querySelectorAll(".mfti-children-flow-repaired").forEach((el) => {
      el.classList.remove("mfti-children-flow-repaired");
      el.style.removeProperty("--mfti-out-of-flow-child-count");
    });

    if (!options.keepBodyState) {
      document.body.classList.remove(BODY_CLASS, "mfti-icon-grayscale", "mfti-folder-arrows-enabled", "mfti-hide-native-file-tags");
      document.body.style.removeProperty("--mfti-icon-size");
      document.body.style.removeProperty("--mfti-icon-opacity");
    }
  }

  getFileIcon(path) {
    const normalizedPath = normalizeLookupPath(path);
    const fileName = basename(normalizedPath);

    const byPath = this.fileNameIcons[normalizedPath];
    if (byPath) {
      return this.resolveIconFile(byPath, "file.svg");
    }

    const byName = COMMON_FILE_NAMES[fileName];
    if (byName) {
      return byName;
    }

    const themeByName = this.fileNameIcons[fileName];
    if (themeByName) {
      return this.resolveIconFile(themeByName, "file.svg");
    }

    const byExtension = this.matchFileExtensionIcon(fileName);
    if (byExtension) {
      return this.resolveIconFile(byExtension, "file.svg");
    }

    const ext = extension(fileName);
    const byCommonExtension = COMMON_FILE_ICONS[ext];
    if (byCommonExtension) {
      return byCommonExtension;
    }

    const languageId = EXTENSION_LANGUAGE_IDS[ext] || ext;
    const languageIcon = this.languageIdIcons[languageId] || this.languageIdIcons[ext] || (this.iconDefinitions[ext] ? ext : null);
    if (languageIcon) {
      return this.resolveIconFile(languageIcon, "file.svg");
    }

    return this.resolveIconFile(this.iconTheme.file || "file", "file.svg");
  }

  getFolderIcon(path, titleEl) {
    const normalizedPath = normalizeLookupPath(path);
    const folderName = basename(normalizedPath);
    const isOpen = isFolderOpen(titleEl);
    const isRoot = !normalizedPath.includes("/");
    const rootMap = isOpen ? this.rootFolderNameExpandedIcons : this.rootFolderNameIcons;
    const folderMap = isOpen ? this.folderNameExpandedIcons : this.folderNameIcons;

    const rootIcon = isRoot ? rootMap[folderName] : null;
    if (rootIcon) {
      return this.resolveIconFile(rootIcon, isOpen ? "folder-open.svg" : "folder.svg");
    }

    const folderIcon = folderMap[folderName];
    if (folderIcon) {
      return this.resolveIconFile(folderIcon, isOpen ? "folder-open.svg" : "folder.svg");
    }

    return this.resolveIconFile(isOpen ? this.iconTheme.folderExpanded || "folder-open" : this.iconTheme.folder || "folder", isOpen ? "folder-open.svg" : "folder.svg");
  }

  getIconUrl(iconFileName) {
    return this.app.vault.adapter.getResourcePath(normalizePath(`${this.pluginDir}/icons/${iconFileName}`));
  }

  async loadIconTheme() {
    try {
      const raw = await this.app.vault.adapter.read(normalizePath(`${this.pluginDir}/dist/material-icons.json`));
      const iconTheme = JSON.parse(raw);
      this.iconTheme = iconTheme;
      this.iconDefinitions = iconTheme.iconDefinitions || {};
      this.fileNameIcons = lowerRecord(iconTheme.fileNames);
      this.fileExtensionIcons = lowerRecord(iconTheme.fileExtensions);
      this.languageIdIcons = lowerRecord(iconTheme.languageIds);
      this.folderNameIcons = lowerRecord(iconTheme.folderNames);
      this.folderNameExpandedIcons = lowerRecord(iconTheme.folderNamesExpanded);
      this.rootFolderNameIcons = lowerRecord(iconTheme.rootFolderNames);
      this.rootFolderNameExpandedIcons = lowerRecord(iconTheme.rootFolderNamesExpanded);
      this.fileExtensionKeys = Object.keys(this.fileExtensionIcons).sort((a, b) => b.length - a.length);
    } catch (error) {
      console.error("material-icon-theme-for-obsidian: failed to load bundled material-icons.json", error);
      this.iconTheme = { file: "file", folder: "folder", folderExpanded: "folder-open" };
      this.iconDefinitions = {};
      this.fileNameIcons = {};
      this.fileExtensionIcons = {};
      this.languageIdIcons = {};
      this.folderNameIcons = {};
      this.folderNameExpandedIcons = {};
      this.rootFolderNameIcons = {};
      this.rootFolderNameExpandedIcons = {};
      this.fileExtensionKeys = [];
    }
  }

  matchFileExtensionIcon(fileName) {
    for (const key of this.fileExtensionKeys) {
      if (fileName === key || fileName.endsWith(`.${key}`)) {
        return this.fileExtensionIcons[key];
      }
    }
    return null;
  }

  resolveIconFile(iconId, fallbackFileName) {
    if (!iconId) {
      return fallbackFileName;
    }

    const definition = this.iconDefinitions[iconId];
    if (definition?.iconPath) {
      return basename(definition.iconPath);
    }

    if (iconId.endsWith(".svg")) {
      return iconId;
    }

    return `${iconId}.svg`;
  }
};

class MaterialFileTreeIconsSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "material-icon-theme-for-obsidian" });

    new Setting(containerEl)
      .setName("File icons")
      .setDesc("Show plugin-managed icons for files.")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.enableFileIcons)
        .onChange(async (value) => {
          this.plugin.settings.enableFileIcons = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Folder icons")
      .setDesc("Show plugin-managed icons for folders.")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.enableFolderIcons)
        .onChange(async (value) => {
          this.plugin.settings.enableFolderIcons = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Folder arrows")
      .setDesc("Show plugin-managed folder expand/collapse arrows.")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.enableFolderArrows)
        .onChange(async (value) => {
          this.plugin.settings.enableFolderArrows = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("File extensions")
      .setDesc("Show file extensions in the file explorer.")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.showFileExtensions)
        .onChange(async (value) => {
          this.plugin.settings.showFileExtensions = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Hide native file tags")
      .setDesc("Hide Obsidian file type badges such as JSON.")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.hideNativeFileTags)
        .onChange(async (value) => {
          this.plugin.settings.hideNativeFileTags = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Icon size")
      .setDesc("Size in pixels.")
      .addSlider((slider) => slider
        .setLimits(12, 24, 1)
        .setValue(this.plugin.settings.iconSize)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.iconSize = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Opacity")
      .setDesc("Icon opacity.")
      .addSlider((slider) => slider
        .setLimits(0.35, 1, 0.05)
        .setValue(this.plugin.settings.opacity)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.opacity = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName("Grayscale")
      .setDesc("Render icons in grayscale.")
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.grayscale)
        .onChange(async (value) => {
          this.plugin.settings.grayscale = value;
          await this.plugin.saveSettings();
        }));
  }
}

function createIconElement() {
  const iconEl = document.createElement("span");
  iconEl.className = "mfti-row-icon";
  iconEl.dataset.mftiIcon = "true";

  const img = document.createElement("img");
  img.decoding = "async";
  img.draggable = false;
  iconEl.appendChild(img);

  return iconEl;
}

function createFolderArrowElement() {
  const arrowEl = document.createElement("span");
  arrowEl.className = "mfti-folder-arrow";
  arrowEl.dataset.mftiFolderArrow = "true";
  arrowEl.setAttribute("role", "button");
  arrowEl.setAttribute("tabindex", "-1");
  arrowEl.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  return arrowEl;
}

function getPath(titleEl, contentEl) {
  return (titleEl.getAttribute("data-path")
    || titleEl.closest("[data-path]")?.getAttribute("data-path")
    || contentEl.getAttribute("title")
    || "").trim();
}

function isRenamingTitle(titleEl) {
  return titleEl.classList.contains("is-being-renamed")
    || Boolean(titleEl.querySelector("input, textarea, [contenteditable='true']"));
}

function isFolderOpen(titleEl) {
  const folder = titleEl.closest(".nav-folder");
  return Boolean(folder && !folder.classList.contains("is-collapsed"));
}

function basename(path) {
  return path.split("/").filter(Boolean).pop() || path;
}

function extension(fileName) {
  const index = fileName.lastIndexOf(".");
  return index > 0 ? fileName.slice(index + 1).toLowerCase() : "";
}

function fileExtensionSuffix(path) {
  const name = basename(String(path || ""));
  const index = name.lastIndexOf(".");
  return index > 0 && index < name.length - 1 ? name.slice(index) : "";
}

function normalizeLookupPath(path) {
  return String(path || "").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "").toLowerCase();
}

function lowerRecord(record) {
  const result = {};
  Object.entries(record || {}).forEach(([key, value]) => {
    result[String(key).toLowerCase()] = value;
  });
  return result;
}
