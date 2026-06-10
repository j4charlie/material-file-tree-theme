const { Notice, Plugin, PluginSettingTab, Setting, normalizePath } = require("obsidian");

const BODY_CLASS = "material-file-tree-theme-enabled";
const GITHUB_REPOSITORY_URL = "https://github.com/j4charlie/material-file-tree-theme";
const GITHUB_ISSUES_URL = "https://github.com/j4charlie/material-file-tree-theme/issues";
const RESOURCE_DOWNLOAD_URL = "https://github.com/j4charlie/material-file-tree-theme/releases/latest";
const RESOURCE_PACK_NAME = "material-icon-souce.zip";
const RESOURCE_STATUS_READY = "ready";
const RESOURCE_STATUS_MISSING = "missing";
const DECORATION_VERSION = "observer-1";
const INITIAL_SCAN_DELAYS = [0, 250, 900];
const DECORATION_BATCH_SIZE = 120;
const NEUTRAL_FILE_TREE_SNIPPET_NAME = "neutral-file-tree";
const NEUTRAL_FILE_TREE_SNIPPET_FILE = `${NEUTRAL_FILE_TREE_SNIPPET_NAME}.css`;
const NEUTRAL_FILE_TREE_SNIPPET_CSS = `/* Neutralize theme file explorer coloring while keeping plugin icons. */
.workspace-leaf-content[data-type="file-explorer"] {
  --nav-indentation-guide-color: var(--background-modifier-border) !important;
  --nav-indentation-guide-width: 1px !important;
  --text-folder-file-icon: var(--text-muted);
  --folder-color: var(--text-muted);
  --mfti-row-hover-background: rgba(128, 128, 128, 0.12);
  --mfti-row-active-background: rgba(128, 128, 128, 0.18);
  --tab-color: var(--text-muted);
}

.workspace-leaf-content[data-type="file-explorer"] .nav-files-container > div > .tree-item.nav-folder {
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  filter: none !important;
  margin: 0 !important;
  --tab-color: var(--text-muted) !important;
}

.workspace-leaf-content[data-type="file-explorer"] .nav-folder-title,
.workspace-leaf-content[data-type="file-explorer"] .nav-file-title,
.workspace-leaf-content[data-type="file-explorer"] .tree-item-self.is-clickable.nav-folder-title,
.workspace-leaf-content[data-type="file-explorer"] .tree-item-self.is-clickable.nav-file-title {
  background-color: transparent !important;
  border-radius: 3px !important;
  color: var(--nav-item-color) !important;
  filter: none !important;
  text-decoration: none !important;
}

.workspace-leaf-content[data-type="file-explorer"] .nav-folder,
.workspace-leaf-content[data-type="file-explorer"] .nav-folder:hover,
.workspace-leaf-content[data-type="file-explorer"] .nav-folder-children,
.workspace-leaf-content[data-type="file-explorer"] .nav-folder-children:hover,
.workspace-leaf-content[data-type="file-explorer"] .tree-item-children,
.workspace-leaf-content[data-type="file-explorer"] .tree-item-children:hover {
  background: transparent !important;
  background-color: transparent !important;
}

.workspace-leaf-content[data-type="file-explorer"] .nav-folder-title:hover,
.workspace-leaf-content[data-type="file-explorer"] .nav-file-title:hover,
.workspace-leaf-content[data-type="file-explorer"] .tree-item-self.is-clickable.nav-folder-title:hover,
.workspace-leaf-content[data-type="file-explorer"] .tree-item-self.is-clickable.nav-file-title:hover {
  color: var(--nav-item-color-hover) !important;
  background-color: var(--mfti-row-hover-background) !important;
}

.workspace-leaf-content[data-type="file-explorer"] .nav-file-title.is-active,
.workspace-leaf-content[data-type="file-explorer"] .tree-item-self.is-clickable.nav-file-title.is-active {
  color: var(--nav-item-color-active) !important;
  background-color: var(--mfti-row-active-background) !important;
}

.workspace-leaf-content[data-type="file-explorer"] .nav-folder-children,
.workspace-leaf-content[data-type="file-explorer"] .tree-item-children {
  background: transparent !important;
  box-shadow: none !important;
  filter: none !important;
}

body.material-file-tree-theme-enabled .workspace-leaf-content[data-type="file-explorer"] .nav-folder-children,
body.material-file-tree-theme-enabled .workspace-leaf-content[data-type="file-explorer"] .tree-item-children {
  background: transparent !important;
  box-shadow: none !important;
  filter: none !important;
}

body.material-file-tree-theme-enabled .workspace-leaf-content[data-type="file-explorer"] .nav-folder-title::before,
body.material-file-tree-theme-enabled .workspace-leaf-content[data-type="file-explorer"] .nav-folder-title::after,
body.material-file-tree-theme-enabled .workspace-leaf-content[data-type="file-explorer"] .nav-file-title::before,
body.material-file-tree-theme-enabled .workspace-leaf-content[data-type="file-explorer"] .nav-file-title::after,
body.material-file-tree-theme-enabled .workspace-leaf-content[data-type="file-explorer"] .nav-folder-title-content::before,
body.material-file-tree-theme-enabled .workspace-leaf-content[data-type="file-explorer"] .nav-folder-title-content::after,
body.material-file-tree-theme-enabled .workspace-leaf-content[data-type="file-explorer"] .nav-file-title-content::before,
body.material-file-tree-theme-enabled .workspace-leaf-content[data-type="file-explorer"] .nav-file-title-content::after {
  background: none !important;
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  content: none !important;
  display: none !important;
  filter: none !important;
  -webkit-mask-image: none !important;
  mask-image: none !important;
}

.workspace-leaf-content[data-type="file-explorer"] .nav-files-container > div > .tree-item.nav-folder > .nav-folder-title::before,
.workspace-leaf-content[data-type="file-explorer"] .nav-files-container > div > .tree-item.nav-folder > .tree-item-self.nav-folder-title::before {
  content: none !important;
  display: none !important;
}
`;

const DEFAULT_SETTINGS = {
  language: "en",
  enableFileIcons: true,
  enableFolderIcons: true,
  showFileExtensions: true,
  hideNativeFileTags: true,
  iconSize: 16,
  opacity: 1,
  grayscale: false
};

