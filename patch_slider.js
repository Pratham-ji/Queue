const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/provider-mobile/src/components/SlideToCall.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /if \(gestureState\.dx > MAX_TRANSLATE - 20\) \{/,
  `if (gestureState.dx > MAX_TRANSLATE * 0.6) {`
);

fs.writeFileSync(file, code);
