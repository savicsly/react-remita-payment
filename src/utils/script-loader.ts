import { Environment } from "../types";
import { RemitaPaymentEngine } from "../types/global";

// Define script URLs
const SCRIPT_URLS: Record<Environment, string> = {
  demo: "https://remitademo.net/payment/v1/remita-pay-inline.bundle.js",
  live: "https://login.remita.net/payment/v1/remita-pay-inline.bundle.js",
};

// Create a singleton promise to ensure the script is loaded only once.
let loadPromise: Promise<RemitaPaymentEngine> | null = null;

/**
 * Checks if the Remita Payment Engine is available and properly initialized on the window object.
 * @returns {boolean} - True if the engine is ready, false otherwise.
 */
const isEngineReady = (): boolean => {
  return (
    typeof window !== "undefined" &&
    !!window.RmPaymentEngine &&
    typeof window.RmPaymentEngine.showPaymentWidget === "function"
  );
};

/**
 * The core function to load the Remita inline script.
 * It ensures that the script is fetched and loaded only once per page session.
 *
 * @param environment - The Remita environment ('demo' or 'live').
 * @returns A promise that resolves with the Remita Payment Engine object when it's ready.
 */
export const loadRemitaScript = (
  environment: Environment
): Promise<RemitaPaymentEngine> => {
  // If the promise already exists, return it to avoid reloading the script.
  if (loadPromise) {
    return loadPromise;
  }

  // Create a new promise and store it in the singleton.
  loadPromise = new Promise<RemitaPaymentEngine>((resolve, reject) => {
    // On the server, script cannot be loaded.
    if (typeof window === "undefined" || typeof document === "undefined") {
      return reject(
        new Error("Remita script can only be loaded in a browser environment.")
      );
    }

    // If the engine is already available, resolve immediately.
    if (isEngineReady()) {
      console.log("Remita engine already initialized.");
      return resolve(window.RmPaymentEngine as RemitaPaymentEngine);
    }

    const scriptUrl = SCRIPT_URLS[environment];
    const scriptId = `remita-script-${environment}`;

    // Clean up any existing Remita scripts to prevent conflicts.
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      console.log("Removing existing Remita script tag.");
      existingScript.remove();
    }

    // Create the script element.
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = scriptUrl;
    script.async = true;
    script.defer = true;
    script.setAttribute("crossorigin", "anonymous");

    // Set a timeout to handle script loading failures.
    const loadTimeout = setTimeout(() => {
      reject(
        new Error(
          `Remita script loading timed out after 30 seconds. Please check your network connection.`
        )
      );
    }, 30000); // 30-second timeout

    // This is the primary mechanism for detecting when the Remita engine is ready.
    // The Remita script is expected to call this function once it has initialized.
    window.remitaAsyncInit = () => {
      clearTimeout(loadTimeout);
      if (isEngineReady()) {
        console.log("Remita engine initialized via remitaAsyncInit callback.");
        resolve(window.RmPaymentEngine as RemitaPaymentEngine);
      } else {
        reject(
          new Error(
            "remitaAsyncInit was called, but Remita engine is not available."
          )
        );
      }
    };

    // Handle script loading errors (e.g., network issues, 404).
    script.onerror = (error) => {
      clearTimeout(loadTimeout);
      // Clear the singleton promise on failure to allow for a retry.
      loadPromise = null;
      reject(
        new Error(
          `Failed to load Remita script: ${
            error instanceof Event ? "Network error" : error
          }`
        )
      );
    };

    // Append the script to the document head to initiate loading.
    console.log(`Loading Remita script for ${environment} environment.`);
    document.head.appendChild(script);
  });

  return loadPromise;
};
