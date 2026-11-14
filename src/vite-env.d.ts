/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Web3Forms access key for the "Advertise here" enquiry form. Leave unset to hide the form. */
  readonly VITE_WEB3FORMS_KEY?: string
  /** Amazon Associates tracking ID (e.g. secretsantama-22). Leave unset to hide gift ideas. */
  readonly VITE_AMAZON_TAG?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
