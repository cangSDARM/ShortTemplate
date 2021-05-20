import os
from typing import Optional, Tuple


def resolve_path(path: str = '') -> str:
    """
    Resolve path from ShortTemplate to Python
    """
    if os.path.isabs(path):
        return path

    # dont change workdir in anyway
    os.chdir('./Python')
    ret = os.path.abspath(os.path.relpath(path))
    os.chdir('..')
    return ret


def require_abspath(p: str = None, throwexp=True) -> Optional[str]:
    '''
    :param throwexp: if False, return `None`; else throw a exception if it's not a valid path

    else return retrive the path to abs path
    '''
    if p is None or p.isspace():
        if not throwexp:
            return None

        raise "it's not a legal path"

    return os.path.abspath(p)


def split(abs_path: str = '') -> Tuple[str, str, str]:
    """
    return (dir_path, file_name, ext)
    """

    abs_path = require_abspath(abs_path)

    if os.path.isdir(abs_path):
        return (abs_path, '', '')

    (dir_path, tfile) = os.path.split(abs_path)
    (file_name, ext) = os.path.splitext(tfile)

    return (dir_path, file_name, ext)


def font_path() -> str:
    return os.path.abspath(
        './asserts/Ubuntu Mono derivative Powerline.ttf').replace(
            '\\', '\\\\')
