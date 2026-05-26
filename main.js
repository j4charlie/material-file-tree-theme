const { Notice, Plugin, PluginSettingTab, Setting, TFile, normalizePath } = require("obsidian");

const BODY_CLASS = "material-icon-theme-for-vault-enabled";
const GITHUB_REPOSITORY_URL = "https://github.com/j4charlie/material-icon-theme-for-vault";
const GITHUB_ISSUES_URL = "https://github.com/j4charlie/material-icon-theme-for-vault/issues";
const RESOURCE_DOWNLOAD_URL = "https://github.com/j4charlie/material-icon-theme-for-vault/releases/latest";
const RESOURCE_PACK_NAME = "material-icon-souce.zip";
const RESOURCE_STATUS_READY = "ready";
const RESOURCE_STATUS_MISSING = "missing";
const CODE_FILES_PLUGIN_ID = "code-files";
const CODE_FILES_VIEW_TYPE = "code-editor";
const STARTUP_SCAN_DELAYS = [0, 160, 420];
const DEBUG_FILE_TREE_LAYOUT = false;
const DEBUG_FILE_TREE_CONSOLE = false;
const DEBUG_FILE_TREE_FOLDER_LIMIT = 120;
const DEBUG_FILE_TREE_LOG_LIMIT = 80;
const DEBUG_FILE_TREE_MUTATION_LIMIT = 8;
const DEBUG_FILE_TREE_WARNING_LIMIT = 30;
const NEUTRAL_FILE_TREE_SNIPPET_NAME = "neutral-file-tree";
const NEUTRAL_FILE_TREE_SNIPPET_FILE = `${NEUTRAL_FILE_TREE_SNIPPET_NAME}.css`;
const NEUTRAL_FILE_TREE_SNIPPET_CSS = `/* Neutralize theme file explorer coloring while keeping plugin icons. */
.workspace-leaf-content[data-type="file-explorer"] {
  --nav-indentation-guide-color: var(--background-modifier-border);
  --nav-indentation-guide-width: 1px;
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
  border-left: none !important;
  border-inline-start: none !important;
  box-shadow: none !important;
  filter: none !important;
}

body.material-icon-theme-for-vault-enabled .workspace-leaf-content[data-type="file-explorer"] .nav-folder-children,
body.material-icon-theme-for-vault-enabled .workspace-leaf-content[data-type="file-explorer"] .tree-item-children {
  background: transparent !important;
  border-left: none !important;
  border-inline-start: none !important;
  box-shadow: none !important;
  filter: none !important;
}

body.material-icon-theme-for-vault-enabled .workspace-leaf-content[data-type="file-explorer"] .nav-indentation-guide {
  display: none !important;
}

body.material-icon-theme-for-vault-enabled .workspace-leaf-content[data-type="file-explorer"] .nav-folder-title::before,
body.material-icon-theme-for-vault-enabled .workspace-leaf-content[data-type="file-explorer"] .nav-folder-title::after,
body.material-icon-theme-for-vault-enabled .workspace-leaf-content[data-type="file-explorer"] .nav-file-title::before,
body.material-icon-theme-for-vault-enabled .workspace-leaf-content[data-type="file-explorer"] .nav-file-title::after,
body.material-icon-theme-for-vault-enabled .workspace-leaf-content[data-type="file-explorer"] .nav-folder-title-content::before,
body.material-icon-theme-for-vault-enabled .workspace-leaf-content[data-type="file-explorer"] .nav-folder-title-content::after,
body.material-icon-theme-for-vault-enabled .workspace-leaf-content[data-type="file-explorer"] .nav-file-title-content::before,
body.material-icon-theme-for-vault-enabled .workspace-leaf-content[data-type="file-explorer"] .nav-file-title-content::after {
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

body.material-icon-theme-for-vault-enabled.mfti-folder-arrows-enabled .workspace-leaf-content[data-type="file-explorer"] .nav-folder-title > .collapse-icon,
body.material-icon-theme-for-vault-enabled.mfti-folder-arrows-enabled .workspace-leaf-content[data-type="file-explorer"] .nav-folder-title > .nav-folder-collapse-indicator,
body.material-icon-theme-for-vault-enabled.mfti-folder-arrows-enabled .workspace-leaf-content[data-type="file-explorer"] .nav-folder-title > .nav-indentation-guide {
  display: none !important;
}

.workspace-leaf-content[data-type="file-explorer"] .nav-files-container > div > .tree-item.nav-folder > .nav-folder-title::before,
.workspace-leaf-content[data-type="file-explorer"] .nav-files-container > div > .tree-item.nav-folder > .tree-item-self.nav-folder-title::before {
  content: none !important;
  display: none !important;
}
`;
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
    grayscaleDesc: "Render icons in grayscale.",
    themeCompatibilityName: "Theme compatibility",
    themeCompatibilityDesc: "Create or remove a CSS snippet that neutralizes theme colors in the file tree while keeping plugin icons.",
    installNeutralFileTreeButton: "Install CSS snippet",
    resetNeutralFileTreeButton: "Reset",
    neutralFileTreeInstalled: "Created neutral-file-tree. Go to Settings -> Appearance -> CSS snippets -> neutral-file-tree and enable it.",
    neutralFileTreeInstallFailed: "Failed to create neutral-file-tree CSS snippet.",
    neutralFileTreeRemoved: "Removed neutral-file-tree CSS snippet.",
    neutralFileTreeRemoveFailed: "Failed to remove neutral-file-tree CSS snippet."
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
    grayscaleDesc: "以灰度样式显示图标。",
    themeCompatibilityName: "主题兼容",
    themeCompatibilityDesc: "创建或移除一个 CSS 代码片段，用于屏蔽主题对文件树颜色的影响，同时保留插件图标。",
    installNeutralFileTreeButton: "注入 CSS 片段",
    resetNeutralFileTreeButton: "重置",
    neutralFileTreeInstalled: "已创建 neutral-file-tree。请前往 设置 -> 外观 -> CSS 代码片段 -> neutral-file-tree 开启。",
    neutralFileTreeInstallFailed: "创建 neutral-file-tree CSS 片段失败。",
    neutralFileTreeRemoved: "已移除 neutral-file-tree CSS 片段。",
    neutralFileTreeRemoveFailed: "移除 neutral-file-tree CSS 片段失败。"
  }
};

