import logger from "./logger";
import { logoutUser } from "./logout";

export const fetchClient = async (url: string, init?: RequestInit) => {
    logger.info('FetchClient', init?.method || 'GET', url);

    const response = await fetch(url, init);

    if (!response.ok) {
        if(response.status == 408) {
            throw new Error('Server down for maintenance');
        }

        // Open up the response body using clone()
        const body = await response.clone().text();

        if(body == 'identityExpired') {
            logoutUser();
            throw new Error('Session expired...');
        }
    }

    return response;
}