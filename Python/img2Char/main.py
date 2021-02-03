from PIL import Image, ImageDraw, ImageFont, ImageStat
from types import SimpleNamespace
import sys
# import numpy as np
from random import randint
import os
import time

_TYPE_OF_CHARACTER = {"numeral": "numeral", "alpha": "alpha"}
TYPE_OF_CHARACTER = SimpleNamespace(**_TYPE_OF_CHARACTER)


def brightness(im_file) -> int:
    """https://stackoverflow.com/questions/3490727/what-are-some-methods-to-analyze-image-brightness-using-python"""

    manual = input('Set brightness manually [white/black]:').strip().lower()
    if manual == 'white' or manual == 'w':
        return 255
    elif manual == 'black' or manual == 'b':
        return 0

    im = im_file.convert('L')
    stat = ImageStat.Stat(im)
    brightness_origin = round(stat.rms[0]) + 5
    if 127 <= brightness_origin and brightness_origin <= 255:
        return brightness_origin

    brightness_origin -= 10
    if 0 <= brightness_origin:
        return brightness_origin

    return 0


def img2char(srd_img_file_path,
             dst_img_file_path=None,
             font_size=7,
             type_of_chara=TYPE_OF_CHARACTER.alpha):
    '''
    图片转字符画
    1. 通过对图片特殊点采样取色
    2. 将字符填充至新图
    3. 如果必要去除alpha通道

    缺陷:
    - 速度太慢(每次修改图片都需要进行至少 O(size)^2 的复杂度)
    '''

    start_time = int(time.time())
    # 读取图片信息
    old_img = Image.open(srd_img_file_path)

    width = old_img.size[0]
    height = old_img.size[1]

    # 读取图片
    pix = old_img.load()

    # 创建新图片
    new_image = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(new_image)

    # 创建绘制对象
    font = ImageFont.truetype(font=font_path(),
                              size=font_size,
                              encoding="unic")
    (font_width, font_height) = font.getsize(
        'A') if type_of_chara == TYPE_OF_CHARACTER.alpha else font.getsize('1')
    table = char_table(type_of_chara)

    # 开始绘制
    pix_count = 0
    table_len = len(table)
    for y in range(height):
        for x in range(width):
            if x % font_width == 0 and y % font_height == 0:
                draw.text((x, y), table[randint(0, table_len - 1)], pix[x, y],
                          font)
                pix_count += 1

    # 转化格式
    if old_img.mode == 'RGB':
        bri = brightness(old_img)
        bg_color = (bri, bri, bri)
        background = Image.new(new_image.mode[:-1], new_image.size, bg_color)
        background.paste(new_image, new_image.split()[-1])  # omit transparency
        new_image = background.convert('RGB')

    # 保存
    dst_img_file_path = dst_path(dst_img_file_path)
    new_image.save(dst_img_file_path)

    print("used time : %d second, pix_count : %d" %
          ((int(time.time()) - start_time), pix_count))
    print("image saved to : %s" % dst_img_file_path)


def char_table(typo='alpha') -> list:
    if TYPE_OF_CHARACTER.alpha == typo:
        return list('ABCDEFGHIJKLMNOPRSTUVWXYZabcdefhiklmnorstuvwxz')
    else:
        return list('1234567890')


def font_path() -> str:
    return os.path.abspath(
        './asserts/Ubuntu Mono derivative Powerline.ttf').replace(
            '\\', '\\\\')


def dst_path(dst_img_path) -> str:
    global fileName, dirpath, ext
    return "{abs}{sep}{name}-{time}{ext}".format(
        abs=os.path.abspath(dirpath),
        name=fileName,
        sep=os.path.sep,
        time=time.strftime(".%Y-%m-%d_%H-%M-%S", time.localtime()),
        ext=ext
    ) if dst_img_path is None or dst_img_path.strip() == '' else dst_img_path


def convert(oldFile=""):
    new = input('NewPath [AbsPath Required]:')
    font_size = 0

    try:
        font_size = int(input('Font Size [Number]:'))
    except Exception:
        font_size = 12

    img2char(oldFile, new, font_size)


# ---------------
if len(sys.argv) < 2:
    print("it's not a legal file")
    sys.exit(1)

oldFile = sys.argv[1]
(dirpath, tempfilename) = os.path.split(oldFile)
(fileName, ext) = os.path.splitext(tempfilename)
if not oldFile or not ext:
    print("it's not a legal path")
    sys.exit(1)

convert(oldFile)
