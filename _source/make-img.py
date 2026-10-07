# Переводит скриншоты из _source/shots в img/*.webp в нескольких размерах
from PIL import Image
import os
SRC = os.path.join(os.path.dirname(__file__), 'shots')
OUT = os.path.join(os.path.dirname(__file__), '..', 'img')
JOBS = {'roti-desktop': [720, 1440], 'roti-menu': [720, 1440], 'roti-mobile': [390], 'roti-mobile-menu': [390]}
for name, widths in JOBS.items():
    im = Image.open(os.path.join(SRC, name + '.png')).convert('RGB')
    for w in widths:
        h = round(im.height * w / im.width)
        im.resize((w, h), Image.LANCZOS).save(os.path.join(OUT, f'{name}-{w}.webp'), 'WEBP', quality=82, method=6)
        print(name, w, h)
