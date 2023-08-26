import { PublicClientApplication, type PopupRequest, InteractionRequiredAuthError } from "@azure/msal-browser";
import { graphConfig, loginRequest, msalConfig, tokenRequest } from "./authConfig";
import { callMSGraph } from "./graph";

const msalApp = new PublicClientApplication(msalConfig);
export const msalInitialization = msalApp.initialize();

export async function signIn() {
    if(msalApp.getAllAccounts().length > 0) {
        return msalApp.getAllAccounts()[0];
    }
    await msalApp.loginPopup(loginRequest);
    msalApp.setActiveAccount(msalApp.getAllAccounts()[0]);
    return msalApp.getAllAccounts()[0];
}

async function getToken(request: PopupRequest) {
    return await msalApp.acquireTokenSilent(request)
        .catch(async error => {
            console.warn("silent token acquisition fails. acquiring token using popup");
            if (error instanceof InteractionRequiredAuthError) {
                // fallback to interaction when silent call fails
                return await msalApp.acquireTokenPopup(request)
                    .then(tokenResponse => {
                        console.log(tokenResponse);
                        return tokenResponse;
                    }).catch(error => {
                        console.error(error);
                    });
            } else {
                console.warn(error);   
            }
    });
}

export async function getProfile() {
    const tokenResponse = await getToken(tokenRequest);
    if (!tokenResponse) {
        throw new Error("No token response");
    }

    const queryParams = "?$select=displayName,jobTitle,mail,givenName,surname,id,officeLocation,department,userPrincipalName";

    return {
        user: await callMSGraph(graphConfig.GRAPH_ME_ENDPOINT + queryParams, tokenResponse.accessToken),
        accessToken: tokenResponse.accessToken
    };
}