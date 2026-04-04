const runtimeEnvironment = globalThis.__APP_ENV__ || {};

const environment = {
    backendUrl: runtimeEnvironment.VITE_BACKEND_URL || import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
};

export default environment;