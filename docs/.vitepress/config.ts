import { defineConfig } from 'vitepress'

export default defineConfig({
    title: 'D8',
    description: 'A modern TypeScript date/time library',
    lang: 'en-US',

    head: [
        ['meta', { name: 'theme-color', content: '#3c3c3d' }],
        ['meta', { name: 'og:type', content: 'website' }],
        ['meta', { name: 'og:locale', content: 'en' }],
    ],

    themeConfig: {
        logo: '🗓️',
        siteTitle: 'D8',

        nav: [
            { text: 'Guide', link: '/guide/' },
            { text: 'API', link: '/api/dateformat' },
            { text: 'Examples', link: '/examples/' },
            {
                text: 'Links',
                items: [
                    { text: 'npm', link: 'https://www.npmjs.com/package/@anilkumarthakur/d8' },
                    { text: 'GitHub', link: 'https://github.com/AnilKumarThakur/snaptime' }
                ]
            }
        ],

        sidebar: {
            '/guide/': [
                {
                    text: 'Getting Started',
                    items: [
                        { text: 'Introduction', link: '/guide/' },
                        { text: 'Installation', link: '/guide/installation' },
                        { text: 'Quick Start', link: '/guide/quick-start' }
                    ]
                },
                {
                    text: 'Core Concepts',
                    items: [
                        { text: 'DateFormat', link: '/guide/dateformat' },
                        { text: 'Duration', link: '/guide/duration' },
                        { text: 'DateRange', link: '/guide/daterange' },
                        { text: 'Timezone', link: '/guide/timezone' },
                        { text: 'BusinessDay', link: '/guide/businessday' }
                    ]
                },
                {
                    text: 'Advanced',
                    items: [
                        { text: 'Cron Expressions', link: '/guide/cron' },
                        { text: 'Natural Language', link: '/guide/natural-language' },
                        { text: 'DateCollection', link: '/guide/datecollection' }
                    ]
                }
            ],
            '/api/': [
                {
                    text: 'API Reference',
                    items: [
                        { text: 'DateFormat', link: '/api/dateformat' },
                        { text: 'Duration', link: '/api/duration' },
                        { text: 'DateRange', link: '/api/daterange' },
                        { text: 'DateCollection', link: '/api/datecollection' },
                        { text: 'Timezone', link: '/api/timezone' },
                        { text: 'BusinessDay', link: '/api/businessday' },
                        { text: 'Cron', link: '/api/cron' },
                        { text: 'NaturalLanguage', link: '/api/natural-language' }
                    ]
                }
            ],
            '/examples/': [
                {
                    text: 'Examples',
                    items: [
                        { text: 'Overview', link: '/examples/' },
                        { text: 'Date Formatting', link: '/examples/formatting' },
                        { text: 'Date Arithmetic', link: '/examples/arithmetic' },
                        { text: 'Working with Timezones', link: '/examples/timezones' },
                        { text: 'Business Days', link: '/examples/business-days' },
                        { text: 'Cron Scheduling', link: '/examples/cron' }
                    ]
                }
            ]
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/AnilKumarThakur/snaptime' },
            { icon: 'npm', link: 'https://www.npmjs.com/package/@anilkumarthakur/d8' }
        ],

        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2024-present Anil Kumar Thakur'
        },

        search: {
            provider: 'local'
        }
    }
})
