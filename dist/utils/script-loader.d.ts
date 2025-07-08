import { Environment } from "../types";
import { RemitaPaymentEngine } from "../types/global";
/**
 * The core function to load the Remita inline script.
 * It ensures that the script is fetched and loaded only once per page session.
 *
 * @param environment - The Remita environment ('demo' or 'live').
 * @returns A promise that resolves with the Remita Payment Engine object when it's ready.
 */
export declare const loadRemitaScript: (environment: Environment) => Promise<RemitaPaymentEngine>;
