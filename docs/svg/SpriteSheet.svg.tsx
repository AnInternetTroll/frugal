/* @jsxRuntime automatic */
/* @jsxImportSource preact */

import { SpriteSheet } from '../dep/frugal/spritesheet.ts';
import { render } from 'preact-render-to-string';

export const spritesheet = new SpriteSheet({ render, name: 'svg' });

const CarretSprite = spritesheet.sprite(
    <path d='M14,17.414l-4.707-4.707c-0.391-0.391-0.391-1.023,0-1.414L14,6.586L15.414,8l-4,4l4,4L14,17.414z' />,
    'carret',
);

const SpinnerSprite = spritesheet.sprite(
    <circle cx='50' cy='50' r='45' />,
    'circle',
);

const TocSprite = spritesheet.sprite(
    <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        d='M4 6h16M4 12h16M4 18h7'
    >
    </path>,
    'toc',
);

const LinkSprite = spritesheet.sprite(
    <path d='M421.512,207.074l-85.795,85.767c-47.352,47.38-124.169,47.38-171.529,0c-7.46-7.439-13.296-15.821-18.421-24.465
		l39.864-39.861c1.895-1.911,4.235-3.006,6.471-4.296c2.756,9.416,7.567,18.33,14.972,25.736c23.648,23.667,62.128,23.634,85.762,0
		l85.768-85.765c23.666-23.664,23.666-62.135,0-85.781c-23.635-23.646-62.105-23.646-85.768,0l-30.499,30.532
		c-24.75-9.637-51.415-12.228-77.373-8.424l64.991-64.989c47.38-47.371,124.177-47.371,171.557,0
		C468.869,82.897,468.869,159.706,421.512,207.074z M194.708,348.104l-30.521,30.532c-23.646,23.634-62.128,23.634-85.778,0
		c-23.648-23.667-23.648-62.138,0-85.795l85.778-85.767c23.665-23.662,62.121-23.662,85.767,0
		c7.388,7.39,12.204,16.302,14.986,25.706c2.249-1.307,4.56-2.369,6.454-4.266l39.861-39.845
		c-5.092-8.678-10.958-17.03-18.421-24.477c-47.348-47.371-124.172-47.371-171.543,0L35.526,249.96
		c-47.366,47.385-47.366,124.172,0,171.553c47.371,47.356,124.177,47.356,171.547,0l65.008-65.003
		C246.109,360.336,219.437,357.723,194.708,348.104z' />,
);

spritesheet.collect();

export const carretUrl = CarretSprite.url();
export const spinnerUrl = SpinnerSprite.url();
export const tocUrl = TocSprite.url();
export const linkUrl = LinkSprite.url();