module.exports = class MaterialFileTreeIconsPlugin extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.pluginDir = this.manifest.dir || `${this.app.vault.configDir}/plugins/${this.manifest.id}`;
    this.scanTimer = null;
    this.startupScanTimers = new Set();
    this.suppressFileExplorerMutations = false;
    this.folderInteractionUntil = 0;
    this.debugScanIndex = 0;
    this.debugMutationLogCount = 0;
    this.debugWarningLogCount = 0;
    this.resourceStatus = await this.getResourceStatus();

    await this.loadIconTheme();
    this.restoreFileExplorer();
    this.applyBodyState();
    this.addSettingTab(new MaterialFileTreeIconsSettingTab(this.app, this));
    this.installDebugHelpers();
    this.debugAllFileExplorers("onload-after-body-state");

    this.registerEvent(this.app.workspace.on("layout-change", () => this.handleWorkspaceTreeChange()));
    this.registerEvent(this.app.workspace.on("file-open", () => this.handleWorkspaceTreeChange()));
    this.registerEvent(this.app.vault.on("create", () => this.scheduleScan(150, "vault-create")));
    this.registerEvent(this.app.vault.on("rename", () => this.scheduleScan(150, "vault-rename")));
    this.registerEvent(this.app.vault.on("delete", () => this.scheduleScan(150, "vault-delete")));
    this.registerDomEvent(document, "click", (event) => this.handleCodeFilesFileOpen(event), { capture: true });
    this.registerDomEvent(document, "click", (event) => this.handleFolderTitleInteraction(event));
    this.registerDomEvent(document, "keydown", (event) => this.handleFolderTitleInteraction(event));
    this.registerDomEvent(window, "resize", () => this.scheduleScan(80, "window-resize"));
    this.register(() => {
      this.clearScanTimers();
    });

    this.app.workspace.onLayoutReady(() => {
      this.debugAllFileExplorers("layout-ready-before-observe");
      this.queueStartupScans();
    });
  }

  onunload() {
    this.clearScanTimers();
    this.removeDebugHelpers();
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

  handleWorkspaceTreeChange() {
    if (Date.now() < this.folderInteractionUntil) {
      return;
    }

    this.debugAllFileExplorers("workspace-tree-change-before-scan");
    this.scheduleScan(80, "workspace-tree-change");
    this.queueStartupScans();
  }

  clearScanTimer() {
    if (this.scanTimer !== null) {
      window.clearTimeout(this.scanTimer);
      this.scanTimer = null;
    }
  }

  clearStartupScanTimers() {
    this.startupScanTimers.forEach((timer) => window.clearTimeout(timer));
    this.startupScanTimers.clear();
  }

  clearScanTimers() {
    this.clearScanTimer();
    this.clearStartupScanTimers();
  }

  scheduleScan(delay = 150, reason = "scheduled") {
    this.clearScanTimer();
    this.scanTimer = window.setTimeout(() => {
      this.scanTimer = null;
      this.decorateFileExplorer(reason);
    }, delay);
  }

  queueStartupScans() {
    this.clearStartupScanTimers();
    STARTUP_SCAN_DELAYS.forEach((delay) => {
      const timer = window.setTimeout(() => {
        this.startupScanTimers.delete(timer);
        this.decorateFileExplorer(`startup-${delay}ms`);
      }, delay);
      this.startupScanTimers.add(timer);
    });
  }

  installDebugHelpers() {
    if (!DEBUG_FILE_TREE_LAYOUT || typeof window === "undefined") {
      return;
    }

    window.__MFTI_CLEAR_LAYOUT_LOGS = () => {
      window.__MFTI_LAYOUT_LOGS = [];
      this.debugScanIndex = 0;
      this.debugMutationLogCount = 0;
      this.debugWarningLogCount = 0;
      return "cleared";
    };

    window.__MFTI_CAPTURE_LAYOUT = () => {
      this.debugAllFileExplorers("manual-capture");
      return getDebugLayoutLogsJson();
    };

    window.__MFTI_DUMP_LAYOUT = () => getDebugLayoutLogsJson();
  }

  removeDebugHelpers() {
    if (typeof window === "undefined") {
      return;
    }

    delete window.__MFTI_CLEAR_LAYOUT_LOGS;
    delete window.__MFTI_CAPTURE_LAYOUT;
    delete window.__MFTI_DUMP_LAYOUT;
  }

  debugAllFileExplorers(label, extra = {}) {
    if (!DEBUG_FILE_TREE_LAYOUT) {
      return;
    }

    const explorers = document.querySelectorAll('.workspace-leaf-content[data-type="file-explorer"]');
    if (!explorers.length) {
      const payload = {
        bodyClass: document.body.className,
        explorerCount: 0,
        time: debugNow(),
        ...extra
      };
      pushDebugLayoutLog({ type: "no-explorer", label, payload });
      if (DEBUG_FILE_TREE_CONSOLE) {
        console.debug("[mfti layout]", label, payload);
      }
      return;
    }

    explorers.forEach((explorer, index) => this.debugFileExplorerLayout(explorer, `${label}#${index}`, extra));
  }

  debugFileExplorerLayout(explorer, label, extra = {}) {
    if (!DEBUG_FILE_TREE_LAYOUT || !(explorer instanceof HTMLElement)) {
      return;
    }

    const folders = Array.from(explorer.querySelectorAll(".nav-folder-title"))
      .slice(0, DEBUG_FILE_TREE_FOLDER_LIMIT)
      .map((titleEl) => getFolderLayoutDebugRow(titleEl));
    const explorerRect = elementRectToObject(explorer);
    const scrollEl = explorer.querySelector(".nav-files-container") || explorer;
    const payload = {
      label,
      index: ++this.debugScanIndex,
      time: debugNow(),
      bodyClass: document.body.className,
      resourceStatus: this.resourceStatus,
      settings: {
        enableFileIcons: this.settings.enableFileIcons,
        enableFolderIcons: this.settings.enableFolderIcons,
        enableFolderArrows: this.settings.enableFolderArrows,
        iconSize: this.settings.iconSize
      },
      explorer: {
        className: explorer.className,
        rect: explorerRect,
        scrollTop: scrollEl.scrollTop,
        scrollHeight: scrollEl.scrollHeight,
        clientHeight: scrollEl.clientHeight
      },
      counts: {
        folders: explorer.querySelectorAll(".nav-folder-title").length,
        files: explorer.querySelectorAll(".nav-file-title").length,
        branchLines: explorer.querySelectorAll(".mfti-folder-branch-line").length,
        arrows: explorer.querySelectorAll(".mfti-folder-arrow").length,
        spacers: explorer.querySelectorAll(".mfti-arrow-spacer").length
      },
      folders,
      ...extra
    };

    if (shouldStoreDebugLayoutLabel(label)) {
      pushDebugLayoutLog({ type: "explorer-layout", label, payload });
    }

    if (DEBUG_FILE_TREE_CONSOLE) {
      console.groupCollapsed(`[mfti layout] ${label} #${payload.index}`);
      console.log(payload);
      console.table(folders.map((folder) => ({
        path: folder.path,
        depth: folder.depth,
        topLevel: folder.isTopLevel,
        collapsed: folder.isCollapsed,
        directChildren: folder.directChildCount,
        hasLine: folder.hasLine,
        folderTop: folder.folderRect?.top,
        folderHeight: folder.folderRect?.height,
        titleTop: folder.titleRect?.top,
        titleHeight: folder.titleRect?.height,
        arrowLeft: folder.arrowRect?.left,
        arrowTop: folder.arrowRect?.top,
        arrowHeight: folder.arrowRect?.height,
        childrenTop: folder.childrenRect?.top,
        childrenHeight: folder.childrenRect?.height,
        lineLeftVar: folder.lineVars.left,
        lineTopVar: folder.lineVars.top,
        lineHeightVar: folder.lineVars.height,
        lineTop: folder.lineRect?.top,
        lineHeight: folder.lineRect?.height
      })));
      console.groupEnd();
    }
  }

  debugMutationSummary(mutations) {
    if (!DEBUG_FILE_TREE_LAYOUT) {
      return;
    }

    if (this.debugMutationLogCount >= DEBUG_FILE_TREE_MUTATION_LIMIT) {
      return;
    }

    this.debugMutationLogCount += 1;

    const payload = {
      time: debugNow(),
      mutations: mutations.slice(0, 20).map((mutation) => ({
        type: mutation.type,
        attributeName: mutation.attributeName,
        oldValue: mutation.oldValue,
        target: describeDebugElement(mutation.target),
        added: mutation.addedNodes.length,
        removed: mutation.removedNodes.length
      }))
    };
    pushDebugLayoutLog({ type: "mutation", label: "mutation-observer", payload });
    if (DEBUG_FILE_TREE_CONSOLE) {
      console.debug("[mfti layout] mutation-observer", payload);
    }
  }

  debugFolderLineDecision(reason, titleEl, detail = {}) {
    if (!DEBUG_FILE_TREE_LAYOUT) {
      return;
    }

    const shouldWarn = detail.missingArrow
      || detail.badRect
      || (typeof detail.computedHeight === "number" && detail.computedHeight <= 1)
      || (detail.shouldShowLine === false && !detail.isCollapsed && detail.directChildCount > 0);

    if (!shouldWarn) {
      return;
    }

    if (this.debugWarningLogCount >= DEBUG_FILE_TREE_WARNING_LIMIT) {
      return;
    }

    this.debugWarningLogCount += 1;

    const payload = {
      reason,
      detail,
      folder: getFolderLayoutDebugRow(titleEl),
      time: debugNow()
    };
    pushDebugLayoutLog({ type: "branch-line-warning", label: reason, payload });
    if (DEBUG_FILE_TREE_CONSOLE) {
      console.warn("[mfti layout] branch-line decision", payload);
    }
  }

  decorateFileExplorer(reason = "scan") {
    if (this.resourceStatus?.state !== RESOURCE_STATUS_READY) {
      this.debugAllFileExplorers(`${reason}:resource-not-ready`, { resourceStatus: this.resourceStatus });
      return;
    }

    this.suppressFileExplorerMutations = true;
    const explorers = document.querySelectorAll('.workspace-leaf-content[data-type="file-explorer"]');
    explorers.forEach((explorer) => {
      this.decorateVisibleExplorer(explorer, reason);
    });

    if (!explorers.length) {
      this.suppressFileExplorerMutations = false;
    }
  }

  decorateVisibleExplorer(explorer, reason = "scan") {
    this.debugFileExplorerLayout(explorer, `${reason}:before-decorate`);

    if (this.settings.enableFolderIcons) {
      explorer.querySelectorAll(".nav-folder-title").forEach((titleEl) => this.decorateTitle(titleEl, "folder"));
    }

    if (this.settings.enableFileIcons) {
      explorer.querySelectorAll(".nav-file-title").forEach((titleEl) => this.decorateTitle(titleEl, "file"));
    }

    this.refreshFolderBranchLines(explorer, `${reason}:sync`, { repairFlow: true });
    this.debugFileExplorerLayout(explorer, `${reason}:after-sync`);
    window.requestAnimationFrame(() => {
      this.refreshFolderBranchLines(explorer, `${reason}:raf-1`, { repairFlow: true });
      this.debugFileExplorerLayout(explorer, `${reason}:after-raf-1`);
      this.suppressFileExplorerMutations = false;
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
    } else {
      this.ensureFileArrowSpacer(titleEl, contentEl);
    }
    applyTreeTitleIndentation(titleEl, type, path);

    const icon = type === "folder" ? this.getFolderIcon(path, titleEl) : this.getFileIcon(path);
    this.ensureIcon(titleEl, contentEl, icon);
    this.ensureFileExtension(contentEl, path, type);
    titleEl.classList.add("mfti-title-decorated");
    titleEl.classList.toggle("mfti-folder-decorated", type === "folder");
    titleEl.classList.toggle("mfti-file-decorated", type === "file");

    if (type === "folder") {
      this.ensureFolderBranchLine(titleEl);
    }
  }

  refreshFolderBranchLines(rootEl, reason = "refresh", options = {}) {
    if (!(rootEl instanceof HTMLElement)) {
      return;
    }

    rootEl.querySelectorAll(".nav-folder-title").forEach((titleEl) => {
      if (options.repairFlow) {
        this.repairFolderChildrenFlow(titleEl);
      }
      this.ensureFolderBranchLine(titleEl, reason);
    });
  }

  decorateFolderSubtree(titleEl, reason = "folder-interaction") {
    if (this.resourceStatus?.state !== RESOURCE_STATUS_READY || !(titleEl instanceof HTMLElement)) {
      return;
    }

    const folderEl = titleEl.closest(".nav-folder");
    if (!(folderEl instanceof HTMLElement)) {
      return;
    }

    if (this.settings.enableFolderIcons) {
      this.decorateTitle(titleEl, "folder");
      folderEl.querySelectorAll(".nav-folder-title").forEach((childTitleEl) => {
        if (childTitleEl !== titleEl) {
          this.decorateTitle(childTitleEl, "folder");
        }
      });
    }

    if (this.settings.enableFileIcons) {
      folderEl.querySelectorAll(".nav-file-title").forEach((fileTitleEl) => this.decorateTitle(fileTitleEl, "file"));
    }

    this.ensureFolderBranchLine(titleEl, reason);
    this.refreshFolderBranchLines(folderEl, reason);
  }

  ensureFolderArrow(titleEl, contentEl) {
    if (!this.settings.enableFolderArrows) {
      titleEl.querySelectorAll(":scope > .mfti-folder-arrow").forEach((el) => el.remove());
      const folderEl = titleEl.closest(".nav-folder");
      if (folderEl instanceof HTMLElement) {
        this.clearFolderBranchLine(folderEl);
      }
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

  ensureFolderBranchLine(titleEl, reason = "ensure") {
    const folderEl = titleEl.closest(".nav-folder");
    if (!(folderEl instanceof HTMLElement)) {
      return;
    }

    const isTopLevel = isTopLevelFolder(folderEl);
    folderEl.classList.toggle("mfti-top-level-folder", isTopLevel);

    const childrenEl = folderEl.querySelector(":scope > .nav-folder-children, :scope > .tree-item-children");
    const directChildCount = childrenEl instanceof HTMLElement
      ? childrenEl.querySelectorAll(":scope > .nav-folder, :scope > .nav-file, :scope > .tree-item").length
      : 0;
    const shouldMaintainLine = this.settings.enableFolderArrows
      && childrenEl instanceof HTMLElement
      && directChildCount > 0;

    if (!shouldMaintainLine) {
      this.debugFolderLineDecision(reason, titleEl, {
        directChildCount,
        isCollapsed: folderEl.classList.contains("is-collapsed"),
        isTopLevel,
        shouldMaintainLine
      });
      this.clearFolderBranchLine(folderEl);
      return;
    }

    let lineEl = folderEl.querySelector(":scope > .mfti-folder-branch-line");
    if (!lineEl) {
      lineEl = createFolderBranchLineElement();
      folderEl.insertBefore(lineEl, childrenEl);
    }

    folderEl.classList.add("mfti-has-branch-line");
    if (folderEl.classList.contains("is-collapsed")) {
      this.updateFolderBranchLineAnchor(folderEl, titleEl, lineEl, reason);
      lineEl.style.removeProperty("--mfti-tree-line-height");
      return;
    }

    this.updateFolderBranchLineGeometry(folderEl, titleEl, childrenEl, lineEl, reason);
  }

  clearFolderBranchLine(folderEl) {
    folderEl.querySelectorAll(":scope > .mfti-folder-branch-line").forEach((el) => el.remove());
    folderEl.classList.remove("mfti-has-branch-line");
  }

  updateFolderBranchLineAnchor(folderEl, titleEl, lineEl, reason = "anchor") {
    const arrowEl = titleEl.querySelector(":scope > .mfti-folder-arrow");
    if (!(arrowEl instanceof HTMLElement)) {
      this.debugFolderLineDecision(reason, titleEl, { missingArrow: true });
      return null;
    }

    const folderRect = folderEl.getBoundingClientRect();
    const arrowRect = arrowEl.getBoundingClientRect();
    if (!folderRect.width || !folderRect.height || !arrowRect.width || !arrowRect.height) {
      this.debugFolderLineDecision(reason, titleEl, {
        badRect: true,
        arrowRect: rectToObject(arrowRect),
        folderRect: rectToObject(folderRect)
      });
      return null;
    }

    const arrowSize = Number.parseFloat(getComputedStyle(document.body).getPropertyValue("--mfti-arrow-size"))
      || arrowRect.width
      || 14;
    const left = arrowRect.left + (arrowRect.width / 2) - folderRect.left;
    const top = arrowRect.top - folderRect.top + (arrowRect.height / 2) + (arrowSize / 2);

    lineEl.style.setProperty("--mfti-tree-line-left", `${roundCssPixel(left)}px`);
    lineEl.style.setProperty("--mfti-tree-line-top-dynamic", `${roundCssPixel(top)}px`);
    return { folderRect, left, top };
  }

  updateFolderBranchLineGeometry(folderEl, titleEl, childrenEl, lineEl, reason = "geometry") {
    const anchor = this.updateFolderBranchLineAnchor(folderEl, titleEl, lineEl, reason);
    if (!anchor) {
      return;
    }

    const bottom = getVisibleFolderChildrenBottom(childrenEl);
    const height = Math.max(0, bottom - anchor.folderRect.top - anchor.top);

    lineEl.style.setProperty("--mfti-tree-line-height", `${roundCssPixel(height)}px`);
    this.debugFolderLineDecision(reason, titleEl, {
      bottom: roundCssPixel(bottom),
      computedHeight: roundCssPixel(height),
      computedLeft: roundCssPixel(anchor.left),
      computedTop: roundCssPixel(anchor.top)
    });
  }

  ensureFileArrowSpacer(titleEl, contentEl) {
    if (!this.settings.enableFolderArrows) {
      titleEl.querySelectorAll(":scope > .mfti-arrow-spacer").forEach((el) => el.remove());
      return;
    }

    let spacerEl = titleEl.querySelector(":scope > .mfti-arrow-spacer");
    if (!spacerEl) {
      spacerEl = createArrowSpacerElement();
      const iconEl = titleEl.querySelector(":scope > .mfti-row-icon");
      titleEl.insertBefore(spacerEl, iconEl || contentEl);
    }
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
    extensionEl.dataset.mftiExtension = "true";
    extensionEl.setAttribute("aria-hidden", "true");
    extensionEl.textContent = ext;
    contentEl.appendChild(extensionEl);
  }

  toggleFolder(titleEl) {
    this.prepareFolderInteraction(titleEl);
    const nativeToggle = titleEl.querySelector(":scope > .collapse-icon, :scope > .nav-folder-collapse-indicator");
    if (nativeToggle instanceof HTMLElement) {
      nativeToggle.click();
    } else {
      titleEl.click();
    }
    this.scheduleFolderInteractionScan(titleEl, "folder-arrow-toggle");
  }

  handleCodeFilesFileOpen(event) {
    if (event.defaultPrevented || event.button !== 0) {
      return;
    }

    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const titleEl = target.closest('.workspace-leaf-content[data-type="file-explorer"] .nav-file-title');
    if (!titleEl || isRenamingTitle(titleEl)) {
      return;
    }

    const contentEl = titleEl.querySelector(".nav-file-title-content");
    if (!(contentEl instanceof HTMLElement)) {
      return;
    }

    const path = getPath(titleEl, contentEl);
    if (!path || !this.isCodeFilesManagedPath(path)) {
      return;
    }

    const file = this.app.vault.getAbstractFileByPath(path);
    if (!(file instanceof TFile)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    this.openCodeFile(file, event);
  }

  isCodeFilesManagedPath(path) {
    const codeFilesPlugin = this.app.plugins?.plugins?.[CODE_FILES_PLUGIN_ID];
    const configuredExtensions = codeFilesPlugin?.settings?.extensions;
    if (!Array.isArray(configuredExtensions)) {
      return false;
    }

    const fileExt = extension(basename(path));
    if (!fileExt) {
      return false;
    }

    return configuredExtensions
      .map((ext) => String(ext || "").trim().replace(/^\./, "").toLowerCase())
      .filter(Boolean)
      .includes(fileExt);
  }

  async openCodeFile(file, event) {
    try {
      const openInNewLeaf = Boolean(event?.metaKey || event?.ctrlKey);
      const leaf = this.app.workspace.getLeaf(openInNewLeaf);
      await leaf.setViewState({
        type: CODE_FILES_VIEW_TYPE,
        state: { file: file.path },
        active: true
      });
      this.app.workspace.revealLeaf(leaf);
    } catch (error) {
      console.error("material-icon-theme-for-vault: failed to open Code Files view", error);
      new Notice(`Failed to open ${file.name} with Code Files.`);
    }
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

    this.prepareFolderInteraction(titleEl);
    this.scheduleFolderInteractionScan(titleEl, "folder-title-toggle");
  }

  prepareFolderInteraction(titleEl) {
    const folderEl = titleEl.closest(".nav-folder");
    const childrenEl = folderEl?.querySelector(":scope > .nav-folder-children, :scope > .tree-item-children");
    const lineEl = folderEl?.querySelector(":scope > .mfti-folder-branch-line");
    if (folderEl instanceof HTMLElement && childrenEl instanceof HTMLElement && lineEl instanceof HTMLElement) {
      this.updateFolderBranchLineGeometry(folderEl, titleEl, childrenEl, lineEl, "interaction-prepare");
    }
  }

  scheduleFolderInteractionScan(titleEl, reason) {
    this.folderInteractionUntil = Date.now() + 500;
    this.suppressFileExplorerMutations = true;
    window.requestAnimationFrame(() => {
      this.decorateFolderSubtree(titleEl, `${reason}-raf-1`);
      window.requestAnimationFrame(() => {
        this.decorateFolderSubtree(titleEl, `${reason}-raf-2`);
        window.setTimeout(() => {
          this.decorateFolderSubtree(titleEl, `${reason}-settled`);
          this.suppressFileExplorerMutations = false;
        }, 60);
      });
    });
  }

  restoreTitle(titleEl) {
    titleEl.querySelectorAll(":scope > .mfti-row-icon").forEach((el) => el.remove());
    titleEl.querySelectorAll(":scope > .mfti-folder-arrow").forEach((el) => el.remove());
    titleEl.querySelectorAll(":scope > .mfti-arrow-spacer").forEach((el) => el.remove());
    titleEl.querySelectorAll(".mfti-extension").forEach((el) => el.remove());
    restoreTreeTitleIndentation(titleEl);
    titleEl.classList.remove("mfti-title-decorated", "mfti-folder-decorated", "mfti-file-decorated");
    const folderEl = titleEl.closest(".nav-folder, .tree-item");
    if (folderEl instanceof HTMLElement) {
      this.clearFolderBranchLine(folderEl);
      this.clearFolderChildrenFlowRepair(folderEl);
    }
  }

  restoreFileExplorer(options = {}) {
    document.querySelectorAll(".mfti-row-icon, [data-mfti-icon]").forEach((el) => el.remove());
    document.querySelectorAll(".mfti-folder-arrow, [data-mfti-folder-arrow]").forEach((el) => el.remove());
    document.querySelectorAll(".mfti-arrow-spacer, [data-mfti-arrow-spacer]").forEach((el) => el.remove());
    document.querySelectorAll(".mfti-folder-branch-line, [data-mfti-folder-branch-line]").forEach((el) => el.remove());
    document.querySelectorAll(".mfti-extension").forEach((el) => el.remove());
    document.querySelectorAll("[data-mfti-tree-depth], [data-mfti-original-padding-inline-start-set='true']").forEach((el) => {
      restoreTreeTitleIndentation(el);
    });
    document.querySelectorAll(".mfti-hidden-foreign-icon").forEach((el) => el.classList.remove("mfti-hidden-foreign-icon"));
    document.querySelectorAll(".mfti-title-decorated").forEach((el) => {
      el.classList.remove("mfti-title-decorated", "mfti-folder-decorated", "mfti-file-decorated", "mfti-renaming");
    });
    document.querySelectorAll(".mfti-has-branch-line, .mfti-top-level-folder").forEach((el) => {
      el.classList.remove("mfti-has-branch-line", "mfti-top-level-folder");
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

  getNeutralFileTreeSnippetPath() {
    return normalizePath(`${this.app.vault.configDir}/snippets/${NEUTRAL_FILE_TREE_SNIPPET_FILE}`);
  }

  async installNeutralFileTreeSnippet() {
    const snippetPath = this.getNeutralFileTreeSnippetPath();
    await ensureAdapterFolder(this.app.vault.adapter, dirname(snippetPath));
    await this.app.vault.adapter.write(snippetPath, NEUTRAL_FILE_TREE_SNIPPET_CSS);
  }

  async removeNeutralFileTreeSnippet() {
    const snippetPath = this.getNeutralFileTreeSnippetPath();
    if (await this.app.vault.adapter.exists(snippetPath)) {
      await this.app.vault.adapter.remove(snippetPath);
    }
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
    this.renderThemeCompatibilityControls(containerEl);

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
            console.error("material-icon-theme-for-vault: failed to install neutral file tree snippet", error);
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
            console.error("material-icon-theme-for-vault: failed to remove neutral file tree snippet", error);
            new Notice(t(this.plugin, "neutralFileTreeRemoveFailed"));
          }
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

function createArrowSpacerElement() {
  const spacerEl = document.createElement("span");
  spacerEl.className = "mfti-arrow-spacer";
  spacerEl.dataset.mftiArrowSpacer = "true";
  spacerEl.setAttribute("aria-hidden", "true");
  return spacerEl;
}

function createFolderBranchLineElement() {
  const lineEl = document.createElement("span");
  lineEl.className = "mfti-folder-branch-line";
  lineEl.dataset.mftiFolderBranchLine = "true";
  lineEl.setAttribute("aria-hidden", "true");
  return lineEl;
}

function applyTreeTitleIndentation(titleEl, type, path) {
  if (!(titleEl instanceof HTMLElement)) {
    return;
  }

  rememberInlineStyle(titleEl, "padding-inline-start", "mftiOriginalPaddingInlineStart", "mftiOriginalPaddingInlineStartPriority");
  const depth = getTitleTreeDepth(titleEl, type, path);
  const rowPadding = getBodyCssNumber("--mfti-row-padding-inline-start", 4);
  const depthIndent = getBodyCssNumber("--mfti-tree-depth-indent", 21);
  titleEl.dataset.mftiTreeDepth = String(depth);
  titleEl.style.setProperty("padding-inline-start", `${roundCssPixel(rowPadding + (depth * depthIndent))}px`, "important");
}

function restoreTreeTitleIndentation(titleEl) {
  if (!(titleEl instanceof HTMLElement)) {
    return;
  }

  restoreInlineStyle(titleEl, "padding-inline-start", "mftiOriginalPaddingInlineStart", "mftiOriginalPaddingInlineStartPriority");
  delete titleEl.dataset.mftiTreeDepth;
}

function getTitleTreeDepth(titleEl, type, path) {
  const pathDepth = getPathTreeDepth(path, type);
  if (pathDepth !== null) {
    return pathDepth;
  }

  if (type === "folder") {
    const folderEl = titleEl.closest(".nav-folder");
    return folderEl instanceof HTMLElement ? getFolderDepth(folderEl) : 0;
  }

  const fileEl = titleEl.closest(".nav-file, .tree-item");
  const parentFolder = fileEl?.parentElement?.closest(".nav-folder");
  if (!(parentFolder instanceof HTMLElement) || parentFolder.classList.contains("mod-root")) {
    return 0;
  }

  return getFolderDepth(parentFolder) + 1;
}

function getPathTreeDepth(path, type) {
  const segments = String(path || "").split("/").filter(Boolean);
  if (!segments.length) {
    return null;
  }

  return Math.max(0, segments.length - 1);
}

function getBodyCssNumber(propertyName, fallback) {
  const value = Number.parseFloat(getComputedStyle(document.body).getPropertyValue(propertyName));
  return Number.isFinite(value) ? value : fallback;
}

function rememberInlineStyle(element, propertyName, valueKey, priorityKey) {
  const flagKey = `${valueKey}Set`;
  if (element.dataset[flagKey] === "true") {
    return;
  }

  element.dataset[valueKey] = element.style.getPropertyValue(propertyName);
  element.dataset[priorityKey] = element.style.getPropertyPriority(propertyName);
  element.dataset[flagKey] = "true";
}

function restoreInlineStyle(element, propertyName, valueKey, priorityKey) {
  const flagKey = `${valueKey}Set`;
  if (element.dataset[flagKey] !== "true") {
    return;
  }

  const value = element.dataset[valueKey] || "";
  const priority = element.dataset[priorityKey] || "";
  if (value) {
    element.style.setProperty(propertyName, value, priority);
  } else {
    element.style.removeProperty(propertyName);
  }

  delete element.dataset[valueKey];
  delete element.dataset[priorityKey];
  delete element.dataset[flagKey];
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

function isTopLevelFolder(folderEl) {
  const parentFolder = folderEl.parentElement?.closest(".nav-folder");
  return !parentFolder || parentFolder.classList.contains("mod-root");
}

function getVisibleFolderChildrenBottom(childrenEl) {
  let bottom = childrenEl.getBoundingClientRect().bottom;
  childrenEl.querySelectorAll(".nav-folder-title, .nav-file-title, .tree-item-self").forEach((rowEl) => {
    if (!(rowEl instanceof HTMLElement)) {
      return;
    }

    const rowRect = rowEl.getBoundingClientRect();
    if (rowRect.width > 0 && rowRect.height > 0) {
      bottom = Math.max(bottom, rowRect.bottom);
    }
  });
  return bottom;
}

function roundCssPixel(value) {
  return Math.round(value * 100) / 100;
}

function isPluginOnlyMutation(mutation) {
  if (mutation.type === "attributes") {
    if (!(mutation.target instanceof HTMLElement)) {
      return false;
    }

    if (isPluginManagedElement(mutation.target)) {
      return true;
    }

    if (mutation.attributeName === "class") {
      const previous = new Set(String(mutation.oldValue || "").split(/\s+/).filter(Boolean));
      const current = new Set(String(mutation.target.className || "").split(/\s+/).filter(Boolean));
      const changed = [
        ...[...previous].filter((className) => !current.has(className)),
        ...[...current].filter((className) => !previous.has(className))
      ];
      if (!changed.length) {
        return true;
      }
      return changed.length > 0 && changed.every((className) => className.startsWith("mfti-"));
    }

    if (mutation.attributeName === "style") {
      const oldStyle = String(mutation.oldValue || "");
      const currentStyle = String(mutation.target.getAttribute("style") || "");
      if (oldStyle === currentStyle) {
        return true;
      }
      return oldStyle.includes("--mfti-")
        || currentStyle.includes("--mfti-")
        || [...mutation.target.classList].some((className) => className.startsWith("mfti-"));
    }

    return false;
  }

  if (mutation.type !== "childList") {
    return false;
  }

  const changedElements = [...mutation.addedNodes, ...mutation.removedNodes]
    .filter((node) => node instanceof HTMLElement);

  return changedElements.length > 0 && changedElements.every((node) => isPluginManagedElement(node));
}

function isPluginManagedElement(element) {
  return Boolean(element.closest(".mfti-folder-branch-line, .mfti-folder-arrow, .mfti-arrow-spacer, .mfti-row-icon, .mfti-extension"));
}

function getFolderLayoutDebugRow(titleEl) {
  const folderEl = titleEl instanceof HTMLElement ? titleEl.closest(".nav-folder") : null;
  const contentEl = titleEl instanceof HTMLElement ? titleEl.querySelector(".nav-folder-title-content") : null;
  const childrenEl = folderEl instanceof HTMLElement
    ? folderEl.querySelector(":scope > .nav-folder-children, :scope > .tree-item-children")
    : null;
  const arrowEl = titleEl instanceof HTMLElement ? titleEl.querySelector(":scope > .mfti-folder-arrow") : null;
  const lineEl = folderEl instanceof HTMLElement ? folderEl.querySelector(":scope > .mfti-folder-branch-line") : null;
  const titleStyle = titleEl instanceof HTMLElement ? getComputedStyle(titleEl) : null;
  const childrenStyle = childrenEl instanceof HTMLElement ? getComputedStyle(childrenEl) : null;
  const lineStyle = lineEl instanceof HTMLElement ? getComputedStyle(lineEl) : null;

  return {
    path: contentEl instanceof HTMLElement ? getPath(titleEl, contentEl) : "",
    text: contentEl?.textContent?.trim() || titleEl?.textContent?.trim() || "",
    depth: contentEl instanceof HTMLElement ? getTitleTreeDepth(titleEl, "folder", getPath(titleEl, contentEl)) : null,
    isTopLevel: folderEl instanceof HTMLElement ? isTopLevelFolder(folderEl) : null,
    isCollapsed: folderEl instanceof HTMLElement ? folderEl.classList.contains("is-collapsed") : null,
    directChildCount: childrenEl instanceof HTMLElement
      ? childrenEl.querySelectorAll(":scope > .nav-folder, :scope > .nav-file, :scope > .tree-item").length
      : 0,
    hasLine: lineEl instanceof HTMLElement,
    titleClass: titleEl?.className || "",
    folderClass: folderEl?.className || "",
    childrenClass: childrenEl?.className || "",
    folderRect: elementRectToObject(folderEl),
    titleRect: elementRectToObject(titleEl),
    arrowRect: elementRectToObject(arrowEl),
    childrenRect: elementRectToObject(childrenEl),
    lineRect: elementRectToObject(lineEl),
    titleCss: titleStyle ? {
      display: titleStyle.display,
      paddingInlineStart: titleStyle.paddingInlineStart,
      position: titleStyle.position
    } : {},
    childrenCss: childrenStyle ? {
      borderInlineStart: childrenStyle.borderInlineStart,
      display: childrenStyle.display,
      marginInlineStart: childrenStyle.marginInlineStart,
      overflow: childrenStyle.overflow,
      paddingInlineStart: childrenStyle.paddingInlineStart,
      position: childrenStyle.position
    } : {},
    lineCss: lineStyle ? {
      backgroundColor: lineStyle.backgroundColor,
      display: lineStyle.display,
      height: lineStyle.height,
      left: lineStyle.left,
      position: lineStyle.position,
      top: lineStyle.top,
      width: lineStyle.width,
      zIndex: lineStyle.zIndex
    } : {},
    lineVars: lineEl instanceof HTMLElement ? {
      height: lineEl.style.getPropertyValue("--mfti-tree-line-height"),
      left: lineEl.style.getPropertyValue("--mfti-tree-line-left"),
      top: lineEl.style.getPropertyValue("--mfti-tree-line-top-dynamic")
    } : {
      height: "",
      left: "",
      top: ""
    }
  };
}

function getFolderDepth(folderEl) {
  let depth = 0;
  let parentFolder = folderEl.parentElement?.closest(".nav-folder");
  while (parentFolder && !parentFolder.classList.contains("mod-root")) {
    depth += 1;
    parentFolder = parentFolder.parentElement?.closest(".nav-folder");
  }
  return depth;
}

function elementRectToObject(element) {
  if (!(element instanceof Element)) {
    return null;
  }
  return rectToObject(element.getBoundingClientRect());
}

function rectToObject(rect) {
  if (!rect) {
    return null;
  }
  return {
    bottom: roundCssPixel(rect.bottom),
    height: roundCssPixel(rect.height),
    left: roundCssPixel(rect.left),
    right: roundCssPixel(rect.right),
    top: roundCssPixel(rect.top),
    width: roundCssPixel(rect.width)
  };
}

function describeDebugElement(node) {
  if (!(node instanceof Element)) {
    return String(node?.nodeName || "unknown");
  }

  const text = node.textContent?.trim().replace(/\s+/g, " ").slice(0, 80) || "";
  return {
    className: node.className,
    nodeName: node.nodeName,
    path: node.getAttribute("data-path"),
    text
  };
}

function debugNow() {
  return typeof performance !== "undefined" ? roundCssPixel(performance.now()) : Date.now();
}

function shouldStoreDebugLayoutLabel(label) {
  return label.includes("manual-capture")
    || label.startsWith("onload-after-body-state")
    || label.startsWith("layout-ready-before-observe")
    || label.startsWith("workspace-tree-change-before-scan")
    || /^startup-(0|80|220|500|1000|1800|3000)ms:(before-decorate|after-sync|after-raf-2)/.test(label)
    || label.includes("resource-not-ready");
}

function getDebugLayoutLogsJson() {
  const logs = Array.isArray(window.__MFTI_LAYOUT_LOGS) ? window.__MFTI_LAYOUT_LOGS : [];
  return JSON.stringify(logs, null, 2);
}

function pushDebugLayoutLog(entry) {
  if (typeof window === "undefined") {
    return;
  }

  if (!Array.isArray(window.__MFTI_LAYOUT_LOGS)) {
    window.__MFTI_LAYOUT_LOGS = [];
  }

  window.__MFTI_LAYOUT_LOGS.push(entry);
  if (window.__MFTI_LAYOUT_LOGS.length > DEBUG_FILE_TREE_LOG_LIMIT) {
    window.__MFTI_LAYOUT_LOGS.shift();
  }
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
