import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		backgroundImage: {
  			hero: 'url(https://res.cloudinary.com/doqsecks2/image/upload/ralevel/home_img/hero-bg.png)',
  			contact: 'url(https://res.cloudinary.com/doqsecks2/image/upload/ralevel/contact/contact.png)',
  			join: 'url(https://res.cloudinary.com/doqsecks2/image/upload/ralevel/home_img/Rectangle.png)'
  		},
  		fontFamily: {
  			poppins: [
  				'var(--font-poppins)'
  			]
  		},
  		colors: {
  			purp: {
  				'100': '#CEA2D7',
  				'200': '#A348A6',
  				'300': '#9F63C4',
  				'400': '#674AB3'
  			},
  			cy: {
  				'100': '#e3fafc',
  				'200': '#E7F5FF',
  				'300': '#A5D8FF',
  				'400': '#0078D4',
  				'500': '#22b8cf',
  				'700': '#1098ad'
  			},
  			oran: {
  				'100': '#F59631'
  			},
  			themBlue: {
  				'100': '#a4b7d7',
  				'200': '#5f8cdb',
  				'300': '#1b4a9b'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		screens: {
  			lg2: '920px',
  			md2: '560px',
  			xs: '460px',
  			xxs: '370px'
  		},
  		scale: {
  			'80': '0.8',
  			'60': '0.6',
  			'40': '0.4',
  			'30': '0.3',
  			'20': '0.2'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },

  plugins: [require("tailwindcss-animate")],
};
export default config;
