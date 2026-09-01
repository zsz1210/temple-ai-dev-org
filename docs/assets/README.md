# Documentation assets

The Temple delivery diagrams in this directory are static README assets generated from the adjacent Mermaid source files.

- `temple-delivery-path.<locale>.mmd` is the desktop source.
- `temple-delivery-path.<locale>-mobile.mmd` is the narrow-layout source.
- The three root READMEs use a `<picture>` element to select the appropriate SVG.
- Each README supplies localized alternative text because the pinned Mermaid block-diagram grammar does not accept the generic accessibility directives.

Regenerate all six SVGs with the pinned authoring tool:

    for source in docs/assets/temple-delivery-path.*.mmd; do
      npx --yes @mermaid-js/mermaid-cli@11.10.1 \
        -i "$source" \
        -o "${source%.mmd}.svg" \
        -b transparent
    done

Mermaid is an authoring-only tool. It is not a Temple runtime dependency and is not installed by default. After regeneration, validate the SVG files and inspect the rendered READMEs at desktop and narrow widths.
