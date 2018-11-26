from PIL import Image
from PIL import ImageDraw
from PIL import ImageFont
#import numpy as np
from random import randint

def Img2Chr(srd_img_file_path, dst_img_file_path = None, sample_step = 3):
    '''
    图片转字符画
    1. 通过对图片特殊点采样修改字体颜色
    2. 清空图片
    3. 将字符填充

    缺陷:
    1. 字符大小需要自己反复确认, 采样步长也如此
    2. 速度太慢(每次修改图片都需要进行至少 O(width*height)^2 的复杂度)
    '''
    scale = 5
    #start_time = int(time.time())
    #读取图片信息
    old_img = Image.open(srd_img_file_path)
    width = old_img.size[0]
    height = old_img.size[1]

    #缩放
    old_img = old_img.copy()
    old_img.thumbnail((width//scale, height//scale))

    #确定长宽
    width = old_img.size[0]
    height = old_img.size[1]

    #读取缩略图
    #old_img.save(dst_img_file_path+".png")
    pix = old_img.load()

    #创建新图片
    #canvas = np.ndarray((height*scale, width*scale, 3), np.uint8)
    #canvas[:, :, :] = 0
    #new_image = Image.fromarray(canvas)
    new_image = Image.new('RGBA', (width*scale, height*scale), (0, 0, 0, 0))
    draw = ImageDraw.Draw(new_image)

    #创建绘制对象
    font = ImageFont.truetype("C:\\Windows\\Fonts\\UbuntuMono-R.ttf", 7 * sample_step, encoding="unic")
    char_table = list('ABCDEFGHIJKLMNOPRSTUVWXYZabcdefhiklmnorstuvwxz')

    #开始绘制
    pix_count = 0
    table_len = len(char_table)
    for y in range(height):
        for x in range(width):
            if x % sample_step == 0 and y % sample_step == 0:
                draw.text((x*scale, y*scale), char_table[randint(0, table_len - 1)], pix[x, y], font)
                pix_count += 1

    # 保存
    if dst_img_file_path is not None:
        new_image.save(dst_img_file_path)

    #print("used time : %d second, pix_count : %d" % ((int(time.time()) - start_time), pix_count))
    #new_image.show()

if __name__ == "__main__":
    old = input('OldPath:')
    #old = 'E:/Uploaded/test01.jpg'
    new = input('NewPath:')
    scale = input('Scale:')
    #new = 'D:/360data/Desktop/temp.png'
    Img2Chr(old, new, scale)