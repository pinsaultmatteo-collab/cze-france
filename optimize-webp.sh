#!/usr/bin/env bash
# Convertit en WebP les images locales (products/ et clients/) puis supprime les originaux.
# À lancer dans le dossier site-internet :  bash optimize-webp.sh
set -e
shopt -s nullglob nocaseglob

if command -v cwebp >/dev/null 2>&1; then CONV=cwebp
elif command -v sips >/dev/null 2>&1; then CONV=sips
else
  echo "❌ Ni 'cwebp' ni 'sips' trouvés."
  echo "   Installe cwebp avec :  brew install webp"
  exit 1
fi
echo "Conversion WebP via $CONV…"

count=0
for dir in assets/img/products assets/img/clients; do
  [ -d "$dir" ] || continue
  for f in "$dir"/*.jpg "$dir"/*.jpeg "$dir"/*.png; do
    [ -e "$f" ] || continue
    out="${f%.*}.webp"
    if [ "$CONV" = "cwebp" ]; then
      cwebp -quiet -q 82 "$f" -o "$out"
    else
      sips -s format webp -s formatOptions 82 "$f" --out "$out" >/dev/null
    fi
    rm -f "$f"
    count=$((count+1))
    echo "  ✓ $out"
  done
done
echo "✅ $count image(s) converties en WebP. Les originaux ont été supprimés."
