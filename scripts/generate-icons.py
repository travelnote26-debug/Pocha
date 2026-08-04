from PIL import Image, ImageDraw

GREEN = (18, 67, 32, 255)
GOLD = (255, 200, 44, 255)
WHITE = (250, 250, 247, 255)
RED = (211, 47, 47, 255)
DARKGOLD = (212, 158, 0, 255)


def rounded_mask(size, radius):
    mask = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    return mask


def make_icon(size, rounded=True):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # felt green background
    if rounded:
        img.paste(Image.new("RGBA", (size, size), GREEN), (0, 0), rounded_mask(size, int(size * 0.22)))
    else:
        d.rectangle([0, 0, size - 1, size - 1], fill=GREEN)

    cx = cy = size / 2
    ring_r = size * 0.40
    ring_w = size * 0.055

    # gold ring
    d.ellipse([cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r], outline=GOLD, width=int(ring_w))

    # white card
    card_w = size * 0.46
    card_h = size * 0.58
    x0, y0 = cx - card_w / 2, cy - card_h / 2
    x1, y1 = cx + card_w / 2, cy + card_h / 2
    d.rounded_rectangle([x0, y0, x1, y1], radius=size * 0.05, fill=WHITE)
    d.rounded_rectangle([x0, y0, x1, y1], radius=size * 0.05, outline=DARKGOLD, width=int(size * 0.02))

    # red diamond suit
    d.ellipse([cx - size * 0.10, cy - size * 0.10, cx + size * 0.10, cy + size * 0.10], fill=RED)

    return img


def make_maskable(size):
    img = make_icon(size, rounded=False)
    return img


if __name__ == "__main__":
    for s in (192, 512):
        make_icon(s).save(f"public/icons/icon-{s}.png")
    make_maskable(512).save("public/icons/icon-maskable.png")
    print("icons generated")
