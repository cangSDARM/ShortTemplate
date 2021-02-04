import sys
import os
from PIL import Image, ImageStat


class Util:
    @classmethod
    def require_abspath(cls, p=None, throwexp=True) -> None:
        '''
        :param throwexp: if False, return `None`

        Throw a exception if it's not a valid path'''
        if not throwexp:
            return None

        if p is None or p.strip() == '':
            print("it's not a legal path")
            sys.exit(1)

    @classmethod
    def brightness(cls, im_file) -> int:
        """https://stackoverflow.com/questions/3490727/what-are-some-methods-to-analyze-image-brightness-using-python"""

        manual = input(
            'Set brightness manually [white/black]:').strip().lower()
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
    def __init__(self):
        self.set_newfile()

    def set_oldfile(self, abs_path=None) -> None:
        '''
        set `self.old_file` = `(abs_path, dir_path, file_name, ext)`'''

        Util.require_abspath(abs_path)

        (dir_path, tfile) = os.path.split(abs_path)
        (file_name, ext) = os.path.splitext(tfile)

        if not ext:
            print("this file cannot be converted. require a valid extention")
            sys.exit(1)

        self.old_file = (abs_path, dir_path, file_name, ext)

    def set_newfile(self) -> None:
        '''
        set `self.new_file` = `(abs_path)`'''

        abs_path = input('NewPath [AbsPath Required]:')
        Util.require_abspath(abs_path, False)

        self.new_file = (abs_path)

    @classmethod
    def drop_alpha(cls, old_img, new_img,
                   bg_color=(255, 255, 255)) -> Image.Image:
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
    img2Char.convert(convertor)


if __name__ == "__main__":
    from .img2Char import main as img2Char

    convert()
