module.exports = {
    i18n: {
      defaultLocale: 'en',
      locales: ['en', 'fr', 'es'], // Add your supported languages
      localeDetection: true,
    },
    reloadOnPrerender: process.env.NODE_ENV === 'development',
  };