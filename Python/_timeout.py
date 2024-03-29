from time import time
import sys
import threading

# https://www.bookset.io/read/python-notebook/python-warp


class KThread(threading.Thread):

  """A subclass of threading.Thread, with a kill()
    method.
    Come from:
    Kill a thread in Python:
    http://mail.python.org/pipermail/python-list/2004-May/260937.html
    """

  def __init__(self, *args, **kwargs):
    threading.Thread.__init__(self, *args, **kwargs)
    self.killed = False

  def start(self):
    """Start the thread."""
    self.__run_backup = self.run
    self.run = self.__run  # Force the Thread to install our trace.
    threading.Thread.start(self)

  def __run(self):
    """Hacked run function, which installs the
        trace."""
    sys.settrace(self.globaltrace)
    self.__run_backup()
    self.run = self.__run_backup

  def globaltrace(self, frame, why, arg):
    if why == 'call':
      return self.localtrace
    else:
      return None

  def localtrace(self, frame, why, arg):
    if self.killed:
      if why == 'line':
        raise SystemExit()
    return self.localtrace

  def kill(self):
    self.killed = True


class Timeout(Exception):

  """function run timeout"""


def set_timeout(seconds, callback_data=None):
  """超时装饰器，指定超时时间
    若被装饰的方法在指定的时间内未返回，则抛出Timeout异常"""

  def timeout_decorator(func):
    """真正的装饰器"""

    def _new_func(oldfunc, result, oldfunc_args, oldfunc_kwargs):
      result.append(oldfunc(*oldfunc_args, **oldfunc_kwargs))

    def _(*args, **kwargs):
      result = []
      new_kwargs = {  # create new args for _new_func, because we want to get the func return val to result list
          'oldfunc': func,
          'result': result,
          'oldfunc_args': args,
          'oldfunc_kwargs': kwargs
      }
      thd = KThread(target=_new_func, args=(), kwargs=new_kwargs)
      thd.start()
      thd.join(seconds)
      alive = thd.isAlive()
      thd.kill()  # kill the child thread
      if alive:
        # raise Timeout(u'function run too long, timeout %d seconds.' % seconds)
        try:
          return callback_data
          # raise Timeout(u'function run too long, timeout %d seconds.' % seconds)
        finally:
          # return u'function run too long, timeout %d seconds.' % seconds
          return callback_data
      else:
        return result[0]

    _.__name__ = func.__name__
    _.__doc__ = func.__doc__
    return _

  return timeout_decorator


@set_timeout(2, None)  # 限时 2 秒超时
def connect():  # 要执行的函数
  time.sleep(3)  # 函数执行时间，写大于2的值，可测试超时
  print('Finished without timeout.')