const LANGUAGE_OPTIONS = {
  en: "English",
  zh: "中文"
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

const I18N = {
  en: {
    settingsTitle: "Material File Tree Theme",
    importantSettingsName: "Important settings",
    moreSettingsName: "More settings",
    languageName: "Language",
    languageDesc: "Change the language used on this settings page.",
    resourcesInstalled: "Icon resources installed",
    resourcesMissing: "Icon resources missing",
    resourcesReadyDesc: "The bundled icon mapping and SVG files are available.",
    resourcesMissingDesc: "Missing: {{missing}}. Download {{pack}}, extract it, then import the extracted folder.",
    resourcePackName: "Resource pack",
    resourcePackDesc: "Open the GitHub release page. Download {{pack}}, then extract it.",
    resourcePackButton: "Open download page",
    importResourcesName: "Import resources",
    importResourcesDesc: "Choose the extracted folder. It must contain dist/material-icons.json and icons/*.svg.",
    importResourcesButton: "Import folder",
    importSuccess: "Imported {{count}} icon resources.",
    importFailed: "Failed to import icon resources.",
    importInvalidFolder: "Choose the extracted resource pack folder that contains dist/material-icons.json and icons/*.svg.",
    fileIconsName: "File icons",
    fileIconsDesc: "Show Material icons for files.",
    folderIconsName: "Folder icons",
    folderIconsDesc: "Show Material icons for folders.",
    fileExtensionsName: "File extensions",
    fileExtensionsDesc: "Show file extensions in the file explorer when they are hidden by default.",
    hideNativeTagsName: "Hide native file tags",
    hideNativeTagsDesc: "Hide native file type badges such as JSON.",
    iconSizeName: "Icon size",
    iconSizeDesc: "Size in pixels.",
    opacityName: "Opacity",
    opacityDesc: "Icon opacity.",
    grayscaleName: "Grayscale",
    grayscaleDesc: "Render icons in grayscale.",
    themeCompatibilityName: "Theme compatibility",
    themeCompatibilityDesc: "Create and enable a CSS snippet that neutralizes theme colors in the file tree while keeping plugin icons and native indentation guides.",
    installNeutralFileTreeButton: "Install and enable CSS snippet",
    resetNeutralFileTreeButton: "Remove snippet",
    neutralFileTreeInstalled: "Created and enabled neutral-file-tree.",
    neutralFileTreeInstallFailed: "Failed to create and enable neutral-file-tree CSS snippet.",
    neutralFileTreeRemoved: "Removed neutral-file-tree CSS snippet.",
    neutralFileTreeRemoveFailed: "Failed to remove neutral-file-tree CSS snippet.",
    showAllFileTypesName: "Show all file types",
    showAllFileTypesDesc: "Recommended. Lets the file tree show files beyond Markdown.",
    showAllFileTypesUpdated: "Updated file type visibility.",
    showAllFileTypesUpdateFailed: "Failed to update file type visibility.",
    pluginPairingName: "Plugin pairing recommendations",
    pluginPairingDesc: "Manual Sorting helps control file tree sorting. Code Files helps preview code files. For other file types, install matching viewer plugins such as draw.io.",
    githubName: "GitHub",
    githubDesc: "Report issues or support the project.",
    githubIssueButton: "Open issue",
    githubStarButton: "Star on GitHub"
  },
  zh: {
    settingsTitle: "Material File Tree Theme",
    importantSettingsName: "重要配置",
    moreSettingsName: "更多配置",
    languageName: "语言",
    languageDesc: "切换此配置页面使用的语言。",
    resourcesInstalled: "图标资源已安装",
    resourcesMissing: "图标资源缺失",
    resourcesReadyDesc: "图标映射和 SVG 文件已可用。",
    resourcesMissingDesc: "缺失：{{missing}}。请下载 {{pack}}，解压后导入解压目录。",
    resourcePackName: "资源包",
    resourcePackDesc: "打开 GitHub Release 页面，下载 {{pack}} 后解压。",
    resourcePackButton: "打开下载页面",
    importResourcesName: "导入资源",
    importResourcesDesc: "选择解压后的目录。目录中必须包含 dist/material-icons.json 和 icons/*.svg。",
    importResourcesButton: "导入文件夹",
    importSuccess: "已导入 {{count}} 个图标资源。",
    importFailed: "图标资源导入失败。",
    importInvalidFolder: "请选择包含 dist/material-icons.json 和 icons/*.svg 的资源包解压目录。",
    fileIconsName: "文件图标",
    fileIconsDesc: "为文件显示 Material 图标。",
    folderIconsName: "文件夹图标",
    folderIconsDesc: "为文件夹显示 Material 图标。",
    fileExtensionsName: "文件扩展名",
    fileExtensionsDesc: "当扩展名默认隐藏时，在文件浏览器里补充显示。",
    hideNativeTagsName: "隐藏原生文件标签",
    hideNativeTagsDesc: "隐藏原生文件类型标记，例如 JSON。",
    iconSizeName: "图标大小",
    iconSizeDesc: "单位为像素。",
    opacityName: "透明度",
    opacityDesc: "图标透明度。",
    grayscaleName: "灰度",
    grayscaleDesc: "以灰度样式显示图标。",
    themeCompatibilityName: "主题兼容",
    themeCompatibilityDesc: "创建并启用 CSS 代码片段，用于屏蔽主题对文件树颜色的影响，同时保留插件图标和原生缩进线。",
    installNeutralFileTreeButton: "安装并启用 CSS 片段",
    resetNeutralFileTreeButton: "移除片段",
    neutralFileTreeInstalled: "已创建并启用 neutral-file-tree。",
    neutralFileTreeInstallFailed: "创建并启用 neutral-file-tree CSS 片段失败。",
    neutralFileTreeRemoved: "已移除 neutral-file-tree CSS 片段。",
    neutralFileTreeRemoveFailed: "移除 neutral-file-tree CSS 片段失败。",
    showAllFileTypesName: "展示所有文件类型",
    showAllFileTypesDesc: "推荐开启，可以查看 md 以外的文件。",
    showAllFileTypesUpdated: "已更新文件类型展示设置。",
    showAllFileTypesUpdateFailed: "更新文件类型展示设置失败。",
    pluginPairingName: "插件搭配推荐",
    pluginPairingDesc: "推荐 Manual Sorting 解决排序，Code Files 解决代码文件预览。其他类型文件可以寻找对应插件支持，比如 draw.io。",
    githubName: "GitHub",
    githubDesc: "反馈问题或支持这个项目。",
    githubIssueButton: "提交 issue",
    githubStarButton: "去 GitHub 点 star"
  }
};

module.exports = class MaterialFileTreeIconsPlugin extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.pluginDir = this.manifest.dir || `${this.app.vault.configDir}/plugins/${this.manifest.id}`;
    this.explorerObservers = new Map();
    this.pendingScanTimers = new Set();
    this.pendingTitleEls = new Set();
    this.pendingFlushFrame = null;
    this.fileIconCache = new Map();
    this.folderIconCache = new Map();
    this.iconUrlCache = new Map();
    this.resourceStatus = await this.getResourceStatus();
    this.showAllFileTypes = await this.loadShowAllFileTypes();

    await this.loadIconTheme();
    this.restoreFileExplorer();
    this.applyBodyState();
    this.addSettingTab(new MaterialFileTreeIconsSettingTab(this.app, this));

    this.registerEvent(this.app.workspace.on("layout-change", () => this.handleExplorerLayoutChange("layout-change")));
    this.registerEvent(this.app.workspace.on("file-open", () => this.queueExplorerScan("file-open")));
    this.registerEvent(this.app.vault.on("create", () => this.queueExplorerScan("vault-create")));
    this.registerEvent(this.app.vault.on("rename", () => this.queueExplorerScan("vault-rename")));
    this.registerEvent(this.app.vault.on("delete", () => this.queueExplorerScan("vault-delete")));
    this.registerDomEvent(document, "click", (event) => this.handleExplorerInteraction(event), { capture: true });
    this.registerDomEvent(document, "keydown", (event) => this.handleExplorerInteraction(event), { capture: true });
    this.registerDomEvent(window, "resize", () => this.queueExplorerScan("window-resize", [120]));
    this.register(() => this.disconnectExplorerObservers());
    this.register(() => this.clearPendingWork());

    this.app.workspace.onLayoutReady(() => this.handleExplorerLayoutChange("layout-ready"));
  }

  onunload() {
    this.disconnectExplorerObservers();
    this.clearPendingWork();
    this.restoreFileExplorer();
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.applyBodyState();
    this.restoreFileExplorer({ keepBodyState: true });
    this.queueExplorerScan("settings-change");
  }

  applyBodyState() {
    document.body.classList.add(BODY_CLASS);
    document.body.classList.toggle("mfti-icon-grayscale", this.settings.grayscale);
    document.body.classList.toggle("mfti-hide-native-file-tags", this.settings.hideNativeFileTags);
    document.body.style.setProperty("--mfti-icon-size", `${this.settings.iconSize}px`);
    document.body.style.setProperty("--mfti-icon-opacity", String(this.settings.opacity));
  }

  clearPendingWork() {
    this.pendingScanTimers.forEach((timer) => window.clearTimeout(timer));
    this.pendingScanTimers.clear();
    if (this.pendingFlushFrame !== null) {
      window.cancelAnimationFrame(this.pendingFlushFrame);
      this.pendingFlushFrame = null;
    }
    this.pendingTitleEls.clear();
  }

  handleExplorerInteraction(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const titleEl = target.closest(".nav-folder-title, .nav-file-title");
    if (titleEl instanceof HTMLElement && titleEl.closest('.workspace-leaf-content[data-type="file-explorer"]')) {
      this.queueTitle(titleEl);
      this.scheduleTitleDecoration(titleEl, 180);
    }
  }

  handleExplorerLayoutChange(reason) {
    this.refreshExplorerObservers();
    this.queueExplorerScan(reason);
  }

  queueExplorerScan(reason = "scheduled", delays = INITIAL_SCAN_DELAYS) {
    if (this.resourceStatus?.state !== RESOURCE_STATUS_READY) {
      return;
    }

    this.pendingScanTimers.forEach((timer) => window.clearTimeout(timer));
    this.pendingScanTimers.clear();

    delays.forEach((delay) => {
      const timer = window.setTimeout(() => {
        this.pendingScanTimers.delete(timer);
        this.scanFileExplorers(reason);
      }, delay);
      this.pendingScanTimers.add(timer);
    });
  }

  refreshExplorerObservers() {
    const explorers = new Set(document.querySelectorAll('.workspace-leaf-content[data-type="file-explorer"]'));

    this.explorerObservers.forEach((observer, explorer) => {
      if (!explorers.has(explorer)) {
        observer.disconnect();
        this.explorerObservers.delete(explorer);
      }
    });

    explorers.forEach((explorer) => {
      if (this.explorerObservers.has(explorer)) {
        return;
      }

      const observer = new MutationObserver((mutations) => this.handleExplorerMutations(mutations));
      observer.observe(explorer, {
        attributeFilter: ["aria-label", "class", "data-path", "title"],
        attributeOldValue: true,
        attributes: true,
        childList: true,
        subtree: true
      });
      this.explorerObservers.set(explorer, observer);
    });
  }

  disconnectExplorerObservers() {
    this.explorerObservers.forEach((observer) => observer.disconnect());
    this.explorerObservers.clear();
  }

  handleExplorerMutations(mutations) {
    if (this.resourceStatus?.state !== RESOURCE_STATUS_READY) {
      return;
    }

    const titleEls = new Set();
    mutations.forEach((mutation) => {
      if (isPluginOnlyMutation(mutation)) {
        return;
      }

      if (mutation.type === "childList") {
        collectRelatedTitleElement(mutation.target, titleEls);
        mutation.addedNodes.forEach((node) => collectTitleElements(node, titleEls));
        return;
      }

      collectRelatedTitleElement(mutation.target, titleEls);
    });

    this.queueTitles(titleEls);
  }

  scanFileExplorers() {
    if (this.resourceStatus?.state !== RESOURCE_STATUS_READY) {
      return;
    }

    this.refreshExplorerObservers();
    const titleEls = document.querySelectorAll(
      '.workspace-leaf-content[data-type="file-explorer"] .nav-folder-title, ' +
      '.workspace-leaf-content[data-type="file-explorer"] .nav-file-title'
    );
    this.queueTitles(titleEls);
  }

  queueTitles(titleEls) {
    titleEls.forEach((titleEl) => this.queueTitle(titleEl));
  }

  scheduleTitleDecoration(titleEl, delay) {
    const timer = window.setTimeout(() => {
      this.pendingScanTimers.delete(timer);
      this.queueTitle(titleEl);
    }, delay);
    this.pendingScanTimers.add(timer);
  }

  queueTitle(titleEl) {
    if (!(titleEl instanceof HTMLElement)) {
      return;
    }

    this.pendingTitleEls.add(titleEl);
    if (this.pendingFlushFrame !== null) {
      return;
    }

    this.pendingFlushFrame = window.requestAnimationFrame(() => this.flushPendingTitles());
  }

  flushPendingTitles() {
    this.pendingFlushFrame = null;

    const batch = [];
    for (const titleEl of this.pendingTitleEls) {
      batch.push(titleEl);
      this.pendingTitleEls.delete(titleEl);
      if (batch.length >= DECORATION_BATCH_SIZE) {
        break;
      }
    }

    batch.forEach((titleEl) => this.decorateQueuedTitle(titleEl));

    if (this.pendingTitleEls.size) {
      this.pendingFlushFrame = window.requestAnimationFrame(() => this.flushPendingTitles());
    }
  }

  decorateQueuedTitle(titleEl) {
    if (!(titleEl instanceof HTMLElement) || !titleEl.isConnected) {
      return;
    }

    if (titleEl.classList.contains("nav-folder-title")) {
      if (this.settings.enableFolderIcons) {
        this.decorateTitle(titleEl, "folder");
      } else {
        this.restoreTitle(titleEl);
      }
      return;
    }

    if (titleEl.classList.contains("nav-file-title")) {
      if (this.settings.enableFileIcons || this.settings.showFileExtensions) {
        this.decorateTitle(titleEl, "file");
      } else {
        this.restoreTitle(titleEl);
      }
    }
  }

  decorateTitle(titleEl, type) {
    if (!(titleEl instanceof HTMLElement) || isRenamingTitle(titleEl)) {
      this.restoreTitle(titleEl);
      return;
    }

    const contentEl = titleEl.querySelector(type === "folder" ? ".nav-folder-title-content" : ".nav-file-title-content");
    if (!(contentEl instanceof HTMLElement)) {
      this.restoreTitle(titleEl);
      return;
    }

    const path = getPath(titleEl, contentEl);
    const lookupPath = path || fileTitleText(contentEl) || contentEl.textContent?.trim() || "";
    if (!lookupPath) {
      this.restoreTitle(titleEl);
      return;
    }

    const iconEnabled = type === "folder" ? this.settings.enableFolderIcons : this.settings.enableFileIcons;
    const signature = this.getDecorationSignature(titleEl, type, lookupPath, iconEnabled);
    const icon = iconEnabled
      ? (type === "folder" ? this.getFolderIcon(lookupPath, titleEl) : this.getFileIcon(lookupPath))
      : null;

    if (titleEl.dataset.mftiSignature === signature
      && titleEl.classList.contains("mfti-title-decorated")
      && isDecorationComplete(titleEl, contentEl, icon, type, path, this.settings.showFileExtensions)) {
      return;
    }

    if (icon) {
      this.ensureIcon(titleEl, contentEl, icon);
    } else {
      titleEl.querySelectorAll(".mfti-row-icon").forEach((el) => el.remove());
    }

    this.ensureFileExtension(contentEl, path, type);
    titleEl.classList.add("mfti-title-decorated");
    titleEl.classList.toggle("mfti-folder-decorated", type === "folder");
    titleEl.classList.toggle("mfti-file-decorated", type === "file");
    titleEl.dataset.mftiSignature = signature;
  }

  getDecorationSignature(titleEl, type, path, iconEnabled) {
    const state = type === "folder" ? (isFolderOpen(titleEl) ? "open" : "closed") : (this.settings.showFileExtensions ? "ext" : "no-ext");
    return [DECORATION_VERSION, type, path, iconEnabled ? "icon" : "no-icon", state].join("|");
  }

  ensureIcon(titleEl, contentEl, iconFileName) {
    let iconEl = getTitleIconElement(titleEl, contentEl);
    if (!iconEl) {
      iconEl = createIconElement();
    }

    contentEl.insertBefore(iconEl, contentEl.firstChild);

    titleEl.querySelectorAll(".mfti-row-icon").forEach((el) => {
      if (el !== iconEl) {
        el.remove();
      }
    });

    if (iconEl.dataset.icon !== iconFileName) {
      const img = iconEl.querySelector("img");
      img.src = this.getIconUrl(iconFileName);
      img.alt = "";
      iconEl.dataset.icon = iconFileName;
    }
  }

  ensureFileExtension(contentEl, path, type) {
    contentEl.querySelectorAll(":scope > .mfti-extension").forEach((el) => el.remove());
    if (type !== "file" || !this.settings.showFileExtensions) {
      return;
    }

    const ext = fileExtensionSuffix(path);
    if (!ext || fileTitleText(contentEl).toLowerCase().endsWith(ext.toLowerCase())) {
      return;
    }

    const extensionEl = document.createElement("span");
    extensionEl.className = "mfti-extension";
    extensionEl.dataset.mftiExtension = "true";
    extensionEl.setAttribute("aria-hidden", "true");
    extensionEl.textContent = ext;
    contentEl.appendChild(extensionEl);
  }

  restoreTitle(titleEl) {
    if (!(titleEl instanceof HTMLElement)) {
      return;
    }

    titleEl.querySelectorAll(".mfti-row-icon").forEach((el) => el.remove());
    titleEl.querySelectorAll(".mfti-extension").forEach((el) => el.remove());
    delete titleEl.dataset.mftiSignature;
    titleEl.classList.remove("mfti-title-decorated", "mfti-folder-decorated", "mfti-file-decorated");
  }

  restoreFileExplorer(options = {}) {
    document.querySelectorAll(".mfti-row-icon, .mfti-extension").forEach((el) => el.remove());
    document.querySelectorAll(".mfti-title-decorated").forEach((el) => {
      delete el.dataset.mftiSignature;
      el.classList.remove("mfti-title-decorated", "mfti-folder-decorated", "mfti-file-decorated");
    });

    if (!options.keepBodyState) {
      document.body.classList.remove(BODY_CLASS, "mfti-icon-grayscale", "mfti-hide-native-file-tags");
      document.body.style.removeProperty("--mfti-icon-size");
      document.body.style.removeProperty("--mfti-icon-opacity");
    }
  }

  getFileIcon(path) {
    const normalizedPath = normalizeLookupPath(path);
    const cached = this.fileIconCache.get(normalizedPath);
    if (cached) {
      return cached;
    }

    const fileName = basename(normalizedPath);
    const icon = this.resolveFileIcon(fileName, normalizedPath);
    this.fileIconCache.set(normalizedPath, icon);
    return icon;
  }

  resolveFileIcon(fileName, normalizedPath) {
    const byPath = this.fileNameIcons[normalizedPath];
    if (byPath) {
      return this.resolveIconFile(byPath, "file.svg");
    }

    const commonName = COMMON_FILE_NAMES[fileName];
    if (commonName) {
      return commonName;
    }

    const byName = this.fileNameIcons[fileName];
    if (byName) {
      return this.resolveIconFile(byName, "file.svg");
    }

    const byExtension = this.matchFileExtensionIcon(fileName);
    if (byExtension) {
      return this.resolveIconFile(byExtension, "file.svg");
    }

    const ext = extension(fileName);
    const commonExtension = COMMON_FILE_ICONS[ext];
    if (commonExtension) {
      return commonExtension;
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
    const isOpen = isFolderOpen(titleEl);
    const cacheKey = `${isOpen ? "open" : "closed"}:${normalizedPath}`;
    const cached = this.folderIconCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const fallback = isOpen ? "folder-open.svg" : "folder.svg";
    const folderName = basename(normalizedPath);
    const isRoot = !normalizedPath.includes("/");
    const rootMap = isOpen ? this.rootFolderNameExpandedIcons : this.rootFolderNameIcons;
    const folderMap = isOpen ? this.folderNameExpandedIcons : this.folderNameIcons;
    const configuredIcon = (isRoot ? rootMap[folderName] : null) || folderMap[folderName];
    const icon = configuredIcon
      ? this.resolveIconFile(configuredIcon, fallback)
      : this.resolveIconFile(isOpen ? this.iconTheme.folderExpanded || "folder-open" : this.iconTheme.folder || "folder", fallback);

    this.folderIconCache.set(cacheKey, icon);
    return icon;
  }

  getIconUrl(iconFileName) {
    if (!this.iconUrlCache.has(iconFileName)) {
      this.iconUrlCache.set(iconFileName, this.app.vault.adapter.getResourcePath(normalizePath(`${this.pluginDir}/icons/${iconFileName}`)));
    }
    return this.iconUrlCache.get(iconFileName);
  }

  async getResourceStatus() {
    const requiredPaths = [
      "dist/material-icons.json",
      "icons/file.svg",
      "icons/folder.svg",
      "icons/folder-open.svg"
    ];
    const results = await Promise.all(requiredPaths.map((path) => this.app.vault.adapter.exists(normalizePath(`${this.pluginDir}/${path}`))));
    const missing = requiredPaths.filter((_, index) => !results[index]);
    return {
      state: missing.length ? RESOURCE_STATUS_MISSING : RESOURCE_STATUS_READY,
      missing
    };
  }

  async reloadResources() {
    this.resourceStatus = await this.getResourceStatus();
    await this.loadIconTheme();
    this.restoreFileExplorer({ keepBodyState: true });
    this.queueExplorerScan("resources-reloaded");
  }

  async importResourceFolder(files) {
    const fileList = Array.from(files || []);
    const mappingFile = findResourceFile(fileList, "dist/material-icons.json");
    const iconFiles = findResourceFilesInFolder(fileList, "icons", ".svg");

    if (!mappingFile || !iconFiles.length) {
      throw new Error(t(this, "importInvalidFolder"));
    }

    await ensureAdapterFolder(this.app.vault.adapter, normalizePath(`${this.pluginDir}/dist`));
    await ensureAdapterFolder(this.app.vault.adapter, normalizePath(`${this.pluginDir}/icons`));
    await this.app.vault.adapter.write(normalizePath(`${this.pluginDir}/dist/material-icons.json`), await mappingFile.text());

    for (const file of iconFiles) {
      const relativeIconPath = getRelativePathAfterFolder(file, "icons");
      if (!relativeIconPath || isUnsafeRelativePath(relativeIconPath)) {
        continue;
      }

      const destination = normalizePath(`${this.pluginDir}/icons/${relativeIconPath}`);
      await ensureAdapterFolder(this.app.vault.adapter, dirname(destination));
      await this.app.vault.adapter.write(destination, await file.text());
    }

    await this.reloadResources();
    return iconFiles.length;
  }

  getAppConfigPath() {
    return normalizePath(`${this.app.vault.configDir}/app.json`);
  }

  async loadShowAllFileTypes() {
    try {
      if (typeof this.app.vault.getConfig === "function") {
        return Boolean(this.app.vault.getConfig("showUnsupportedFiles"));
      }
    } catch (error) {
      console.error("material-file-tree-theme: failed to read showUnsupportedFiles from vault config", error);
    }

    const appConfig = await readAdapterJson(this.app.vault.adapter, this.getAppConfigPath(), {});
    return Boolean(appConfig.showUnsupportedFiles);
  }

  async setShowAllFileTypes(enabled) {
    let handledByVaultConfig = false;
    if (typeof this.app.vault.setConfig === "function") {
      try {
        await this.app.vault.setConfig("showUnsupportedFiles", enabled);
        handledByVaultConfig = true;
      } catch (error) {
        console.error("material-file-tree-theme: failed to update showUnsupportedFiles with vault config", error);
      }
    }

    if (!handledByVaultConfig) {
      const appConfigPath = this.getAppConfigPath();
      const appConfig = await readAdapterJson(this.app.vault.adapter, appConfigPath, {});
      appConfig.showUnsupportedFiles = enabled;
      await ensureAdapterFolder(this.app.vault.adapter, dirname(appConfigPath));
      await this.app.vault.adapter.write(appConfigPath, `${JSON.stringify(appConfig, null, 2)}\n`);
    }

    this.showAllFileTypes = enabled;
    if (this.app.workspace && typeof this.app.workspace.trigger === "function") {
      this.app.workspace.trigger("layout-change");
    }
    this.queueExplorerScan("show-all-file-types-change");
  }

  getNeutralFileTreeSnippetPath() {
    return normalizePath(`${this.app.vault.configDir}/snippets/${NEUTRAL_FILE_TREE_SNIPPET_FILE}`);
  }

  async installNeutralFileTreeSnippet() {
    const snippetPath = this.getNeutralFileTreeSnippetPath();
    await ensureAdapterFolder(this.app.vault.adapter, dirname(snippetPath));
    await this.app.vault.adapter.write(snippetPath, NEUTRAL_FILE_TREE_SNIPPET_CSS);
    await this.setNeutralFileTreeSnippetEnabled(true);
  }

  async removeNeutralFileTreeSnippet() {
    const snippetPath = this.getNeutralFileTreeSnippetPath();
    await this.setNeutralFileTreeSnippetEnabled(false);
    if (await this.app.vault.adapter.exists(snippetPath)) {
      await this.app.vault.adapter.remove(snippetPath);
    }
  }

  async setNeutralFileTreeSnippetEnabled(enabled) {
    const customCss = this.app.customCss;
    if (customCss && typeof customCss.setCssEnabledStatus === "function") {
      await customCss.setCssEnabledStatus(NEUTRAL_FILE_TREE_SNIPPET_NAME, enabled);
      return;
    }

    const appearancePath = normalizePath(`${this.app.vault.configDir}/appearance.json`);
    await updateEnabledCssSnippet(this.app.vault.adapter, appearancePath, NEUTRAL_FILE_TREE_SNIPPET_NAME, enabled);
    await reloadCssSnippets(customCss);
  }

  async loadIconTheme() {
    try {
      const raw = await this.app.vault.adapter.read(normalizePath(`${this.pluginDir}/dist/material-icons.json`));
      this.iconTheme = JSON.parse(raw);
      this.iconDefinitions = this.iconTheme.iconDefinitions || {};
      this.fileNameIcons = lowerRecord(this.iconTheme.fileNames);
      this.fileExtensionIcons = lowerRecord(this.iconTheme.fileExtensions);
      this.languageIdIcons = lowerRecord(this.iconTheme.languageIds);
      this.folderNameIcons = lowerRecord(this.iconTheme.folderNames);
      this.folderNameExpandedIcons = lowerRecord(this.iconTheme.folderNamesExpanded);
      this.rootFolderNameIcons = lowerRecord(this.iconTheme.rootFolderNames);
      this.rootFolderNameExpandedIcons = lowerRecord(this.iconTheme.rootFolderNamesExpanded);
      this.fileExtensionKeys = Object.keys(this.fileExtensionIcons).sort((a, b) => b.length - a.length);
    } catch (error) {
      console.error("material-file-tree-theme: failed to load icon theme", error);
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

    this.fileIconCache.clear();
    this.folderIconCache.clear();
    this.iconUrlCache.clear();
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
    containerEl.createEl("h2", { text: t(this.plugin, "settingsTitle") });
    containerEl.createEl("h3", { text: t(this.plugin, "importantSettingsName"), cls: "mfti-settings-heading" });
    this.renderLanguageControl(containerEl);
    this.renderResourceControls(containerEl);
    this.renderThemeCompatibilityControls(containerEl);
    this.renderShowAllFileTypesControl(containerEl);
    this.renderPluginPairingRecommendations(containerEl);
    this.renderGithubControls(containerEl);

    const moreSettingsEl = containerEl.createEl("details", { cls: "mfti-more-settings" });
    moreSettingsEl.createEl("summary", { text: t(this.plugin, "moreSettingsName") });
    this.renderIconControls(moreSettingsEl);
  }

  renderLanguageControl(containerEl) {
    new Setting(containerEl)
      .setName(t(this.plugin, "languageName"))
      .setDesc(t(this.plugin, "languageDesc"))
      .addDropdown((dropdown) => {
        Object.entries(LANGUAGE_OPTIONS).forEach(([value, label]) => dropdown.addOption(value, label));
        dropdown
          .setValue(getLanguage(this.plugin))
          .onChange(async (value) => {
            this.plugin.settings.language = LANGUAGE_OPTIONS[value] ? value : "en";
            await this.plugin.saveSettings();
            this.display();
          });
      });
  }

  renderResourceControls(containerEl) {
    const status = this.plugin.resourceStatus || { state: RESOURCE_STATUS_MISSING, missing: ["resources"] };
    const ready = status.state === RESOURCE_STATUS_READY;
    const statusEl = containerEl.createDiv({ cls: `mfti-resource-status ${ready ? "is-ready" : "is-missing"}` });
    statusEl.createEl("strong", { text: ready ? t(this.plugin, "resourcesInstalled") : t(this.plugin, "resourcesMissing") });
    statusEl.createEl("div", {
      text: ready
        ? t(this.plugin, "resourcesReadyDesc")
        : t(this.plugin, "resourcesMissingDesc", { missing: status.missing.join(", "), pack: RESOURCE_PACK_NAME })
    });

    new Setting(containerEl)
      .setName(t(this.plugin, "resourcePackName"))
      .setDesc(t(this.plugin, "resourcePackDesc", { pack: RESOURCE_PACK_NAME }))
      .addButton((button) => button
        .setButtonText(t(this.plugin, "resourcePackButton"))
        .onClick(() => window.open(RESOURCE_DOWNLOAD_URL)));

    const inputEl = document.createElement("input");
    inputEl.type = "file";
    inputEl.multiple = true;
    inputEl.webkitdirectory = true;
    inputEl.style.display = "none";
    inputEl.setAttribute("webkitdirectory", "");
    inputEl.addEventListener("change", async () => {
      try {
        const count = await this.plugin.importResourceFolder(inputEl.files);
        new Notice(t(this.plugin, "importSuccess", { count: String(count) }));
        this.display();
      } catch (error) {
        console.error("material-file-tree-theme: failed to import resources", error);
        new Notice(error.message || t(this.plugin, "importFailed"));
      } finally {
        inputEl.value = "";
      }
    });
    containerEl.appendChild(inputEl);

    new Setting(containerEl)
      .setName(t(this.plugin, "importResourcesName"))
      .setDesc(t(this.plugin, "importResourcesDesc"))
      .addButton((button) => button
        .setButtonText(t(this.plugin, "importResourcesButton"))
        .onClick(() => inputEl.click()));
  }

  renderGithubControls(containerEl) {
    new Setting(containerEl)
      .setName(t(this.plugin, "githubName"))
      .setDesc(t(this.plugin, "githubDesc"))
      .addButton((button) => button
        .setButtonText(t(this.plugin, "githubIssueButton"))
        .onClick(() => window.open(GITHUB_ISSUES_URL)))
      .addButton((button) => button
        .setButtonText(t(this.plugin, "githubStarButton"))
        .onClick(() => window.open(GITHUB_REPOSITORY_URL)));
  }

  renderThemeCompatibilityControls(containerEl) {
    new Setting(containerEl)
      .setName(t(this.plugin, "themeCompatibilityName"))
      .setDesc(t(this.plugin, "themeCompatibilityDesc"))
      .addButton((button) => button
        .setButtonText(t(this.plugin, "installNeutralFileTreeButton"))
        .onClick(async () => {
          try {
            await this.plugin.installNeutralFileTreeSnippet();
            new Notice(t(this.plugin, "neutralFileTreeInstalled"));
          } catch (error) {
            console.error("material-file-tree-theme: failed to install neutral file tree snippet", error);
            new Notice(t(this.plugin, "neutralFileTreeInstallFailed"));
          }
        }))
      .addButton((button) => button
        .setButtonText(t(this.plugin, "resetNeutralFileTreeButton"))
        .onClick(async () => {
          try {
            await this.plugin.removeNeutralFileTreeSnippet();
            new Notice(t(this.plugin, "neutralFileTreeRemoved"));
          } catch (error) {
            console.error("material-file-tree-theme: failed to remove neutral file tree snippet", error);
            new Notice(t(this.plugin, "neutralFileTreeRemoveFailed"));
          }
        }));
  }

  renderShowAllFileTypesControl(containerEl) {
    new Setting(containerEl)
      .setName(t(this.plugin, "showAllFileTypesName"))
      .setDesc(t(this.plugin, "showAllFileTypesDesc"))
      .addToggle((toggle) => toggle
        .setValue(Boolean(this.plugin.showAllFileTypes))
        .onChange(async (value) => {
          try {
            await this.plugin.setShowAllFileTypes(value);
            new Notice(t(this.plugin, "showAllFileTypesUpdated"));
          } catch (error) {
            console.error("material-file-tree-theme: failed to update show all file types", error);
            new Notice(t(this.plugin, "showAllFileTypesUpdateFailed"));
            this.plugin.showAllFileTypes = await this.plugin.loadShowAllFileTypes();
            this.display();
          }
        }));
  }

  renderPluginPairingRecommendations(containerEl) {
    new Setting(containerEl)
      .setName(t(this.plugin, "pluginPairingName"))
      .setDesc(t(this.plugin, "pluginPairingDesc"));
  }

  renderIconControls(containerEl) {
    new Setting(containerEl)
      .setName(t(this.plugin, "fileIconsName"))
      .setDesc(t(this.plugin, "fileIconsDesc"))
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.enableFileIcons)
        .onChange(async (value) => {
          this.plugin.settings.enableFileIcons = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t(this.plugin, "folderIconsName"))
      .setDesc(t(this.plugin, "folderIconsDesc"))
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.enableFolderIcons)
        .onChange(async (value) => {
          this.plugin.settings.enableFolderIcons = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t(this.plugin, "fileExtensionsName"))
      .setDesc(t(this.plugin, "fileExtensionsDesc"))
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.showFileExtensions)
        .onChange(async (value) => {
          this.plugin.settings.showFileExtensions = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t(this.plugin, "hideNativeTagsName"))
      .setDesc(t(this.plugin, "hideNativeTagsDesc"))
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.hideNativeFileTags)
        .onChange(async (value) => {
          this.plugin.settings.hideNativeFileTags = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t(this.plugin, "iconSizeName"))
      .setDesc(t(this.plugin, "iconSizeDesc"))
      .addSlider((slider) => slider
        .setLimits(12, 24, 1)
        .setValue(this.plugin.settings.iconSize)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.iconSize = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t(this.plugin, "opacityName"))
      .setDesc(t(this.plugin, "opacityDesc"))
      .addSlider((slider) => slider
        .setLimits(0.35, 1, 0.05)
        .setValue(this.plugin.settings.opacity)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.opacity = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t(this.plugin, "grayscaleName"))
      .setDesc(t(this.plugin, "grayscaleDesc"))
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

function collectTitleElements(node, titleEls) {
  if (!(node instanceof HTMLElement)) {
    return;
  }

  if (node.matches(".nav-folder-title, .nav-file-title")) {
    titleEls.add(node);
  }

  node.querySelectorAll(".nav-folder-title, .nav-file-title").forEach((titleEl) => titleEls.add(titleEl));
}

function collectRelatedTitleElement(node, titleEls) {
  if (!(node instanceof HTMLElement)) {
    return;
  }

  if (node.matches(".nav-folder-title, .nav-file-title")) {
    titleEls.add(node);
    return;
  }

  const parentTitle = node.closest(".nav-folder-title, .nav-file-title");
  if (parentTitle instanceof HTMLElement) {
    titleEls.add(parentTitle);
    return;
  }

  if (node.matches(".nav-folder")) {
    const folderTitle = node.querySelector(":scope > .nav-folder-title");
    if (folderTitle instanceof HTMLElement) {
      titleEls.add(folderTitle);
    }
  }
}

function isPluginOnlyMutation(mutation) {
  if (mutation.type === "childList") {
    return false;
  }

  if (mutation.type === "attributes" && mutation.attributeName === "class" && mutation.target instanceof HTMLElement) {
    const previous = new Set(String(mutation.oldValue || "").split(/\s+/).filter(Boolean));
    const current = new Set(String(mutation.target.className || "").split(/\s+/).filter(Boolean));
    const changedClasses = [
      ...[...previous].filter((className) => !current.has(className)),
      ...[...current].filter((className) => !previous.has(className))
    ];
    return changedClasses.length > 0 && changedClasses.every((className) => className.startsWith("mfti-"));
  }

  return mutation.target instanceof HTMLElement && isPluginManagedElement(mutation.target);
}

function isPluginManagedElement(element) {
  return Boolean(element.closest(".mfti-row-icon, .mfti-extension"));
}

function getTitleIconElement(titleEl, contentEl) {
  return titleEl.querySelector(":scope > .mfti-row-icon") || contentEl.querySelector(":scope > .mfti-row-icon");
}

function isDecorationComplete(titleEl, contentEl, icon, type, path, showFileExtensions) {
  const iconEl = getTitleIconElement(titleEl, contentEl);
  if (icon) {
    const imgEl = iconEl?.querySelector("img");
    if (!(iconEl instanceof HTMLElement) || iconEl.dataset.icon !== icon || !(imgEl instanceof HTMLImageElement) || !imgEl.src) {
      return false;
    }
  } else if (iconEl) {
    return false;
  }

  if (type !== "file" || !showFileExtensions) {
    return true;
  }

  const ext = fileExtensionSuffix(path);
  if (!ext || fileTitleText(contentEl).toLowerCase().endsWith(ext.toLowerCase())) {
    return true;
  }

  return Boolean(contentEl.querySelector(":scope > .mfti-extension"));
}

function getPath(titleEl, contentEl) {
  return (titleEl.getAttribute("data-path")
    || titleEl.closest("[data-path]")?.getAttribute("data-path")
    || titleEl.getAttribute("title")
    || contentEl.getAttribute("title")
    || titleEl.getAttribute("aria-label")
    || "").trim();
}

function isRenamingTitle(titleEl) {
  return titleEl.classList.contains("is-being-renamed")
    || Boolean(titleEl.querySelector("input, textarea, [contenteditable='true']"));
}

function isFolderOpen(titleEl) {
  const folderEl = titleEl.closest(".nav-folder");
  return Boolean(folderEl && !folderEl.classList.contains("is-collapsed"));
}

function fileTitleText(contentEl) {
  const ignoredSelectors = ".mfti-extension, .nav-file-tag";
  let text = "";
  const walker = document.createTreeWalker(contentEl, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.parentElement?.closest(ignoredSelectors) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    }
  });

  let node = walker.nextNode();
  while (node) {
    text += node.nodeValue || "";
    node = walker.nextNode();
  }
  return text.trim();
}

function fileExtensionSuffix(path) {
  const name = basename(String(path || ""));
  const index = name.lastIndexOf(".");
  return index > 0 && index < name.length - 1 ? name.slice(index) : "";
}

function normalizeLookupPath(path) {
  return String(path || "").replace(/\\/g, "/").replace(/^\/+|\/+$/g, "").toLowerCase();
}

function basename(path) {
  return String(path || "").split("/").filter(Boolean).pop() || String(path || "");
}

function dirname(path) {
  const normalized = normalizePath(String(path || ""));
  const index = normalized.lastIndexOf("/");
  return index <= 0 ? "" : normalized.slice(0, index);
}

function extension(fileName) {
  const index = fileName.lastIndexOf(".");
  return index > 0 ? fileName.slice(index + 1).toLowerCase() : "";
}

function lowerRecord(record) {
  const result = {};
  Object.entries(record || {}).forEach(([key, value]) => {
    result[String(key).toLowerCase()] = value;
  });
  return result;
}

async function ensureAdapterFolder(adapter, folderPath) {
  const normalized = normalizePath(folderPath);
  if (!normalized || await adapter.exists(normalized)) {
    return;
  }

  const parent = dirname(normalized);
  if (parent) {
    await ensureAdapterFolder(adapter, parent);
  }
  await adapter.mkdir(normalized);
}

async function readAdapterJson(adapter, filePath, fallback) {
  if (!await adapter.exists(filePath)) {
    return fallback;
  }

  try {
    return JSON.parse(await adapter.read(filePath));
  } catch (error) {
    console.error(`material-file-tree-theme: failed to parse ${filePath}`, error);
    return fallback;
  }
}

async function updateEnabledCssSnippet(adapter, appearancePath, snippetName, enabled) {
  let appearance = {};
  if (await adapter.exists(appearancePath)) {
    try {
      appearance = JSON.parse(await adapter.read(appearancePath));
    } catch (error) {
      console.error("material-file-tree-theme: failed to parse appearance.json", error);
    }
  }

  const currentSnippets = Array.isArray(appearance.enabledCssSnippets) ? appearance.enabledCssSnippets : [];
  const enabledSnippets = new Set(currentSnippets.filter((snippet) => typeof snippet === "string" && snippet.trim()));
  if (enabled) {
    enabledSnippets.add(snippetName);
  } else {
    enabledSnippets.delete(snippetName);
  }

  appearance.enabledCssSnippets = Array.from(enabledSnippets);
  await ensureAdapterFolder(adapter, dirname(appearancePath));
  await adapter.write(appearancePath, `${JSON.stringify(appearance, null, 2)}\n`);
}

async function reloadCssSnippets(customCss) {
  if (!customCss) {
    return;
  }

  if (typeof customCss.requestLoadSnippets === "function") {
    customCss.requestLoadSnippets();
    return;
  }

  if (typeof customCss.loadSnippets === "function") {
    await customCss.loadSnippets();
  }
}

function findResourceFile(files, normalizedPath) {
  const expected = normalizePath(normalizedPath).toLowerCase();
  return files.find((file) => normalizeFileInputPath(file).endsWith(expected)) || null;
}

function findResourceFilesInFolder(files, folderName, extensionName) {
  const marker = `/${folderName.toLowerCase()}/`;
  return files.filter((file) => {
    const path = normalizeFileInputPath(file);
    return path.includes(marker) && path.endsWith(extensionName.toLowerCase());
  });
}

function normalizeFileInputPath(file) {
  return normalizePath(String(file.webkitRelativePath || file.name || "")).toLowerCase();
}

function getRelativePathAfterFolder(file, folderName) {
  const normalized = normalizePath(String(file.webkitRelativePath || file.name || ""));
  const parts = normalized.split("/");
  const index = parts.findIndex((part) => part.toLowerCase() === folderName.toLowerCase());
  return index >= 0 ? parts.slice(index + 1).join("/") : file.name;
}

function isUnsafeRelativePath(path) {
  const parts = normalizePath(String(path || "")).split("/");
  return !path || parts.some((part) => part === ".." || part === "." || !part.trim());
}

function getLanguage(plugin) {
  return LANGUAGE_OPTIONS[plugin.settings.language] ? plugin.settings.language : "en";
}

function t(plugin, key, params = {}) {
  const dictionary = I18N[getLanguage(plugin)] || I18N.en;
  let text = dictionary[key] || I18N.en[key] || key;
  Object.entries(params).forEach(([paramKey, value]) => {
    text = text.replaceAll(`{{${paramKey}}}`, value);
  });
  return text;
}
