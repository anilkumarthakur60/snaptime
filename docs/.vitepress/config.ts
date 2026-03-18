import { defineConfig } from 'vitepress'

export default defineConfig({
    title: 'D8',
    description: 'A modern, zero-dependency TypeScript date/time library — formatting, parsing, timezones, business days, cron, and natural language.',
    lang: 'en-US',
    base: '/snaptime/',

    head: [
        ['meta', { name: 'theme-color', content: '#667eea' }],
        ['meta', { name: 'og:type', content: 'website' }],
        ['meta', { name: 'og:locale', content: 'en' }],
        ['meta', { name: 'og:title', content: 'D8 — Modern TypeScript Date/Time Library' }],
        ['meta', { name: 'og:description', content: 'Zero-dependency, fully typed date library for formatting, parsing, timezones, business days, cron, and natural language.' }],
        ['meta', { name: 'og:site_name', content: 'D8' }],
        ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
        ['meta', { name: 'twitter:title', content: 'D8 — Modern TypeScript Date/Time Library' }],
        ['meta', { name: 'keywords', content: 'date, time, typescript, javascript, timezone, cron, duration, business days, date formatting, date parsing, zero-dependency' }],
    ],

    themeConfig: {
        logo: '🗓️',
        siteTitle: 'D8',

        nav: [
            { text: 'Guide', link: '/guide/' },
            { text: 'API', link: '/api/' },
            { text: 'Examples', link: '/examples/' },
            {
                text: 'Links',
                items: [
                    { text: 'npm', link: 'https://www.npmjs.com/package/@anilkumarthakur/d8' },
                    { text: 'GitHub', link: 'https://github.com/anilkumarthakur60/snaptime' },
                    { text: 'Changelog', link: 'https://github.com/anilkumarthakur60/snaptime/releases' }
                ]
            }
        ],

        sidebar: {
            '/guide/': [
                {
                    text: 'Getting Started',
                    collapsed: false,
                    items: [
                        { text: 'Introduction', link: '/guide/' },
                        { text: 'Installation', link: '/guide/installation' },
                        { text: 'Quick Start', link: '/guide/quick-start' }
                    ]
                },
                {
                    text: 'Core Concepts',
                    collapsed: false,
                    items: [
                        { text: 'DateFormat', link: '/guide/dateformat' },
                        { text: 'Duration', link: '/guide/duration' },
                        { text: 'DateRange', link: '/guide/daterange' },
                        { text: 'DateCollection', link: '/guide/datecollection' },
                    ]
                },
                {
                    text: 'Ecosystem',
                    collapsed: false,
                    items: [
                        { text: 'Timezone', link: '/guide/timezone' },
                        { text: 'Business Days', link: '/guide/businessday' },
                        { text: 'Cron Expressions', link: '/guide/cron' },
                        { text: 'Natural Language', link: '/guide/natural-language' },
                    ]
                },
                {
                    text: 'Advanced',
                    collapsed: false,
                    items: [
                        { text: 'Plugin System', link: '/guide/plugins' },
                        { text: 'Locale Support', link: '/guide/locale' },
                        { text: 'TypeScript Types', link: '/guide/types' },
                    ]
                }
            ],
            '/api/': [
                {
                    text: 'API Reference',
                    collapsed: false,
                    items: [
                        { text: 'Overview', link: '/api/' },
                        { text: 'Factory Function', link: '/api/factory' },
                        { text: 'DateFormat', link: '/api/dateformat' },
                        { text: 'Duration', link: '/api/duration' },
                        { text: 'DateRange', link: '/api/daterange' },
                        { text: 'DateCollection', link: '/api/datecollection' },
                        { text: 'Timezone', link: '/api/timezone' },
                        { text: 'BusinessDay', link: '/api/businessday' },
                        { text: 'Cron', link: '/api/cron' },
                        { text: 'Natural Language', link: '/api/natural-language' },
                        { text: 'Type Definitions', link: '/api/types' },
                    ]
                }
            ],
            '/examples/': [
                {
                    text: 'Examples',
                    collapsed: false,
                    items: [
                        { text: 'Overview', link: '/examples/' },
                        { text: 'Date Formatting', link: '/examples/formatting' },
                        { text: 'Date Arithmetic', link: '/examples/arithmetic' },
                        { text: 'Working with Timezones', link: '/examples/timezones' },
                        { text: 'Business Days', link: '/examples/business-days' },
                        { text: 'Cron Scheduling', link: '/examples/cron' },
                        { text: 'Collections & Ranges', link: '/examples/collections' },
                        { text: 'Natural Language', link: '/examples/natural-language' },
                        { text: 'Real-World Recipes', link: '/examples/real-world' },
                    ]
                }
            ]
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/anilkumarthakur60/snaptime' },
            { icon: 'npm', link: 'https://www.npmjs.com/package/@anilkumarthakur/d8' }
        ],

        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2024-present Anil Kumar Thakur'
        },

        search: {
            provider: 'local'
        },

        editLink: {
            pattern: 'https://github.com/anilkumarthakur60/snaptime/edit/main/docs/:path',
            text: 'Edit this page on GitHub'
        },

        outline: {
            level: [2, 3]
        },

        lastUpdated: {
            text: 'Last updated'
        }
    }
})
