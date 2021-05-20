import sys
import time
# import numpy as np
from random import randint
from types import SimpleNamespace

from PIL import Image, ImageDraw, ImageFont

from ..imgConvert import Convertor, Util
from ..input import rinput
from ..path import font_path

_TYPE_OF_CHARACTER = {"numeral": "numeral", "alpha": "alpha"}
TYPE_OF_CHARACTER = SimpleNamespace(**_TYPE_OF_CHARACTER)


def img2char(convertor: Convertor,
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
    old_img = Image.open(convertor.old_file)

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
        bri = Util.brightness(old_img)
        bg_color = (bri, bri, bri)
        new_image = Convertor.drop_alpha(old_img, new_image, bg_color)

    # 保存
    dst_img_file_path = convertor.dst_path()
    new_image.save(dst_img_file_path)

    print("used time : %d second, pix_count : %d" %
          ((int(time.time()) - start_time), pix_count))
    print("image saved to : %s" % dst_img_file_path)


def char_table(typo='alpha') -> list:
    if TYPE_OF_CHARACTER.alpha == typo:
        return list('ABCDEFGHIJKLMNOPRSTUVWXYZabcdefhiklmnorstuvwxz')
    else:
        return list('1234567890')


def convert(convertor: Convertor):
    font_size = int(rinput('Font Size [Number]:', '12'))

    img2char(convertor, font_size)


if __name__ == "__main__":

    if len(sys.argv) < 2:
        print("it's not a legal file")
        sys.exit(1)

    convertor = Convertor()
    convertor.set_oldfile(sys.argv[1])
    convert(convertor)
