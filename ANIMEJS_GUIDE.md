# AnimeJS Usage Guide for StockOS Website

## What is AnimeJS?

AnimeJS is a powerful JavaScript animation library that makes it easy to create smooth, performant animations. It's already included in your website via CDN.

## How AnimeJS Works in This Website

### Basic Syntax

```javascript
anime({
  targets: '.element',      // What to animate (CSS selector, DOM element, or array)
  property: value,          // CSS property to animate
  duration: 1000,          // Duration in milliseconds
  easing: 'easeOutQuad',   // Animation easing function
  delay: 100,              // Delay before starting
  complete: function() {   // Callback when animation completes
    // Do something
  }
});
```

### Current Animations in Your Website

1. **Boot Screen Typewriter Effect**
   - Types text character by character
   - Located in `animateBootScreen()` function

2. **Stock Card Animations**
   - Cards fade in and slide up when loaded
   - Hover effects with scale and shadow
   - Staggered delays for sequential appearance

3. **News Items Animation**
   - Slide in from the left
   - Staggered timing for each item

4. **Section Transitions**
   - Fade in/out when switching sections
   - Smooth opacity and transform animations

5. **Market Status Indicator**
   - Pulsing dot animation
   - Continuous loop

### Example Animations You Can Use

#### 1. Fade In Animation
```javascript
anime({
  targets: '.my-element',
  opacity: [0, 1],
  duration: 800,
  easing: 'easeOutQuad'
});
```

#### 2. Slide Animation
```javascript
anime({
  targets: '.my-element',
  translateX: [-100, 0],
  opacity: [0, 1],
  duration: 600
});
```

#### 3. Scale Animation
```javascript
anime({
  targets: '.my-element',
  scale: [0, 1],
  duration: 500,
  easing: 'easeOutElastic(1, .8)'
});
```

#### 4. Rotate Animation
```javascript
anime({
  targets: '.my-element',
  rotate: '1turn',
  duration: 1000
});
```

#### 5. Stagger Animation (Multiple Elements)
```javascript
anime({
  targets: '.multiple-elements',
  translateY: [50, 0],
  opacity: [0, 1],
  delay: anime.stagger(100), // 100ms delay between each element
  duration: 600
});
```

#### 6. Color Animation
```javascript
anime({
  targets: '.my-element',
  backgroundColor: '#00ff41',
  color: '#000',
  duration: 500
});
```

#### 7. Path/Morph Animation
```javascript
anime({
  targets: '.svg-path',
  d: 'M 100 200 Q 200 100 300 200',
  duration: 1000
});
```

#### 8. Timeline (Sequence of Animations)
```javascript
const tl = anime.timeline({
  easing: 'easeOutExpo',
  duration: 750
});

tl.add({
  targets: '.first',
  translateX: 250
}).add({
  targets: '.second',
  translateX: 250
}).add({
  targets: '.third',
  translateX: 250
});
```

### Useful Easing Functions

- `linear` - Constant speed
- `easeInQuad` - Slow start
- `easeOutQuad` - Slow end
- `easeInOutQuad` - Slow start and end
- `easeInElastic(1, .6)` - Bouncy start
- `easeOutElastic(1, .8)` - Bouncy end
- `easeInOutElastic(1, .8)` - Bouncy both ways

### Where to Add New Animations

You can add AnimeJS animations in:
1. `script.js` - In any function or event listener
2. Button click handlers
3. Scroll event listeners
4. Data update functions
5. Any interactive element

### Tips

1. **Performance**: Use `transform` and `opacity` for best performance (they're GPU accelerated)
2. **Stagger**: Use `anime.stagger()` for sequential animations
3. **Easing**: Experiment with different easing functions for different feels
4. **Duration**: 300-800ms is usually good for UI animations
5. **Complete Callbacks**: Use callbacks to chain animations

### Documentation

Full documentation: https://animejs.com/documentation/

