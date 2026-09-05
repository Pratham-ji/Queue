const fs = require('fs');
const file = '/Users/pratham/Projects/Queue/apps/provider-mobile/src/components/SlideToCall.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace the old style PanGestureHandler with Reanimated v2 useAnimatedGestureHandler 
const regex = /const onGestureEvent = \([\s\S]*?\} \/>\n        <\/Animated\.View>\n      <\/PanGestureHandler>/;

code = code.replace(/import Animated, \{[\s\S]*?\} from "react-native-reanimated";/, `import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
  useAnimatedGestureHandler,
} from "react-native-reanimated";`);

code = code.replace(/const onGestureEvent = \([\s\S]*?const animatedThumbStyle =/m, `
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx: any) => {
      if (disabled || triggered) return;
      const translation = Math.max(0, Math.min(ctx.startX + event.translationX, MAX_TRANSLATE));
      translateX.value = translation;
    },
    onEnd: () => {
      if (disabled || triggered) return;
      if (translateX.value > THRESHOLD) {
        translateX.value = withTiming(MAX_TRANSLATE, { duration: 150 }, () => {
          runOnJS(handleTriggerComplete)();
        });
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    }
  });

  const animatedThumbStyle =`);

code = code.replace(/<PanGestureHandler[\s\S]*?onHandlerStateChange=\{onHandlerStateChange\}\n\s*>/, '<PanGestureHandler onGestureEvent={gestureHandler}>');

fs.writeFileSync(file, code);
