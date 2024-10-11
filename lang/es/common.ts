import { CommonKeys } from "../tokens/common";

const commonEs: { [k in CommonKeys]: string } = {
  [CommonKeys.title]: "Aceptación de los Términos y Condiciones de My Way",
  [CommonKeys.accept]: "Aceptar",
  [CommonKeys.acceptTerms]:
    "He sido informado, he leído y acepto los **términos y condiciones** y la **[política de privacidad](/privacy-policy?lang=es)**",
  [CommonKeys.validateConsent]: "Debe aceptar los términos marcando la casilla",
  [CommonKeys.error]: "Error. Su código no es válido.",
  [CommonKeys.errorNoParams]: "No se detecto estudiante o familia",
  [CommonKeys.loading]: "Cargando",
  [CommonKeys.send]: "Enviar",
};

export default commonEs;
