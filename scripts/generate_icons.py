import os
from PIL import Image, ImageDraw, ImageFilter

def create_liquid_glass_icon(size=512, is_maskable=False):
    # Render at 4x for ultra-crisp supersampled anti-aliasing
    scale = 4
    canvas_size = size * scale
    img = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    
    # Outer dark background if maskable
    if is_maskable:
        bg = Image.new('RGBA', (canvas_size, canvas_size), (10, 10, 10, 255))
        img = bg

    draw = ImageDraw.Draw(img)

    # Coordinates for the liquid glass badge
    margin = int(canvas_size * (0.15 if is_maskable else 0.08))
    box = [margin, margin, canvas_size - margin, canvas_size - margin]
    radius = int(canvas_size * 0.22)

    # 1. Outer ambient blue glow
    glow_img = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    glow_draw.rounded_rectangle(box, radius=radius, fill=(37, 99, 235, 160))
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(int(canvas_size * 0.08)))
    img = Image.alpha_composite(img, glow_img)

    # 2. Main Liquid Glass Blue Container with Gradient
    badge_img = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    badge_draw = ImageDraw.Draw(badge_img)

    # Create gradient background
    w = box[2] - box[0]
    h = box[3] - box[1]
    for y in range(h):
        ratio = y / float(h)
        r = int(59 * (1 - ratio) + 29 * ratio)
        g = int(130 * (1 - ratio) + 78 * ratio)
        b = int(246 * (1 - ratio) + 216 * ratio)
        badge_draw.line([(box[0], box[1] + y), (box[2], box[1] + y)], fill=(r, g, b, 255))

    # Mask with rounded rect
    mask = Image.new('L', (canvas_size, canvas_size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle(box, radius=radius, fill=255)
    
    badge_final = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    badge_final.paste(badge_img, (0, 0), mask=mask)
    img = Image.alpha_composite(img, badge_final)

    # 3. Top Specular Glass Sheen
    sheen_img = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    sheen_draw = ImageDraw.Draw(sheen_img)
    
    # Curved specular highlight
    sheen_h = int(h * 0.48)
    for y in range(sheen_h):
        alpha = int(95 * (1 - (y / float(sheen_h))))
        sheen_draw.line([(box[0], box[1] + y), (box[2], box[1] + y)], fill=(255, 255, 255, alpha))
    
    sheen_final = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    sheen_final.paste(sheen_img, (0, 0), mask=mask)
    img = Image.alpha_composite(img, sheen_final)

    # 4. Specular border rim
    rim_img = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    rim_draw = ImageDraw.Draw(rim_img)
    rim_draw.rounded_rectangle(box, radius=radius, outline=(255, 255, 255, 60), width=int(canvas_size * 0.015))
    img = Image.alpha_composite(img, rim_img)

    # 5. Crisp Vector Download Icon
    icon_draw = ImageDraw.Draw(img)
    cx = canvas_size / 2
    cy = canvas_size / 2
    stroke_w = int(canvas_size * 0.055)

    # Vertical stem: cx, cy - 18% to cy + 10%
    y_top = cy - canvas_size * 0.16
    y_bot = cy + canvas_size * 0.10
    icon_draw.line([(cx, y_top), (cx, y_bot)], fill=(255, 255, 255, 255), width=stroke_w)
    
    # Rounded cap on top
    cap_r = stroke_w / 2
    icon_draw.ellipse([cx - cap_r, y_top - cap_r, cx + cap_r, y_top + cap_r], fill=(255, 255, 255, 255))

    # Arrow Head: (cx - w, cy - offset) -> (cx, y_bot) -> (cx + w, cy - offset)
    aw = canvas_size * 0.14
    ay = cy - canvas_size * 0.03
    icon_draw.line([(cx - aw, ay), (cx, y_bot)], fill=(255, 255, 255, 255), width=stroke_w)
    icon_draw.line([(cx + aw, ay), (cx, y_bot)], fill=(255, 255, 255, 255), width=stroke_w)
    
    # End caps for arrowhead
    icon_draw.ellipse([cx - aw - cap_r, ay - cap_r, cx - aw + cap_r, ay + cap_r], fill=(255, 255, 255, 255))
    icon_draw.ellipse([cx + aw - cap_r, ay - cap_r, cx + aw + cap_r, ay + cap_r], fill=(255, 255, 255, 255))
    icon_draw.ellipse([cx - cap_r, y_bot - cap_r, cx + cap_r, y_bot + cap_r], fill=(255, 255, 255, 255))

    # Base tray: (cx - w, cy + 22%) to (cx + w, cy + 22%)
    by = cy + canvas_size * 0.20
    bw = canvas_size * 0.18
    icon_draw.line([(cx - bw, by), (cx + bw, by)], fill=(255, 255, 255, 255), width=stroke_w)
    icon_draw.ellipse([cx - bw - cap_r, by - cap_r, cx - bw + cap_r, by + cap_r], fill=(255, 255, 255, 255))
    icon_draw.ellipse([cx + bw - cap_r, by - cap_r, cx + bw + cap_r, by + cap_r], fill=(255, 255, 255, 255))

    # Downsample with LANCZOS filter for pristine smoothness
    return img.resize((size, size), Image.Resampling.LANCZOS)

os.makedirs('public/icons', exist_ok=True)

# Generate 192x192, 512x512, maskable, and favicon
icon_192 = create_liquid_glass_icon(192, is_maskable=False)
icon_192.save('public/icons/icon-192.png', format='PNG')

icon_512 = create_liquid_glass_icon(512, is_maskable=False)
icon_512.save('public/icons/icon-512.png', format='PNG')

icon_512_maskable = create_liquid_glass_icon(512, is_maskable=True)
icon_512_maskable.save('public/icons/icon-512-maskable.png', format='PNG')

# Favicon ICO
icon_32 = create_liquid_glass_icon(32, is_maskable=False)
icon_32.save('public/favicon.ico', format='ICO')
icon_32.save('app/favicon.ico', format='ICO')

print("PakGet liquid glass icons generated successfully!")
