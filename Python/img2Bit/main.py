from PIL import Image, ImageDraw
import sys
# import numpy as np
import time
from ..path import dst_path
from ..imgConvert import Convertor, Util


def img2char(
    convertor: Convertor,
    sample_step=24,
):
    '''
    图片转像素画
    1. 通过对图片特殊点采样取色
    2. 将字符填充至新图
    3. 如果必要去除alpha通道

    缺陷:
    - 速度太慢(每次修改图片都需要进行至少 O(size)^2 的复杂度)
    '''

    start_time = int(time.time())
    # 读取图片信息
    old_img = Image.open(convertor.old_file[0])

    (width, height) = old_img.size

    # 读取图片
    pix = old_img.load()

    # 创建新图片
    new_image = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(new_image)

    # 开始绘制
    pix_count = 0
    for y in range(height):
        for x in range(width):
            if x % sample_step == 0 and y % sample_step == 0:
                left_top = (x, y)
                right_bottom = (x + sample_step, y + sample_step)
                draw.rectangle((left_top, right_bottom),
                               fill=pix[x, y],
                               width=0)
                pix_count += 1

    # 转化格式
    if old_img.mode == 'RGB':
        bri = Util.brightness(old_img)
        bg_color = (bri, bri, bri)
        new_image = Convertor.drop_alpha(old_img, new_image, bg_color)

    # 保存
    dst_img_file_path = dst_path(convertor)
    new_image.save(dst_img_file_path)

    print("used time : %d second, pix_count : %d" %
          ((int(time.time()) - start_time), pix_count))
    print("image saved to : %s" % dst_img_file_path)


def convert(convertor: Convertor):
    sample = 0

    try:
        sample = int(input('Sample Step [Number]:'))
    except Exception:
        sample = 12

    img2char(convertor, sample)


if __name__ == "__main__":

    if len(sys.argv) < 2:
        print("it's not a legal file")
        sys.exit(1)

    convertor = Convertor()
    convertor.set_oldfile(sys.argv[1])
    convert(convertor)
