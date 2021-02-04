import os
import time
from .imgConvert import Convertor


def font_path() -> str:
    return os.path.abspath(
        './asserts/Ubuntu Mono derivative Powerline.ttf').replace(
            '\\', '\\\\')


def dst_path(convert: Convertor) -> str:
    (_, dir_path, file_name, ext) = convert.old_file
    (abs_path) = convert.new_file
    return "{abs}{sep}{name}-{time}{ext}".format(
        abs=os.path.abspath(dir_path),
        name=file_name,
        sep=os.path.sep,
        time=time.strftime(".%Y-%m-%d_%H-%M-%S", time.localtime()),
        ext=ext) if abs_path is None or abs_path.strip() == '' else abs_path
