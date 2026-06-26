import os

OPEN = chr(123)
CLOSE = chr(125)
SL = chr(60)
SR = chr(62)

# Update StatsDialog.tsx in place via search/replace on committed baseline
src = 'src/components/game/StatsDialog.tsx'
c = open(src).read()

# Add useDialogA11y hook import after useDialogA11y would-be line
old_import = "import type { GameStats } from '@/lib/stats';"
new_import_lines = [
    "import { useRef, useId } from 'react';",
    "import type { GameStats } from '@/lib/stats';",
    "import { cn } from '@/lib/utils';",
    "import { useDialogA11y } from '@/lib/focus-trap';",
]
new_import = '\n'.join(new_import_lines)
c = c.replace(old_import, new_import)

# Inside the function, add the ref / titleId / useDialogA11y at the top of the body
body_marker = 'export default function StatsDialog('
end_signature = '  if (!gameOver) return null;'
new_body = (
    'export default function StatsDialog('
)
c = c.replace(body_marker, new_body)
# Find the function start, then insert ref/titleId calls before `if (!gameOver)`
# Use a substring approach: find `if (!gameOver) return null;`
prefix = 'const ref = useRef' + OPEN + 'HTMLDivElement' + OPEN + 'null' + CLOSE + '>' + OPEN + 'HTMLDivElement' + CLOSE + '(' + 'null';
c = c.replace(end_signature, prefix + ';\n  const titleId = useId();\n  useDialogA11y(ref, onClose, gameOver);\n\n' + end_signature)

# Wrap dialog content with role/aria-modal/etc.
old_dialog = (
    SL + 'div className=' + chr(34) + 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm' + chr(34) + SR
    + '\n      ' + SL + 'div className=' + chr(34) + 'w-full max-w-sm rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 shadow-2xl' + chr(34) + SR
)
new_dialog = (
    SL + 'div className=' + chr(34) + 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm' + chr(34) + SR
    + '\n      ' + SL + 'div\n        ref=' + OPEN + 'ref' + CLOSE
    + '\n        role=' + chr(34) + 'dialog' + chr(34)
    + '\n        aria-modal=' + chr(34) + 'true' + chr(34)
    + '\n        aria-labelledby=' + OPEN + 'titleId' + CLOSE
    + '\n        tabIndex=' + OPEN + '-1' + CLOSE
    + '\n        className=' + chr(34) + 'w-full max-w-sm rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 shadow-2xl outline-none' + chr(34) + SR
)
c = c.replace(old_dialog, new_dialog)

# Add id={titleId} to h2
c = c.replace(
    SL + 'h2 className=' + chr(34) + 'mb-5 text-center text-lg font-display' + chr(34) + SR,
    SL + 'h2 id=' + OPEN + 'titleId' + CLOSE + ' className=' + chr(34) + 'mb-5 text-center text-lg font-display' + chr(34) + SR
)

# Add aria-label to distribution row + aria-hidden="true" to number span
c = c.replace(
    SL + 'div key=' + OPEN + 'i' + CLOSE + ' className=' + chr(34) + 'flex items-center gap-2 text-sm' + chr(34) + SR,
    SL + 'div key=' + OPEN + 'i' + CLOSE + ' className=' + chr(34) + 'flex items-center gap-2 text-sm' + chr(34) + ' aria-label=' + OPEN + '`' + OPEN + 'i + 1' + CLOSE + ' guess$' + OPEN + 'count === 1 ? \'\'' + ' : \'es\'' + CLOSE + ': $' + OPEN + 'count' + CLOSE + '`' + CLOSE + SR
)

c = c.replace(
    SL + 'span className=' + chr(34) + 'w-4 text-right text-surface-400 font-medium' + chr(34) + SR + OPEN + 'i + 1' + CLOSE +</span>',
    SL + 'span className=' + chr(34) + 'w-4 text-right text-surface-400 font-medium' + chr(34) + ' aria-hidden=' + chr(34) + 'true' + chr(34) + SR + OPEN + 'i + 1' + CLOSE +</span>'
)

# Add focus rings to buttons
close_btn = (
    SL + 'button\n            onClick=' + OPEN + 'onClose' + CLOSE
    + '\n            className=' + chr(34)
    + 'flex-1 rounded-xl border border-surface-200 dark:border-surface-800 py-2.5 text-sm font-display hover:bg-surface-100 dark:hover:bg-surface-800 transition'
    + chr(34)
    + SR
)
new_close_btn = (
    SL + 'button\n            onClick=' + OPEN + 'onClose' + CLOSE
    + '\n            className=' + chr(34)
    + 'flex-1 rounded-xl border border-surface-200 dark:border-surface-800 py-2.5 text-sm font-display hover:bg-surface-100 dark:hover:bg-surface-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-surface-900 focus-visible:ring-surface-500'
    + chr(34)
    + SR
)
c = c.replace(close_btn, new_close_btn)

reset_btn = (
    SL + 'button\n            onClick=' + OPEN + 'onReset' + CLOSE
    + '\n            className=' + chr(34)
    + 'rounded-xl border border-red-200 dark:border-red-900 py-2.5 px-4 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition'
    + chr(34)
    + SR
)
new_reset_btn = (
    SL + 'button\n            onClick=' + OPEN + 'onReset' + CLOSE
    + '\n            aria-label=' + chr(34) + 'Reset statistics (permanent)' + chr(34)
    + '\n            className=' + chr(34)
    + 'rounded-xl border border-red-200 dark:border-red-900 py-2.5 px-4 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-surface-900 focus-visible:ring-red-500'
    + chr(34)
    + SR
)
c = c.replace(reset_btn, new_reset_btn)

open(src, 'w').write(c)
print(src, 'done')
