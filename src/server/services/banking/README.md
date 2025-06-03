# Banking Integration

This module provides integration with Open Banking APIs to allow users to connect their bank accounts and automatically import transactions.

## Architecture

The banking integration is built with a modular architecture that supports multiple banking providers:

- **Provider Interface**: All banking providers implement the `BankingProvider` interface, ensuring consistent behavior.
- **Provider Factory**: The `getBankingProvider` function returns the appropriate provider based on the provider name.
- **Session Storage**: Temporary storage for authentication sessions during the OAuth flow.
- **Sync Service**: Handles synchronizing accounts and transactions from the banking providers.
- **Categorization Service**: Automatically categorizes transactions based on their details.

## Supported Providers

### SIBS API Market (Portuguese Banks)

SIBS API Market provides access to Portuguese banks through the PSD2 Open Banking APIs. This integration requires:

- eIDAS certificate for authentication
- Client ID and Secret from SIBS API Market
- Proper handling of bank selection and consent flows

### TrueLayer (UK & European Banks)

TrueLayer provides access to UK and European banks through their unified API. This integration requires:

- Client ID and Secret from TrueLayer
- Proper handling of OAuth flows

## Environment Variables

The following environment variables need to be set:

```
# SIBS API Market
SIBS_API_URL=https://api.sibsapimarket.com
SIBS_CLIENT_ID=your-client-id
SIBS_CLIENT_SECRET=your-client-secret
SIBS_REDIRECT_URI=https://yourdomain.com/api/banking/callback
SIBS_CERTIFICATE=your-certificate-content
SIBS_CERTIFICATE_KEY=your-certificate-key-content

# TrueLayer
TRUELAYER_CLIENT_ID=your-client-id
TRUELAYER_CLIENT_SECRET=your-client-secret
TRUELAYER_REDIRECT_URI=https://yourdomain.com/api/banking/callback
```

## Authentication Flow

1. User initiates connection by selecting a provider
2. For SIBS, user selects a bank; for TrueLayer, bank selection is handled by their UI
3. User is redirected to the bank's authentication page
4. After authentication, user is redirected back to our callback URL
5. We exchange the authorization code for access and refresh tokens
6. We store the connection details and sync the user's accounts and transactions

## Data Model

- **BankConnection**: Represents a connection to a bank through a specific provider
- **BankAccount**: Represents a bank account from a connected bank
- **BankTransaction**: Represents a transaction from a bank account

## Transaction Categorization

Transactions are automatically categorized based on:

1. Merchant name matching
2. Description text matching
3. Transaction amount patterns
4. User feedback (learning from manual categorizations)

## Expense Integration

Banking transactions can be:

1. Linked to existing expenses
2. Used to create new expenses
3. Kept separate from the expense tracking system

## Security Considerations

- Access tokens are stored securely
- Refresh tokens are used to maintain access without requiring re-authentication
- Users can disconnect their bank accounts at any time
- We only request read-only access to transaction data

## Adding New Providers

To add a new banking provider:

1. Create a new provider class that implements the `BankingProvider` interface
2. Add the provider to the `providerFactory.ts` file
3. Add any necessary environment variables
4. Update the UI to include the new provider option

## Troubleshooting

Common issues:

- **Connection failures**: Check that the provider credentials are correct
- **Token expiration**: Ensure refresh tokens are working correctly
- **Missing transactions**: Check the date range for transaction syncing
- **Categorization issues**: Review and improve the categorization rules
