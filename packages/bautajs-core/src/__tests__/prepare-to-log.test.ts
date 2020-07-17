import { prepareToLog } from '../utils/prepare-to-log';

import smallObject from './fixtures/small-object-less-than-3200-size.json';

describe('prepareToLog tests', () => {
  test('should return unaffected object if it is smaller than the default size', () => {
    const result = prepareToLog(smallObject);

    expect(result).toStrictEqual(
      '{"claimId":"15603343","claimNumber":"1.1040.99.001248","eventDate":"2020-07-16T10:24:00.000Z","typeOfEvent":{"id":"26_RCT_2","descriptionUI":"Danni a terzi causati nella vita privata"},"claimStatusCode":"CLOSED","claimStatusUpdateDate":"2020-07-16","claimParties":[{"givenName":"MARZIATD","id":"41045064","surname":"SADUNTD","roles":["POLICY_HOLDER"]},{"givenName":"MARZIATD","surname":"SADUNTD","roles":["CLAIM_DECLARER"]}],"contactInformation":{"phones":[{"phoneNumber":"02/480841","phoneKind":"MOBILE"}],"email":"PP_liquidatoresinistri036@axa.it"},"claimQuestionnaireId":"EN0000033644","documentIds":["claim.15603343_9959756659"],"history":[{"date":"2020-07-16","description":"Assicurato: SADUNTD MARZIATDE - Mail: dare@example.comData del sinistro: 16/07/2020Ora del sinistro: 12:24Luogo del sinistro: Brescia 25133Tipologia di danno: Danni a terzi causati nella vita privataCategoria evento: DA FATTO DOLOSO DI PERSONE DELLE QUALI DEBBA RISPONDEREDinamica dell\'evento: textBeni danneggiati:IBAN: IT36M0306981970033257650158Immagini e documenti: -Sono presenti danni a Terzi? : SIDenuncia alle Autorità : -"},{"date":"2020-07-16","description":"Sarà assegnato  un gestore dedicato che seguirà il tuo sinistro. Per ulteriori informazioni chiamaci al numero 800 085 559"},{"date":"2020-07-16","description":"Hai aperto un sinistro Danni a terzi causati nella vita privata avvenuto il giorno 16/07/2020"},{"date":"2020-07-16","description":"CLERICI LUIGI ha preso in carico il tuo sinistro ed è contattabile al seguente indirizzo e-mail PP_liquidatoresinistri036@axa.it presso SC Sinistri Broker Corso Como, 17 MILANO"},{"date":"2020-07-16","description":"Verrà nominato a breve un perito che effettuerà la valutazione del  danno e ti contatterà se necessario"},{"date":"2020-07-16","description":"Ti preghiamo di entrare in contatto con AXA o il tuo distributore di fiducia per maggiori informazioni"},{"date":"2020-07-16","description":""},{"date":"2020-07-16","description":"Ti informiamo che stiamo gestendo separatamente altre posizioni in merito a questo sinistro. Trattandosi di posizioni relative ad altri soggetti (diversi dal contraente di polizza) per motivi di privacy non ci e\' consentito esporre ulteriori informazioni."}],"partiesRoleInClaim":[{"partyId":"41045064","role":"POLICY_HOLDER"}],"questionnaireValues":[{"id":"","input":[{"key":"eventCategories_26_RCT_2","values":["DA FATTO DOLOSO DI PERSONE DELLE QUALI DEBBA RISPONDERE"],"promptUI":"Cos\'è successo?"},{"key":"claim.incident.description","values":["text"],"promptUI":"Descrivi come è successo e specifica cosa è stato danneggiato/rubato"}]}]}'
    );
  });

  test('should return unaffected object if it is smaller than the non default size', () => {
    const result = prepareToLog(smallObject, 999999);

    expect(result).toStrictEqual(
      '{"claimId":"15603343","claimNumber":"1.1040.99.001248","eventDate":"2020-07-16T10:24:00.000Z","typeOfEvent":{"id":"26_RCT_2","descriptionUI":"Danni a terzi causati nella vita privata"},"claimStatusCode":"CLOSED","claimStatusUpdateDate":"2020-07-16","claimParties":[{"givenName":"MARZIATD","id":"41045064","surname":"SADUNTD","roles":["POLICY_HOLDER"]},{"givenName":"MARZIATD","surname":"SADUNTD","roles":["CLAIM_DECLARER"]}],"contactInformation":{"phones":[{"phoneNumber":"02/480841","phoneKind":"MOBILE"}],"email":"PP_liquidatoresinistri036@axa.it"},"claimQuestionnaireId":"EN0000033644","documentIds":["claim.15603343_9959756659"],"history":[{"date":"2020-07-16","description":"Assicurato: SADUNTD MARZIATDE - Mail: dare@example.comData del sinistro: 16/07/2020Ora del sinistro: 12:24Luogo del sinistro: Brescia 25133Tipologia di danno: Danni a terzi causati nella vita privataCategoria evento: DA FATTO DOLOSO DI PERSONE DELLE QUALI DEBBA RISPONDEREDinamica dell\'evento: textBeni danneggiati:IBAN: IT36M0306981970033257650158Immagini e documenti: -Sono presenti danni a Terzi? : SIDenuncia alle Autorità : -"},{"date":"2020-07-16","description":"Sarà assegnato  un gestore dedicato che seguirà il tuo sinistro. Per ulteriori informazioni chiamaci al numero 800 085 559"},{"date":"2020-07-16","description":"Hai aperto un sinistro Danni a terzi causati nella vita privata avvenuto il giorno 16/07/2020"},{"date":"2020-07-16","description":"CLERICI LUIGI ha preso in carico il tuo sinistro ed è contattabile al seguente indirizzo e-mail PP_liquidatoresinistri036@axa.it presso SC Sinistri Broker Corso Como, 17 MILANO"},{"date":"2020-07-16","description":"Verrà nominato a breve un perito che effettuerà la valutazione del  danno e ti contatterà se necessario"},{"date":"2020-07-16","description":"Ti preghiamo di entrare in contatto con AXA o il tuo distributore di fiducia per maggiori informazioni"},{"date":"2020-07-16","description":""},{"date":"2020-07-16","description":"Ti informiamo che stiamo gestendo separatamente altre posizioni in merito a questo sinistro. Trattandosi di posizioni relative ad altri soggetti (diversi dal contraente di polizza) per motivi di privacy non ci e\' consentito esporre ulteriori informazioni."}],"partiesRoleInClaim":[{"partyId":"41045064","role":"POLICY_HOLDER"}],"questionnaireValues":[{"id":"","input":[{"key":"eventCategories_26_RCT_2","values":["DA FATTO DOLOSO DI PERSONE DELLE QUALI DEBBA RISPONDERE"],"promptUI":"Cos\'è successo?"},{"key":"claim.incident.description","values":["text"],"promptUI":"Descrivi come è successo e specifica cosa è stato danneggiato/rubato"}]}]}'
    );
  });

  test('should return truncated object if it is smaller than the non default size', () => {
    const result = prepareToLog(smallObject, 999);

    expect(result).toStrictEqual(
      '{"claimId":"15603343","claimNumber":"1.1040.99.001248","eventDate":"2020-07-16T10:24:00.000Z","typeOfEvent":{"id":"26_RCT_2","descriptionUI":"Danni a terzi causati nella vita privata"},"claimStatusCode":"CLOSED","claimStatusUpdateDate":"2020-07-16","claimParties":[{"givenName":"MARZIATD","id":"41045064","surname":"SADUNTD","roles":["POLICY_HOLDER"]},{"givenName":"MARZIATD","surname":"SADUNTD","roles":["CLAIM_DECLARER"]}],"contactInformation":{"phones":[{"phoneNumber":"02/480841","phoneKind":"MOBILE"}],"email":"PP_liquidatoresinistri036@axa.it"},"claimQuestionnaireId":"EN0000033644","documentIds":["claim.15603343_9959756659"],"history":[{"date":"2020-07-16","description":"Assicurato: SADUNTD MARZIATDE - Mail: dare@example.comData del sinistro: 16/07/2020Ora del sinistro: 12:24Luogo del sinistro: Brescia 25133Tipologia di danno: Danni a terzi causati nella vita privataCategoria evento: DA FATTO DOLOSO DI PERSONE DELLE QUALI DEBBA RISPONDEREDinamica dell\'evento: textBeni danneggiati:IBAN...'
    );
  });

  test('should return unaffected object with a message that disable truncate is true', () => {
    const result = prepareToLog(smallObject, 999, true);

    expect(result).toStrictEqual(
      '[full log truncate disabled]{"claimId":"15603343","claimNumber":"1.1040.99.001248","eventDate":"2020-07-16T10:24:00.000Z","typeOfEvent":{"id":"26_RCT_2","descriptionUI":"Danni a terzi causati nella vita privata"},"claimStatusCode":"CLOSED","claimStatusUpdateDate":"2020-07-16","claimParties":[{"givenName":"MARZIATD","id":"41045064","surname":"SADUNTD","roles":["POLICY_HOLDER"]},{"givenName":"MARZIATD","surname":"SADUNTD","roles":["CLAIM_DECLARER"]}],"contactInformation":{"phones":[{"phoneNumber":"02/480841","phoneKind":"MOBILE"}],"email":"PP_liquidatoresinistri036@axa.it"},"claimQuestionnaireId":"EN0000033644","documentIds":["claim.15603343_9959756659"],"history":[{"date":"2020-07-16","description":"Assicurato: SADUNTD MARZIATDE - Mail: dare@example.comData del sinistro: 16/07/2020Ora del sinistro: 12:24Luogo del sinistro: Brescia 25133Tipologia di danno: Danni a terzi causati nella vita privataCategoria evento: DA FATTO DOLOSO DI PERSONE DELLE QUALI DEBBA RISPONDEREDinamica dell\'evento: textBeni danneggiati:IBAN: IT36M0306981970033257650158Immagini e documenti: -Sono presenti danni a Terzi? : SIDenuncia alle Autorità : -"},{"date":"2020-07-16","description":"Sarà assegnato  un gestore dedicato che seguirà il tuo sinistro. Per ulteriori informazioni chiamaci al numero 800 085 559"},{"date":"2020-07-16","description":"Hai aperto un sinistro Danni a terzi causati nella vita privata avvenuto il giorno 16/07/2020"},{"date":"2020-07-16","description":"CLERICI LUIGI ha preso in carico il tuo sinistro ed è contattabile al seguente indirizzo e-mail PP_liquidatoresinistri036@axa.it presso SC Sinistri Broker Corso Como, 17 MILANO"},{"date":"2020-07-16","description":"Verrà nominato a breve un perito che effettuerà la valutazione del  danno e ti contatterà se necessario"},{"date":"2020-07-16","description":"Ti preghiamo di entrare in contatto con AXA o il tuo distributore di fiducia per maggiori informazioni"},{"date":"2020-07-16","description":""},{"date":"2020-07-16","description":"Ti informiamo che stiamo gestendo separatamente altre posizioni in merito a questo sinistro. Trattandosi di posizioni relative ad altri soggetti (diversi dal contraente di polizza) per motivi di privacy non ci e\' consentito esporre ulteriori informazioni."}],"partiesRoleInClaim":[{"partyId":"41045064","role":"POLICY_HOLDER"}],"questionnaireValues":[{"id":"","input":[{"key":"eventCategories_26_RCT_2","values":["DA FATTO DOLOSO DI PERSONE DELLE QUALI DEBBA RISPONDERE"],"promptUI":"Cos\'è successo?"},{"key":"claim.incident.description","values":["text"],"promptUI":"Descrivi come è successo e specifica cosa è stato danneggiato/rubato"}]}]}'
    );
  });

  test('should return unaffected string if it is smaller than the default size', () => {
    const result = prepareToLog('this is a simple log');

    expect(result).toStrictEqual('this is a simple log');
  });

  test('should return unaffected string if it is smaller than the non default size', () => {
    const result = prepareToLog('this is a simple log', 99);

    expect(result).toStrictEqual('this is a simple log');
  });

  test('should return truncated string if it is smaller than the non default size', () => {
    const result = prepareToLog('this is a simple log that was a bit longer than needed', 2);

    expect(result).toStrictEqual('this is a simple log...');
  });

  test('should return unaffected string with a message that disable truncate is true', () => {
    const result = prepareToLog('this is a simple log that was a bit longer than needed', 2, true);

    expect(result).toStrictEqual(
      '[full log truncate disabled]this is a simple log that was a bit longer than needed'
    );
  });
});
