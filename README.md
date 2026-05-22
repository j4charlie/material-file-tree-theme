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

## Icon resources

Obsidian's community plugin installer downloads the plugin entry files, but it
may not install the large `icons/` and `dist/` resource folders. If the settings
page reports missing icon resources:

1. Open the plugin settings.
2. Click `Open download page`.
3. Download `material icon souce.zip` from the latest GitHub release.
4. Extract the zip.
5. Click `Import folder` and choose the extracted folder that contains `icons/`
   and `dist/material-icons.json`.

The plugin copies those resources into its vault plugin folder and reloads the
file explorer icons automatically.

## Release assets

Each GitHub release should include `material icon souce.zip` so users can import
the icon resources from the plugin settings page.

After creating a release for a tag, upload the resource pack:

```bash
scripts/release-resource-pack.sh <release-tag>
```

The script rebuilds `material icon souce.zip` from `dist/` and `icons/`, then
uploads it to the release with `gh release upload --clobber`.

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
