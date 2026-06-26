import os

OPEN = chr(123)
CLOSE = chr(125)
SL = chr(60)
SR = chr(62)

SPAN_OPEN = SL + "span"
SPAN_CLOSE = SL + "/span" + SR
DIV_OPEN = SL + "div"
DIV_CLOSE = SL + "/div" + SR

fixes = [
    ('src/components/game/StatsDialog.tsx',
     'aria-hidden="true">' + OPEN + 'i + 1' + SPAN_CLOSE,
     'aria-hidden="true">' + OPEN + 'i + 1' + CLOSE + SPAN_CLOSE),
    ('src/components/game/StatsDialog.tsx',
     OPEN + 'value' + OPEN + 'suffix' + DIV_CLOSE,
     OPEN + 'value' + OPEN + 'suffix' + CLOSE + DIV_CLOSE),
    ('src/components/game/StatsDialog.tsx',
     OPEN + 'label' + DIV_CLOSE,
     OPEN + 'label' + CLOSE + DIV_CLOSE),
    ('src/components/game/SettingsDialog.tsx',
     OPEN + 'opt.label' + SPAN_CLOSE,
     OPEN + 'opt.label' + CLOSE + SPAN_CLOSE),
    ('src/components/game/StatsDialog.tsx',
     OPEN + 'count > 0 && ' + SL + 'span className="drop-shadow-sm">',
     OPEN + 'count > 0 && ' + CLOSE + SL + 'span className="drop-shadow-sm">'),
    ('src/components/game/StatsDialog.tsx',
     'drop-shadow-sm">' + OPEN + 'count' + SPAN_CLOSE,
     'drop-shadow-sm">' + OPEN + 'count' + CLOSE + SPAN_CLOSE),
]

for path, old, new in fixes:
    if not os.path.exists(path):
        print('skip', path)
        continue
    c = open(path).read()
    count = c.count(old)
    print(path, 'matches:', count)
    if count:
        c = c.replace(old, new)
        open(path, 'w').write(c)
print('done')
