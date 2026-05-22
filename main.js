const { Notice, Plugin, PluginSettingTab, Setting, normalizePath } = require("obsidian");

const BODY_CLASS = "material-icon-theme-for-vault-enabled";
const GITHUB_REPOSITORY_URL = "https://github.com/j4charlie/material-icon-theme-for-vault";
const GITHUB_ISSUES_URL = "https://github.com/j4charlie/material-icon-theme-for-vault/issues";
const RESOURCE_DOWNLOAD_URL = "https://github.com/j4charlie/material-icon-theme-for-vault/releases/latest";
const RESOURCE_PACK_NAME = "material-icon-souce.zip";
const RESOURCE_STATUS_READY = "ready";
const RESOURCE_STATUS_MISSING = "missing";
const LANGUAGE_OPTIONS = {
  en: "English",
  zh: "中文"
};

const DEFAULT_SETTINGS = {
  language: "en",
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

const I18N = {
  en: {
    settingsTitle: "material-icon-theme-for-vault",
    languageName: "Language",
    languageDesc: "Change the language used on this settings page.",
    githubIssueText: "If you run into any issues, such as compatibility problems with a specific theme, please open a GitHub issue. I will handle it as soon as possible.",
    githubStarText: "If you enjoy this plugin, please consider giving it a star.",
    githubUsageTitle: "Usage tip",
    githubUsageText: "If your vault contains many file types, remember to enable Settings -> Files and links -> Detect all file extensions. If you work with code files, you can also install the Code Files plugin from the community plugin marketplace.",
    githubName: "GitHub",
    githubDesc: "Report issues or support the project.",
    githubIssueButton: "Open issue",
    githubStarButton: "Star on GitHub",
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
    fileIconsDesc: "Show plugin-managed icons for files.",
    folderIconsName: "Folder icons",
    folderIconsDesc: "Show plugin-managed icons for folders.",
    folderArrowsName: "Folder arrows",
    folderArrowsDesc: "Show plugin-managed folder expand/collapse arrows.",
    fileExtensionsName: "File extensions",
    fileExtensionsDesc: "Show file extensions in the file explorer.",
    hideNativeTagsName: "Hide native file tags",
    hideNativeTagsDesc: "Hide Obsidian file type badges such as JSON.",
    iconSizeName: "Icon size",
    iconSizeDesc: "Size in pixels.",
    opacityName: "Opacity",
    opacityDesc: "Icon opacity.",
    grayscaleName: "Grayscale",
    grayscaleDesc: "Render icons in grayscale."
  },
  zh: {
    settingsTitle: "material-icon-theme-for-vault",
    languageName: "语言",
    languageDesc: "切换此配置页面使用的语言。",
    githubIssueText: "如果你遇到任何问题，例如在某个主题下的兼容问题，欢迎在 GitHub 提 issue 给我，我会尽快处理。",
    githubStarText: "如果你觉得这个插件不错，请给它一个 star。",
    githubUsageTitle: "使用建议",
    githubUsageText: "如果 vault 有多种类型的文件，记得开启 设置 -> 文件与链接 -> 检测所有类型文件。 如果涉及代码，可以在插件市场下载 Code Files 插件。",
    githubName: "GitHub",
    githubDesc: "反馈问题或支持这个项目。",
    githubIssueButton: "提交 issue",
    githubStarButton: "去 GitHub 点 star",
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
    fileIconsDesc: "为文件显示插件管理的图标。",
    folderIconsName: "文件夹图标",
    folderIconsDesc: "为文件夹显示插件管理的图标。",
    folderArrowsName: "文件夹箭头",
    folderArrowsDesc: "显示插件管理的文件夹展开/折叠箭头。",
    fileExtensionsName: "文件扩展名",
    fileExtensionsDesc: "在文件浏览器中显示文件扩展名。",
    hideNativeTagsName: "隐藏原生文件标签",
    hideNativeTagsDesc: "隐藏 Obsidian 的文件类型标记，例如 JSON。",
    iconSizeName: "图标大小",
    iconSizeDesc: "单位为像素。",
    opacityName: "透明度",
    opacityDesc: "图标透明度。",
    grayscaleName: "灰度",
    grayscaleDesc: "以灰度样式显示图标。"
  }
};

module.exports = class MaterialFileTreeIconsPlugin extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.pluginDir = this.manifest.dir || `${this.app.vault.configDir}/plugins/${this.manifest.id}`;
    this.scanTimer = null;
    this.resourceStatus = await this.getResourceStatus();

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
    if (this.resourceStatus?.state !== RESOURCE_STATUS_READY) {
      return;
    }

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

    if (fileTitleText(contentEl).toLowerCase().endsWith(ext.toLowerCase())) {
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

  async getResourceStatus() {
    const mappingPath = normalizePath(`${this.pluginDir}/dist/material-icons.json`);
    const fileIconPath = normalizePath(`${this.pluginDir}/icons/file.svg`);
    const folderIconPath = normalizePath(`${this.pluginDir}/icons/folder.svg`);
    const folderOpenIconPath = normalizePath(`${this.pluginDir}/icons/folder-open.svg`);

    const [hasMapping, hasFileIcon, hasFolderIcon, hasFolderOpenIcon] = await Promise.all([
      this.app.vault.adapter.exists(mappingPath),
      this.app.vault.adapter.exists(fileIconPath),
      this.app.vault.adapter.exists(folderIconPath),
      this.app.vault.adapter.exists(folderOpenIconPath)
    ]);

    const missing = [];
    if (!hasMapping) {
      missing.push("dist/material-icons.json");
    }
    if (!hasFileIcon) {
      missing.push("icons/file.svg");
    }
    if (!hasFolderIcon) {
      missing.push("icons/folder.svg");
    }
    if (!hasFolderOpenIcon) {
      missing.push("icons/folder-open.svg");
    }

    return {
      state: missing.length ? RESOURCE_STATUS_MISSING : RESOURCE_STATUS_READY,
      missing
    };
  }

  async reloadResources() {
    this.resourceStatus = await this.getResourceStatus();
    await this.loadIconTheme();
    this.restoreFileExplorer({ keepBodyState: true });
    this.scheduleScan();
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
    await this.app.vault.adapter.write(
      normalizePath(`${this.pluginDir}/dist/material-icons.json`),
      await mappingFile.text()
    );

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
      console.error("material-icon-theme-for-vault: failed to load bundled material-icons.json", error);
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
    containerEl.createEl("h2", { text: t(this.plugin, "settingsTitle") });
    this.renderLanguageControl(containerEl);
    this.renderGithubControls(containerEl);
    this.renderResourceControls(containerEl);

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
      .setName(t(this.plugin, "folderArrowsName"))
      .setDesc(t(this.plugin, "folderArrowsDesc"))
      .addToggle((toggle) => toggle
        .setValue(this.plugin.settings.enableFolderArrows)
        .onChange(async (value) => {
          this.plugin.settings.enableFolderArrows = value;
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

  renderLanguageControl(containerEl) {
    new Setting(containerEl)
      .setName(t(this.plugin, "languageName"))
      .setDesc(t(this.plugin, "languageDesc"))
      .addDropdown((dropdown) => {
        Object.entries(LANGUAGE_OPTIONS).forEach(([value, label]) => {
          dropdown.addOption(value, label);
        });
        dropdown
          .setValue(getLanguage(this.plugin))
          .onChange(async (value) => {
            this.plugin.settings.language = LANGUAGE_OPTIONS[value] ? value : "en";
            await this.plugin.saveSettings();
            this.display();
          });
      });
  }

  renderGithubControls(containerEl) {
    const supportEl = containerEl.createDiv({ cls: "mfti-github-support" });
    supportEl.createEl("div", {
      text: t(this.plugin, "githubIssueText")
    });
    supportEl.createEl("div", {
      text: t(this.plugin, "githubStarText")
    });
    const usageEl = supportEl.createEl("div", { cls: "mfti-github-usage" });
    usageEl.createEl("strong", { text: t(this.plugin, "githubUsageTitle") });
    usageEl.createSpan({ text: t(this.plugin, "githubUsageText") });

    new Setting(containerEl)
      .setName(t(this.plugin, "githubName"))
      .setDesc(t(this.plugin, "githubDesc"))
      .addButton((button) => button
        .setButtonText(t(this.plugin, "githubIssueButton"))
        .onClick(() => {
          window.open(GITHUB_ISSUES_URL);
        }))
      .addButton((button) => button
        .setButtonText(t(this.plugin, "githubStarButton"))
        .onClick(() => {
          window.open(GITHUB_REPOSITORY_URL);
        }));
  }

  renderResourceControls(containerEl) {
    const status = this.plugin.resourceStatus || { state: RESOURCE_STATUS_MISSING, missing: ["resources"] };
    const isReady = status.state === RESOURCE_STATUS_READY;
    const statusEl = containerEl.createDiv({
      cls: `mfti-resource-status ${isReady ? "is-ready" : "is-missing"}`
    });

    statusEl.createEl("strong", {
      text: isReady ? t(this.plugin, "resourcesInstalled") : t(this.plugin, "resourcesMissing")
    });
    statusEl.createEl("div", {
      text: isReady
        ? t(this.plugin, "resourcesReadyDesc")
        : t(this.plugin, "resourcesMissingDesc", { missing: status.missing.join(", "), pack: RESOURCE_PACK_NAME })
    });

    new Setting(containerEl)
      .setName(t(this.plugin, "resourcePackName"))
      .setDesc(t(this.plugin, "resourcePackDesc", { pack: RESOURCE_PACK_NAME }))
      .addButton((button) => button
        .setButtonText(t(this.plugin, "resourcePackButton"))
        .onClick(() => {
          window.open(RESOURCE_DOWNLOAD_URL);
        }));

    const inputEl = document.createElement("input");
    inputEl.type = "file";
    inputEl.multiple = true;
    inputEl.webkitdirectory = true;
    inputEl.style.display = "none";
    inputEl.setAttribute("webkitdirectory", "");
    inputEl.addEventListener("change", async () => {
      try {
        const importedCount = await this.plugin.importResourceFolder(inputEl.files);
        new Notice(t(this.plugin, "importSuccess", { count: String(importedCount) }));
        this.display();
      } catch (error) {
        console.error("material-icon-theme-for-vault: failed to import resources", error);
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

function fileTitleText(contentEl) {
  const ignoredSelectors = ".mfti-extension, .nav-file-tag";
  let text = "";

  const walker = document.createTreeWalker(contentEl, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      return parent?.closest(ignoredSelectors) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    }
  });

  let node = walker.nextNode();
  while (node) {
    text += node.nodeValue || "";
    node = walker.nextNode();
  }

  return text.trim();
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

function getLanguage(plugin) {
  return LANGUAGE_OPTIONS[plugin.settings?.language] ? plugin.settings.language : "en";
}

function t(plugin, key, replacements = {}) {
  const language = getLanguage(plugin);
  const dictionary = I18N[language] || I18N.en;
  let value = dictionary[key] || I18N.en[key] || key;

  Object.entries(replacements).forEach(([name, replacement]) => {
    value = value.replaceAll(`{{${name}}}`, replacement);
  });

  return value;
}

function findResourceFile(files, expectedPath) {
  const normalizedExpected = normalizeLookupPath(expectedPath);
  return files.find((file) => normalizeFileRelativePath(file) === normalizedExpected
    || normalizeFileRelativePath(file).endsWith(`/${normalizedExpected}`));
}

function findResourceFilesInFolder(files, folderName, extensionName) {
  const folderSegment = `/${normalizeLookupPath(folderName)}/`;
  const normalizedExtension = extensionName.toLowerCase();
  return files.filter((file) => {
    const path = normalizeFileRelativePath(file);
    return (path.startsWith(`${normalizeLookupPath(folderName)}/`) || path.includes(folderSegment))
      && path.endsWith(normalizedExtension);
  });
}

function getRelativePathAfterFolder(file, folderName) {
  const rawPath = String(file.webkitRelativePath || file.name || "").replace(/\\/g, "/");
  const parts = rawPath.split("/").filter(Boolean);
  const folderIndex = parts.findIndex((part) => part.toLowerCase() === folderName.toLowerCase());
  return folderIndex >= 0 ? parts.slice(folderIndex + 1).join("/") : file.name;
}

function normalizeFileRelativePath(file) {
  return normalizeLookupPath(file.webkitRelativePath || file.name || "");
}

function isUnsafeRelativePath(path) {
  return path.startsWith("/")
    || path.split("/").some((part) => part === ".." || part === "");
}

function dirname(path) {
  const index = path.lastIndexOf("/");
  return index > 0 ? path.slice(0, index) : "";
}

async function ensureAdapterFolder(adapter, path) {
  const normalizedPath = normalizePath(path);
  if (!normalizedPath || await adapter.exists(normalizedPath)) {
    return;
  }

  const parent = dirname(normalizedPath);
  if (parent && !(await adapter.exists(parent))) {
    await ensureAdapterFolder(adapter, parent);
  }

  await adapter.mkdir(normalizedPath);
}
