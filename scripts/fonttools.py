# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "fonttools",
# ]
# ///

from pathlib import Path
from fontTools import ttLib


def rename_font(font_path: Path, new_family_name: str) -> None:
    """Rename font family internally in the font file."""
    print(f"Processing {font_path.name}...")

    font = ttLib.TTFont(font_path)

    # Name table IDs: 1=Family, 4=Full Name, 6=PostScript Name, 16=Typographic Family
    for record in font['name'].names:
        if record.nameID == 1:  # Family name
            record.string = new_family_name.encode(record.getEncoding())
        elif record.nameID == 4:  # Full font name
            old_name = record.toUnicode()
            # Replace old family with new family in full name
            new_full = old_name.replace("Atkinson Hyperlegible", new_family_name)
            record.string = new_full.encode(record.getEncoding())
        elif record.nameID == 6:  # PostScript name
            old_ps = record.toUnicode()
            new_ps = old_ps.replace("AtkinsonHyperlegible", new_family_name.replace(" ", ""))
            record.string = new_ps.encode(record.getEncoding())
        elif record.nameID == 16:  # Typographic Family name (if present)
            record.string = new_family_name.encode(record.getEncoding())

    font.save(font_path)
    font.close()
    print(f"✓ Renamed {font_path.name}")


def main() -> None:
    # Get the directory where this script is located
    script_dir = Path(__file__).parent
    proc_dir = script_dir / "proc"

    if not proc_dir.exists():
        print(f"Error: {proc_dir} directory not found")
        return

    # Find all font files (ttf and otf)
    font_files = list(proc_dir.glob("*.ttf")) + list(proc_dir.glob("*.otf"))

    if not font_files:
        print("No font files found in proc directory")
        return

    print(f"Found {len(font_files)} font file(s)")
    print()

    new_family_name = "Atkinson Hyperlegible Next Static"

    for font_file in font_files:
        rename_font(font_file, new_family_name)

    print()
    print(f"All fonts renamed to '{new_family_name}'")


if __name__ == "__main__":
    main()
