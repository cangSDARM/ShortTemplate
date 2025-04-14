import os
import re
import sys
import time

from PIL import Image, ImageStat

from .input import rinput
from .path import require_abspath, resolve_path, split


class Util:

  @classmethod
  def brightness(cls, im_file: Image.Image) -> int:
    """https://stackoverflow.com/questions/3490727/what-are-some-methods-to-analyze-image-brightness-using-python"""

    manual = rinput("Set brightness manually [white/black]:", "black").lower()
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


class Convertor:

  def __init__(self) -> None:
    self.set_newfile()

  def set_oldfile(self, abs_path: str = None) -> None:
    '''
        set `self.old_file` = `abs_path`'''

    self.old_file = abs_path

  def set_newfile(self) -> None:
    '''
        set `self.new_file` = `(abs_path)`

        Supported:
        1. abs_path(include file_name or not)
        2. relative path(based on ..Python)
        '''

    abs_path = rinput('Save to:')

    abs_path = resolve_path(abs_path)

    self.new_file = abs_path

  def dst_path(self) -> str:
    (dir_path, file_name, ext) = split(self.old_file)
    abs_path = self.new_file

    if not abs_path or abs_path.isspace():
      return "{abs}{sep}{name}{time}{ext}".format(
          abs=os.path.abspath(dir_path),
          name=file_name,
          sep=os.path.sep,
          time=time.strftime(".%Y-%m-%d_%H-%M-%S", time.localtime()),
          ext=ext)
    else:
      abs_path = require_abspath(abs_path)
      (dir_path, file_sp, _) = split(abs_path)
      return "{abs}{sep}{name}{ext}".format(
          abs=os.path.abspath(dir_path), name=file_sp if file_sp != '' else file_name, sep=os.path.sep, ext=ext)

  @classmethod
  def drop_alpha(cls, old_img: Image.Image, new_img: Image.Image, bg_color=(255, 255, 255)) -> Image.Image:
    '''
        :param new_img: if it's `None`, assume to new_img==old_img
        :param bg_color: used to replace empty alpha

        :return: a drop alphaed img

        drop alpha channel for old_img.'''
    if old_img.mode == 'RGB':
      if new_img is None:
        new_img = old_img

      background = Image.new(new_img.mode[:-1], new_img.size, bg_color)
      background.paste(new_img, new_img.split()[-1])  # omit transparency
      return background.convert('RGB')
    else:
      return new_img


def convert() -> None:
  if len(sys.argv) < 2:
    print("it's not a legal file")
    sys.exit(1)

  convertor = Convertor()
  convertor.set_oldfile(sys.argv[1])

  action = rinput("""
Choose a type u want to converted[Number]

0; to character
1; to bit
""", '0')
  action = int(action, base=10)

  if action == 0:
    print('-----------To Character-----------')
    img2Char.convert(convertor)
  else:
    print('-----------To Bit-----------')
    img2Bit.convert(convertor)


if __name__ == "__main__":
  from .img2Bit import main as img2Bit
  from .img2Char import main as img2Char

  convert()
