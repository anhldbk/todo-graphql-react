export const BASE_PORT = process.env.PORT || 3000;
export const API_PORT = process.env.API_PORT | 8080
export const API_HOST = `http://localhost:${API_PORT}`;

export const API_ENDPOINT = `${API_HOST}/graphql`;
export const SUBSCRIPTION_ENDPOINT = `ws://localhost:${API_PORT}`;
