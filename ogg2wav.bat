@echo off

set InputExt=*.avi,*.mp4,*.wmv,*.flv,*.mkv,*.rmvb,*.rm,*.3gp,*.ogg

md output

echo 开始视频转换

::在下方设置输出格式，这里输出为wav，可自行更改
for %%a in (%InputExt%) do (
	echo transformatting: %%a
	ffmpeg -i "%%a" -f wav "output\%%~na.wav" -y
	echo
	echo
)

echo 转换完成

pause
