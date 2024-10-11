import { CommonKeys } from "../tokens/common";

const common: { [k in CommonKeys]: string } = {
  [CommonKeys.title]: "Accettazione dei Termini e Condizioni di My Way",
  [CommonKeys.accept]: "Accettare",
  [CommonKeys.acceptTerms]: `Sono stato/a informato/a, ho letto e accetto i **termini e condizioni** e l'**[informativa sulla privacy](/privacy-policy?lang=it)**.`,
  [CommonKeys.validateConsent]:
    "È necessario accettare i termini con la casella di controllo",
  [CommonKeys.error]: "Errore. Il tuo codice non è valido.",
  [CommonKeys.errorNoParams]: "Nessuno studente o famiglia rilevato",
  [CommonKeys.loading]: "Caricamento",
  [CommonKeys.send]: "Inviare",
};

export default common;
