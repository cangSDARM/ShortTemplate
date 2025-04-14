def rinput(notion: str = '', dv: str = '') -> str:
  """
    Safe input. Aways input in newline. Stripped
    """

  rev = dv
  try:
    defaultValue = ' default value: {dv}\r\n'.format(dv=dv) if dv else ''
    rev = input('{notion}\r\n{dv}> '.format(notion=notion, dv=defaultValue)).strip()

    if rev.isspace() or not rev:
      raise 'Set for default'
  except Exception:
    rev = dv

  return rev
