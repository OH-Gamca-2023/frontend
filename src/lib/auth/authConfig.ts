/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 */

import { browser } from '$app/environment'
import { LogLevel, type Configuration, type PopupRequest } from '@azure/msal-browser'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const host = browser ? window.location.origin : 'http://localhost:5173'

export const msalConfig: Configuration = {
	auth: {
		clientId: 'b4c732ad-f922-452d-8515-633faccca296',
		authority: 'https://login.microsoftonline.com/b5df9d6f-f2dc-492a-ba67-7afdfa5eef57',
		redirectUri: `${host}/auth/login/callback/`,
		postLogoutRedirectUri: `${host}`,
	},
	cache: {
		cacheLocation: 'sessionStorage', // This configures where your cache will be stored
		storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
	},
	system: {
		loggerOptions: {
			loggerCallback: (level, message, containsPii) => {
				if (containsPii) {
					return
				}
				switch (level) {
					case LogLevel.Error:
						console.error(message)
						return
					case LogLevel.Info:
						console.info(message)
						return
					case LogLevel.Verbose:
						console.debug(message)
						return
					case LogLevel.Warning:
						console.warn(message)
						return
				}
			},
		},
	},
}

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 * For more information about OIDC scopes, visit:
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
export const loginRequest: PopupRequest = {
	scopes: ['User.Read', 'Mail.Read'],
}

/**
 * Add here the scopes to request when obtaining an access token for MS Graph API. For more information, see:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md
 */
export const tokenRequest: PopupRequest = {
	scopes: ['User.Read'],
}

// Add here the endpoints for MS Graph API services you would like to use.
export const graphConfig = {
	GRAPH_ME_ENDPOINT: 'https://graph.microsoft.com/v1.0/me',
}
