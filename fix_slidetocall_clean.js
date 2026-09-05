const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/provider-mobile/src/components/SlideToCall.tsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /const gestureHandler = \(e: any\) => \{\s*'worklet';\s*\/\/ Dummy handler since we must use the old api or new api carefully\s*\/\/ We'll use onGestureEvent directly\s*\};\s*\/\/ The physics engine/;

code = code.replace(regex, '');

// Also ensure PanGestureHandler is imported and correctly typed
code = code.replace('const gestureHandler = useAnimatedGestureHandler({', 'const gestureHandler = useAnimatedGestureHandler<any, any>({');

fs.writeFileSync(file, code);
