  var defaultLanguage = auth.auth.lang + '_' + auth.auth.lang.toUpperCase();
  if (auth.auth.lang === "en") defaultLanguage = 'en_US';

  let translateconfig = {
    baseUrl: 'https://translate.easy4pro.com',
    defaultLanguage: defaultLanguage,
    fallbackLanguage: 'en_US',
    namespace: '/shaq',
    cacheDuration: 86400,
    localStorageKey: 'Shaqtranslations'
  };

  var translations = {};
  var translateClient = new TranslateClient(translateconfig);
  translateClient.getAllTranslations()
    .then(function(allTranslations) {
      translations = allTranslations;
      for (var translation in translations) {
        $("#" + translation).html(translations[translation]);
      }
    })
    .catch(function(error) {
      console.log(error);
    });
