import { I18n } from "i18n-js";
import en from "./en";
import es from "./es";
import it from "./it";
import tokens from "./tokens";
const i18n = new I18n({
  en,
  es,
  it,
});

i18n.locale = "en";
i18n.enableFallback = true;

export { tokens };

export default i18n;
