$(document).ready(function() {
var defaultLanguage = lang + '_' + lang.toUpperCase();
if (lang === "en") defaultLanguage = 'en_US';

config = {
    baseUrl: 'https://translate.easy4pro.com',
    defaultLanguage: defaultLanguage,
    fallbackLanguage: 'en_US',
    namespace: '/shaq',
    cacheDuration: 86400,
    localStorageKey: 'Shaqtranslations'
};

var translations = {};
var translateClient = new TranslateClient(config);
translateClient.getAllTranslations()
    .then(function(allTranslations) {
        translations = allTranslations;
        for (var translation in translations) {
          $("#"+translation).html(translations[translation]);
        }
    })
    .catch(function(error) {
        console.log(error);
    });
});
