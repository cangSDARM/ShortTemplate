import os
from os.path import splitext
from subprocess import run


def ffmpeg(ifile: str):
    # 通常webp是25fps。如果太快或者太慢支持都有问题
    sample = "ffmpeg -i {} -filter:v fps=fps=25 -loop 0 -compression_level 4 -q:v 100 -an -fps_mode vfr {}.webp".format(
        ifile, splitext(ifile)[0])

    res = run(sample.split(" "), capture_output=True)
    # ffmpeg 输出到 stderr
    useful = res.stderr.decode().split("Input #0,")[-1]

    print("\n\nInput #0, {}".format(useful))


def traversal_files(path: str):
    files = []

    for item in os.scandir(path):
        if item.is_file():
            ext = splitext(item.path)[-1]

            if ext == ".webm":
                files.append(item.name)

    for webm in files:
        ffmpeg(webm)


traversal_files(os.curdir)
