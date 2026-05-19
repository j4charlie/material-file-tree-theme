# material-icon-theme-for-vault

An Obsidian plugin that brings the Material Icon Theme file tree style to Obsidian.

This plugin adapts the file and folder icon experience from the open-source
[material-extensions/vscode-material-icon-theme](https://github.com/material-extensions/vscode-material-icon-theme)
project for Obsidian's file explorer.

## Features

- No build step.
- No npm dependencies.
- Bundled Material-style SVG file and folder icons.
- Icon matching driven by the upstream `dist/material-icons.json` mapping file.
- Filename, compound extension, extension, language-id fallback, folder name, and expanded-folder name matching.
- Settings for icon size, opacity, grayscale, and file/folder toggles.

## Install locally

1. Create a folder in your vault:

   ```text
   <your-vault>/.obsidian/plugins/material-icon-theme-for-vault/
   ```

2. Copy these files into that folder:

   ```text
   manifest.json
   main.js
   styles.css
   icons/
   dist/material-icons.json
   LICENSE
   MATERIAL_ICON_THEME_LICENSE.txt
   README.md
   ```

3. In Obsidian, go to `Settings -> Community plugins`.
4. Turn off restricted mode if needed.
5. Enable `material-icon-theme-for-vault`.

## Attribution

The bundled SVG icons and `dist/material-icons.json` mapping are derived from
[material-extensions/vscode-material-icon-theme](https://github.com/material-extensions/vscode-material-icon-theme),
which is licensed under the MIT License.

Keep `MATERIAL_ICON_THEME_LICENSE.txt` with this plugin when copying, sharing, or
redistributing the bundled icon assets.

## License

This Obsidian adapter code is released under the MIT License. See `LICENSE`.

The bundled Material Icon Theme assets retain their original MIT copyright notice.
See `MATERIAL_ICON_THEME_LICENSE.txt`.
