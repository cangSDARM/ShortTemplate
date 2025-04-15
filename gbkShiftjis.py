import os

def gbk2shiftjis(s: str) -> str:
    byte = s.encode('GBK')
    return byte.decode('shift_jis')

def shiftjis2gbk(s: str) -> str:
    byte = s.encode('shift_jis')
    return byte.decode('GBK')

def gbk2shiftjis_fileRename(dir_abs: str):
    dirr = dir_abs + os.sep
    arr = os.listdir(dir_abs)
    for f in arr:
        print(f)
        oldname = dirr + f
        if input('Rename it? [y/n]').upper() == 'Y':
            newname = gbk2shiftjis(f)
            os.rename(oldname, dirr + newname)
            print(newname)
            print('')

if __name__ == "__main__":
    # print('1. gbk -> shift-jis')
    # print('2. shift-jis -> gbk')
    # v = input('Choose your format: ').strip()
    # res = gbk2shiftjis(input('Str:'))

    # while True:
    #     iv = input('str: ')
    #     if iv == 'end':
    #         break

    #     res = gbk2shiftjis(iv)
    #     if res != '':
    #         print(res)
    gbk2shiftjis_fileRename(input('src: '))

    # if v == '1':
    #     res = gbk2shiftjis(input('Str:'))
    # elif v == '2':
    #     res = shift_jis(input('Str:'))
    # else:
    #     print('wrong choose: ' + v)
